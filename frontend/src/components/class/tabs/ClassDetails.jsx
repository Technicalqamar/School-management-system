import { useState, useEffect } from 'react';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useTranslation } from '../../../hooks/useLocalization';
import StatusBadge from '../../common/StatusBadge/StatusBadge';
import classService from '../../../services/class/class.service';

const ClassDetails = ({ classData, onBack }) => {
  const { t } = useTranslation();
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!classData?._id) return;
    classService.getClassDetails(classData._id)
      .then((res) => setDetails(res?.data || null))
      .catch((err) => setError(err?.response?.data?.message || t('failedToLoad')))
      .finally(() => setLoading(false));
  }, [classData?._id]);

  if (!classData) {
    return (
      <div className="text-center py-16 text-gray-400 dark:text-gray-500">
        <p className="text-sm">{t('noClasses')}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer">
            <ArrowLeftIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('classDetails')}</h1>
        </div>
        <div className="flex items-center justify-center h-48 text-gray-400 dark:text-gray-500 text-sm">{t('loading')}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer">
            <ArrowLeftIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('classDetails')}</h1>
        </div>
        <div className="px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-xl text-sm text-red-600 dark:text-red-400">{error}</div>
      </div>
    );
  }

  const d = details || classData;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer">
          <ArrowLeftIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('classDetails')}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 flex flex-col items-center text-center lg:col-span-1">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-lg ring-2 ring-yellow-400/50 mb-3">
            {(d.classInfo?.className || classData.className)?.slice(0, 2).toUpperCase() || 'CL'}
          </div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{d.classInfo?.className || classData.className}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{d.classInfo?.academicYear || classData.academicYear || '-'}</p>
          <div className="mt-3"><StatusBadge status={d.classInfo?.status || classData.status || 'Active'} /></div>
        </div>

        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-5 flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('totalStudentsInClass')}</p>
              <div className="p-2.5 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" /></svg>
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-auto">{d.totalStudents ?? 0}</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-5 flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{`${t('total')} ${t('subject')}s`}</p>
              <div className="p-2.5 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-auto">{d.totalSubjects ?? 0}</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-5 flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{`${t('total')} ${t('teacher')}s`}</p>
              <div className="p-2.5 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-auto">{d.totalTeachers ?? 0}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-4 pb-3 border-b border-gray-100 dark:border-gray-700">{`${t('subject')}s`}</h3>
          {d.subjects && d.subjects.length > 0 ? (
            <div className="space-y-2">
              {d.subjects.map((subj) => (
                <div key={subj._id} className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-gray-50 dark:bg-gray-700/20 border border-gray-100 dark:border-gray-700">
                  <span className="text-[13px] font-medium text-gray-700 dark:text-gray-200">{subj.subjectName}</span>
                  <span className="text-[10px] font-mono text-gray-400 dark:text-gray-500 bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded">{subj.subjectCode}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400 dark:text-gray-500">
              <svg className="h-10 w-10 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
              <p className="text-sm">{t('noSubjects')}</p>
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-4 pb-3 border-b border-gray-100 dark:border-gray-700">{`${t('teacher')}s`}</h3>
          {d.teachers && d.teachers.length > 0 ? (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {d.teachers.map((t) => (
                <div key={t._id} className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-gray-50 dark:bg-gray-700/20 border border-gray-100 dark:border-gray-700">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex-shrink-0 overflow-hidden ring-1 ring-white/20">
                    {t.teacherImage ? <img src={t.teacherImage} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold">{t.fullName?.charAt(0) || 'T'}</div>}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-medium text-gray-700 dark:text-gray-200 truncate">{t.fullName}</p>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 font-mono">{t.teacherId}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400 dark:text-gray-500">
              <svg className="h-10 w-10 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
              <p className="text-sm">{t('noTeachersFound')}</p>
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-4 pb-3 border-b border-gray-100 dark:border-gray-700">{`${t('student')}s`}</h3>
          {d.students && d.students.length > 0 ? (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {d.students.map((s) => (
                <div key={s._id} className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-gray-50 dark:bg-gray-700/20 border border-gray-100 dark:border-gray-700">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex-shrink-0 overflow-hidden ring-1 ring-white/20">
                    {s.studentImage ? <img src={s.studentImage} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold">{s.fullName?.charAt(0) || 'S'}</div>}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-medium text-gray-700 dark:text-gray-200 truncate">{s.fullName}</p>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 font-mono">{s.studentId}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400 dark:text-gray-500">
              <svg className="h-10 w-10 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" /></svg>
              <p className="text-sm">{t('noStudentsFound')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClassDetails;
