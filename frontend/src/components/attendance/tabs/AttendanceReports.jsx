import { useState, useEffect, useMemo, useRef } from 'react';
import { useTranslation } from '../../../hooks/useLocalization';
import toast from 'react-hot-toast';
import {
  CheckCircleIcon, XCircleIcon, ClockIcon, CalendarDaysIcon,
  UserGroupIcon, ArrowPathIcon, DocumentArrowDownIcon,
  PrinterIcon, EyeIcon, MagnifyingGlassIcon, ChevronDownIcon,
  ChartBarSquareIcon,
} from '@heroicons/react/24/outline';
import StatCard from '../../common/StatCard/StatCard';
import { ACADEMIC_YEARS, CLASS_NAMES, DEPARTMENTS } from '../../../utils/classNames';
import attendanceReportsService from '../../../services/attendanceReports/attendanceReports.service';
import Spinner from '../../common/Spinner/Spinner';
import { useSchoolConfig } from '../../../contexts/SchoolConfigContext';

const PAGE_SIZE = 10;
const TYPE_OPTIONS = ['All', 'Students', 'Teachers'];

function getInitials(name) {
  return name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
}

const DonutChart = ({ present, absent, leave, late, total }) => {
  const { t } = useTranslation();
  if (!total) return null;
  const segments = [
    { label: t('present'), value: present, color: '#22c55e' },
    { label: t('absent'), value: absent, color: '#ef4444' },
    { label: t('leave'), value: leave, color: '#eab308' },
    { label: t('late'), value: late, color: '#f97316' },
  ];
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;
  let pathData = '';
  segments.forEach((seg) => {
    if (seg.value === 0) return;
    const ratio = seg.value / total;
    const length = ratio * circumference;
    pathData += `<circle cx="80" cy="80" r="${radius}" fill="none" stroke="${seg.color}" stroke-width="18" stroke-dasharray="${length} ${circumference - length}" stroke-dashoffset="${-offset}" transform="rotate(-90 80 80)" />`;
    offset += length;
  });
  return (
    <div className="flex flex-col items-center">
      <svg width="160" height="160" viewBox="0 0 160 160" dangerouslySetInnerHTML={{ __html: pathData }} />
      <div className="flex flex-wrap gap-3 mt-3 justify-center">
        {segments.map((s) => (
          <div key={s.label} className="flex items-center gap-1 text-[10px] text-gray-500 dark:text-gray-400">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
            {s.label} ({s.value})
          </div>
        ))}
      </div>
    </div>
  );
};

const MonthlyBarChart = ({ data }) => {
  const { t } = useTranslation();
  if (!data.length) return null;
  const maxVal = Math.max(...data.map((d) => d.total), 1);
  return (
    <div className="flex items-end gap-2 h-32">
      {data.map((d) => {
        const presentH = (d.present / maxVal) * 100;
        const absentH = (d.absent / maxVal) * 100;
        return (
          <div key={d.month} className="flex-1 flex flex-col items-center gap-1">
            <div className="w-full flex flex-col items-center justify-end" style={{ height: '100px' }}>
              <div className="w-full relative" style={{ height: '100px' }}>
                <div className="absolute bottom-0 w-full bg-red-400 dark:bg-red-500 rounded-t transition-all" style={{ height: `${absentH}%`, minHeight: d.absent > 0 ? '2px' : '0' }} title={`${d.month}: ${d.absent} ${t('absent').toLowerCase()}`} />
                <div className="absolute bottom-0 w-full bg-green-500 dark:bg-green-400 rounded-t transition-all" style={{ height: `${presentH}%`, minHeight: d.present > 0 ? '2px' : '0' }} title={`${d.month}: ${d.present} ${t('present').toLowerCase()}`} />
              </div>
            </div>
            <span className="text-[8px] text-gray-400 dark:text-gray-500 whitespace-nowrap">{d.month.slice(5)}</span>
          </div>
        );
      })}
    </div>
  );
};

const ClassBarChart = ({ data }) => {
  if (!data.length) return null;
  return (
    <div className="space-y-2">
      {data.slice(0, 10).map((d) => {
        const pct = d.percentage;
        return (
          <div key={d.name} className="flex items-center gap-2">
            <span className="text-[10px] text-gray-500 dark:text-gray-400 w-16 truncate text-right" title={d.name}>{d.name}</span>
            <div className="flex-1 h-4 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
            </div>
            <span className="text-[10px] font-mono text-gray-500 dark:text-gray-400 w-8 text-right">{pct}%</span>
          </div>
        );
      })}
    </div>
  );
};

