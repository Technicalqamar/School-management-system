import { useState, useEffect, useMemo, useCallback } from 'react';
import { ArrowPathIcon, DocumentCheckIcon, EyeIcon } from '@heroicons/react/24/outline';
import SearchInput from '../../common/SearchInput/SearchInput';
import Table from '../../common/Table/Table';
import Modal from '../../common/Modal/Modal';
import SelectInput from '../../common/SelectInput/SelectInput';
import { useSchoolConfig } from '../../../contexts/SchoolConfigContext';
import {
  exams,
  subjectMarks,
  examStudents,
  initialMarksData,
} from '../../../data/examManagement/dummyData';

const GRADE_SYSTEM = [
  { min: 90, max: 100, grade: 'A+' },
  { min: 80, max: 89, grade: 'A' },
  { min: 70, max: 79, grade: 'B' },
  { min: 60, max: 69, grade: 'C' },
  { min: 50, max: 59, grade: 'D' },
  { min: 0, max: 49, grade: 'F' },
];

const getGrade = (pct) => {
  if (pct === null || pct === undefined) return '-';
  for (const g of GRADE_SYSTEM) {
    if (pct >= g.min && pct <= g.max) return g.grade;
  }
  return 'F';
};

const Results = () => {
  const { academic } = useSchoolConfig();

  const centralYear = academic?.currentYear || '';
  const centralYearOptions = centralYear ? [centralYear] : [];

  const [academicYear, setAcademicYear] = useState(() => centralYear || '');
  const [examId, setExamId] = useState('');
  const [className, setClassName] = useState('');
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [generated, setGenerated] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewStudent, setViewStudent] = useState(null);

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
    return exams.filter((e) => e.academicYear === academicYear);
  }, [academicYear]);

  const filteredClasses = useMemo(() => {
    if (!examId) return [];
    const exam = exams.find((e) => e.id === Number(examId));
    return exam ? exam.classes : [];
  }, [examId]);

  const requiredSubjects = useMemo(() => {
    if (!examId || !className) return [];
    return subjectMarks.filter(
      (s) => s.examId === Number(examId) && s.className === className && s.academicYear === academicYear && s.status === 'Active'
    );
  }, [examId, className, academicYear]);

  const studentsInClass = useMemo(() => {
    if (!className) return [];
    return examStudents.filter((s) => s.className === className);
  }, [className]);

  const results = useMemo(() => {
    if (!generated || !examId || !className || requiredSubjects.length === 0) return [];

    return studentsInClass.map((student) => {
      const subjectResults = requiredSubjects.map((subj) => {
        const mark = initialMarksData.find(
          (m) => m.studentId === student.id && m.examId === Number(examId) && m.className === className && m.subjectName === subj.subjectName && m.academicYear === academicYear
        );
        return {
          subjectName: subj.subjectName,
          subjectCode: subj.subjectCode,
          totalMarks: subj.totalMarks,
          passingMarks: subj.passingMarks,
          obtainedMarks: mark ? mark.obtainedMarks : null,
          percentage: mark ? Number(((mark.obtainedMarks / subj.totalMarks) * 100).toFixed(1)) : null,
          grade: mark ? getGrade(((mark.obtainedMarks / subj.totalMarks) * 100).toFixed(1)) : '-',
          passed: mark ? mark.obtainedMarks >= subj.passingMarks : false,
          entered: mark !== null && mark !== undefined,
        };
      });

      const totalMarksAll = subjectResults.reduce((sum, s) => sum + s.totalMarks, 0);
      const obtainedMarksAll = subjectResults.filter((s) => s.entered).reduce((sum, s) => sum + s.obtainedMarks, 0);
      const allEntered = subjectResults.every((s) => s.entered);
      const allPassed = subjectResults.every((s) => !s.entered || s.passed);
      const percentage = allEntered ? Number(((obtainedMarksAll / totalMarksAll) * 100).toFixed(1)) : null;

      let status;
      if (!allEntered) {
        status = 'Pending';
      } else if (allPassed) {
        status = 'Passed';
      } else {
        status = 'Failed';
      }

      return {
        student,
        subjectResults,
        totalMarks: totalMarksAll,
        obtainedMarks: allEntered ? obtainedMarksAll : null,
        percentage,
        grade: percentage !== null ? getGrade(percentage) : '-',
        status,
        allEntered,
      };
    });
  }, [generated, examId, className, academicYear, requiredSubjects, studentsInClass]);

  const filteredResults = useMemo(() => {
    if (!search && !filterStatus) return results;
    return results.filter((r) => {
      const q = search.toLowerCase();
      const matchSearch = !search ||
        r.student.id.toLowerCase().includes(q) ||
        r.student.name.toLowerCase().includes(q) ||
        r.student.rollNumber.toLowerCase().includes(q);
      const matchStatus = !filterStatus || r.status === filterStatus;
      return matchSearch && matchStatus;
    });
  }, [results, search, filterStatus]);

  const summary = useMemo(() => {
    if (results.length === 0) return null;
    const totalStudents = results.length;
    const withMarks = results.filter((r) => r.allEntered).length;
    const passed = results.filter((r) => r.status === 'Passed').length;
    const failed = results.filter((r) => r.status === 'Failed').length;
    const pending = results.filter((r) => r.status === 'Pending').length;
    const avgPct = results.filter((r) => r.percentage !== null);
    const avg = avgPct.length > 0
      ? Number((avgPct.reduce((sum, r) => sum + r.percentage, 0) / avgPct.length).toFixed(1))
      : null;

    return { totalStudents, withMarks, passed, failed, pending, avg };
  }, [results]);

  const handleGenerate = useCallback(() => {
    if (!academicYear || !examId || !className) return;
    setGenerated(true);
    setSearch('');
    setFilterStatus('');
  }, [academicYear, examId, className]);

  const handleReset = useCallback(() => {
    setAcademicYear(centralYear);
    setExamId('');
    setClassName('');
    setSearch('');
    setFilterStatus('');
    setGenerated(false);
  }, [centralYear]);

  const openView = (result) => {
    setViewStudent(result);
    setShowViewModal(true);
  };

  const tableColumns = [
    { key: 'id', label: 'Student ID' },
    { key: 'name', label: 'Student Name' },
    { key: 'rollNumber', label: 'Roll No.' },
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
      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{result.student.rollNumber}</td>
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
        <button
          onClick={() => openView(result)}
          className="p-1.5 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors cursor-pointer"
          title="View Result"
        >
          <EyeIcon className="h-4 w-4" />
        </button>
      </td>
    </>
  );

  const displayExam = exams.find((e) => e.id === Number(examId));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Results</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            View and analyze examination results based on entered marks.
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center gap-2 mb-4">
          <DocumentCheckIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Select Examination Details</h2>
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
            onChange={(e) => { setExamId(e.target.value); setClassName(''); setGenerated(false); }}
            options={filteredExams.map((e) => String(e.id))}
            placeholder={academicYear ? 'Select exam' : 'Select year first'}
            disabled={!academicYear}
            required
          />
          <SelectInput
            label="Class"
            name="className"
            value={className}
            onChange={(e) => { setClassName(e.target.value); setGenerated(false); }}
            options={filteredClasses}
            placeholder={examId ? 'Select class' : 'Select exam first'}
            disabled={!examId}
            required
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleGenerate}
            disabled={!academicYear || !examId || !className}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all cursor-pointer whitespace-nowrap"
          >
            <EyeIcon className="h-4 w-4" /> View Results
          </button>
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer whitespace-nowrap"
          >
            <ArrowPathIcon className="h-4 w-4" /> Reset
          </button>
          {generated && displayExam && (
            <span className="ml-auto text-sm text-gray-500 dark:text-gray-400">
              {displayExam.name} • {className} • {academicYear}
            </span>
          )}
        </div>
      </div>

      {generated && summary && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Total Students</p>
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
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Student Results</h2>
            <div className="flex items-center gap-3">
              <div className="w-56">
                <SearchInput placeholder="Search student ID, name..." value={search} onChange={setSearch} />
              </div>
              <SelectInput
                name="filterStatus"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                options={['Passed', 'Failed', 'Pending']}
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
              <DocumentCheckIcon className="h-8 w-8 text-blue-500 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Examination Results</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
              Select Academic Year, Exam and Class, then click <strong>View Results</strong> to see calculated results based on entered marks.
            </p>
          </div>
        </div>
      )}

      <Modal
        isOpen={showViewModal}
        onClose={() => { setShowViewModal(false); setViewStudent(null); }}
        title="Result Details"
        maxWidth="max-w-2xl"
      >
        {viewStudent && (
          <div className="space-y-5">
            <div className="text-center pb-4 border-b border-gray-200 dark:border-gray-700">
              <div className="mx-auto w-14 h-14 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center mb-3">
                <span className="text-sm font-bold text-blue-600 dark:text-blue-400 font-mono">{viewStudent.student.rollNumber}</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{viewStudent.student.name}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-mono">{viewStudent.student.id}</p>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-2 ${
                viewStudent.status === 'Passed'
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                  : viewStudent.status === 'Failed'
                  ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                  : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
              }`}>
                {viewStudent.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Exam</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{displayExam?.name || '-'}</p>
              </div>
              <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Academic Year</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{academicYear}</p>
              </div>
              <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Class</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{className}</p>
              </div>
              <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Roll Number</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{viewStudent.student.rollNumber}</p>
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
                    {viewStudent.subjectResults.map((subj, idx) => (
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
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{viewStudent.totalMarks}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Obtained</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{viewStudent.obtainedMarks !== null ? viewStudent.obtainedMarks : '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Percentage</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{viewStudent.percentage !== null ? `${viewStudent.percentage}%` : '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Grade</p>
                  <span className={`inline-flex items-center justify-center w-10 h-10 rounded-lg text-sm font-bold ${
                    viewStudent.grade === 'A+' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                    : viewStudent.grade === 'A' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                    : viewStudent.grade === 'B' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                    : viewStudent.grade === 'C' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                    : viewStudent.grade === 'D' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300'
                    : viewStudent.grade === 'F' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                  }`}>
                    {viewStudent.grade}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Status</p>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    viewStudent.status === 'Passed'
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                      : viewStudent.status === 'Failed'
                      ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                      : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                  }`}>
                    {viewStudent.status}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Results;
