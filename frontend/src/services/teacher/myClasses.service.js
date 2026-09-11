import api from '../../api/axios';

/**
 * My Classes service — the integration point for the Teacher "My Classes" page.
 * Resolves the logged-in teacher's own assigned classes (classes + subjects +
 * student counts) from the protected GET /teacher/my-classes endpoint, which
 * reads real Teacher/Class/Subject assignment + Student data. No fake data.
 */

const flattenClasses = (classes) =>
  (classes || []).flatMap((cls) =>
    (cls.subjects || []).length > 0
      ? cls.subjects.map((subject) => ({
          classId: cls.classId,
          className: cls.className,
          subject: subject.subjectName,
          subjectCode: subject.subjectCode || '',
          totalStudents: cls.totalStudents || 0,
        }))
      : [
          {
            classId: cls.classId,
            className: cls.className,
            subject: '',
            subjectCode: '',
            totalStudents: cls.totalStudents || 0,
          },
        ],
  );

const getMyClasses = async () => {
  const response = await api.get('/teacher/my-classes');

  const data = response.data?.data || {};

  return {
    classes: data.classes || [],
    myClasses: flattenClasses(data.classes),
  };
};

const myClassesService = {
  getMyClasses,
};

export default myClassesService;