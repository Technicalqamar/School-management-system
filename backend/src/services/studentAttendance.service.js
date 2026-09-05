import StudentAttendance from '../models/studentAttendance.model.js';
import Student from '../models/student.model.js';
import SchoolSettings from '../models/schoolSettings.model.js';
import { ApiError } from '../utils/apiError.js';
import attendanceRules from './attendanceRules.service.js';

const VALID_CLASS_NAMES = [
  'Montessori', 'Nursery', 'KG 1', 'KG 2',
  'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5',
  'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10',
];

const formatTimeStr = (date) => {
  if (!date) return null;
  const d = new Date(date);
  if (isNaN(d.getTime())) return null;
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
};

const saveAttendance = async (data, userId) => {
  const { academicYear, class: className, date, records } = data;

  // ── Step 1: Validate Student exists ──────────────────────────────

  const studentFilter = {
    academicYear,
    status: 'Active',
  };

  if (className) {
    studentFilter.class = className;
  }

  const students = await Student.find(studentFilter)
    .select('_id studentId fullName studentImage class academicYear').lean();

  if (students.length === 0) {
    throw new ApiError(404, `No active students found for ${className || 'any class'} in ${academicYear}`);
  }

  const studentClassMap = {};
  students.forEach((s) => {
    studentClassMap[s._id.toString()] = s.class;
  });

  const studentIds = new Set(students.map((s) => s._id.toString()));
  const invalidRecords = records.filter((r) => !studentIds.has(r.student));
  if (invalidRecords.length > 0) {
    throw new ApiError(400, 'Some student IDs do not belong to the selected class and academic year');
  }

  // ── Step 2: Validate Attendance Date ─────────────────────────────

  const attendanceDate = new Date(date);
  if (isNaN(attendanceDate.getTime())) {
    throw new ApiError(400, 'Invalid attendance date');
  }

  const today = new Date();
  today.setHours(23, 59, 59, 999);
  if (attendanceDate.getTime() > today.getTime()) {
    throw new ApiError(400, 'Cannot mark attendance for a future date');
  }

  // ── Step 3: Weekend Rule ─────────────────────────────────────────

  const weekendResult = await attendanceRules.checkWeekendPolicy(date);
  if (weekendResult.isWeekend) {
    throw new ApiError(400, `Attendance cannot be marked because today is ${weekendResult.weekendDay} (configured as a weekend day).`);
  }

  // ── Step 4: Holiday Rule ─────────────────────────────────────────

  const holidayResult = await attendanceRules.checkHolidayPolicy(date, { appliesTo: 'Students' });
  if (holidayResult.isHoliday) {
    const holidayNames = holidayResult.holidays.map((h) => h.name).join(', ');
    throw new ApiError(400, `Attendance cannot be marked because today is an official holiday (${holidayNames}).`);
  }

  // ── Step 5: Event Rule + Audience Validation ─────────────────────

  const eventResult = await attendanceRules.checkEventPolicy(date);
  if (eventResult.hasEvent) {
    for (const event of eventResult.events) {
      if (event.attendanceRequired === 'No') {
        throw new ApiError(400,
          `Attendance is disabled because of the event: ${event.name}.`
        );
      }
      if (event.audience && !['All', 'Students'].includes(event.audience)) {
        throw new ApiError(400,
          `Attendance cannot be marked because the event "${event.name}" is restricted to ${event.audience} only. Student attendance is not allowed for this event.`
        );
      }
    }
  }

  // ── Step 5.5: Leave Rule ─────────────────────────────────────────

  const leaveRecords = records.filter((r) => r.status === 'Leave');
  if (leaveRecords.length > 0) {
    const settings = await SchoolSettings.getSettings();
    if (!settings.allowLeaveMarking) {
      throw new ApiError(400,
        'Leave marking is currently disabled in School Settings. Enable "Allow Leave Marking" to use this option.'
      );
    }
  }

  // ── Step 6: Attendance Time Rule ─────────────────────────────────

  const timeResult = await attendanceRules.checkAttendanceTimeRules();
  if (!timeResult.isTimeAllowed) {
    throw new ApiError(400, timeResult.message);
  }

  // ── Step 7: Late Rule (per-record) ───────────────────────────────

  const processedRecords = await Promise.all(
    records.map(async (record) => {
      let recordStatus = record.status;

      if (recordStatus === 'Present') {
        const checkInDate = new Date();
        const checkInTimeStr = formatTimeStr(checkInDate);

        if (checkInTimeStr) {
          const lateResult = await attendanceRules.checkLateRule({ checkInTime: checkInTimeStr });
          if (lateResult.isLate) {
            recordStatus = 'Late';
          }
        }
      }

      return { ...record, status: recordStatus };
    }),
  );

  // ── Step 8 & 9: Duplicate protection + Edit rule check ──────────

  const existingRecords = await StudentAttendance.find({
    student: { $in: students.map((s) => s._id) },
    date: attendanceDate,
  }).lean();

  if (existingRecords.length > 0) {
    const editResult = await attendanceRules.checkEditRules(existingRecords[0]);
    if (!editResult.canEdit) {
      throw new ApiError(400, editResult.message);
    }
  }

  // ── Step 10: Save Attendance ─────────────────────────────────────

  const bulkOps = processedRecords.map((record) => ({
    updateOne: {
      filter: {
        student: record.student,
        date: attendanceDate,
      },
      update: {
        $set: {
          student: record.student,
          class: studentClassMap[record.student] || className,
          academicYear,
          date: attendanceDate,
          status: record.status,
          method: record.method || 'Manual',
          checkIn: record.status !== 'Absent' ? new Date() : undefined,
          remarks: record.remarks || '',
          markedBy: userId,
        },
      },
      upsert: true,
    },
  }));

  await StudentAttendance.bulkWrite(bulkOps);

  const attendanceMap = {};
  processedRecords.forEach((r) => {
    attendanceMap[r.student] = {
      status: r.status,
      method: r.method || 'Manual',
    };
  });

  return {
    academicYear,
    class: className,
    date,
    totalStudents: students.length,
    markedCount: processedRecords.length,
    attendanceMap,
  };
};

