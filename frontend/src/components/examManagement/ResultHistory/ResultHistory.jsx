import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ArrowPathIcon, EyeIcon, PrinterIcon, ArrowDownTrayIcon,
  ClockIcon, AcademicCapIcon,
} from '@heroicons/react/24/outline';
import SearchInput from '../../common/SearchInput/SearchInput';
import Table from '../../common/Table/Table';
import Modal from '../../common/Modal/Modal';
import SelectInput from '../../common/SelectInput/SelectInput';
import {
  exams,
  subjectMarks,
  examStudents,
  initialMarksData,
} from '../../../data/examManagement/dummyData';
import { computeStudentResult } from '../../../data/examManagement/resultUtils';
import { useSchoolConfig } from '../../../contexts/SchoolConfigContext';

const CLASS_OPTIONS = [
  'Montessori', 'Nursery', 'KG1', 'KG2',
  '1', '2', '3', '4', '5',
  '6', '7', '8', '9', '10',
];

const toDataClass = (label) => {
  if (['Montessori', 'Nursery', 'KG1', 'KG2'].includes(label)) return label;
  if (/^\d+$/.test(label)) return `Class ${label}`;
  return label;
};

const STATUS_OPTIONS = ['Passed', 'Failed', 'Pending'];

const ResultHistory = () => {
  const { schoolInfo, academic } = useSchoolConfig();

  const centralYear = academic?.currentYear || '';
  const centralYearOptions = centralYear ? [centralYear] : [];

  const [academicYear, setAcademicYear] = useState(() => centralYear || '');
  const [examId, setExamId] = useState('');
  const [className, setClassName] = useState('');
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [generated, setGenerated] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewRecord, setViewRecord] = useState(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (!centralYear || academicYear === centralYear) {
      return undefined;
    }
    const timer = setTimeout(() => {
      setAcademicYear(centralYear);
      setExamId('');
      setClassName('');
      setGenerated(false);
    }, 0);
    return () => clearTimeout(timer);
  }, [centralYear, academicYear]);

  const filteredExams = useMemo(() => {
    if (!academicYear) return [];
    return exams.filter((e) => e.academicYear === academicYear && e.status === 'Active');
  }, [academicYear]);

  const historyRecords = useMemo(() => {
    const records = [];
    exams.forEach((exam) => {
      if (exam.status !== 'Active') return;
      const classesForExam = subjectMarks
        .filter((s) => s.examId === exam.id && s.academicYear === exam.academicYear && s.status === 'Active')
        .map((s) => s.className);
      const uniqueClasses = [...new Set(classesForExam)];
      uniqueClasses.forEach((cls) => {
        const requiredSubjects = subjectMarks.filter(
          (s) => s.examId === exam.id && s.className === cls && s.academicYear === exam.academicYear && s.status === 'Active'
        );
        const studentsInClass = examStudents.filter((st) => st.className === cls);
        studentsInClass.forEach((student) => {
          records.push(computeStudentResult({ student, exam, requiredSubjects, marksData: initialMarksData }));
        });
      });
    });
    return records;
  }, []);

  const filteredResults = useMemo(() => {
    if (!generated || !academicYear) return [];
    const q = search.toLowerCase();
    return historyRecords.filter((r) => {
      if (r.academicYear !== academicYear) return false;
      if (examId && r.exam.id !== Number(examId)) return false;
      if (className && r.className !== toDataClass(className)) return false;
      if (filterStatus && r.status !== filterStatus) return false;
      if (search &&
        !r.student.id.toLowerCase().includes(q) &&
        !r.student.name.toLowerCase().includes(q) &&
        !r.student.rollNumber.toLowerCase().includes(q)) {
        return false;
      }
      return true;
    });
  }, [generated, academicYear, examId, className, search, filterStatus, historyRecords]);

  const summary = useMemo(() => {
    if (filteredResults.length === 0) return null;
    const totalStudents = filteredResults.length;
    const withMarks = filteredResults.filter((r) => r.allEntered).length;
    const passed = filteredResults.filter((r) => r.status === 'Passed').length;
    const failed = filteredResults.filter((r) => r.status === 'Failed').length;
    const pending = filteredResults.filter((r) => r.status === 'Pending').length;
    const avgPct = filteredResults.filter((r) => r.percentage !== null);
    const avg = avgPct.length > 0
      ? Number((avgPct.reduce((sum, r) => sum + r.percentage, 0) / avgPct.length).toFixed(1))
      : null;
    return { totalStudents, withMarks, passed, failed, pending, avg };
  }, [filteredResults]);

  const handleGenerate = useCallback(() => {
    if (!academicYear) return;
    setGenerated(true);
    setSearch('');
    setFilterStatus('');
  }, [academicYear]);

  const handleReset = useCallback(() => {
    setAcademicYear(centralYear);
    setExamId('');
    setClassName('');
    setSearch('');
    setFilterStatus('');
    setGenerated(false);
  }, [centralYear]);

  const openView = (record) => {
    setViewRecord(record);
    setShowViewModal(true);
  };

  const displayClassName = (rec) => {
    const c = rec.className;
    return c.startsWith('Class ') ? c.replace('Class ', '') : c;
  };

  const buildResultHtml = useCallback((record) => {
    if (!record) return null;
    const sName = schoolInfo?.name || 'My School';
    const generatedOn = new Date().toLocaleString();
    const today = new Date().toLocaleDateString();
    const exam = record.exam;
    const cls = displayClassName(record);
    const subjectRows = record.subjectResults.map((subj) => {
      const statusText = !subj.entered ? 'Pending'
        : subj.passed ? 'Pass' : 'Fail';
      const statusCls = !subj.entered ? 'status-pending'
        : subj.passed ? 'status-pass' : 'status-fail';
      return `<tr>
        <td style="font-weight:600;">${subj.subjectName}</td>
        <td style="font-family:monospace;font-size:9px;color:#6b7280;">${subj.subjectCode}</td>
        <td>${subj.totalMarks}</td>
        <td>${subj.passingMarks}</td>
        <td>${subj.entered ? subj.obtainedMarks : '-'}</td>
        <td>${subj.entered ? `${subj.percentage}%` : '-'}</td>
        <td>${subj.entered ? `<span class="badge grade-${subj.grade}">${subj.grade}</span>` : '-'}</td>
        <td><span class="${statusCls}">${statusText}</span></td>
      </tr>`;
    }).join('');

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Result - ${record.student.name}</title>
  <style>
    @page { size: A4 portrait; margin: 12mm; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', Arial, sans-serif; -webkit-print-color-adjust: exact; print-color-adjust: exact; color: #1f2937; background: #fff; font-size: 11px; }
    .rpt-hdr { background: linear-gradient(135deg, #1e3a5f, #1e40af); padding: 18px 24px; border-radius: 6px 6px 0 0; color: #fff; }
    .rpt-hdr h1 { font-size: 18px; font-weight: 700; letter-spacing: 0.3px; }
    .rpt-hdr p { font-size: 11px; color: rgba(255,255,255,0.75); margin-top: 2px; }
    .rpt-hdr .date { text-align: right; }
    .rpt-hdr .date p { font-size: 10px; }
    .rpt-hdr .date p:last-child { color: #fff; font-weight: 600; font-size: 11px; }
    .rpt-body { padding: 16px 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 6px 6px; }
    .rpt-title { text-align: center; margin-bottom: 14px; }
    .rpt-title h2 { font-size: 16px; color: #1e40af; font-weight: 700; }
    .rpt-title p { font-size: 10px; color: #6b7280; margin-top: 2px; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 8px; margin-bottom: 14px; }
    .info-card { background: #f3f4f6; padding: 8px 10px; border-radius: 4px; }
    .info-card .lbl { font-size: 9px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600; }
    .info-card .val { font-size: 11px; font-weight: 700; color: #111827; margin-top: 2px; }
    .sec-title { font-size: 13px; font-weight: 700; color: #1e40af; margin: 16px 0 8px; padding-bottom: 4px; border-bottom: 2px solid #1e40af; }
    table { width: 100%; border-collapse: collapse; font-size: 10px; margin-bottom: 12px; }
    thead th { background: #1e40af; color: #fff; padding: 7px 8px; text-align: left; font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
    tbody td { padding: 6px 8px; border-bottom: 1px solid #e5e7eb; text-align: center; }
    tbody td:first-child, tbody td:nth-child(2) { text-align: left; }
    tbody tr:nth-child(even) { background: #f9fafb; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 10px; font-size: 9px; font-weight: 700; }
    .grade-A\\+ { background: #d1fae5; color: #065f46; }
    .grade-A { background: #bbf7d0; color: #166534; }
    .grade-B { background: #dbeafe; color: #1e40af; }
    .grade-C { background: #fef9c3; color: #854d0e; }
    .grade-D { background: #ffedd5; color: #c2410c; }
    .grade-F { background: #fee2e2; color: #991b1b; }
    .status-pass { background: #dcfce7; color: #166534; padding: 2px 8px; border-radius: 10px; font-size: 9px; font-weight: 600; }
    .status-fail { background: #fee2e2; color: #991b1b; padding: 2px 8px; border-radius: 10px; font-size: 9px; font-weight: 600; }
    .status-pending { background: #fef9c3; color: #854d0e; padding: 2px 8px; border-radius: 10px; font-size: 9px; font-weight: 600; }
    .summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 14px; }
    .summary-card { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 4px; padding: 10px; text-align: center; }
    .summary-card .lbl { font-size: 9px; color: #6b7280; text-transform: uppercase; font-weight: 600; }
    .summary-card .val { font-size: 14px; font-weight: 700; color: #111827; margin-top: 2px; }
    .summary-card .val.green { color: #16a34a; }
    .summary-card .val.red { color: #dc2626; }
    .summary-card .val.blue { color: #2563eb; }
    .ftr { border-top: 1px solid #e5e7eb; margin-top: 16px; padding-top: 8px; display: flex; justify-content: space-between; font-size: 8px; color: #9ca3af; }
    @media print { body { margin: 0; padding: 0; } .rpt-body { border: none; } }
  </style>
</head>
<body>
  <div class="rpt-hdr">
    <div style="display:flex;justify-content:space-between;align-items:center;">
      <div>
        <h1>${sName}</h1>
        <p>Student Result Report</p>
      </div>
      <div class="date">
        <p>Generated On</p>
        <p>${generatedOn}</p>
      </div>
    </div>
  </div>
  <div class="rpt-body">
    <div class="rpt-title">
      <h2>Examination Result Card</h2>
      <p>${exam.name} &mdash; Academic Year ${record.academicYear}</p>
    </div>
    <div>
      <div class="sec-title">Student Information</div>
      <div class="info-grid">
        <div class="info-card"><div class="lbl">Student ID</div><div class="val">${record.student.id}</div></div>
        <div class="info-card"><div class="lbl">Name</div><div class="val">${record.student.name}</div></div>
        <div class="info-card"><div class="lbl">Class</div><div class="val">Class ${cls}</div></div>
        <div class="info-card"><div class="lbl">Roll Number</div><div class="val">${record.student.rollNumber}</div></div>
      </div>
    </div>
    <div>
      <div class="sec-title">Subject-wise Marks</div>
      <table>
        <thead>
          <tr>
            <th>Subject</th><th>Code</th><th>Total</th><th>Pass</th>
            <th>Obtained</th><th>%</th><th>Grade</th><th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${subjectRows}
        </tbody>
      </table>
    </div>
    <div class="summary-grid">
      <div class="summary-card"><div class="lbl">Total Marks</div><div class="val">${record.totalMarks}</div></div>
      <div class="summary-card"><div class="lbl">Obtained</div><div class="val">${record.obtainedMarks !== null ? record.obtainedMarks : '-'}</div></div>
      <div class="summary-card"><div class="lbl">Percentage</div><div class="val blue">${record.percentage !== null ? `${record.percentage}%` : '-'}</div></div>
      <div class="summary-card"><div class="lbl">Grade</div><div class="val">${record.grade}</div></div>
      <div class="summary-card"><div class="lbl">Result</div><div class="val ${record.status === 'Passed' ? 'green' : record.status === 'Failed' ? 'red' : ''}">${record.status}</div></div>
      <div class="summary-card"><div class="lbl">Generated On</div><div class="val">${today}</div></div>
    </div>
    <div class="ftr">
      <span>${sName} &mdash; Student Result Report</span>
      <span>Page 1 of 1</span>
    </div>
  </div>
</body>
</html>`;
  }, [schoolInfo]);

  const handlePrint = useCallback((record) => {
    const html = buildResultHtml(record);
    if (!html) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) { window.print(); return; }
    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 500);
  }, [buildResultHtml]);

  const handleExportPdf = useCallback(async (record) => {
    const html = buildResultHtml(record);
    if (!html) return;
    setExporting(true);
    try {
      const { default: html2pdf } = await import('html2pdf.js');
      const el = document.createElement('div');
      el.innerHTML = html;
      el.style.position = 'fixed';
      el.style.left = '-9999px';
      el.style.top = '0';
      document.body.appendChild(el);
      const slug = `${record.student.name.replace(/\s+/g, '-')}`;
      await html2pdf().set({
        margin: [10, 10, 10, 10],
        filename: `Result-${slug}-${record.exam.name.replace(/\s+/g, '-')}-${record.academicYear}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      }).from(el).save();
      document.body.removeChild(el);
    } catch {
      // PDF generation failed silently
    } finally {
      setExporting(false);
    }
  }, [buildResultHtml]);

  const tableColumns = [
    { key: 'id', label: 'Student ID' },
    { key: 'name', label: 'Student Name' },
    { key: 'exam', label: 'Exam' },
    { key: 'academicYear', label: 'Year' },
    { key: 'className', label: 'Class' },
    { key: 'totalMarks', label: 'Total' },
    { key: 'obtainedMarks', label: 'Obtained' },
    { key: 'percentage', label: 'Percentage' },
    { key: 'grade', label: 'Grade' },
    { key: 'status', label: 'Result' },
    { key: 'actions', label: 'Actions', className: 'text-right' },
  ];

  const renderRow = (result) => (
    <>
      <td className="px-4 py-3 font-mono text-xs text-gray-600 dark:text-gray-400">{result.student.id}</td>
      <td className="px-4 py-3">
        <span className="font-medium text-gray-900 dark:text-white">{result.student.name}</span>
      </td>
      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{result.exam.name}</td>
      <td className="px-4 py-3 text-center text-gray-700 dark:text-gray-300">{result.academicYear}</td>
      <td className="px-4 py-3 text-center text-gray-700 dark:text-gray-300">{displayClassName(result)}</td>
      <td className="px-4 py-3 text-center text-sm font-medium text-gray-900 dark:text-white">{result.totalMarks}</td>
      <td className="px-4 py-3 text-center">
        {result.obtainedMarks !== null ? (
          <span className="text-sm font-semibold text-gray-900 dark:text-white">{result.obtainedMarks}</span>
        ) : (
          <span className="text-xs text-gray-400">—</span>
        )}
      </td>
      <td className="px-4 py-3 text-center">
        {result.percentage !== null ? (
          <span className="text-sm font-medium text-gray-900 dark:text-white">{result.percentage}%</span>
        ) : (
          <span className="text-xs text-gray-400">—</span>
        )}
      </td>
      <td className="px-4 py-3 text-center">
        <span className={`inline-flex items-center justify-center w-9 h-9 rounded-lg text-sm font-bold ${
          result.grade === 'A+' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
          : result.grade === 'A' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
          : result.grade === 'B' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
          : result.grade === 'C' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
          : result.grade === 'D' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300'
          : result.grade === 'F' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
        }`}>
          {result.grade}
        </span>
      </td>
      <td className="px-4 py-3">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          result.status === 'Passed'
            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
            : result.status === 'Failed'
            ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
            : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
        }`}>
          {result.status}
        </span>
      </td>
      <td className="px-4 py-3 text-right">
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => openView(result)}
            className="p-1.5 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors cursor-pointer"
            title="View Result"
          >
            <EyeIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => handlePrint(result)}
            className="p-1.5 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
            title="Print Result"
          >
            <PrinterIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleExportPdf(result)}
            disabled={exporting}
            className="p-1.5 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer disabled:opacity-50"
            title="Download PDF"
          >
            <ArrowDownTrayIcon className="h-4 w-4" />
          </button>
        </div>
      </td>
    </>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Result History</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Browse past examination results, view report cards, and export them as print or PDF.
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center gap-2 mb-4">
          <ClockIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Filter Result History</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          <SelectInput
            label="Academic Year"
            name="academicYear"
            value={academicYear}
            onChange={(e) => { setAcademicYear(e.target.value); setExamId(''); setClassName(''); setGenerated(false); }}
            options={centralYearOptions}
            placeholder="Select year"
            required
          />
          <SelectInput
            label="Exam"
            name="examId"
            value={examId}
            onChange={(e) => { setExamId(e.target.value); setClassName(''); }}
            options={filteredExams.map((e) => String(e.id))}
            placeholder={academicYear ? 'All exams' : 'Select year first'}
            disabled={!academicYear}
          />
          <SelectInput
            label="Class"
            name="className"
            value={className}
            onChange={(e) => setClassName(e.target.value)}
            options={CLASS_OPTIONS}
            placeholder="All classes"
            disabled={!academicYear}
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleGenerate}
            disabled={!academicYear}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all cursor-pointer whitespace-nowrap"
          >
            <EyeIcon className="h-4 w-4" /> View History
          </button>
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer whitespace-nowrap"
          >
            <ArrowPathIcon className="h-4 w-4" /> Reset
          </button>
          {generated && (
            <span className="ml-auto text-sm text-gray-500 dark:text-gray-400">
              Academic Year {academicYear}
              {examId && ` • ${filteredExams.find((e) => e.id === Number(examId))?.name || 'Exam'}`}
              {className && ` • Class ${className}`}
            </span>
          )}
        </div>
      </div>

      {generated && summary && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Total Results</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{summary.totalStudents}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">With Marks</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{summary.withMarks}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Passed</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{summary.passed}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Failed</p>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">{summary.failed}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Avg. Percentage</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{summary.avg !== null ? `${summary.avg}%` : '—'}</p>
          </div>
        </div>
      )}

      {generated ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Historical Results</h2>
            <div className="flex items-center gap-3">
              <div className="w-56">
                <SearchInput placeholder="Search student ID, name..." value={search} onChange={setSearch} />
              </div>
              <SelectInput
                name="filterStatus"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                options={STATUS_OPTIONS}
                placeholder="All Status"
              />
            </div>
          </div>
          <Table columns={tableColumns} data={filteredResults} renderRow={renderRow} />
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center mb-4">
              <AcademicCapIcon className="h-8 w-8 text-blue-500 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Result History</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
              Select an Academic Year (optionally an Exam, Class and Result Status) and click <strong>View History</strong> to browse past examination results.
            </p>
          </div>
        </div>
      )}

      <Modal
        isOpen={showViewModal}
        onClose={() => { setShowViewModal(false); setViewRecord(null); }}
        title="Result History Details"
        maxWidth="max-w-2xl"
      >
        {viewRecord && (
          <div className="space-y-5">
            <div className="text-center pb-4 border-b border-gray-200 dark:border-gray-700">
              <div className="mx-auto w-14 h-14 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center mb-3">
                <span className="text-sm font-bold text-blue-600 dark:text-blue-400 font-mono">{viewRecord.student.rollNumber}</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{viewRecord.student.name}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-mono">{viewRecord.student.id}</p>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-2 ${
                viewRecord.status === 'Passed'
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                  : viewRecord.status === 'Failed'
                  ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                  : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
              }`}>
                {viewRecord.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Exam</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{viewRecord.exam.name}</p>
              </div>
              <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Academic Year</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{viewRecord.academicYear}</p>
              </div>
              <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Class</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{displayClassName(viewRecord)}</p>
              </div>
              <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Roll Number</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{viewRecord.student.rollNumber}</p>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Subject-wise Results</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Subject</th>
                      <th className="text-center px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Total</th>
                      <th className="text-center px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Pass</th>
                      <th className="text-center px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Obtained</th>
                      <th className="text-center px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">%</th>
                      <th className="text-center px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Grade</th>
                      <th className="text-center px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {viewRecord.subjectResults.map((subj, idx) => (
                      <tr key={idx} className="border-b border-gray-100 dark:border-gray-700/50">
                        <td className="px-3 py-2.5">
                          <span className="font-medium text-gray-900 dark:text-white">{subj.subjectName}</span>
                          <span className="ml-1.5 text-xs text-gray-400 font-mono">{subj.subjectCode}</span>
                        </td>
                        <td className="px-3 py-2.5 text-center text-gray-700 dark:text-gray-300">{subj.totalMarks}</td>
                        <td className="px-3 py-2.5 text-center text-gray-700 dark:text-gray-300">{subj.passingMarks}</td>
                        <td className="px-3 py-2.5 text-center">
                          {subj.entered ? (
                            <span className="font-semibold text-gray-900 dark:text-white">{subj.obtainedMarks}</span>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          {subj.entered ? (
                            <span className="text-gray-700 dark:text-gray-300">{subj.percentage}%</span>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          <span className={`inline-flex items-center justify-center w-8 h-8 rounded-md text-xs font-bold ${
                            subj.grade === 'A+' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                            : subj.grade === 'A' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                            : subj.grade === 'B' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                            : subj.grade === 'C' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                            : subj.grade === 'D' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300'
                            : subj.grade === 'F' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                          }`}>
                            {subj.grade}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          {!subj.entered ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300">Pending</span>
                          ) : subj.passed ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">Pass</span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300">Fail</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Overall Result</h4>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Total Marks</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{viewRecord.totalMarks}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Obtained</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{viewRecord.obtainedMarks !== null ? viewRecord.obtainedMarks : '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Percentage</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{viewRecord.percentage !== null ? `${viewRecord.percentage}%` : '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Grade</p>
                  <span className={`inline-flex items-center justify-center w-10 h-10 rounded-lg text-sm font-bold ${
                    viewRecord.grade === 'A+' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                    : viewRecord.grade === 'A' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                    : viewRecord.grade === 'B' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                    : viewRecord.grade === 'C' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                    : viewRecord.grade === 'D' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300'
                    : viewRecord.grade === 'F' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                  }`}>
                    {viewRecord.grade}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Status</p>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    viewRecord.status === 'Passed'
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                      : viewRecord.status === 'Failed'
                      ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                      : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                  }`}>
                    {viewRecord.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-3 pt-2 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => { setShowViewModal(false); setViewRecord(null); }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => handlePrint(viewRecord)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors cursor-pointer"
              >
                <PrinterIcon className="h-4 w-4" /> Print
              </button>
              <button
                onClick={() => handleExportPdf(viewRecord)}
                disabled={exporting}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:opacity-60 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                <ArrowDownTrayIcon className="h-4 w-4" /> {exporting ? 'Downloading...' : 'Download PDF'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ResultHistory;