import { useState } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import SearchInput from '../../common/SearchInput/SearchInput';
import Table from '../../common/Table/Table';
import ActionButtons from '../../common/ActionButtons/ActionButtons';
import Modal from '../../common/Modal/Modal';
import SelectInput from '../../common/SelectInput/SelectInput';
import Input from '../../common/Input/Input';
import Button from '../../common/Button/Button';
import ConfirmationModal from '../../common/ConfirmationModal/ConfirmationModal';

const CLASS_OPTIONS = ['Montessori', 'Nursery', 'KG1', 'KG2', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'];

const initialStructures = [
  { id: 1, className: 'Nursery', monthlyFee: 3000, admissionFee: 10000, examFee: 2000, status: 'Active' },
  { id: 2, className: 'Montessori', monthlyFee: 3500, admissionFee: 12000, examFee: 2500, status: 'Active' },
  { id: 3, className: 'Class 1', monthlyFee: 4000, admissionFee: 15000, examFee: 3000, status: 'Active' },
  { id: 4, className: 'Class 2', monthlyFee: 4500, admissionFee: 15000, examFee: 3000, status: 'Active' },
  { id: 5, className: 'Class 3', monthlyFee: 5000, admissionFee: 15000, examFee: 3500, status: 'Active' },
  { id: 6, className: 'Class 4', monthlyFee: 5500, admissionFee: 18000, examFee: 3500, status: 'Active' },
  { id: 7, className: 'Class 5', monthlyFee: 6000, admissionFee: 18000, examFee: 4000, status: 'Active' },
  { id: 8, className: 'Class 6', monthlyFee: 6500, admissionFee: 20000, examFee: 4000, status: 'Active' },
  { id: 9, className: 'Class 7', monthlyFee: 7000, admissionFee: 20000, examFee: 4500, status: 'Active' },
  { id: 10, className: 'Class 8', monthlyFee: 7500, admissionFee: 22000, examFee: 4500, status: 'Inactive' },
  { id: 11, className: 'Class 9', monthlyFee: 8000, admissionFee: 22000, examFee: 5000, status: 'Active' },
];

const initialForm = { className: '', monthlyFee: '', admissionFee: '', examFee: '', status: 'Active' };

const FeeStructure = ({ onDataChange }) => {
  const [search, setSearch] = useState('');
  const [data, setData] = useState(initialStructures);
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [viewItem, setViewItem] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});

  const formatCurrency = (val) => `Rs. ${Number(val).toLocaleString()}`;

  const filtered = data.filter((item) =>
    item.className.toLowerCase().includes(search.toLowerCase())
  );

  const availableClassOptions = CLASS_OPTIONS;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors = {};
    if (!form.className) newErrors.className = 'Class is required';
    if (!form.monthlyFee || isNaN(form.monthlyFee) || Number(form.monthlyFee) < 0) newErrors.monthlyFee = 'Enter a valid amount';
    if (!form.admissionFee || isNaN(form.admissionFee) || Number(form.admissionFee) < 0) newErrors.admissionFee = 'Enter a valid amount';
    if (!form.examFee || isNaN(form.examFee) || Number(form.examFee) < 0) newErrors.examFee = 'Enter a valid amount';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    const structure = {
      className: form.className,
      monthlyFee: Number(form.monthlyFee),
      admissionFee: Number(form.admissionFee),
      examFee: Number(form.examFee),
      status: form.status,
    };
    if (editItem) {
      setData((prev) => prev.map((item) => (item.id === editItem.id ? { ...item, ...structure } : item)));
      toast.success('Fee structure updated successfully');
    } else {
      setData((prev) => [...prev, { id: Date.now(), ...structure }]);
      toast.success('Fee structure added successfully');
    }
    closeModal();
    onDataChange?.();
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
      className: item.className,
      monthlyFee: String(item.monthlyFee),
      admissionFee: String(item.admissionFee),
      examFee: String(item.examFee),
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
    toast.success('Fee structure deleted successfully');
    onDataChange?.();
  };

  const tableColumns = [
    { key: 'className', label: 'Class' },
    { key: 'monthlyFee', label: 'Monthly Fee' },
    { key: 'admissionFee', label: 'Admission Fee' },
    { key: 'examFee', label: 'Exam Fee' },
    { key: 'status', label: 'Status' },
    { key: 'actions', label: 'Actions', className: 'text-right' },
  ];

  const renderRow = (item) => (
    <>
      <td className="px-4 py-3">
        <span className="font-medium text-gray-900 dark:text-white">{item.className}</span>
      </td>
      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{formatCurrency(item.monthlyFee)}</td>
      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{formatCurrency(item.admissionFee)}</td>
      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{formatCurrency(item.examFee)}</td>
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Fee Structure</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Define and manage fee structures for each class. Set monthly, admission, and exam fees.
          </p>
        </div>
        <button
          onClick={openAdd}
          className="px-4 py-2.5 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap"
        >
          <PlusIcon className="h-4 w-4" /> Add Structure
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <div className="max-w-sm mb-4">
          <SearchInput placeholder="Search by class..." value={search} onChange={setSearch} />
        </div>
        <Table columns={tableColumns} data={filtered} renderRow={renderRow} />
      </div>

      <Modal
        isOpen={showModal}
        onClose={closeModal}
        title={editItem ? 'Edit Fee Structure' : 'Add Fee Structure'}
        maxWidth="max-w-lg"
      >
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
          {editItem ? 'Update the fee amounts for this class.' : 'Define the fee structure for a class.'}
        </p>

        <SelectInput
          label="Select Class"
          name="className"
          value={form.className}
          onChange={handleChange}
          options={availableClassOptions}
          placeholder="Choose a class"
          required
          disabled={!!editItem}
        />
        {errors.className && <p className="text-xs text-red-600 dark:text-red-400 -mt-2 mb-3">{errors.className}</p>}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            label="Monthly Fee"
            name="monthlyFee"
            type="number"
            value={form.monthlyFee}
            onChange={handleChange}
            placeholder="0"
            required
            error={errors.monthlyFee}
          />
          <Input
            label="Admission Fee"
            name="admissionFee"
            type="number"
            value={form.admissionFee}
            onChange={handleChange}
            placeholder="0"
            required
            error={errors.admissionFee}
          />
          <Input
            label="Exam Fee"
            name="examFee"
            type="number"
            value={form.examFee}
            onChange={handleChange}
            placeholder="0"
            required
            error={errors.examFee}
          />
        </div>

        <SelectInput
          label="Status"
          name="status"
          value={form.status}
          onChange={handleChange}
          options={['Active', 'Inactive']}
          placeholder="Select status"
        />

        <div className="flex gap-3 mt-6">
          <Button variant="secondary" onClick={closeModal}>Cancel</Button>
          <Button onClick={handleSave}>{editItem ? 'Update Structure' : 'Add Structure'}</Button>
        </div>
      </Modal>

      <Modal
        isOpen={showViewModal}
        onClose={() => { setShowViewModal(false); setViewItem(null); }}
        title="Fee Structure Details"
        maxWidth="max-w-md"
      >
        {viewItem && (
          <div className="space-y-5">
            <div className="text-center pb-4 border-b border-gray-200 dark:border-gray-700">
              <div className="mx-auto w-14 h-14 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center mb-3">
                <span className="text-xl font-bold text-blue-600 dark:text-blue-400">{viewItem.className}</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{viewItem.className}</h3>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-2 ${
                viewItem.status === 'Active'
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
              }`}>
                {viewItem.status}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Monthly Fee</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{formatCurrency(viewItem.monthlyFee)}</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Admission Fee</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{formatCurrency(viewItem.admissionFee)}</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Exam Fee</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{formatCurrency(viewItem.examFee)}</p>
              </div>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => { setShowDeleteModal(false); setDeleteItem(null); }}
        title="Delete Fee Structure"
        message={`Are you sure you want to delete the fee structure for class "${deleteItem?.className}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default FeeStructure;
