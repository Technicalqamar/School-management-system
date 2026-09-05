import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from '../../../hooks/useLocalization';
import {
  CheckCircleIcon, XCircleIcon, ClockIcon, CalendarDaysIcon,
  UserGroupIcon, ArrowPathIcon,
  PrinterIcon, EyeIcon, MagnifyingGlassIcon, ChevronDownIcon, XMarkIcon,
} from '@heroicons/react/24/outline';
import StatCard from '../../common/StatCard/StatCard';
import SearchInput from '../../common/SearchInput/SearchInput';
import { CLASS_NAMES, ACADEMIC_YEARS, DEPARTMENTS } from '../../../utils/classNames';
import attendanceHistoryService from '../../../services/attendanceHistory/attendanceHistory.service';

const STATUS_OPTIONS = ['All', 'Present', 'Absent', 'Leave', 'Late'];
const PAGE_SIZE = 10;
const TYPE_OPTIONS = ['All', 'Students', 'Teachers'];

const STATUS_STYLES = {
  Present: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700',
  Absent: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-300 dark:border-red-700',
  Leave: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700',
  Late: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-300 dark:border-orange-700',
};

function getInitials(name) {
  return name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
}

function formatDateDisplay(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatTimeDisplay(timeStr) {
  if (!timeStr) return '—';
  return timeStr;
}

const AttendanceHistory = () => {
  const { t } = useTranslation();
  const [allRecords, setAllRecords] = useState([]);
  const [type, setType] = useState('All');
  const [academicYear, setAcademicYear] = useState('');
  const [className, setClassName] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [status, setStatus] = useState('All');
  const [search, setSearch] = useState('');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    let cancelled = false;
    const loadRecords = async () => {
      try {
        const records = await attendanceHistoryService.getRecords();
        if (!cancelled) setAllRecords(records);
      } catch {
        if (!cancelled) setAllRecords([]);
      }
    };
    loadRecords();
    return () => { cancelled = true; };
  }, []);

  const filteredRecords = useMemo(() => {
    let list = allRecords;
    const typeFilter = type === 'All' ? null : type === 'Students' ? 'Student' : 'Teacher';
    if (typeFilter) list = list.filter((r) => r.type === typeFilter);
    if (academicYear) list = list.filter((r) => r.academicYear === academicYear);
    if (className) list = list.filter((r) => r.classOrDept === className);
    if (status !== 'All') list = list.filter((r) => r.status === status);
    if (fromDate) list = list.filter((r) => r.date >= fromDate);
    if (toDate) list = list.filter((r) => r.date <= toDate);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((r) => r.name.toLowerCase().includes(q) || r.personId.toLowerCase().includes(q));
    }
    return list;
  }, [allRecords, type, academicYear, className, fromDate, toDate, status, search]);

  const dashboardStats = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return {
      totalRecords: filteredRecords.length,
      todayRecords: filteredRecords.filter((r) => r.date === today).length,
      studentRecords: filteredRecords.filter((r) => r.type === 'Student').length,
      teacherRecords: filteredRecords.filter((r) => r.type === 'Teacher').length,
    };
  }, [filteredRecords]);

  const deptOptions = useMemo(() => {
    if (type === 'Teachers') return DEPARTMENTS;
    if (type === 'All') return [...CLASS_NAMES, ...DEPARTMENTS];
    return CLASS_NAMES;
  }, [type]);

  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / PAGE_SIZE));

  const paginatedRecords = useMemo(
    () => filteredRecords.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [filteredRecords, currentPage]
  );

  useEffect(() => {
    const id = setTimeout(() => setCurrentPage(1), 0);
    return () => clearTimeout(id);
  }, [filteredRecords]);

  const handleSearch = async () => {
    try {
      const records = await attendanceHistoryService.getRecords({
        type: type === 'All' ? undefined : type === 'Students' ? 'Student' : 'Teacher',
        academicYear: academicYear || undefined,
        className: className || undefined,
        status: status !== 'All' ? status : undefined,
        fromDate: fromDate || undefined,
        toDate: toDate || undefined,
        search: search || undefined,
      });
      setAllRecords(records);
    } catch {
      setAllRecords([]);
    }
  };

  const handleReset = async () => {
    setType('All');
    setAcademicYear('');
    setClassName('');
    setFromDate('');
    setToDate('');
    setStatus('All');
    setSearch('');
    try {
      const records = await attendanceHistoryService.getRecords();
      setAllRecords(records);
    } catch {
      setAllRecords([]);
    }
  };

  const renderPhoto = (record) => (
    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-xs ring-1 flex-shrink-0 ${
      record.type === 'Teacher'
        ? 'bg-gradient-to-br from-purple-500 to-purple-700 ring-purple-400/50'
        : 'bg-gradient-to-br from-blue-500 to-blue-700 ring-yellow-400/50'
    }`}>
      {getInitials(record.name)}
    </div>
  );

  const renderStatusBadge = (status) => {
    const style = STATUS_STYLES[status] || STATUS_STYLES.Present;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${style}`}>
        {status === 'Present' && <CheckCircleIcon className="h-3 w-3" />}
        {status === 'Absent' && <XCircleIcon className="h-3 w-3" />}
        {status === 'Leave' && <ClockIcon className="h-3 w-3" />}
        {status === 'Late' && <CalendarDaysIcon className="h-3 w-3" />}
        {status}
      </span>
    );
  };

  const renderModeBadge = (mode) => {
    const colors = {
      Manual: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600',
      'QR Code': 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700',
      'Hardware (Coming Soon)': 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700',
    };
    return (
      <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-medium border ${colors[mode] || colors.Manual}`}>
        {mode}
      </span>
    );
  };

  const renderPagination = () => {
    if (filteredRecords.length === 0) return null;
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
          {filteredRecords.length} record{filteredRecords.length !== 1 ? 's' : ''} &mdash; {t('page')} {currentPage} {t('of')} {totalPages}
        </span>
        <div className="flex items-center gap-1">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => p - 1)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            {t('previous')}
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
            {t('next')}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('attendanceHistoryTitle')}</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('attendanceHistorySubtitle')}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard icon={UserGroupIcon} label={t('totalRecords')} value={dashboardStats.totalRecords} color="blue" />
        <StatCard icon={CalendarDaysIcon} label={t('todaysRecords')} value={dashboardStats.todayRecords} color="green" />
        <StatCard icon={UserGroupIcon} label={t('studentRecords')} value={dashboardStats.studentRecords} color="yellow" />
        <StatCard icon={UserGroupIcon} label={t('teacherRecords')} value={dashboardStats.teacherRecords} color="purple" />
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-5">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">{t('attendanceType')}</label>
            <div className="relative">
              <select value={type} onChange={(e) => { setType(e.target.value); setClassName(''); }}
                className="appearance-none w-full px-3 py-2.5 pr-8 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer">
                {TYPE_OPTIONS.map((o) => <option key={o} value={o}>{o === 'All' ? t('all') : o === 'Students' ? t('students') : t('teachers')}</option>)}
              </select>
              <ChevronDownIcon className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">{t('academicYearLabel')}</label>
            <div className="relative">
              <select value={academicYear} onChange={(e) => setAcademicYear(e.target.value)}
                className="appearance-none w-full px-3 py-2.5 pr-8 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer">
                <option value="">{t('allYears')}</option>
                {ACADEMIC_YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
              <ChevronDownIcon className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
              {type === 'Teachers' ? t('classDept') : t('classLabel')}
            </label>
            <div className="relative">
              <select value={className} onChange={(e) => setClassName(e.target.value)}
                className="appearance-none w-full px-3 py-2.5 pr-8 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer">
                <option value="">{type === 'Teachers' ? t('allDepartments') : t('allClasses')}</option>
                {deptOptions.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
              <ChevronDownIcon className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">{t('fromDate')}</label>
            <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">{t('toDate')}</label>
            <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">{t('statusLabel')}</label>
            <div className="relative">
              <select value={status} onChange={(e) => setStatus(e.target.value)}
                className="appearance-none w-full px-3 py-2.5 pr-8 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer">
                {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s === 'All' ? t('all') : t(s.toLowerCase())}</option>)}
              </select>
              <ChevronDownIcon className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
          <button onClick={handleSearch}
            className="px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-sm hover:shadow-md transition-all flex items-center gap-2 cursor-pointer">
            <MagnifyingGlassIcon className="h-4 w-4" />
            {t('searchButton')}
          </button>
          <button onClick={handleReset}
            className="px-4 py-2.5 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm hover:shadow-md transition-all flex items-center gap-2 cursor-pointer">
            <ArrowPathIcon className="h-4 w-4" />
            {t('reset')}
          </button>
          <div className="ml-auto">
            <SearchInput placeholder={t('searchNameOrId')} value={search} onChange={setSearch} />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-800">
              <th className="px-3 py-3 text-left font-semibold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider">{t('photo')}</th>
              <th className="px-3 py-3 text-left font-semibold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider">{t('nameColumn')}</th>
              <th className="px-3 py-3 text-left font-semibold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider">{t('idColumn')}</th>
              <th className="px-3 py-3 text-left font-semibold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider">{t('type')}</th>
              <th className="px-3 py-3 text-left font-semibold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider">{t('classDept')}</th>
              <th className="px-3 py-3 text-left font-semibold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider">{t('dateLabel')}</th>
              <th className="px-3 py-3 text-left font-semibold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider">{t('checkIn')}</th>
              <th className="px-3 py-3 text-left font-semibold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider">{t('status')}</th>
              <th className="px-3 py-3 text-left font-semibold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider">{t('mode')}</th>
              <th className="px-3 py-3 text-left font-semibold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider no-print">{t('actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredRecords.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-4 py-8 text-center text-gray-400 dark:text-gray-500">
                  <div className="flex flex-col items-center gap-2">
                    <UserGroupIcon className="h-12 w-12 text-gray-300 dark:text-gray-600" />
                    <p className="text-sm">{t('noRecordsFound')}</p>
                    <p className="text-xs">{t('adjustFilters')}</p>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedRecords.map((record) => (
                <tr key={record.id} className="bg-white dark:bg-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <td className="px-3 py-3">{renderPhoto(record)}</td>
                  <td className="px-3 py-3 text-sm font-medium text-gray-900 dark:text-white">{record.name}</td>
                  <td className="px-3 py-3 text-xs font-mono font-medium text-gray-700 dark:text-gray-300">{record.personId}</td>
                  <td className="px-3 py-3">
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium border ${
                      record.type === 'Teacher'
                        ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-700'
                        : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700'
                    }`}>
                      {record.type}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-xs text-gray-500 dark:text-gray-400">{record.classOrDept}</td>
                  <td className="px-3 py-3 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">{formatDateDisplay(record.date)}</td>
                  <td className="px-3 py-3 text-xs font-mono text-gray-600 dark:text-gray-400">{formatTimeDisplay(record.checkIn)}</td>
                  <td className="px-3 py-3">{renderStatusBadge(record.status)}</td>
                  <td className="px-3 py-3">{renderModeBadge(record.mode)}</td>
                  <td className="px-3 py-3 no-print">
                    <div className="flex items-center gap-2">
                      <button onClick={() => setSelectedRecord(record)}
                        className="p-1.5 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors cursor-pointer" title={t('viewDetails')}>
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      <button onClick={() => {
                        const pw = window.open('', '_blank');
                        if (!pw) return;
                        const html = `
                          <html><head><title>${t('attendanceRecord')}</title>
                          <style>
                            @page { margin: 15mm; }
                            body { font-family: 'Segoe UI', Arial, sans-serif; -webkit-print-color-adjust: exact; }
                            .card { max-width: 500px; margin: 0 auto; border: 1px solid #d1d5db; border-radius: 12px; padding: 24px; }
                            h2 { text-align: center; color: #1f2937; margin-bottom: 16px; }
                            .row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #f3f4f6; font-size: 13px; }
                            .label { color: #6b7280; }
                            .value { font-weight: 600; color: #1f2937; }
                            .badge { display: inline-block; padding: 2px 10px; border-radius: 9999px; font-size: 11px; font-weight: 600; }
                          </style></head>
                          <body>
                            <div class="card">
                              <h2>${t('attendanceRecord')}</h2>
                              <div class="row"><span class="label">${t('nameColumn')}</span><span class="value">${record.name}</span></div>
                              <div class="row"><span class="label">${t('idColumn')}</span><span class="value">${record.personId}</span></div>
                              <div class="row"><span class="label">${t('type')}</span><span class="value">${record.type}</span></div>
                              <div class="row"><span class="label">${t('classDept')}</span><span class="value">${record.classOrDept}</span></div>
                              <div class="row"><span class="label">${t('dateLabel')}</span><span class="value">${formatDateDisplay(record.date)}</span></div>
                              <div class="row"><span class="label">${t('checkIn')}</span><span class="value">${formatTimeDisplay(record.checkIn)}</span></div>
                              <div class="row"><span class="label">${t('status')}</span><span class="value">${record.status}</span></div>
                              <div class="row"><span class="label">${t('mode')}</span><span class="value">${record.mode}</span></div>
                            </div>
                            <p style="text-align:center;font-size:11px;color:#9ca3af;margin-top:16px;">${t('generatedOn')}${new Date().toLocaleDateString()}</p>
                          </body></html>
                        `;
                        pw.document.write(html);
                        pw.document.close();
                        pw.focus();
                        setTimeout(() => pw.print(), 300);
                      }} className="p-1.5 rounded-lg text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors cursor-pointer" title={t('printRecord')}>
                        <PrinterIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        {renderPagination()}
      </div>

      {/* Details Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setSelectedRecord(null)}>
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-sm font-semibold text-gray-800 dark:text-white">{t('attendanceRecordDetails')}</h2>
              <button onClick={() => setSelectedRecord(null)}
                className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors cursor-pointer">
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="px-5 py-5 max-h-[80vh] overflow-y-auto">
              <div className="flex items-center gap-4 mb-5">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg ring-2 ${
                  selectedRecord.type === 'Teacher'
                    ? 'bg-gradient-to-br from-purple-500 to-purple-700 ring-purple-400/50'
                    : 'bg-gradient-to-br from-blue-500 to-blue-700 ring-yellow-400/50'
                }`}>
                  {getInitials(selectedRecord.name)}
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white">{selectedRecord.name}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{selectedRecord.personId}</p>
                </div>
                <div className="ml-auto">
                  {renderStatusBadge(selectedRecord.status)}
                </div>
              </div>
              <div className="space-y-3">
                {[
                  [t('type'), selectedRecord.type],
                  [t('classDept'), selectedRecord.classOrDept],
                  [t('academicYearLabel'), selectedRecord.academicYear],
                  [t('dateLabel'), formatDateDisplay(selectedRecord.date)],
                  [t('checkInTime'), formatTimeDisplay(selectedRecord.checkIn)],
                  [t('attendanceMode'), selectedRecord.mode],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between items-center py-2 px-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <span className="text-xs text-gray-500 dark:text-gray-400">{label}</span>
                    <span className="text-xs font-medium text-gray-800 dark:text-gray-200">{value}</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 mt-5">
                <button
                  onClick={() => setSelectedRecord(null)}
                  className="flex-1 py-2 rounded-lg text-xs font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all cursor-pointer">
                  {t('close')}
                </button>
                <button
                  onClick={() => {
                    const pw = window.open('', '_blank');
                    if (!pw) return;
                    const html = `
                      <html><head><title>${t('attendanceRecord')}</title>
                      <style>
                        @page { margin: 15mm; }
                        body { font-family: 'Segoe UI', Arial, sans-serif; -webkit-print-color-adjust: exact; }
                        .card { max-width: 500px; margin: 0 auto; border: 1px solid #d1d5db; border-radius: 12px; padding: 24px; }
                        h2 { text-align: center; color: #1f2937; margin-bottom: 16px; }
                        .row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #f3f4f6; font-size: 13px; }
                        .label { color: #6b7280; }
                        .value { font-weight: 600; color: #1f2937; }
                      </style></head>
                      <body>
                        <div class="card">
                          <h2>${t('attendanceRecord')}</h2>
                          <div class="row"><span class="label">${t('nameColumn')}</span><span class="value">${selectedRecord.name}</span></div>
                          <div class="row"><span class="label">${t('idColumn')}</span><span class="value">${selectedRecord.personId}</span></div>
                          <div class="row"><span class="label">${t('type')}</span><span class="value">${selectedRecord.type}</span></div>
                          <div class="row"><span class="label">${t('classDept')}</span><span class="value">${selectedRecord.classOrDept}</span></div>
                          <div class="row"><span class="label">${t('academicYearLabel')}</span><span class="value">${selectedRecord.academicYear}</span></div>
                          <div class="row"><span class="label">${t('dateLabel')}</span><span class="value">${formatDateDisplay(selectedRecord.date)}</span></div>
                          <div class="row"><span class="label">${t('checkIn')}</span><span class="value">${formatTimeDisplay(selectedRecord.checkIn)}</span></div>
                          <div class="row"><span class="label">${t('status')}</span><span class="value">${selectedRecord.status}</span></div>
                          <div class="row"><span class="label">${t('mode')}</span><span class="value">${selectedRecord.mode}</span></div>
                        </div>
                        <p style="text-align:center;font-size:11px;color:#9ca3af;margin-top:16px;">${t('generatedOn')}${new Date().toLocaleDateString()}</p>
                      </body></html>
                    `;
                    pw.document.write(html);
                    pw.document.close();
                    pw.focus();
                    setTimeout(() => pw.print(), 300);
                  }}
                  className="flex-1 py-2 rounded-lg text-xs font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1.5">
                  <PrinterIcon className="h-3.5 w-3.5" /> {t('printRecord')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceHistory;