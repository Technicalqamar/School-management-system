import { useState, useMemo, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  CheckCircleIcon, XCircleIcon, ClockIcon,
  CalendarDaysIcon, UsersIcon,
  EyeIcon, ArrowPathIcon, ChevronDownIcon, InformationCircleIcon,
} from '@heroicons/react/24/outline';
import StatCard from '../../common/StatCard/StatCard';
import SelectInput from '../../common/SelectInput/SelectInput';
import DateInput from '../../common/DateInput/DateInput';
import Modal from '../../common/Modal/Modal';
import ConfirmationModal from '../../common/ConfirmationModal/ConfirmationModal';
import { ACADEMIC_YEARS } from '../../../utils/classNames';
import Spinner from '../../common/Spinner/Spinner';
import { useFormatTime } from '../../../hooks/useLocalization';

const STATUS_OPTIONS = ['Present', 'Absent', 'Leave', 'Late'];
const ATTENDANCE_MODES = ['Manual', 'Biometric Device'];

const STATUS_STYLES = {
  Present: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700',
  Absent: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-300 dark:border-red-700',
  Leave: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700',
  Late: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-300 dark:border-orange-700',
  Pending: 'bg-gray-100 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 border-gray-300 dark:border-gray-600',
};

const STATUS_COLORS = {
  Present: { dot: 'bg-green-500', hover: 'hover:bg-green-50 dark:hover:bg-green-900/20', text: 'text-green-700 dark:text-green-300' },
  Absent: { dot: 'bg-red-500', hover: 'hover:bg-red-50 dark:hover:bg-red-900/20', text: 'text-red-700 dark:text-red-300' },
  Leave: { dot: 'bg-yellow-400', hover: 'hover:bg-yellow-50 dark:hover:bg-yellow-900/20', text: 'text-yellow-700 dark:text-yellow-300' },
  Late: { dot: 'bg-blue-500', hover: 'hover:bg-blue-50 dark:hover:bg-blue-900/20', text: 'text-blue-700 dark:text-blue-300' },
};

const PAGE_SIZE = 10;

