import mongoose from 'mongoose';
import Teacher from '../models/teacher.model.js';
import Admin from '../models/admin.model.js';
import Class from '../models/class.model.js';
import Student from '../models/student.model.js';
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

  throw new ApiError(403, 'Only teachers can access this resource');
};

const getClassStudents = async (user, { classId, search }) => {
  const teacher = await resolveTeacherProfile(user);

  if (teacher.status !== 'Active') {
    throw new ApiError(403, 'Your teacher profile is inactive. Contact the administration.');
  }

  if (!mongoose.Types.ObjectId.isValid(classId)) {
    throw new ApiError(400, 'Invalid class ID');
  }

  const cls = await Class.findById(classId)
    .populate({ path: 'assignedSubjects', select: 'subjectName subjectCode' })
    .lean();

  if (!cls) {
    throw new ApiError(404, 'Class not found');
  }

  const academicYear = await getCurrentAcademicYear();

  if (cls.academicYear !== academicYear) {
    throw new ApiError(403, 'You can only view students for the current academic year.');
  }

  const teacherSubjectIds = (teacher.assignedSubjects || []).map((id) => id.toString());
  const classSubjectIds = (cls.assignedSubjects || []).map((s) => s._id.toString());

  const isAssigned = teacherSubjectIds.some((id) => classSubjectIds.includes(id));

  if (!isAssigned) {
    throw new ApiError(403, 'You are not assigned to this class.');
  }

  const membershipOr = classMembershipFilter(cls.className, academicYear).$or;

  const andConditions = [{ $or: membershipOr }];

  if (search) {
    const regex = new RegExp(search, 'i');
    andConditions.push({
      $or: [
        { studentId: regex },
        { fullName: regex },
      ],
    });
  }

  const students = await Student.find({ $and: andConditions })
    .select('studentId fullName fatherName gender status studentImage')
    .sort({ fullName: 1 })
    .lean();

  return {
    classId: cls._id,
    className: cls.className,
    academicYear: cls.academicYear,
    students,
  };
};

export default { getClassStudents };