const getStudentsWithAttendance = async (academicYear, className, date) => {
  const studentFilter = {
    academicYear,
    status: 'Active',
  };

  if (className && className !== 'All Classes') {
    studentFilter.class = className;
  }

  const students = await Student.find(studentFilter)
    .select('studentId fullName studentImage class academicYear')
    .sort({ fullName: 1 })
    .lean();

  if (students.length === 0) {
    return { students: [], attendanceMap: {} };
  }

  const attendanceDate = new Date(date);
  const studentIds = students.map((s) => s._id);

  const attendanceRecords = await StudentAttendance.find({
    student: { $in: studentIds },
    date: attendanceDate,
  })
    .select('student status checkIn method')
    .lean();

  const attendanceMap = {};
  attendanceRecords.forEach((record) => {
    attendanceMap[record.student.toString()] = {
      status: record.status,
      checkIn: record.checkIn,
      method: record.method,
    };
  });

  return { students, attendanceMap };
};

const getAttendanceByClass = async (className, academicYear, date) => {
  const filter = {};

  if (className && className !== 'All Classes') {
    filter.class = className;
  }

  if (academicYear) {
    filter.academicYear = academicYear;
  }

  if (date) {
    filter.date = new Date(date);
  }

  return StudentAttendance.find(filter)
    .populate('student', 'studentId fullName class')
    .sort({ date: -1 })
    .lean();
};

const getAttendanceByDate = async (date, academicYear) => {
  const filter = { date: new Date(date) };

  if (academicYear) {
    filter.academicYear = academicYear;
  }

  return StudentAttendance.find(filter)
    .populate('student', 'studentId fullName class')
    .sort({ createdAt: -1 })
    .lean();
};

const getAttendanceByStudent = async (studentId, academicYear) => {
  const filter = { student: studentId };

  if (academicYear) {
    filter.academicYear = academicYear;
  }

  return StudentAttendance.find(filter)
    .populate('student', 'studentId fullName class')
    .sort({ date: -1 })
    .lean();
};

