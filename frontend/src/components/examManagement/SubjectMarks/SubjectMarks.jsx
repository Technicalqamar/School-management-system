import { useState, useMemo } from 'react';
import { PlusIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import SearchInput from '../../common/SearchInput/SearchInput';
import Table from '../../common/Table/Table';
import ActionButtons from '../../common/ActionButtons/ActionButtons';
import Modal from '../../common/Modal/Modal';
import SelectInput from '../../common/SelectInput/SelectInput';
import Input from '../../common/Input/Input';
import Button from '../../common/Button/Button';
import ConfirmationModal from '../../common/ConfirmationModal/ConfirmationModal';
import {
  subjectMarks as initialSubjects,
  exams,
  CLASS_OPTIONS,
  ACADEMIC_YEARS,
  STATUSES,
} from '../../../data/examManagement/dummyData';

const initialForm = {
  subjectName: '',
  subjectCode: '',
  academicYear: '',
  className: '',
  examId: '',
  totalMarks: '',
  passingMarks: '',
  description: '',
  status: 'Active',
};

const SubjectMarks = () => {
  const [search, setSearch] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [filterExam, setFilterExam] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [data, setData] = useState(initialSubjects);
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [viewItem, setViewItem] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});

  const filtered = useMemo(() => {
    return data.filter((item) => {
      const matchSearch = !search || item.subjectName.toLowerCase().includes(search.toLowerCase()) || item.subjectCode.toLowerCase().includes(search.toLowerCase());
      const matchYear = !filterYear || item.academicYear === filterYear;
      const matchClass = !filterClass || item.className === filterClass;
      const matchExam = !filterExam || String(item.examId) === filterExam;
      const matchStatus = !filterStatus || item.status === filterStatus;
      return matchSearch && matchYear && matchClass && matchExam && matchStatus;
    });
  }, [data, search, filterYear, filterClass, filterExam, filterStatus]);

  const getExamName = (examId) => {
    const exam = exams.find((e) => e.id === Number(examId));
    return exam ? exam.name : '-';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors = {};
    if (!form.subjectName.trim()) newErrors.subjectName = 'Subject name is required';
    if (!form.subjectCode.trim()) newErrors.subjectCode = 'Subject code is required';
    if (!form.academicYear) newErrors.academicYear = 'Academic year is required';
    if (!form.className) newErrors.className = 'Class is required';
    if (!form.examId) newErrors.examId = 'Exam is required';
    if (!form.totalMarks || isNaN(form.totalMarks) || Number(form.totalMarks) <= 0) {
      newErrors.totalMarks = 'Enter valid total marks';
    }
    if (!form.passingMarks || isNaN(form.passingMarks) || Number(form.passingMarks) <= 0) {
      newErrors.passingMarks = 'Enter valid passing marks';
    }
    if (form.totalMarks && form.passingMarks && Number(form.passingMarks) > Number(form.totalMarks)) {
      newErrors.passingMarks = 'Passing marks cannot exceed total marks';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    const record = {
      subjectName: form.subjectName.trim(),
      subjectCode: form.subjectCode.trim().toUpperCase(),
      academicYear: form.academicYear,
      className: form.className,
      examId: Number(form.examId),
      totalMarks: Number(form.totalMarks),
      passingMarks: Number(form.passingMarks),
      description: form.description.trim(),
      status: form.status,
    };
    if (editItem) {
      setData((prev) => prev.map((item) => (item.id === editItem.id ? { ...item, ...record } : item)));
      toast.success('Subject updated successfully');
    } else {
      setData((prev) => [...prev, { id: Date.now(), ...record }]);
      toast.success('Subject added successfully');
    }
    closeModal();
  };

  const openAdd = () => {
    setEditItem(null);
    setForm(initialForm);
    setErrors({});
    setShowModal(true);
  };

  const openView = (item) => {
    setViewItem(item);
    setShowViewModal(true);
  };

  const openEdit = (item) => {
    setEditItem(item);
    setForm({
      subjectName: item.subjectName,
      subjectCode: item.subjectCode,
      academicYear: item.academicYear,
      className: item.className,
      examId: String(item.examId),
      totalMarks: String(item.totalMarks),
      passingMarks: String(item.passingMarks),
      description: item.description || '',
      status: item.status,
    });
    setErrors({});
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditItem(null);
    setForm(initialForm);
    setErrors({});
  };

  const handleDelete = (item) => {
    setDeleteItem(item);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    setData((prev) => prev.filter((item) => item.id !== deleteItem.id));
    setShowDeleteModal(false);
    setDeleteItem(null);
    toast.success('Subject deleted successfully');
  };

  const handleReset = () => {
    setSearch('');
    setFilterYear('');
    setFilterClass('');
    setFilterExam('');
    setFilterStatus('');
  };

  const tableColumns = [
    { key: 'subjectName', label: 'Subject Name' },
    { key: 'subjectCode', label: 'Code' },
    { key: 'className', label: 'Class' },
    { key: 'examId', label: 'Exam' },
    { key: 'academicYear', label: 'Year' },
    { key: 'totalMarks', label: 'Total' },
    { key: 'passingMarks', label: 'Pass' },
    { key: 'status', label: 'Status' },
    { key: 'actions', label: 'Actions', className: 'text-right' },
  ];

  const renderRow = (item) => (
    <>
      <td className="px-4 py-3">
        <span className="font-medium text-gray-900 dark:text-white">{item.subjectName}</span>
      </td>
      <td className="px-4 py-3">
        <span className="font-mono text-xs text-gray-600 dark:text-gray-400">{item.subjectCode}</span>
      </td>
      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{item.className}</td>
      <td className="px-4 py-3">
        <span className="text-xs text-gray-600 dark:text-gray-400">{getExamName(item.examId)}</span>
      </td>
      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{item.academicYear}</td>
      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{item.totalMarks}</td>
      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{item.passingMarks}</td>
      <td className="px-4 py-3">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          item.status === 'Active'
            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
        }`}>
          {item.status}
        </span>
      </td>
      <td className="px-4 py-3 text-right">
        <ActionButtons onView={() => openView(item)} onEdit={() => openEdit(item)} onDelete={() => handleDelete(item)} />
      </td>
    </>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Subjects & Marks</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Configure subjects, total marks, and passing criteria for examinations.
          </p>
        </div>
        <button
          onClick={openAdd}
          className="px-4 py-2.5 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap"
        >
          <PlusIcon className="h-4 w-4" /> Add Subject
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 mb-4">
          <div className="lg:col-span-2">
            <SearchInput placeholder="Search subject or code..." value={search} onChange={setSearch} />
          </div>
          <SelectInput
            name="filterYear"
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
            options={ACADEMIC_YEARS}
            placeholder="Academic Year"
          />
          <SelectInput
            name="filterClass"
            value={filterClass}
            onChange={(e) => setFilterClass(e.target.value)}
            options={CLASS_OPTIONS}
            placeholder="Class"
          />
          <SelectInput
            name="filterExam"
            value={filterExam}
            onChange={(e) => setFilterExam(e.target.value)}
            options={exams.map((e) => String(e.id))}
            placeholder="Exam"
          />
          <SelectInput
            name="filterStatus"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            options={STATUSES}
            placeholder="Status"
          />
        </div>
        <div className="flex justify-end">
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
          >
            <ArrowPathIcon className="h-4 w-4" /> Reset
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <Table columns={tableColumns} data={filtered} renderRow={renderRow} />
      </div>

      <Modal
        isOpen={showModal}
        onClose={closeModal}
        title={editItem ? 'Edit Subject' : 'Add Subject'}
        maxWidth="max-w-xl"
      >
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
          {editItem ? 'Update the subject configuration.' : 'Configure a subject for an examination.'}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Subject Name"
            name="subjectName"
            value={form.subjectName}
            onChange={handleChange}
            placeholder="e.g. Mathematics"
            required
            error={errors.subjectName}
          />
          <Input
            label="Subject Code"
            name="subjectCode"
            value={form.subjectCode}
            onChange={handleChange}
            placeholder="e.g. MATH-101"
            required
            error={errors.subjectCode}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SelectInput
            label="Academic Year"
            name="academicYear"
            value={form.academicYear}
            onChange={handleChange}
            options={ACADEMIC_YEARS}
            placeholder="Select year"
            required
          />
          <SelectInput
            label="Class"
            name="className"
            value={form.className}
            onChange={handleChange}
            options={CLASS_OPTIONS}
            placeholder="Select class"
            required
          />
        </div>
        {errors.academicYear && <p className="text-xs text-red-600 dark:text-red-400 -mt-2 mb-3">{errors.academicYear}</p>}
        {errors.className && <p className="text-xs text-red-600 dark:text-red-400 -mt-2 mb-3">{errors.className}</p>}

        <SelectInput
          label="Exam"
          name="examId"
          value={form.examId}
          onChange={handleChange}
          options={exams.map((e) => String(e.id))}
          placeholder="Select exam"
          required
        />
        {errors.examId && <p className="text-xs text-red-600 dark:text-red-400 -mt-2 mb-3">{errors.examId}</p>}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Total Marks"
            name="totalMarks"
            type="number"
            value={form.totalMarks}
            onChange={handleChange}
            placeholder="e.g. 100"
            required
            error={errors.totalMarks}
          />
          <Input
            label="Passing Marks"
            name="passingMarks"
            type="number"
            value={form.passingMarks}
            onChange={handleChange}
            placeholder="e.g. 40"
            required
            error={errors.passingMarks}
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Description / Notes
          </label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={3}
            placeholder="Optional notes about this subject..."
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
          />
        </div>

        <SelectInput
          label="Status"
          name="status"
          value={form.status}
          onChange={handleChange}
          options={STATUSES}
          placeholder="Select status"
        />

        <div className="flex gap-3 mt-6">
          <Button variant="secondary" onClick={closeModal}>Cancel</Button>
          <Button onClick={handleSave}>{editItem ? 'Update Subject' : 'Add Subject'}</Button>
        </div>
      </Modal>

      <Modal
        isOpen={showViewModal}
        onClose={() => { setShowViewModal(false); setViewItem(null); }}
        title="Subject Details"
        maxWidth="max-w-lg"
      >
        {viewItem && (
          <div className="space-y-5">
            <div className="text-center pb-4 border-b border-gray-200 dark:border-gray-700">
              <div className="mx-auto w-14 h-14 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center mb-3">
                <span className="text-lg font-bold text-blue-600 dark:text-blue-400 font-mono">{viewItem.subjectCode}</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{viewItem.subjectName}</h3>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-2 ${
                viewItem.status === 'Active'
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
              }`}>
                {viewItem.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Academic Year</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{viewItem.academicYear}</p>
              </div>
              <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Class</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{viewItem.className}</p>
              </div>
              <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Exam</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{getExamName(viewItem.examId)}</p>
              </div>
              <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Subject Code</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white font-mono">{viewItem.subjectCode}</p>
              </div>
              <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Total Marks</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{viewItem.totalMarks}</p>
              </div>
              <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Passing Marks</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{viewItem.passingMarks}</p>
              </div>
            </div>

            {viewItem.description && (
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Description</p>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{viewItem.description}</p>
              </div>
            )}
          </div>
        )}
      </Modal>

      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => { setShowDeleteModal(false); setDeleteItem(null); }}
        title="Delete Subject"
        message={`Are you sure you want to delete "${deleteItem?.subjectName}" (${deleteItem?.subjectCode})? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default SubjectMarks;