const AttendanceReports = () => {
  const { t } = useTranslation();
  const { schoolInfo } = useSchoolConfig();
  const [allRecords, setAllRecords] = useState([]);
  const [type, setType] = useState('All');
  const [academicYear, setAcademicYear] = useState('');
  const [className, setClassName] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [personSummary, setPersonSummary] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const tableRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    const loadRecords = async () => {
      try {
        const records = await attendanceReportsService.getRecords();
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
    if (fromDate) list = list.filter((r) => r.date >= fromDate);
    if (toDate) list = list.filter((r) => r.date <= toDate);
    return list;
  }, [allRecords, type, academicYear, className, fromDate, toDate]);

  const isTeacherView = type === 'Teachers';

  const personSummaries = useMemo(() => {
    return attendanceReportsService.getPersonSummaries(filteredRecords);
  }, [filteredRecords]);

  const stats = useMemo(() => attendanceReportsService.getStats(filteredRecords), [filteredRecords]);
  const monthlyTrend = useMemo(() => attendanceReportsService.getMonthlyTrend(filteredRecords), [filteredRecords]);
  const classWiseStats = useMemo(() => attendanceReportsService.getClassWiseStats(filteredRecords), [filteredRecords]);
  const teacherOverview = useMemo(() => attendanceReportsService.getTeacherOverview(filteredRecords), [filteredRecords]);

  const totalPages = Math.max(1, Math.ceil(personSummaries.length / PAGE_SIZE));

  const paginatedSummaries = useMemo(
    () => personSummaries.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [personSummaries, currentPage]
  );

  useEffect(() => {
    const id = setTimeout(() => setCurrentPage(1), 0);
    return () => clearTimeout(id);
  }, [personSummaries]);

  const deptOptions = useMemo(() => {
    if (type === 'All') return [...CLASS_NAMES, ...DEPARTMENTS];
    return CLASS_NAMES;
  }, [type]);

  const handleGenerateReport = async () => {
    try {
      const records = await attendanceReportsService.getRecords({
        type: type === 'All' ? undefined : type === 'Students' ? 'Student' : 'Teacher',
        academicYear: academicYear || undefined,
        className: className || undefined,
        fromDate: fromDate || undefined,
        toDate: toDate || undefined,
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
    try {
      const records = await attendanceReportsService.getRecords();
      setAllRecords(records);
    } catch {
      setAllRecords([]);
    }
  };

  const buildReportHtml = () => {
    const schoolName = schoolInfo?.name || t('schoolName');
    const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const title = t('fullReport');
    const isTeacher = type === 'Teachers';

    const filterInfo = [];
    if (academicYear) filterInfo.push(`${t('academicYearLabel')}: ${academicYear}`);
    if (className) filterInfo.push(isTeacher ? `${t('department')}: ${className}` : `${t('classLabel')}: ${className}`);
    if (fromDate) filterInfo.push(`${t('fromDate')}: ${fromDate}`);
    if (toDate) filterInfo.push(`${t('toDate')}: ${toDate}`);

    const cols = isTeacher
      ? [t('nameColumn'), t('idColumn'), t('present'), t('absent'), t('leave'), t('late'), t('attendancePercentage')]
      : [t('nameColumn'), t('idColumn'), t('classLabel'), t('present'), t('absent'), t('leave'), t('late'), t('attendancePercentage')];

    const rowsHtml = paginatedSummaries.map((p) => {
      const cells = [
        `<td style="padding:7px 10px;border-bottom:1px solid #e5e7eb;font-size:10px;font-weight:600;color:#1f2937;">${p.name}</td>`,
        `<td style="padding:7px 10px;border-bottom:1px solid #e5e7eb;font-size:10px;font-family:monospace;color:#4b5563;">${p.personId}</td>`,
      ];
      if (!isTeacher) {
        cells.push(`<td style="padding:7px 10px;border-bottom:1px solid #e5e7eb;font-size:10px;color:#6b7280;">${p.classOrDept}</td>`);
      }
      cells.push(
        `<td style="padding:7px 10px;border-bottom:1px solid #e5e7eb;font-size:10px;font-family:monospace;color:#16a34a;font-weight:600;text-align:center;">${p.present}</td>`,
        `<td style="padding:7px 10px;border-bottom:1px solid #e5e7eb;font-size:10px;font-family:monospace;color:#dc2626;font-weight:600;text-align:center;">${p.absent}</td>`,
        `<td style="padding:7px 10px;border-bottom:1px solid #e5e7eb;font-size:10px;font-family:monospace;color:#ca8a04;font-weight:600;text-align:center;">${p.leave}</td>`,
        `<td style="padding:7px 10px;border-bottom:1px solid #e5e7eb;font-size:10px;font-family:monospace;color:#ea580c;font-weight:600;text-align:center;">${p.late}</td>`,
        `<td style="padding:7px 10px;border-bottom:1px solid #e5e7eb;font-size:11px;font-family:monospace;font-weight:700;text-align:center;color:${p.percentage >= 80 ? '#16a34a' : p.percentage >= 60 ? '#ca8a04' : '#dc2626'};">${p.percentage}%</td>`
      );
      return `<tr style="background:#ffffff;">${cells.join('')}</tr>`;
    }).join('');

    const headerCells = cols.map((c) =>
      `<th style="background:#1e40af;color:white;padding:8px 10px;font-size:10px;font-weight:700;text-align:${c === 'Present' || c === 'Absent' || c === 'Leave' || c === 'Late' || c === 'Attendance %' ? 'center' : 'left'};text-transform:uppercase;letter-spacing:0.5px;">${c}</th>`
    ).join('');

    const filterSection = filterInfo.length
      ? `<div style="text-align:center;font-size:10px;color:#6b7280;margin-bottom:14px;">${filterInfo.join(' &nbsp;|&nbsp; ')}</div>`
      : '';

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    @page { size: A4 landscape; margin: 10mm; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', Arial, sans-serif; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  </style>
</head>
<body>
  <div style="max-width:100%;margin:0 auto;">
    <div style="background:linear-gradient(135deg,#1e3a5f,#1e40af);padding:18px 24px;border-radius:4px 4px 0 0;">
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <div>
          <h1 style="color:white;font-size:18px;font-weight:700;letter-spacing:0.3px;margin:0;">${schoolName}</h1>
          <p style="color:rgba(255,255,255,0.7);font-size:11px;margin-top:3px;">${title}</p>
        </div>
        <div style="text-align:right;">
          <p style="color:rgba(255,255,255,0.7);font-size:10px;margin:0;">${t('generatedOn')}</p>
          <p style="color:white;font-size:11px;font-weight:600;margin:0;">${today}</p>
        </div>
      </div>
    </div>
    ${filterSection}
    <div style="overflow-x:auto;">
      <table style="width:100%;border-collapse:collapse;font-size:10px;">
        <thead>${headerCells}</thead>
        <tbody>
          ${rowsHtml || `<tr><td colspan="${cols.length}" style="padding:30px;text-align:center;color:#9ca3af;font-size:11px;">${t('noRecordsFound')}</td></tr>`}
        </tbody>
      </table>
    </div>
    <div style="border-top:1px solid #e5e7eb;margin-top:12px;padding-top:8px;display:flex;justify-content:space-between;align-items:center;">
      <p style="font-size:8px;color:#9ca3af;margin:0;">${schoolName} &mdash; ${title}</p>
      <p style="font-size:8px;color:#9ca3af;margin:0;">Page 1 of 1</p>
    </div>
  </div>
</body>
</html>`;
  };

  const handleExportPdf = async () => {
    if (!paginatedSummaries.length) { toast.error('No records to export on the current page'); return; }
    try {
      const { default: html2pdf } = await import('html2pdf.js');
      const html = buildReportHtml();
      const el = document.createElement('div');
      el.innerHTML = html;
      document.body.appendChild(el);
      await html2pdf().set({
        margin: [6, 6, 6, 6],
        filename: `Attendance-Report-${academicYear || 'all'}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' },
      }).from(el).save();
      document.body.removeChild(el);
      toast.success(t('savedSuccessfully'));
    } catch { toast.error(t('failedToSave')); }
  };

  const handlePrint = () => {
    if (!paginatedSummaries.length) { toast.error(t('noRecordsFound')); return; }
    const printWindow = window.open('', '_blank');
    if (!printWindow) { window.print(); return; }
    const html = buildReportHtml();
    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 500);
  };

  const handleViewReport = async (person) => {
    setLoadingSummary(true);
    setSelectedPerson(person);
    await new Promise((r) => setTimeout(r, 200));
    const summary = attendanceReportsService.getPersonSummary(allRecords, person.personId);
    setPersonSummary(summary);
    setLoadingSummary(false);
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

  const renderPercentageBadge = (pct) => {
    const color = pct >= 80 ? 'text-green-600 dark:text-green-400' : pct >= 60 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400';
    return <span className={`text-xs font-mono font-semibold ${color}`}>{pct}%</span>;
  };

  const renderPagination = () => {
    if (personSummaries.length === 0) return null;
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
          {personSummaries.length} person{personSummaries.length !== 1 ? 's' : ''} &mdash; {t('page')} {currentPage} {t('of')} {totalPages}
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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('attendanceReportsTitle')}</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('attendanceReportsSubtitle')}</p>
      </div>

      {/* Summary Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard icon={UserGroupIcon} label={t('totalAttendance')} value={stats.total} color="blue" />
        <StatCard icon={CheckCircleIcon} label={t('present')} value={stats.present} color="green" />
        <StatCard icon={XCircleIcon} label={t('absent')} value={stats.absent} color="red" />
        <StatCard icon={ClockIcon} label={t('leave')} value={stats.leave} color="yellow" />
        <StatCard icon={CalendarDaysIcon} label={t('late')} value={stats.late} color="orange" />
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('attendancePercentage')}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.percentage}%</p>
            </div>
            <div className="p-3 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400">
              <ChartBarSquareIcon className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-3 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-indigo-500 to-indigo-400 rounded-full transition-all" style={{ width: `${stats.percentage}%` }} />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-5">
        <div className={`grid grid-cols-2 sm:grid-cols-3 ${isTeacherView ? 'lg:grid-cols-4' : 'lg:grid-cols-5'} gap-4`}>
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
          {!isTeacherView && (
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">{t('classLabel')}</label>
            <div className="relative">
              <select value={className} onChange={(e) => setClassName(e.target.value)}
                className="appearance-none w-full px-3 py-2.5 pr-8 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer">
                <option value="">{t('allClasses')}</option>
                {deptOptions.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
              <ChevronDownIcon className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
          )}
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
        </div>

        <div className="flex flex-wrap items-center gap-3 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
          <button onClick={handleGenerateReport}
            className="px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-sm hover:shadow-md transition-all flex items-center gap-2 cursor-pointer">
            <MagnifyingGlassIcon className="h-4 w-4" />
            {t('generateReport')}
          </button>
          <button onClick={handleReset}
            className="px-4 py-2.5 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm hover:shadow-md transition-all flex items-center gap-2 cursor-pointer">
            <ArrowPathIcon className="h-4 w-4" />
            {t('reset')}
          </button>
          <button onClick={handlePrint}
            disabled={!filteredRecords.length}
            className="px-4 py-2.5 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer">
            <PrinterIcon className="h-4 w-4" />
            {t('printReport')}
          </button>
          <button onClick={handleExportPdf}
            disabled={!filteredRecords.length}
            className="px-4 py-2.5 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer">
            <DocumentArrowDownIcon className="h-4 w-4" />
            {t('exportPdf')}
          </button>
        </div>
      </div>

      {/* Charts */}
      {filteredRecords.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-5">
            <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wider">{t('monthlyTrend')}</h3>
            <MonthlyBarChart data={monthlyTrend} />
            <div className="flex items-center justify-center gap-4 mt-2 text-[10px] text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500" /> {t('present')}</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400" /> {t('absent')}</span>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-5">
            <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wider">{t('presentVsAbsent')}</h3>
            <DonutChart present={stats.present} absent={stats.absent} leave={stats.leave} late={stats.late} total={stats.total} />
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-5">
            <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wider">{t('classWiseAttendance')}</h3>
            <ClassBarChart data={classWiseStats} />
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-5">
            <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wider">{t('teacherOverview')}</h3>
            {teacherOverview.length > 0 ? <ClassBarChart data={teacherOverview} /> : (
              <div className="flex flex-col items-center justify-center h-32 text-gray-400 dark:text-gray-500">
                <UserGroupIcon className="h-8 w-8 mb-2" />
                <p className="text-xs">{t('noTeacherData')}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Summary Table */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm" ref={tableRef}>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-800">
              <th className="px-3 py-3 text-left font-semibold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider">{t('photo')}</th>
              <th className="px-3 py-3 text-left font-semibold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider">{t('nameColumn')}</th>
              <th className="px-3 py-3 text-left font-semibold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider">{t('idColumn')}</th>
              <th className="px-3 py-3 text-left font-semibold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider">{t('type')}</th>
              {!isTeacherView && <th className="px-3 py-3 text-left font-semibold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider">{t('classLabel')}</th>}
              <th className="px-3 py-3 text-left font-semibold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider">{t('presentDays')}</th>
              <th className="px-3 py-3 text-left font-semibold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider">{t('absentDays')}</th>
              <th className="px-3 py-3 text-left font-semibold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider">{t('leaveDays')}</th>
              <th className="px-3 py-3 text-left font-semibold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider">{t('lateDays')}</th>
              <th className="px-3 py-3 text-left font-semibold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider">{t('attendancePercentage')}</th>
              <th className="px-3 py-3 text-left font-semibold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider no-print">{t('action')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {personSummaries.length === 0 ? (
              <tr>
                <td colSpan={isTeacherView ? 10 : 11} className="px-4 py-8 text-center text-gray-400 dark:text-gray-500">
                  <div className="flex flex-col items-center gap-2">
                    <UserGroupIcon className="h-12 w-12 text-gray-300 dark:text-gray-600" />
                    <p className="text-sm">{t('noRecordsFound')}</p>
                    <p className="text-xs">{t('adjustFilters')}</p>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedSummaries.map((person) => (
                <tr key={person.personId} className="bg-white dark:bg-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <td className="px-3 py-3">{renderPhoto(person)}</td>
                  <td className="px-3 py-3 text-sm font-medium text-gray-900 dark:text-white">{person.name}</td>
                  <td className="px-3 py-3 text-xs font-mono font-medium text-gray-700 dark:text-gray-300">{person.personId}</td>
                  <td className="px-3 py-3">
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium border ${
                      person.type === 'Teacher'
                        ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-700'
                        : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700'
                    }`}>
                      {person.type}
                    </span>
                  </td>
                  {!isTeacherView && <td className="px-3 py-3 text-xs text-gray-500 dark:text-gray-400">{person.classOrDept}</td>}
                  <td className="px-3 py-3 text-xs font-mono text-green-600 dark:text-green-400 font-medium">{person.present}</td>
                  <td className="px-3 py-3 text-xs font-mono text-red-600 dark:text-red-400 font-medium">{person.absent}</td>
                  <td className="px-3 py-3 text-xs font-mono text-yellow-600 dark:text-yellow-400 font-medium">{person.leave}</td>
                  <td className="px-3 py-3 text-xs font-mono text-orange-600 dark:text-orange-400 font-medium">{person.late}</td>
                  <td className="px-3 py-3">{renderPercentageBadge(person.percentage)}</td>
                  <td className="px-3 py-3 no-print">
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleViewReport(person)}
                        className="p-1.5 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors cursor-pointer" title={t('viewReport')}>
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      <button onClick={async () => {
                        const summary = attendanceReportsService.getPersonSummary(allRecords, person.personId);
                        if (!summary) return;
                        const pw = window.open('', '_blank');
                        if (!pw) return;
                        const modeRows = Object.entries(summary.modeStats || {}).map(([m, c]) =>
                          `<div class="row"><span class="label">${m}</span><span class="value">${c}</span></div>`
                        ).join('');
                        const monthlyRows = (summary.monthly || []).map((m) =>
                          `<div class="row"><span class="label">${m.month}</span><span class="value">${m.present}/${m.total} (${m.total > 0 ? Math.round((m.present / m.total) * 100) : 0}%)</span></div>`
                        ).join('');
                        const html = `
                          <html><head><title>Full Report - ${summary.name}</title>
                          <style>
                            @page { margin: 12mm; }
                            body { font-family: 'Segoe UI', Arial, sans-serif; -webkit-print-color-adjust: exact; }
                            .card { max-width: 600px; margin: 0 auto; border: 1px solid #d1d5db; border-radius: 12px; padding: 24px; }
                            h2 { text-align: center; color: #1f2937; margin-bottom: 8px; font-size: 16px; }
                            .subtitle { text-align: center; color: #6b7280; font-size: 12px; margin-bottom: 20px; }
                            .section-title { font-size: 11px; font-weight: 700; color: #374151; text-transform: uppercase; letter-spacing: 0.5px; margin: 16px 0 8px; }
                            .row { display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid #f3f4f6; font-size: 12px; }
                            .label { color: #6b7280; }
                            .value { font-weight: 600; color: #1f2937; }
                            .stats-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; margin: 12px 0; }
                            .stat-box { text-align: center; padding: 8px; background: #f9fafb; border-radius: 8px; }
                            .stat-value { font-size: 18px; font-weight: 700; color: #1f2937; }
                            .stat-label { font-size: 9px; color: #9ca3af; }
                            .footer { text-align: center; font-size: 10px; color: #9ca3af; margin-top: 20px; }
                          </style></head>
                          <body>
                            <div class="card">
                              <h2>${t('attendanceReport')}</h2>
                              <p class="subtitle">${summary.personId} &bull; ${summary.type} &bull; ${summary.classOrDept}</p>
                              <div class="stats-grid">
                                <div class="stat-box"><div class="stat-value">${summary.total}</div><div class="stat-label">${t('total')}</div></div>
                                <div class="stat-box"><div class="stat-value" style="color:#16a34a;">${summary.present}</div><div class="stat-label">${t('present')}</div></div>
                                <div class="stat-box"><div class="stat-value" style="color:#dc2626;">${summary.absent}</div><div class="stat-label">${t('absent')}</div></div>
                                <div class="stat-box"><div class="stat-value" style="color:#ca8a04;">${summary.leave}</div><div class="stat-label">${t('leave')}</div></div>
                                <div class="stat-box"><div class="stat-value" style="color:#ea580c;">${summary.late}</div><div class="stat-label">${t('late')}</div></div>
                              </div>
                              <div style="text-align:center;margin:12px 0;"><span style="font-size:24px;font-weight:700;color:#4f46e5;">${summary.percentage}%</span><span style="font-size:12px;color:#6b7280;margin-left:4px;">${t('attendance')}</span></div>
                              <div class="section-title">${t('details')}</div>
                              <div class="row"><span class="label">${t('academicYearLabel')}</span><span class="value">${summary.academicYear}</span></div>
                              <div class="section-title">${t('monthlySummary')}</div>
                              ${monthlyRows}
                              <div class="section-title">${t('attendanceModeDetail')}</div>
                              ${modeRows}
                            </div>
                            <p class="footer">${t('generatedOn')}${new Date().toLocaleDateString()}</p>
                          </body></html>`;
                        pw.document.write(html);
                        pw.document.close();
                        pw.focus();
                        setTimeout(() => pw.print(), 300);
                      }} className="p-1.5 rounded-lg text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors cursor-pointer" title={t('printReport')}>
                        <PrinterIcon className="h-4 w-4" />
                      </button>
                      <button onClick={async () => {
                        try {
                          const summary = attendanceReportsService.getPersonSummary(allRecords, person.personId);
                          if (!summary) return;
                          const { default: html2pdf } = await import('html2pdf.js');
                          const modeRows = Object.entries(summary.modeStats || {}).map(([m, c]) =>
                            `<div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid #f3f4f6;font-size:11px;"><span style="color:#6b7280;">${m}</span><span style="font-weight:600;color:#1f2937;">${c}</span></div>`
                          ).join('');
                          const monthlyRows = (summary.monthly || []).map((m) =>
                            `<div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid #f3f4f6;font-size:11px;"><span style="color:#6b7280;">${m.month}</span><span style="font-weight:600;color:#1f2937;">${m.present}/${m.total} (${m.total > 0 ? Math.round((m.present / m.total) * 100) : 0}%)</span></div>`
                          ).join('');
                          const qrHtml = `
                            <div style="max-width:600px;margin:12mm auto;font-family:'Segoe UI',Arial,sans-serif;">
                              <h2 style="text-align:center;color:#1f2937;font-size:16px;">${t('attendanceReport')}</h2>
                              <p style="text-align:center;color:#6b7280;font-size:11px;margin-bottom:16px;">${summary.personId} &bull; ${summary.type} &bull; ${summary.classOrDept}</p>
                              <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:6px;margin:12px 0;">
                                ${[[t('total'), summary.total], [t('present'), summary.present], [t('absent'), summary.absent], [t('leave'), summary.leave], [t('late'), summary.late]].map(([l, v]) =>
                                  `<div style="text-align:center;padding:6px;background:#f9fafb;border-radius:6px;"><div style="font-size:16px;font-weight:700;color:#1f2937;">${v}</div><div style="font-size:9px;color:#9ca3af;">${l}</div></div>`
                                ).join('')}
                              </div>
                              <p style="text-align:center;font-size:20px;font-weight:700;color:#4f46e5;margin:8px 0;">${summary.percentage}% ${t('attendance')}</p>
                              <h3 style="font-size:10px;font-weight:700;color:#374151;text-transform:uppercase;margin:12px 0 6px;">${t('details')}</h3>
                              <div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid #f3f4f6;font-size:11px;"><span style="color:#6b7280;">${t('academicYearLabel')}</span><span style="font-weight:600;color:#1f2937;">${summary.academicYear}</span></div>
                              <h3 style="font-size:10px;font-weight:700;color:#374151;text-transform:uppercase;margin:12px 0 6px;">${t('monthlySummary')}</h3>
                              ${monthlyRows}
                              <h3 style="font-size:10px;font-weight:700;color:#374151;text-transform:uppercase;margin:12px 0 6px;">${t('attendanceModeDetail')}</h3>
                              ${modeRows}
                              <p style="text-align:center;font-size:9px;color:#9ca3af;margin-top:16px;">${t('generatedOn')}${new Date().toLocaleDateString()}</p>
                            </div>`;
                          const el = document.createElement('div');
                          el.innerHTML = qrHtml;
                          document.body.appendChild(el);
                          await html2pdf().set({
                            margin: [8, 8, 8, 8],
                            filename: `Attendance-Report-${summary.personId}.pdf`,
                            image: { type: 'jpeg', quality: 0.98 },
                            html2canvas: { scale: 2, useCORS: true, logging: false },
                            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
                          }).from(el).save();
                          document.body.removeChild(el);
                          toast.success(t('savedSuccessfully'));
                        } catch { toast.error(t('failedToSave')); }
                      }} className="p-1.5 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer" title={t('downloadPdf')}>
                        <DocumentArrowDownIcon className="h-4 w-4" />
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

      {/* Report Details Modal */}
      {selectedPerson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => { setSelectedPerson(null); setPersonSummary(null); }}>
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-sm font-semibold text-gray-800 dark:text-white">{t('reportDetails')}</h2>
              <button onClick={() => { setSelectedPerson(null); setPersonSummary(null); }}
                className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors cursor-pointer">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="px-5 py-5 max-h-[80vh] overflow-y-auto">
              {loadingSummary || !personSummary ? (
                <div className="flex items-center justify-center py-10">
                  <Spinner size="md" className="text-blue-500" />
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-4 mb-5">
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg ring-2 ${
                      personSummary.type === 'Teacher'
                        ? 'bg-gradient-to-br from-purple-500 to-purple-700 ring-purple-400/50'
                        : 'bg-gradient-to-br from-blue-500 to-blue-700 ring-yellow-400/50'
                    }`}>
                      {getInitials(personSummary.name)}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-base font-semibold text-gray-900 dark:text-white truncate">{personSummary.name}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{personSummary.personId}</p>
                    </div>
                    <div className="ml-auto text-center">
                      <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{personSummary.percentage}%</p>
                      <p className="text-[10px] text-gray-400 dark:text-gray-500">{t('attendance')}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-5 gap-2 mb-5">
                    {[
                      [t('total'), personSummary.total, 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'],
                      [t('present'), personSummary.present, 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400'],
                      [t('absent'), personSummary.absent, 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'],
                      [t('leave'), personSummary.leave, 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400'],
                      [t('late'), personSummary.late, 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400'],
                    ].map(([label, value, color]) => (
                      <div key={label} className="text-center p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                        <p className={`text-lg font-bold ${color.split(' ')[2]}`}>{value}</p>
                        <p className="text-[10px] text-gray-400 dark:text-gray-500">{label}</p>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-3 mb-5">
                    {[
                      [t('type'), personSummary.type],
                      [t('classDept'), personSummary.classOrDept],
                      [t('academicYearLabel'), personSummary.academicYear],
                    ].map(([label, value]) => (
                      <div key={label} className="flex justify-between items-center py-2 px-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <span className="text-xs text-gray-500 dark:text-gray-400">{label}</span>
                        <span className="text-xs font-medium text-gray-800 dark:text-gray-200">{value}</span>
                      </div>
                    ))}
                  </div>

                  {personSummary.monthly.length > 0 && (
                    <div className="mb-5">
                      <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">{t('monthlySummary')}</h4>
                      <div className="space-y-1.5">
                        {personSummary.monthly.map((m) => (
                          <div key={m.month} className="flex items-center gap-2 py-1.5 px-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <span className="text-[10px] font-medium text-gray-600 dark:text-gray-400 w-16">{m.month}</span>
                            <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden flex">
                              <div className="h-full bg-green-500" style={{ width: `${(m.present / (m.total || 1)) * 100}%` }} />
                              <div className="h-full bg-red-400" style={{ width: `${(m.absent / (m.total || 1)) * 100}%` }} />
                            </div>
                            <span className="text-[10px] font-mono text-gray-500 dark:text-gray-400 w-10 text-right">{m.present}/{m.total}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {Object.keys(personSummary.modeStats || {}).length > 0 && (
                    <div className="mb-5">
                      <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">{t('attendanceModeDetail')}</h4>
                      <div className="grid grid-cols-3 gap-2">
                        {Object.entries(personSummary.modeStats).map(([mode, count]) => (
                          <div key={mode} className="text-center p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                            <p className="text-lg font-bold text-gray-900 dark:text-white">{count}</p>
                            <p className="text-[9px] text-gray-400 dark:text-gray-500 truncate">{mode}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button onClick={() => { setSelectedPerson(null); setPersonSummary(null); }}
                      className="flex-1 py-2 rounded-lg text-xs font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all cursor-pointer">
                      {t('close')}
                    </button>
                    <button onClick={() => {
                      if (!personSummary) return;
                      const pw = window.open('', '_blank');
                      if (!pw) return;
                      const modeRows = Object.entries(personSummary.modeStats || {}).map(([m, c]) =>
                        `<div class="row"><span class="label">${m}</span><span class="value">${c}</span></div>`
                      ).join('');
                      const monthlyRows = (personSummary.monthly || []).map((m) =>
                        `<div class="row"><span class="label">${m.month}</span><span class="value">${m.present}/${m.total} (${m.total > 0 ? Math.round((m.present / m.total) * 100) : 0}%)</span></div>`
                      ).join('');
                      const html = `
                        <html><head><title>Full Report - ${personSummary.name}</title>
                        <style>
                          @page { margin: 12mm; }
                          body { font-family: 'Segoe UI', Arial, sans-serif; -webkit-print-color-adjust: exact; }
                          .card { max-width: 600px; margin: 0 auto; border: 1px solid #d1d5db; border-radius: 12px; padding: 24px; }
                          h2 { text-align: center; color: #1f2937; margin-bottom: 8px; font-size: 16px; }
                          .subtitle { text-align: center; color: #6b7280; font-size: 12px; margin-bottom: 20px; }
                          .section-title { font-size: 11px; font-weight: 700; color: #374151; text-transform: uppercase; letter-spacing: 0.5px; margin: 16px 0 8px; }
                          .row { display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid #f3f4f6; font-size: 12px; }
                          .label { color: #6b7280; }
                          .value { font-weight: 600; color: #1f2937; }
                          .stats-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; margin: 12px 0; }
                          .stat-box { text-align: center; padding: 8px; background: #f9fafb; border-radius: 8px; }
                          .stat-value { font-size: 18px; font-weight: 700; color: #1f2937; }
                          .stat-label { font-size: 9px; color: #9ca3af; }
                          .footer { text-align: center; font-size: 10px; color: #9ca3af; margin-top: 20px; }
                        </style></head>
                        <body>
                          <div class="card">
                            <h2>${t('attendanceReport')}</h2>
                            <p class="subtitle">${personSummary.personId} &bull; ${personSummary.type} &bull; ${personSummary.classOrDept}</p>
                            <div class="stats-grid">
                              <div class="stat-box"><div class="stat-value">${personSummary.total}</div><div class="stat-label">${t('total')}</div></div>
                              <div class="stat-box"><div class="stat-value" style="color:#16a34a;">${personSummary.present}</div><div class="stat-label">${t('present')}</div></div>
                              <div class="stat-box"><div class="stat-value" style="color:#dc2626;">${personSummary.absent}</div><div class="stat-label">${t('absent')}</div></div>
                              <div class="stat-box"><div class="stat-value" style="color:#ca8a04;">${personSummary.leave}</div><div class="stat-label">${t('leave')}</div></div>
                              <div class="stat-box"><div class="stat-value" style="color:#ea580c;">${personSummary.late}</div><div class="stat-label">${t('late')}</div></div>
                            </div>
                            <div style="text-align:center;margin:12px 0;"><span style="font-size:24px;font-weight:700;color:#4f46e5;">${personSummary.percentage}%</span><span style="font-size:12px;color:#6b7280;margin-left:4px;">${t('attendance')}</span></div>
                            <div class="section-title">${t('details')}</div>
                            <div class="row"><span class="label">${t('academicYearLabel')}</span><span class="value">${personSummary.academicYear}</span></div>
                            <div class="section-title">${t('monthlySummary')}</div>
                            ${monthlyRows}
                            <div class="section-title">${t('attendanceModeDetail')}</div>
                            ${modeRows}
                          </div>
                          <p class="footer">${t('generatedOn')}${new Date().toLocaleDateString()}</p>
                        </body></html>`;
                      pw.document.write(html);
                      pw.document.close();
                      pw.focus();
                      setTimeout(() => pw.print(), 300);
                    }} className="flex-1 py-2 rounded-lg text-xs font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1.5">
                      <PrinterIcon className="h-3.5 w-3.5" /> {t('printReport')}
                    </button>
                    <button onClick={async () => {
                      if (!personSummary) return;
                      try {
                        const { default: html2pdf } = await import('html2pdf.js');
                        const modeRows = Object.entries(personSummary.modeStats || {}).map(([m, c]) =>
                          `<div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid #f3f4f6;font-size:11px;"><span style="color:#6b7280;">${m}</span><span style="font-weight:600;color:#1f2937;">${c}</span></div>`
                        ).join('');
                        const monthlyRows = (personSummary.monthly || []).map((m) =>
                          `<div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid #f3f4f6;font-size:11px;"><span style="color:#6b7280;">${m.month}</span><span style="font-weight:600;color:#1f2937;">${m.present}/${m.total} (${m.total > 0 ? Math.round((m.present / m.total) * 100) : 0}%)</span></div>`
                        ).join('');
                        const html = `
                          <div style="max-width:600px;margin:12mm auto;font-family:'Segoe UI',Arial,sans-serif;">
                            <h2 style="text-align:center;color:#1f2937;font-size:16px;">Attendance Report</h2>
                            <p style="text-align:center;color:#6b7280;font-size:11px;margin-bottom:16px;">${personSummary.personId} &bull; ${personSummary.type} &bull; ${personSummary.classOrDept}</p>
                            <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:6px;margin:12px 0;">
                              ${[['Total', personSummary.total], ['Present', personSummary.present], ['Absent', personSummary.absent], ['Leave', personSummary.leave], ['Late', personSummary.late]].map(([l, v]) =>
                                `<div style="text-align:center;padding:6px;background:#f9fafb;border-radius:6px;"><div style="font-size:16px;font-weight:700;color:#1f2937;">${v}</div><div style="font-size:9px;color:#9ca3af;">${l}</div></div>`
                              ).join('')}
                            </div>
                            <p style="text-align:center;font-size:20px;font-weight:700;color:#4f46e5;margin:8px 0;">${personSummary.percentage}% Attendance</p>
                            <h3 style="font-size:10px;font-weight:700;color:#374151;text-transform:uppercase;margin:12px 0 6px;">Details</h3>
                            <div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid #f3f4f6;font-size:11px;"><span style="color:#6b7280;">Academic Year</span><span style="font-weight:600;color:#1f2937;">${personSummary.academicYear}</span></div>
                            <h3 style="font-size:10px;font-weight:700;color:#374151;text-transform:uppercase;margin:12px 0 6px;">Monthly Summary</h3>
                            ${monthlyRows}
                            <h3 style="font-size:10px;font-weight:700;color:#374151;text-transform:uppercase;margin:12px 0 6px;">Attendance Mode</h3>
                            ${modeRows}
                            <p style="text-align:center;font-size:9px;color:#9ca3af;margin-top:16px;">Generated on ${new Date().toLocaleDateString()}</p>
                          </div>`;
                        const el = document.createElement('div');
                        el.innerHTML = html;
                        document.body.appendChild(el);
                        await html2pdf().set({
                          margin: [8, 8, 8, 8],
                          filename: `Attendance-Report-${personSummary.personId}.pdf`,
                          image: { type: 'jpeg', quality: 0.98 },
                          html2canvas: { scale: 2, useCORS: true, logging: false },
                          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
                        }).from(el).save();
                        document.body.removeChild(el);
                        toast.success('PDF downloaded');
                      } catch { toast.error('Failed to download PDF'); }
                    }} className="flex-1 py-2 rounded-lg text-xs font-medium text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1.5">
                      <DocumentArrowDownIcon className="h-3.5 w-3.5" /> {t('downloadPdf')}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceReports;
