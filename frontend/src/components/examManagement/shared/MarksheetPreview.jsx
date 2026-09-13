import { getInitials, gradeBadgeClass, statusBadgeClass } from './marksheet';
import { getImageUrl } from '../../../utils/imageUrl';

const MarksheetPreview = ({ record, schoolInfo = {} }) => {
  if (!record) return null;
  const photoUrl = getImageUrl(record.student.studentImage);
  const overallStatus = record.status || 'Pending';
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
      <div className="bg-gradient-to-r from-blue-800 to-blue-600 px-5 py-4 text-white flex items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold">{schoolInfo.name || 'School Name'}</h3>
          <p className="text-xs text-blue-100 mt-0.5">{record.exam?.name || 'Exam'} ({record.exam?.type || ''}) • Year {record.academicYear}</p>
        </div>
        <div className="text-right text-xs text-blue-100">
          <p>Generated On</p>
          <p className="text-white font-semibold text-sm">{new Date().toLocaleString()}</p>
        </div>
      </div>

      <div className="p-5">
        <div className="text-center mb-4">
          <h4 className="text-base font-bold text-gray-900 dark:text-white uppercase tracking-wide">Examination Marksheet</h4>
        </div>

        <div className="flex items-center gap-5 mb-5">
          <div className="w-20 h-24 rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden flex items-center justify-center bg-gray-50 dark:bg-gray-700 flex-shrink-0">
            {photoUrl ? (
              <img src={photoUrl} alt="Student" className="w-full h-full object-cover" />
            ) : (
              <span className="text-lg font-bold text-gray-400">{getInitials(record.student.fullName)}</span>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 flex-1">
            <div className="p-2.5 rounded-lg bg-gray-50 dark:bg-gray-700/50">
              <p className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-0.5">Student Name</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{record.student.fullName}</p>
            </div>
            <div className="p-2.5 rounded-lg bg-gray-50 dark:bg-gray-700/50">
              <p className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-0.5">Father's Name</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{record.student.fatherName || '-'}</p>
            </div>
            <div className="p-2.5 rounded-lg bg-gray-50 dark:bg-gray-700/50">
              <p className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-0.5">Student ID</p>
              <p className="text-sm font-semibold font-mono text-gray-900 dark:text-white">{record.student.studentId}</p>
            </div>
            <div className="p-2.5 rounded-lg bg-gray-50 dark:bg-gray-700/50">
              <p className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-0.5">Class</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{record.className}</p>
            </div>
            <div className="p-2.5 rounded-lg bg-gray-50 dark:bg-gray-700/50">
              <p className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-0.5">Academic Year</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{record.academicYear}</p>
            </div>
            <div className="p-2.5 rounded-lg bg-gray-50 dark:bg-gray-700/50">
              <p className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-0.5">Exam Term</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{record.exam?.type || '-'}</p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 mb-5">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Subject</th>
                <th className="text-center px-4 py-2.5 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Total Marks</th>
                <th className="text-center px-4 py-2.5 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Obtained Marks</th>
                <th className="text-center px-4 py-2.5 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Percentage</th>
                <th className="text-center px-4 py-2.5 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Grade</th>
                <th className="text-center px-4 py-2.5 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
              </tr>
            </thead>
            <tbody>
              {record.subjectResults.map((subj, idx) => (
                <tr key={idx} className="border-b border-gray-100 dark:border-gray-700/50 last:border-0">
                  <td className="px-4 py-2.5 font-medium text-gray-900 dark:text-white">{subj.subjectName}</td>
                  <td className="px-4 py-2.5 text-center text-gray-700 dark:text-gray-300">{subj.totalMarks}</td>
                  <td className="px-4 py-2.5 text-center">
                    {subj.entered ? (
                      <span className="font-semibold text-gray-900 dark:text-white">{subj.obtainedMarks}</span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-center text-gray-700 dark:text-gray-300">
                    {subj.entered ? `${subj.percentage}%` : '—'}
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    {subj.entered ? (
                      <span className={`inline-flex items-center justify-center w-9 h-9 rounded-lg text-sm font-bold ${gradeBadgeClass(subj.grade)}`}>
                        {subj.grade}
                      </span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    {!subj.entered ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300">Pending</span>
                    ) : subj.passed ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">Pass</span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300">Fail</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Total Marks</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">{record.totalMarks}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Obtained Marks</p>
            <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{record.obtainedMarks !== null ? record.obtainedMarks : '—'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Overall Percentage</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">{record.percentage !== null ? `${record.percentage}%` : '—'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Overall Grade</p>
            <span className={`inline-flex items-center justify-center w-10 h-10 rounded-lg text-sm font-bold ${gradeBadgeClass(record.grade)}`}>
              {record.grade}
            </span>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Pass / Fail</p>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusBadgeClass(overallStatus)}`}>
              {overallStatus}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarksheetPreview;