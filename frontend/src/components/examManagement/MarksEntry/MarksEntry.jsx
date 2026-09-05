import { useState, useMemo } from 'react';
import { ArrowPathIcon, AcademicCapIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import SearchInput from '../../common/SearchInput/SearchInput';
import Table from '../../common/Table/Table';
import ActionButtons from '../../common/ActionButtons/ActionButtons';
import Modal from '../../common/Modal/Modal';
import SelectInput from '../../common/SelectInput/SelectInput';
import {
  exams,
  subjectMarks,
  examStudents,
  initialMarksData,
  ACADEMIC_YEARS,
} from '../../../data/examManagement/dummyData';

const MarksEntry = () => {
  const [academicYear, setAcademicYear] = useState('');
  const [examId, setExamId] = useState('');
  const [className, setClassName] = useState('');
  const [subjectName, setSubjectName] = useState('');
  const [loaded, setLoaded] = useState(false);
  const [search, setSearch] = useState('');
  const [marks, setMarks] = useState({});
  const [marksData, setMarksData] = useState(initialMarksData);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewItem, setViewItem] = useState(null);
  const [errors, setErrors] = useState({});

  const filteredExams = useMemo(() => {
    if (!academicYear) return [];
    return exams.filter((e) => e.academicYear === academicYear && e.status === 'Active');
  }, [academicYear]);

  const filteredClasses = useMemo(() => {
    if (!examId) return [];
    const exam = exams.find((e) => e.id === Number(examId));
    return exam ? exam.classes : [];
  }, [examId]);

  const filteredSubjects = useMemo(() => {
    if (!examId || !className) return [];
    return subjectMarks.filter(
      (s) => s.examId === Number(examId) && s.className === className && s.academicYear === academicYear && s.status === 'Active'
    );
  }, [examId, className, academicYear]);

  const selectedSubjectConfig = useMemo(() => {
    if (!subjectName) return null;
    return subjectMarks.find(
      (s) => s.subjectName === subjectName && s.examId === Number(examId) && s.className === className && s.academicYear === academicYear
    );
  }, [subjectName, examId, className, academicYear]);

  const filteredStudents = useMemo(() => {
    if (!className) return [];
    return examStudents.filter((s) => s.className === className);
  }, [className]);

  const displayStudents = useMemo(() => {
    if (!search) return filteredStudents;
    const q = search.toLowerCase();
    return filteredStudents.filter(
      (s) => s.id.toLowerCase().includes(q) || s.name.toLowerCase().includes(q) || s.rollNumber.toLowerCase().includes(q)
    );
  }, [filteredStudents, search]);

  const getExistingMark = (studentId) => {
    return marksData.find(
      (m) => m.studentId === studentId && m.examId === Number(examId) && m.className === className && m.subjectName === subjectName && m.academicYear === academicYear
    );
  };

  const getMarkValue = (studentId) => {
    if (marks[studentId] !== undefined) return marks[studentId];
    const existing = getExistingMark(studentId);
    return existing ? String(existing.obtainedMarks) : '';
  };

  const getMarkStatus = (studentId) => {
    const val = marks[studentId];
    if (val !== undefined && val !== '') return 'Entered';
    const existing = getExistingMark(studentId);
    if (existing) return 'Entered';
    return 'Not Entered';
  };

  const handleMarkChange = (studentId, value) => {
    if (value === '' || (/^\d*$/.test(value) && Number(value) >= 0)) {
      setMarks((prev) => ({ ...prev, [studentId]: value }));
    }
  };

  const handleLoadStudents = () => {
    const newErrors = {};
    if (!academicYear) newErrors.academicYear = 'Required';
    if (!examId) newErrors.examId = 'Required';
    if (!className) newErrors.className = 'Required';
    if (!subjectName) newErrors.subjectName = 'Required';
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    const preFilled = {};
    filteredStudents.forEach((s) => {
      const existing = getExistingMark(s.id);
      if (existing) {
        preFilled[s.id] = String(existing.obtainedMarks);
      }
    });
    setMarks(preFilled);
    setLoaded(true);
    setSearch('');
    toast.success(`Loaded ${filteredStudents.length} students`);
  };

  const handleSaveMarks = () => {
    const totalMarks = selectedSubjectConfig?.totalMarks;
    let invalid = false;
    const updatedMarks = {};

    filteredStudents.forEach((s) => {
      const val = marks[s.id];
      if (val === undefined || val === '') {
        updatedMarks[s.id] = null;
        return;
      }
      const num = Number(val);
      if (isNaN(num) || num < 0 || num > totalMarks) {
        invalid = true;
        return;
      }
      updatedMarks[s.id] = num;
    });

    if (invalid) {
      toast.error('Some marks are invalid. Please check all entered values.');
      return;
    }

    let newRecords = [...marksData];
    let savedCount = 0;

    filteredStudents.forEach((s) => {
      const val = updatedMarks[s.id];
      if (val === null) return;

      const existingIdx = newRecords.findIndex(
        (m) => m.studentId === s.id && m.examId === Number(examId) && m.className === className && m.subjectName === subjectName && m.academicYear === academicYear
      );

      const record = {
        studentId: s.id,
        examId: Number(examId),
        className,
        subjectName,
        academicYear,
        obtainedMarks: val,
        status: 'Entered',
      };

      if (existingIdx >= 0) {
        newRecords[existingIdx] = { ...newRecords[existingIdx], ...record };
      } else {
        newRecords.push({ id: Date.now() + savedCount, ...record });
      }
      savedCount++;
    });

    setMarksData(newRecords);
    toast.success(`${savedCount} mark(s) saved successfully`);
  };

  const handleReset = () => {
    setAcademicYear('');
    setExamId('');
    setClassName('');
    setSubjectName('');
    setLoaded(false);
    setSearch('');
    setMarks({});
    setErrors({});
  };

  const openView = (student) => {
    const existing = getExistingMark(student.id);
    const val = marks[student.id];
    setViewItem({
      ...student,
      examName: exams.find((e) => e.id === Number(examId))?.name || '-',
      academicYear,
      className,
      subjectName,
      totalMarks: selectedSubjectConfig?.totalMarks || '-',
      obtainedMarks: val !== undefined && val !== '' ? val : existing ? existing.obtainedMarks : '-',
      entryStatus: getMarkStatus(student.id),
    });
    setShowViewModal(true);
  };

  const tableColumns = [
    { key: 'id', label: 'Student ID' },
    { key: 'name', label: 'Student Name' },
    { key: 'rollNumber', label: 'Roll No.' },
    { key: 'totalMarks', label: 'Total Marks' },
    { key: 'obtainedMarks', label: 'Obtained Marks' },
    { key: 'status', label: 'Status' },
    { key: 'actions', label: 'Actions', className: 'text-right' },
  ];

  const renderRow = (student) => {
    const val = getMarkValue(student.id);
    const status = getMarkStatus(student.id);
    const numVal = val !== '' ? Number(val) : null;
    const overMax = numVal !== null && selectedSubjectConfig && numVal > selectedSubjectConfig.totalMarks;

    return (
      <>
        <td className="px-4 py-3 font-mono text-xs text-gray-600 dark:text-gray-400">{student.id}</td>
        <td className="px-4 py-3">
          <span className="font-medium text-gray-900 dark:text-white">{student.name}</span>
        </td>
        <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{student.rollNumber}</td>
        <td className="px-4 py-3 text-center">
          <span className="text-sm font-semibold text-gray-900 dark:text-white">{selectedSubjectConfig?.totalMarks || '-'}</span>
        </td>
        <td className="px-4 py-3">
          <input
            type="text"
            inputMode="numeric"
            value={val}
            onChange={(e) => handleMarkChange(student.id, e.target.value)}
            placeholder="0"
            className={`w-20 px-3 py-1.5 rounded-lg border text-sm text-center font-medium focus:outline-none focus:ring-2 transition-all ${
              overMax
                ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
                : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500/20 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white'
            }`}
          />
          {overMax && (
            <p className="text-xs text-red-600 dark:text-red-400 mt-1">Max: {selectedSubjectConfig.totalMarks}</p>
          )}
        </td>
        <td className="px-4 py-3">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            status === 'Entered'
              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
          }`}>
            {status}
          </span>
        </td>
        <td className="px-4 py-3 text-right">
          <ActionButtons onView={() => openView(student)} />
        </td>
      </>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Marks Entry</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Enter and manage student marks for examinations.
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center gap-2 mb-4">
          <AcademicCapIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Select Examination Details</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div>
            <SelectInput
              label="Academic Year"
              name="academicYear"
              value={academicYear}
              onChange={(e) => { setAcademicYear(e.target.value); setExamId(''); setClassName(''); setSubjectName(''); setLoaded(false); setMarks({}); }}
              options={ACADEMIC_YEARS}
              placeholder="Select year"
              required
            />
            {errors.academicYear && <p className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.academicYear}</p>}
          </div>
          <div>
            <SelectInput
              label="Exam"
              name="examId"
              value={examId}
              onChange={(e) => { setExamId(e.target.value); setClassName(''); setSubjectName(''); setLoaded(false); setMarks({}); }}
              options={filteredExams.map((e) => String(e.id))}
              placeholder={academicYear ? 'Select exam' : 'Select year first'}
              disabled={!academicYear}
              required
            />
            {errors.examId && <p className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.examId}</p>}
          </div>
          <div>
            <SelectInput
              label="Class"
              name="className"
              value={className}
              onChange={(e) => { setClassName(e.target.value); setSubjectName(''); setLoaded(false); setMarks({}); }}
              options={filteredClasses}
              placeholder={examId ? 'Select class' : 'Select exam first'}
              disabled={!examId}
              required
            />
            {errors.className && <p className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.className}</p>}
          </div>
          <div>
            <SelectInput
              label="Subject"
              name="subjectName"
              value={subjectName}
              onChange={(e) => { setSubjectName(e.target.value); setLoaded(false); setMarks({}); }}
              options={filteredSubjects.map((s) => s.subjectName)}
              placeholder={className ? 'Select subject' : 'Select class first'}
              disabled={!className}
              required
            />
            {errors.subjectName && <p className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.subjectName}</p>}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleLoadStudents}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transition-all cursor-pointer whitespace-nowrap"
          >
            <AcademicCapIcon className="h-4 w-4" /> Load Students
          </button>
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer whitespace-nowrap"
          >
            <ArrowPathIcon className="h-4 w-4" /> Reset
          </button>
          {loaded && selectedSubjectConfig && (
            <div className="ml-auto flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <span>Total Marks: <strong className="text-gray-900 dark:text-white">{selectedSubjectConfig.totalMarks}</strong></span>
              <span className="text-gray-300 dark:text-gray-600">|</span>
              <span>Passing Marks: <strong className="text-gray-900 dark:text-white">{selectedSubjectConfig.passingMarks}</strong></span>
            </div>
          )}
        </div>
      </div>

      {loaded ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
                Student Marks — {subjectName}
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {exams.find((e) => e.id === Number(examId))?.name} • {className} • {academicYear}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-64">
                <SearchInput placeholder="Search student ID, name or roll..." value={search} onChange={setSearch} />
              </div>
              <button
                onClick={handleSaveMarks}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 transition-all cursor-pointer whitespace-nowrap"
              >
                <CheckCircleIcon className="h-4 w-4" /> Save Marks
              </button>
            </div>
          </div>

          <Table columns={tableColumns} data={displayStudents} renderRow={renderRow} />
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center mb-4">
              <AcademicCapIcon className="h-8 w-8 text-blue-500 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Marks Entry</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
              Select Academic Year, Exam, Class and Subject, then click <strong>Load Students</strong> to begin entering marks.
            </p>
          </div>
        </div>
      )}

      <Modal
        isOpen={showViewModal}
        onClose={() => { setShowViewModal(false); setViewItem(null); }}
        title="Marks Details"
        maxWidth="max-w-lg"
      >
        {viewItem && (
          <div className="space-y-5">
            <div className="text-center pb-4 border-b border-gray-200 dark:border-gray-700">
              <div className="mx-auto w-14 h-14 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center mb-3">
                <span className="text-sm font-bold text-blue-600 dark:text-blue-400 font-mono">{viewItem.rollNumber}</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{viewItem.name}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-mono">{viewItem.id}</p>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-2 ${
                viewItem.entryStatus === 'Entered'
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
              }`}>
                {viewItem.entryStatus}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Student ID</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white font-mono">{viewItem.id}</p>
              </div>
              <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Roll Number</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{viewItem.rollNumber}</p>
              </div>
              <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Exam</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{viewItem.examName}</p>
              </div>
              <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Academic Year</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{viewItem.academicYear}</p>
              </div>
              <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Class</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{viewItem.className}</p>
              </div>
              <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Subject</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{viewItem.subjectName}</p>
              </div>
              <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Total Marks</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{viewItem.totalMarks}</p>
              </div>
              <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Obtained Marks</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{viewItem.obtainedMarks}</p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MarksEntry;