const TeacherAttendance = () => {
  const formatTime = useFormatTime();
  const [academicYear, setAcademicYear] = useState('');
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceMode, setAttendanceMode] = useState('Biometric Device');
  const [teachers, setTeachers] = useState([]);
  const [attendanceMap, setAttendanceMap] = useState({});
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [viewTeacher, setViewTeacher] = useState(null);
  const [resetTarget, setResetTarget] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const isDeviceMode = attendanceMode === 'Biometric Device';

  const teacherOptions = useMemo(
    () => teachers.map(t => ({ value: t._id, label: t.fullName })),
    [teachers]
  );

  const filteredTeachers = useMemo(
    () => selectedTeacherId ? teachers.filter(t => t._id === selectedTeacherId) : teachers,
    [teachers, selectedTeacherId]
  );

  const totalPages = Math.max(1, Math.ceil(filteredTeachers.length / PAGE_SIZE));

  const paginatedTeachers = useMemo(
    () => filteredTeachers.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [filteredTeachers, currentPage]
  );

  const stats = useMemo(() => {
    const records = Object.values(attendanceMap);
    const present = records.filter(r => r.status === 'Present').length;
    const absent = records.filter(r => r.status === 'Absent').length;
    const leave = records.filter(r => r.status === 'Leave').length;
    const late = records.filter(r => r.status === 'Late').length;
    return { present, absent, leave, late, total: teachers.length };
  }, [attendanceMap, teachers.length]);

  useEffect(() => {
    const close = () => setOpenDropdownId(null);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, []);

  const loadTeachers = () => {
    if (!academicYear) {
      toast.error('Please select Academic Year');
      return;
    }
    setCurrentPage(1);
    setLoading(true);
    setLoaded(false);
    setTeachers([]);
    setAttendanceMap({});
    setTimeout(() => {
      setLoaded(true);
      setLoading(false);
    }, 300);
  };

  const updateAttendance = (teacherId, field, value) => {
    setAttendanceMap(prev => ({
      ...prev,
      [teacherId]: {
        ...prev[teacherId],
        [field]: value,
        ...(field === 'status' ? { checkIn: formatTime() } : {}),
      },
    }));
  };

  const handleResetConfirm = () => {
    if (!resetTarget) return;
    setAttendanceMap(prev => ({
      ...prev,
      [resetTarget]: { ...prev[resetTarget], status: 'Present', checkIn: '' },
    }));
    setResetTarget(null);
    toast.success('Attendance reset');
  };

  const renderStatusBadge = (status) => {
    const style = STATUS_STYLES[status] || STATUS_STYLES.Present;
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${style}`}>
        {status}
      </span>
    );
  };

  const renderStatusDropdown = (teacherId, currentStatus) => (
    <div className="relative">
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); setOpenDropdownId(openDropdownId === teacherId ? null : teacherId); }}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-xs font-medium transition-all hover:border-gray-300 dark:hover:border-gray-500 cursor-pointer ${STATUS_COLORS[currentStatus].text}`}
      >
        <span className={`w-2 h-2 rounded-full ${STATUS_COLORS[currentStatus].dot}`} />
        {currentStatus}
        <ChevronDownIcon className="h-3 w-3 text-gray-400 ml-0.5" />
      </button>
      {openDropdownId === teacherId && (
        <div className="absolute left-0 mt-1.5 w-36 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10 py-1 overflow-hidden">
          {STATUS_OPTIONS.map(opt => (
            <button
              key={opt}
              type="button"
              onClick={(e) => { e.stopPropagation(); updateAttendance(teacherId, 'status', opt); setOpenDropdownId(null); }}
              className={`flex items-center gap-2 w-full px-3 py-2 text-xs text-left transition-colors ${STATUS_COLORS[opt].hover} ${currentStatus === opt ? STATUS_COLORS[opt].text : 'text-gray-700 dark:text-gray-200'}`}
            >
              <span className={`w-2 h-2 rounded-full ${STATUS_COLORS[opt].dot} flex-shrink-0`} />
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  const renderPagination = () => {
    if (filteredTeachers.length === 0) return null;
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);
      if (currentPage <= 3) { start = 2; end = Math.min(4, totalPages - 1); }
      if (currentPage >= totalPages - 2) { start = Math.max(2, totalPages - 3); end = totalPages - 1; }
      if (start > 2) pages.push('...');
      for (let i = start; i <= end; i++) pages.push(i);
      if (end < totalPages - 1) pages.push('...');
      pages.push(totalPages);
    }
    return (
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {filteredTeachers.length} teacher{filteredTeachers.length !== 1 ? 's' : ''} — Page {currentPage} of {totalPages}
        </span>
        <div className="flex items-center gap-1">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => p - 1)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            Previous
          </button>
          {pages.map((page, idx) =>
            page === '...' ? (
              <span key={`ellipsis-${idx}`} className="px-1.5 text-xs text-gray-400 dark:text-gray-500">...</span>
            ) : (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`min-w-[28px] px-2 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  currentPage === page
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {page}
              </button>
            )
          )}
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(p => p + 1)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            Next
          </button>
        </div>
      </div>
    );
  };

  const renderEmptyState = () => (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-12 flex flex-col items-center justify-center text-center">
      <UsersIcon className="h-16 w-16 text-gray-300 dark:text-gray-600 mb-4" />
      <h3 className="text-base font-semibold text-gray-700 dark:text-gray-200 mb-2">No Teachers Loaded</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">
        Select Academic Year and click Load Teachers.
      </p>
    </div>
  );

  const renderLoadingState = () => (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-12 flex flex-col items-center justify-center text-center">
      <Spinner size="md" className="text-blue-600 mb-4" />
      <p className="text-sm text-gray-500 dark:text-gray-400">Loading teachers...</p>
    </div>
  );

  const renderTable = () => (
    <>
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-800">
              <th className="sticky top-0 z-10 bg-gray-50 dark:bg-gray-800 px-4 py-3.5 text-left font-semibold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider whitespace-nowrap">Photo</th>
              <th className="sticky top-0 z-10 bg-gray-50 dark:bg-gray-800 px-4 py-3.5 text-left font-semibold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider whitespace-nowrap">Teacher Name</th>
              <th className="sticky top-0 z-10 bg-gray-50 dark:bg-gray-800 px-4 py-3.5 text-left font-semibold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider whitespace-nowrap">Teacher ID</th>
              <th className="sticky top-0 z-10 bg-gray-50 dark:bg-gray-800 px-4 py-3.5 text-left font-semibold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider whitespace-nowrap">Status</th>
              <th className="sticky top-0 z-10 bg-gray-50 dark:bg-gray-800 px-4 py-3.5 text-left font-semibold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider whitespace-nowrap">Check In</th>
              <th className="sticky top-0 z-10 bg-gray-50 dark:bg-gray-800 px-4 py-3.5 text-left font-semibold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider whitespace-nowrap">Check Out</th>
              <th className="sticky top-0 z-10 bg-gray-50 dark:bg-gray-800 px-4 py-3.5 text-left font-semibold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider whitespace-nowrap">Working Hours</th>
              <th className="sticky top-0 z-10 bg-gray-50 dark:bg-gray-800 px-4 py-3.5 text-left font-semibold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {paginatedTeachers.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-16 text-center">
                  <div className="flex flex-col items-center justify-center text-gray-400 dark:text-gray-500">
                    <UsersIcon className="h-12 w-12 mb-3" />
                    <p className="text-sm font-medium">No Teachers Loaded</p>
                    <p className="text-xs mt-1">Select Academic Year and click Load Teachers.</p>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedTeachers.map((teacher) => {
                const record = attendanceMap[teacher._id] || { status: 'Present', checkIn: '' };
                return (
                  <tr key={teacher._id} className="bg-white dark:bg-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <td className="px-4 py-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-xs ring-1 ring-yellow-400/30">
                        {teacher.fullName?.charAt(0) || 'T'}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white whitespace-nowrap">{teacher.fullName}</td>
                    <td className="px-4 py-3 text-xs font-mono font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">{teacher.teacherId}</td>
                    <td className="px-4 py-3">
                      {isDeviceMode ? (
                        renderStatusBadge(record.status)
                      ) : (
                        renderStatusDropdown(teacher._id, record.status)
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-block text-xs font-mono text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/80 px-2.5 py-1 rounded-md border border-gray-100 dark:border-gray-700 min-w-[72px]">
                        {record.checkIn || '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-block text-xs font-mono text-gray-400 dark:text-gray-500 px-2.5 py-1">
                        —
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-block text-xs font-mono text-gray-400 dark:text-gray-500 px-2.5 py-1">
                        —
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {!isDeviceMode && (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setViewTeacher(teacher)}
                            title="View Attendance"
                            className="p-1.5 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors cursor-pointer"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setResetTarget(teacher._id)}
                            title="Reset Attendance"
                            className="p-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                          >
                            <ArrowPathIcon className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
        {renderPagination()}
      </div>
    </>
  );

  const renderViewModal = () => {
    if (!viewTeacher) return null;
    const record = attendanceMap[viewTeacher._id] || {};
    return (
      <Modal isOpen={!!viewTeacher} onClose={() => setViewTeacher(null)} title="Attendance Details" maxWidth="max-w-md">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-xl ring-2 ring-yellow-400/50 mb-3 overflow-hidden">
            {viewTeacher.fullName?.charAt(0) || 'T'}
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{viewTeacher.fullName}</h3>
          {renderStatusBadge(record.status || '—')}
        </div>
        <div className="space-y-0">
          <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
            <span className="text-sm text-gray-500 dark:text-gray-400">Teacher ID</span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">{viewTeacher.teacherId}</span>
          </div>

          <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
            <span className="text-sm text-gray-500 dark:text-gray-400">Attendance Status</span>
            <span className="text-sm font-medium">{renderStatusBadge(record.status || '—')}</span>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
            <span className="text-sm text-gray-500 dark:text-gray-400">Check In Time</span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">{record.checkIn || '—'}</span>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
            <span className="text-sm text-gray-500 dark:text-gray-400">Academic Year</span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">{academicYear || '—'}</span>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
            <span className="text-sm text-gray-500 dark:text-gray-400">Attendance Mode</span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">{attendanceMode}</span>
          </div>
          <div className="flex items-center justify-between py-3">
            <span className="text-sm text-gray-500 dark:text-gray-400">Date</span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">{date}</span>
          </div>
        </div>
      </Modal>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Teacher Attendance</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage daily teacher attendance records</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard icon={CheckCircleIcon} label="Present Teachers" value={stats.present} color="green" />
        <StatCard icon={XCircleIcon} label="Absent Teachers" value={stats.absent} color="red" />
        <StatCard icon={ClockIcon} label="Leave" value={stats.leave} color="yellow" />
        <StatCard icon={CalendarDaysIcon} label="Late" value={stats.late} color="blue" />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <SelectInput
            label="Academic Year"
            name="academicYear"
            value={academicYear}
            onChange={(e) => setAcademicYear(e.target.value)}
            options={ACADEMIC_YEARS}
            placeholder="Select year"
          />
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Teacher</label>
            <div className="relative">
              <select
                value={selectedTeacherId}
                onChange={(e) => { setSelectedTeacherId(e.target.value); setCurrentPage(1); }}
                className="appearance-none w-full px-4 py-2.5 pr-10 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
              >
                <option value="">All Teachers</option>
                {teacherOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <svg className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          <DateInput
            label="Date"
            name="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Attendance Mode
            </label>
            <div className="relative">
              <select
                value={attendanceMode}
                onChange={(e) => setAttendanceMode(e.target.value)}
                className="appearance-none w-full px-4 py-2.5 pr-10 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
              >
                {ATTENDANCE_MODES.map(mode => (
                  <option key={mode} value={mode}>{mode}</option>
                ))}
              </select>
              <svg className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
          <button
            onClick={loadTeachers}
            disabled={!academicYear || loading}
            className="px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
          >
            <UsersIcon className="h-4 w-4" />
            Load Teachers
          </button>
        </div>
      </div>

      {isDeviceMode && (
        <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-xl p-4 flex items-start gap-3">
          <InformationCircleIcon className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-800 dark:text-blue-200">Biometric Device Mode</p>
            <p className="text-xs text-blue-600 dark:text-blue-300 mt-0.5">
              Waiting for biometric device connection. Attendance records are in read-only mode.
            </p>
          </div>
        </div>
      )}

      {loading && renderLoadingState()}
      {!loading && !loaded && renderEmptyState()}
      {!loading && loaded && renderTable()}

      {renderViewModal()}

      <ConfirmationModal
        isOpen={!!resetTarget}
        onClose={() => setResetTarget(null)}
        title="Reset Attendance"
        message="Are you sure you want to reset this teacher's attendance record? The status and check-in time will be cleared."
        confirmLabel="Reset"
        cancelLabel="Cancel"
        variant="primary"
        onConfirm={handleResetConfirm}
      />
    </div>
  );
};

export default TeacherAttendance;