const getAttendanceHistory = async (filters = {}) => {
  const {
    academicYear,
    class: className,
    status,
    fromDate,
    toDate,
    search,
    page = 1,
    limit = 500,
  } = filters;

  const studentFilter = { status: 'Active' };

  if (academicYear) {
    studentFilter.academicYear = academicYear;
  }

  if (className) {
    studentFilter.class = className;
  }

  if (search) {
    studentFilter.$or = [
      { fullName: { $regex: search, $options: 'i' } },
      { studentId: { $regex: search, $options: 'i' } },
    ];
  }

  const matchingStudents = await Student.find(studentFilter)
    .select('_id studentId fullName studentImage class academicYear')
    .lean();

  if (matchingStudents.length === 0) {
    return { records: [], total: 0 };
  }

  const studentIdMap = {};
  matchingStudents.forEach((s) => {
    studentIdMap[s._id.toString()] = s;
  });

  const attendanceFilter = {
    student: { $in: matchingStudents.map((s) => s._id) },
  };

  if (status && status !== 'All') {
    attendanceFilter.status = status;
  }

  if (fromDate || toDate) {
    attendanceFilter.date = {};
    if (fromDate) attendanceFilter.date.$gte = new Date(fromDate);
    if (toDate) attendanceFilter.date.$lte = new Date(toDate);
  }

  const total = await StudentAttendance.countDocuments(attendanceFilter);

  const skip = (Math.max(1, parseInt(page, 10) || 1) - 1) * parseInt(limit, 10);

  const attendanceRecords = await StudentAttendance.find(attendanceFilter)
    .sort({ date: -1 })
    .skip(skip)
    .limit(parseInt(limit, 10))
    .lean();

  const records = attendanceRecords.map((record) => {
    const student = studentIdMap[record.student.toString()] || {};
    const checkInTime = record.checkIn
      ? new Date(record.checkIn).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
      : null;

    return {
      id: record._id.toString(),
      name: student.fullName || 'Unknown',
      personId: student.studentId || '',
      type: 'Student',
      classOrDept: student.class || record.class,
      academicYear: student.academicYear || record.academicYear,
      date: record.date.toISOString().split('T')[0],
      checkIn: checkInTime,
      status: record.status,
      mode: record.method === 'QR' ? 'QR Code' : 'Manual',
    };
  });

  return { records, total };
};

const getAttendanceReports = async (filters = {}) => {
  return getAttendanceHistory(filters);
};

const deleteAttendance = async (id) => {
  const record = await StudentAttendance.findById(id);

  if (!record) {
    throw new ApiError(404, 'Attendance record not found');
  }

  await StudentAttendance.findByIdAndDelete(id);

  return record;
};

const resetCheckIn = async (studentId, date, academicYear, checkIn) => {
  const filter = { student: studentId, date: new Date(date) };
  if (academicYear) filter.academicYear = academicYear;

  const record = await StudentAttendance.findOne(filter);
  if (!record) {
    throw new ApiError(404, 'Attendance record not found');
  }

  if (checkIn) {
    record.checkIn = new Date(checkIn);
    await record.save();
  } else {
    await StudentAttendance.findByIdAndUpdate(
      record._id,
      { $unset: { checkIn: '' } },
      { new: true },
    );
  }

  return record;
};

const deleteBulkAttendance = async (className, academicYear, date) => {
  const filter = {};

  if (className && className !== 'All Classes') {
    filter.class = className;
  }

  if (academicYear) {
    filter.academicYear = academicYear;
  }

  if (date) {
    filter.date = new Date(date);
  }

  const result = await StudentAttendance.deleteMany(filter);

  return { deletedCount: result.deletedCount };
};

export default {
  saveAttendance,
  getStudentsWithAttendance,
  getAttendanceByClass,
  getAttendanceByDate,
  getAttendanceByStudent,
  getAttendanceHistory,
  getAttendanceReports,
  deleteAttendance,
  deleteBulkAttendance,
  resetCheckIn,
};
