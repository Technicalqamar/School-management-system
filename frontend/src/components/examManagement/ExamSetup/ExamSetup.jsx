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
  exams as initialExams,
  CLASS_OPTIONS,
  EXAM_TYPES,
  ACADEMIC_YEARS,
  STATUSES,
} from '../../../data/examManagement/dummyData';

const initialForm = {
  name: '',
  type: '',
  academicYear: '',
  classes: [],
  startDate: '',
  endDate: '',
  description: '',
  status: 'Active',
};

const ExamSetup = () => {
  const [search, setSearch] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [data, setData] = useState(initialExams);
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
      const matchSearch = !search || item.name.toLowerCase().includes(search.toLowerCase());
      const matchYear = !filterYear || item.academicYear === filterYear;
      const matchType = !filterType || item.type === filterType;
      const matchStatus = !filterStatus || item.status === filterStatus;
      return matchSearch && matchYear && matchType && matchStatus;
    });
  }, [data, search, filterYear, filterType, filterStatus]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const toggleClass = (cls) => {
    setForm((prev) => {
      const exists = prev.classes.includes(cls);
      const next = exists ? prev.classes.filter((c) => c !== cls) : [...prev.classes, cls];
      return { ...prev, classes: next };
    });
    if (errors.classes) setErrors((prev) => ({ ...prev, classes: '' }));
  };

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = 'Exam name is required';
    if (!form.type) newErrors.type = 'Exam type is required';
    if (!form.academicYear) newErrors.academicYear = 'Academic year is required';
    if (form.classes.length === 0) newErrors.classes = 'Select at least one class';
    if (!form.startDate) newErrors.startDate = 'Start date is required';
    if (!form.endDate) newErrors.endDate = 'End date is required';
    if (form.startDate && form.endDate && form.startDate > form.endDate) {
      newErrors.endDate = 'End date must be after start date';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    const exam = {
      name: form.name.trim(),
      type: form.type,
      academicYear: form.academicYear,
      classes: form.classes,
      startDate: form.startDate,
      endDate: form.endDate,
      description: form.description.trim(),
      status: form.status,
    };
    if (editItem) {
      setData((prev) => prev.map((item) => (item.id === editItem.id ? { ...item, ...exam } : item)));
      toast.success('Exam updated successfully');
    } else {
      setData((prev) => [...prev, { id: Date.now(), ...exam }]);
      toast.success('Exam added successfully');
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
      name: item.name,
      type: item.type,
      academicYear: item.academicYear,
      classes: [...item.classes],
      startDate: item.startDate,
      endDate: item.endDate,
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
    toast.success('Exam deleted successfully');
  };

  const handleReset = () => {
    setSearch('');
    setFilterYear('');
    setFilterType('');
    setFilterStatus('');
  };

  const formatDate = (d) => {
    if (!d) return '-';
    return new Date(d + 'T00:00:00').toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const tableColumns = [
    { key: 'name', label: 'Exam Name' },
    { key: 'type', label: 'Type' },
    { key: 'academicYear', label: 'Year' },
    { key: 'classes', label: 'Classes' },
    { key: 'startDate', label: 'Start Date' },
    { key: 'endDate', label: 'End Date' },
    { key: 'status', label: 'Status' },
    { key: 'actions', label: 'Actions', className: 'text-right' },
  ];

  const renderRow = (item) => (
    <>
      <td className="px-4 py-3">
        <span className="font-medium text-gray-900 dark:text-white">{item.name}</span>
      </td>
      <td className="px-4 py-3">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
          {item.type}
        </span>
      </td>
      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{item.academicYear}</td>
      <td className="px-4 py-3">
        <div className="flex flex-wrap gap-1 max-w-[200px]">
          {item.classes.length <= 2 ? (
            item.classes.map((c) => (
              <span key={c} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                {c}
              </span>
            ))
          ) : (
            <>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                {item.classes[0]}
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                +{item.classes.length - 1} more
              </span>
            </>
          )}
        </div>
      </td>
      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{formatDate(item.startDate)}</td>
      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{formatDate(item.endDate)}</td>
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Exam Setup</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Create and manage examinations. Define exam types, schedules, and assign classes.
          </p>
        </div>
        <button
          onClick={openAdd}
          className="px-4 py-2.5 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap"
        >
          <PlusIcon className="h-4 w-4" /> Add Exam
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
          <div className="lg:col-span-2">
            <SearchInput placeholder="Search exams..." value={search} onChange={setSearch} />
          </div>
          <SelectInput
            name="filterYear"
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
            options={ACADEMIC_YEARS}
            placeholder="Academic Year"
          />
          <SelectInput
            name="filterType"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            options={EXAM_TYPES}
            placeholder="Exam Type"
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
        title={editItem ? 'Edit Exam' : 'Add Exam'}
        maxWidth="max-w-xl"
      >
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
          {editItem ? 'Update the examination details.' : 'Define a new examination.'}
        </p>

        <Input
          label="Exam Name"
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="e.g. Mid Term Examination"
          required
          error={errors.name}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SelectInput
            label="Exam Type"
            name="type"
            value={form.type}
            onChange={handleChange}
            options={EXAM_TYPES}
            placeholder="Select type"
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
        {errors.type && <p className="text-xs text-red-600 dark:text-red-400 -mt-2 mb-3">{errors.type}</p>}
        {errors.academicYear && <p className="text-xs text-red-600 dark:text-red-400 -mt-2 mb-3">{errors.academicYear}</p>}

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Classes <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 max-h-40 overflow-y-auto">
            {CLASS_OPTIONS.map((cls) => (
              <label
                key={cls}
                className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-sm cursor-pointer transition-colors ${
                  form.classes.includes(cls)
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-700'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 border border-transparent'
                }`}
              >
                <input
                  type="checkbox"
                  checked={form.classes.includes(cls)}
                  onChange={() => toggleClass(cls)}
                  className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                />
                <span className="truncate">{cls}</span>
              </label>
            ))}
          </div>
          {errors.classes && <p className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.classes}</p>}
          {form.classes.length > 0 && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{form.classes.length} class(es) selected</p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <DateInput
            label="Start Date"
            name="startDate"
            value={form.startDate}
            onChange={handleChange}
            required
          />
          <DateInput
            label="End Date"
            name="endDate"
            value={form.endDate}
            onChange={handleChange}
            required
          />
        </div>
        {errors.startDate && <p className="text-xs text-red-600 dark:text-red-400 -mt-2 mb-3">{errors.startDate}</p>}
        {errors.endDate && <p className="text-xs text-red-600 dark:text-red-400 -mt-2 mb-3">{errors.endDate}</p>}

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Description / Notes
          </label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={3}
            placeholder="Optional notes about this examination..."
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
          <Button onClick={handleSave}>{editItem ? 'Update Exam' : 'Add Exam'}</Button>
        </div>
      </Modal>

      <Modal
        isOpen={showViewModal}
        onClose={() => { setShowViewModal(false); setViewItem(null); }}
        title="Exam Details"
        maxWidth="max-w-lg"
      >
        {viewItem && (
          <div className="space-y-5">
            <div className="text-center pb-4 border-b border-gray-200 dark:border-gray-700">
              <div className="mx-auto w-14 h-14 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center mb-3">
                <span className="text-lg font-bold text-blue-600 dark:text-blue-400">{viewItem.type === 'Monthly Test' ? 'MT' : viewItem.type === 'Mid Term' ? 'MT' : 'FT'}</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{viewItem.name}</h3>
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
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Exam Type</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{viewItem.type}</p>
              </div>
              <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Academic Year</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{viewItem.academicYear}</p>
              </div>
              <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Start Date</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{formatDate(viewItem.startDate)}</p>
              </div>
              <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">End Date</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{formatDate(viewItem.endDate)}</p>
              </div>
            </div>

            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Classes</p>
              <div className="flex flex-wrap gap-2">
                {viewItem.classes.map((c) => (
                  <span key={c} className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                    {c}
                  </span>
                ))}
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
        title="Delete Exam"
        message={`Are you sure you want to delete "${deleteItem?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default ExamSetup;
