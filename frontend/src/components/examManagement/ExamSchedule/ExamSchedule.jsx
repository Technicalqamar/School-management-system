import { useState, useMemo } from 'react';
import { PlusIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import SearchInput from '../../common/SearchInput/SearchInput';
import Table from '../../common/Table/Table';
import ActionButtons from '../../common/ActionButtons/ActionButtons';
import Modal from '../../common/Modal/Modal';
import SelectInput from '../../common/SelectInput/SelectInput';
import Input from '../../common/Input/Input';
import DateInput from '../../common/DateInput/DateInput';
import Button from '../../common/Button/Button';
import ConfirmationModal from '../../common/ConfirmationModal/ConfirmationModal';
import {
  examSchedules as initialSchedules,
  subjectMarks,
  exams,
  CLASS_OPTIONS,
  ACADEMIC_YEARS,
  STATUSES,
} from '../../../data/examManagement/dummyData';

const initialForm = {
  examId: '',
  academicYear: '',
  className: '',
  subjectName: '',
  examDate: '',
  startTime: '',
  endTime: '',
  room: '',
  status: 'Active',
  notes: '',
};

const ExamSchedule = () => {
  const [search, setSearch] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [filterExam, setFilterExam] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [data, setData] = useState(initialSchedules);
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [viewItem, setViewItem] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});

  const uniqueSubjects = useMemo(() => {
    const names = [...new Set(subjectMarks.map((s) => s.subjectName))];
    return names.sort();
  }, []);

  const filtered = useMemo(() => {
    return data.filter((item) => {
      const matchSearch = !search || item.subjectName.toLowerCase().includes(search.toLowerCase()) || item.room.toLowerCase().includes(search.toLowerCase());
      const matchYear = !filterYear || item.academicYear === filterYear;
      const matchExam = !filterExam || String(item.examId) === filterExam;
      const matchClass = !filterClass || item.className === filterClass;
      const matchSubject = !filterSubject || item.subjectName === filterSubject;
      const matchStatus = !filterStatus || item.status === filterStatus;
      return matchSearch && matchYear && matchExam && matchClass && matchSubject && matchStatus;
    });
  }, [data, search, filterYear, filterExam, filterClass, filterSubject, filterStatus]);

  const getExamName = (examId) => {
    const exam = exams.find((e) => e.id === Number(examId));
    return exam ? exam.name : '-';
  };

  const formatTime = (t) => {
    if (!t) return '-';
    const [h, m] = t.split(':');
    const hour = Number(h);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const h12 = hour % 12 || 12;
    return `${h12}:${m} ${ampm}`;
  };

  const formatDate = (d) => {
    if (!d) return '-';
    return new Date(d + 'T00:00:00').toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors = {};
    if (!form.examId) newErrors.examId = 'Exam is required';
    if (!form.academicYear) newErrors.academicYear = 'Academic year is required';
    if (!form.className) newErrors.className = 'Class is required';
    if (!form.subjectName) newErrors.subjectName = 'Subject is required';
    if (!form.examDate) newErrors.examDate = 'Exam date is required';
    if (!form.startTime) newErrors.startTime = 'Start time is required';
    if (!form.endTime) newErrors.endTime = 'End time is required';
    if (!form.room.trim()) newErrors.room = 'Room / Hall is required';
    if (form.startTime && form.endTime && form.endTime <= form.startTime) {
      newErrors.endTime = 'End time must be after start time';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    const record = {
      examId: Number(form.examId),
      academicYear: form.academicYear,
      className: form.className,
      subjectName: form.subjectName,
      examDate: form.examDate,
      startTime: form.startTime,
      endTime: form.endTime,
      room: form.room.trim(),
      status: form.status,
      notes: form.notes.trim(),
    };
    if (editItem) {
      setData((prev) => prev.map((item) => (item.id === editItem.id ? { ...item, ...record } : item)));
      toast.success('Schedule updated successfully');
    } else {
      setData((prev) => [...prev, { id: Date.now(), ...record }]);
      toast.success('Schedule added successfully');
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
      examId: String(item.examId),
      academicYear: item.academicYear,
      className: item.className,
      subjectName: item.subjectName,
      examDate: item.examDate,
      startTime: item.startTime,
      endTime: item.endTime,
      room: item.room,
      status: item.status,
      notes: item.notes || '',
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
    toast.success('Schedule deleted successfully');
  };

  const handleReset = () => {
    setSearch('');
    setFilterYear('');
    setFilterExam('');
    setFilterClass('');
    setFilterSubject('');
    setFilterStatus('');
  };

  const tableColumns = [
    { key: 'examId', label: 'Exam' },
    { key: 'academicYear', label: 'Year' },
    { key: 'className', label: 'Class' },
    { key: 'subjectName', label: 'Subject' },
    { key: 'examDate', label: 'Date' },
    { key: 'startTime', label: 'Start' },
    { key: 'endTime', label: 'End' },
    { key: 'room', label: 'Room' },
    { key: 'status', label: 'Status' },
    { key: 'actions', label: 'Actions', className: 'text-right' },
  ];

  const renderRow = (item) => (
    <>
      <td className="px-4 py-3">
        <span className="text-xs text-gray-600 dark:text-gray-400">{getExamName(item.examId)}</span>
      </td>
      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{item.academicYear}</td>
      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{item.className}</td>
      <td className="px-4 py-3">
        <span className="font-medium text-gray-900 dark:text-white">{item.subjectName}</span>
      </td>
      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{formatDate(item.examDate)}</td>
      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{formatTime(item.startTime)}</td>
      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{formatTime(item.endTime)}</td>
      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{item.room}</td>
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Exam Schedule</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage examination date sheets — assign dates, times, and rooms to subjects.
          </p>
        </div>
        <button
          onClick={openAdd}
          className="px-4 py-2.5 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap"
        >
          <PlusIcon className="h-4 w-4" /> Add Schedule
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 mb-4">
          <div className="lg:col-span-2">
            <SearchInput placeholder="Search subject or room..." value={search} onChange={setSearch} />
          </div>
          <SelectInput
            name="filterYear"
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
            options={ACADEMIC_YEARS}
            placeholder="Academic Year"
          />
          <SelectInput
            name="filterExam"
            value={filterExam}
            onChange={(e) => setFilterExam(e.target.value)}
            options={exams.map((e) => String(e.id))}
            placeholder="Exam"
          />
          <SelectInput
            name="filterClass"
            value={filterClass}
            onChange={(e) => setFilterClass(e.target.value)}
            options={CLASS_OPTIONS}
            placeholder="Class"
          />
          <SelectInput
            name="filterSubject"
            value={filterSubject}
            onChange={(e) => setFilterSubject(e.target.value)}
            options={uniqueSubjects}
            placeholder="Subject"
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
        title={editItem ? 'Edit Schedule' : 'Add Schedule'}
        maxWidth="max-w-xl"
      >
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
          {editItem ? 'Update the exam schedule entry.' : 'Schedule a new exam date, time, and room.'}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SelectInput
            label="Exam"
            name="examId"
            value={form.examId}
            onChange={handleChange}
            options={exams.map((e) => String(e.id))}
            placeholder="Select exam"
            required
          />
          <SelectInput
            label="Academic Year"
            name="academicYear"
            value={form.academicYear}
            onChange={handleChange}
            options={ACADEMIC_YEARS}
            placeholder="Select year"
            required
          />
        </div>
        {errors.examId && <p className="text-xs text-red-600 dark:text-red-400 -mt-2 mb-3">{errors.examId}</p>}
        {errors.academicYear && <p className="text-xs text-red-600 dark:text-red-400 -mt-2 mb-3">{errors.academicYear}</p>}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SelectInput
            label="Class"
            name="className"
            value={form.className}
            onChange={handleChange}
            options={CLASS_OPTIONS}
            placeholder="Select class"
            required
          />
          <SelectInput
            label="Subject"
            name="subjectName"
            value={form.subjectName}
            onChange={handleChange}
            options={uniqueSubjects}
            placeholder="Select subject"
            required
          />
        </div>
        {errors.className && <p className="text-xs text-red-600 dark:text-red-400 -mt-2 mb-3">{errors.className}</p>}
        {errors.subjectName && <p className="text-xs text-red-600 dark:text-red-400 -mt-2 mb-3">{errors.subjectName}</p>}

        <DateInput
          label="Exam Date"
          name="examDate"
          value={form.examDate}
          onChange={handleChange}
          required
        />
        {errors.examDate && <p className="text-xs text-red-600 dark:text-red-400 -mt-2 mb-3">{errors.examDate}</p>}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Start Time"
            name="startTime"
            type="time"
            value={form.startTime}
            onChange={handleChange}
            required
            error={errors.startTime}
          />
          <Input
            label="End Time"
            name="endTime"
            type="time"
            value={form.endTime}
            onChange={handleChange}
            required
            error={errors.endTime}
          />
        </div>

        <Input
          label="Room / Hall"
          name="room"
          value={form.room}
          onChange={handleChange}
          placeholder="e.g. Room 101, Hall A"
          required
          error={errors.room}
        />

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Notes
          </label>
          <textarea
            name="notes"
            value={form.notes}
            onChange={handleChange}
            rows={3}
            placeholder="Optional notes (e.g. bring calculator)..."
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
          <Button onClick={handleSave}>{editItem ? 'Update Schedule' : 'Add Schedule'}</Button>
        </div>
      </Modal>

      <Modal
        isOpen={showViewModal}
        onClose={() => { setShowViewModal(false); setViewItem(null); }}
        title="Schedule Details"
        maxWidth="max-w-lg"
      >
        {viewItem && (
          <div className="space-y-5">
            <div className="text-center pb-4 border-b border-gray-200 dark:border-gray-700">
              <div className="mx-auto w-14 h-14 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center mb-3">
                <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{formatDate(viewItem.examDate)}</span>
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
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Exam</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{getExamName(viewItem.examId)}</p>
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
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Start Time</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{formatTime(viewItem.startTime)}</p>
              </div>
              <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">End Time</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{formatTime(viewItem.endTime)}</p>
              </div>
              <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Room / Hall</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{viewItem.room}</p>
              </div>
              <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Status</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{viewItem.status}</p>
              </div>
            </div>

            {viewItem.notes && (
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Notes</p>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{viewItem.notes}</p>
              </div>
            )}
          </div>
        )}
      </Modal>

      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => { setShowDeleteModal(false); setDeleteItem(null); }}
        title="Delete Schedule"
        message={`Are you sure you want to delete the ${deleteItem?.subjectName} schedule for ${deleteItem?.className}? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default ExamSchedule;
