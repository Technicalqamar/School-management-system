import Teacher from '../models/teacher.model.js';
import Class from '../models/class.model.js';
import Student from '../models/student.model.js';
import Timetable from '../models/timetable.model.js';
import Admin from '../models/admin.model.js';
import SchoolSettings from '../models/schoolSettings.model.js';
import { ApiError } from '../utils/apiError.js';

const classMembershipFilter = (className, academicYear) => ({
  $or: [
    { class: className, academicYear, enrollments: { $exists: false } },
    { class: className, academicYear, enrollments: { $size: 0 } },
    {
      enrollments: {
        $elemMatch: {
          academicYear,
          class: className,
          status: { $in: ['Active', 'Historical'] },
        },
      },
    },
  ],
});

const getCurrentAcademicYear = async () => {
  const settings = await SchoolSettings.getSettings();

  if (settings?.currentAcademicYear && /^\d{4}$/.test(settings.currentAcademicYear)) {
    return settings.currentAcademicYear;
  }

  return String(new Date().getFullYear());
};

const resolveTeacherProfile = async (user) => {
  if (user.referenceId && user.referenceModel === 'Teacher') {
    const teacher = await Teacher.findById(user.referenceId);
    if (!teacher) {
      throw new ApiError(404, 'Linked teacher profile not found');
    }
    return teacher;
  }

  if (user.role === 'teacher') {
    const teacher = await Admin.findById(user._id).select('assignedSubjects teacherId fullName status');
    if (!teacher) {
      throw new ApiError(404, 'Teacher profile not found');
    }
    return teacher;
  }

  throw new ApiError(403, 'Only teachers can access the teacher dashboard');
};

const formatTime = (time) => {
  if (!time) return '';
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 === 0 ? 12 : hours % 12;
  return `${String(displayHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${period}`;
};

const getTeacherDashboardData = async (user) => {
  const teacher = await resolveTeacherProfile(user);

  if (teacher.status !== 'Active') {
    throw new ApiError(403, 'Your teacher profile is inactive. Contact the administration.');
  }

  const academicYear = await getCurrentAcademicYear();

  const teacherSubjectIds = (teacher.assignedSubjects || []).map((id) => id.toString());
  const teacherSubjectSet = new Set(teacherSubjectIds);

  const myClasses = [];
  const todayClasses = [];

  if (teacherSubjectIds.length > 0) {
    const [classes, teacherTimetables] = await Promise.all([
      Class.find({
        academicYear,
        status: 'Active',
        isDeleted: { $ne: true },
        assignedSubjects: { $in: teacherSubjectIds },
      })
        .populate({ path: 'assignedSubjects', select: 'subjectName subjectCode' })
        .lean(),
      Timetable.find({
        academicYear,
        'periods.teacherId': teacher._id,
        'periods.type': 'teaching',
      })
        .populate({ path: 'classId', select: 'className' })
        .populate({ path: 'periods.subjectId', select: 'subjectName' })
        .lean(),
    ]);

    const classStudentCounts = await Promise.all(
      classes.map(async (cls) => {
        const count = await Student.countDocuments(classMembershipFilter(cls.className, cls.academicYear));
        return { className: cls.className, count };
      }),
    );

    const studentCountByClass = new Map(classStudentCounts.map((row) => [row.className, row.count]));

    for (const cls of classes) {
      const teacherSubjects = (cls.assignedSubjects || []).filter((subject) =>
        teacherSubjectSet.has(subject._id.toString()),
      );

      const studentCount = studentCountByClass.get(cls.className) || 0;

      for (const subject of teacherSubjects) {
        myClasses.push({
          classId: cls._id,
          className: cls.className,
          subject: subject.subjectName,
          subjectCode: subject.subjectCode || '',
          totalStudents: studentCount,
        });
      }
    }

    for (const timetable of teacherTimetables) {
      for (const period of timetable.periods) {
        if (period.type !== 'teaching') continue;
        if (period.teacherId?.toString() !== teacher._id.toString()) continue;

        todayClasses.push({
          time: `${formatTime(period.startTime)} - ${formatTime(period.endTime)}`,
          startTime: period.startTime,
          periodNo: period.periodNo,
          className: timetable.classId?.className || 'Unknown Class',
          subject: period.subjectId?.subjectName || 'Subject',
        });
      }
    }
  }

  todayClasses.sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));

  const distinctClassCounts = new Map();
  for (const row of myClasses) {
    const classId = String(row.classId);
    if (!distinctClassCounts.has(classId)) {
      distinctClassCounts.set(classId, row.totalStudents);
    }
  }

  return {
    statistics: {
      myClasses: distinctClassCounts.size,
      myStudents: [...distinctClassCounts.values()].reduce((sum, count) => sum + count, 0),
      todayClasses: todayClasses.length,
      pendingHomework: 0,
    },
    myClasses,
    todayClasses,
    upcomingHomework: [],
  };
};

export default { getTeacherDashboardData };