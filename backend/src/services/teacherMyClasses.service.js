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

  throw new ApiError(403, 'Only teachers can access their classes');
};

const getMyClasses = async (user) => {
  const teacher = await resolveTeacherProfile(user);

  if (teacher.status !== 'Active') {
    throw new ApiError(403, 'Your teacher profile is inactive. Contact the administration.');
  }

  const academicYear = await getCurrentAcademicYear();

  const teacherSubjectIds = (teacher.assignedSubjects || []).map((id) => id.toString());
  const teacherSubjectSet = new Set(teacherSubjectIds);

  if (teacherSubjectIds.length === 0) {
    return { classes: [] };
  }

  const classes = await Class.find({
    academicYear,
    status: 'Active',
    isDeleted: { $ne: true },
    assignedSubjects: { $in: teacherSubjectIds },
  })
    .populate({ path: 'assignedSubjects', select: 'subjectName subjectCode' })
    .lean();

  const classesResult = await Promise.all(
    classes.map(async (cls) => {
      const studentCount = await Student.countDocuments(classMembershipFilter(cls.className, cls.academicYear));

      const subjectList = (cls.assignedSubjects || []).filter((subject) =>
        teacherSubjectSet.has(subject._id.toString()),
      );

      return {
        classId: cls._id,
        className: cls.className,
        academicYear: cls.academicYear,
        status: cls.status,
        subjects: subjectList.map((subject) => ({
          id: subject._id,
          subjectName: subject.subjectName,
          subjectCode: subject.subjectCode || '',
        })),
        totalStudents: studentCount,
      };
    }),
  );

  return { classes: classesResult };
};

export default { getMyClasses };