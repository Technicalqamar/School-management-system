import { useState, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import {
  UsersIcon, UserGroupIcon, CheckCircleIcon, XCircleIcon,
  PlusIcon, FunnelIcon, EyeIcon, PencilSquareIcon, TrashIcon,
  KeyIcon, ArrowUpCircleIcon, ArrowDownCircleIcon,
} from '@heroicons/react/24/outline';
import StatCard from '../../common/StatCard/StatCard';
import CardSection from '../../common/CardSection/CardSection';
import SearchInput from '../../common/SearchInput/SearchInput';
import FilterDropdown from '../../common/FilterDropdown/FilterDropdown';
import Modal from '../../common/Modal/Modal';
import ConfirmationModal from '../../common/ConfirmationModal/ConfirmationModal';
import Button from '../../common/Button/Button';
import Input from '../../common/Input/Input';
import SelectInput from '../../common/SelectInput/SelectInput';
import Table from '../../common/Table/Table';
import userAccountsService from '../../../services/userAccounts/userAccounts.service';

const USER_TYPES = ['All', 'Teacher', 'Student'];
const STATUS_FILTERS = ['All', 'Active', 'Inactive'];
const STATUS_OPTIONS = ['Active', 'Inactive'];

const typeStyles = {
  Teacher: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
  Student: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
};

const statusStyles = {
  Active: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700',
  Inactive: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-300 dark:border-red-700',
};

const getInitials = (name) => {
  if (!name) return '?';
  return name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
};

const getAvatarColor = (name) => {
  if (!name) return 'from-gray-500 to-gray-700';
  const colors = [
    'from-blue-500 to-blue-700', 'from-green-500 to-green-700', 'from-purple-500 to-purple-700',
    'from-pink-500 to-pink-700', 'from-indigo-500 to-indigo-700', 'from-teal-500 to-teal-700',
    'from-orange-500 to-orange-700', 'from-cyan-500 to-cyan-700',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
};

const columns = [
  { key: 'loginId', label: 'Login ID' },
  { key: 'userName', label: 'User Name' },
  { key: 'userType', label: 'User Type' },
  { key: 'linkedId', label: 'Linked ID' },
  { key: 'status', label: 'Account Status' },
  { key: 'lastLogin', label: 'Last Login' },
  { key: 'actions', label: 'Actions' },
];

const ITEMS_PER_PAGE = 10;

const emptyForm = {
  userType: 'Student',
  linkedSelect: '',
  loginId: '',
  password: '',
  confirmPassword: '',
  status: 'Active',
};

const UserAccounts = () => {
  const [accounts, setAccounts] = useState([]);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);

  const [viewItem, setViewItem] = useState(null);
  const [mode, setMode] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const [resetPwItem, setResetPwItem] = useState(null);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);

  const [resetFormData, setResetFormData] = useState({ newPassword: '', confirmPassword: '' });
  const [resetFormErrors, setResetFormErrors] = useState({});

  const [formData, setFormData] = useState({ ...emptyForm });
  const [formErrors, setFormErrors] = useState({});

  const teacherList = userAccountsService.getTeachers();
  const studentList = userAccountsService.getStudents();

  const linkedMap = useMemo(() => {
    const map = {};
    [...teacherList, ...studentList].forEach((item) => {
      map[`${item.name} (${item.id})`] = item;
    });
    return map;
  }, [teacherList, studentList]);

  const teacherOptions = teacherList.map((item) => `${item.name} (${item.id})`);
  const studentOptions = studentList.map((item) => `${item.name} (${item.id})`);
  const linkedOptions = formData.userType === 'Teacher' ? teacherOptions : studentOptions;

  const loadData = () => {
    try {
      const data = userAccountsService.getAll();
      setAccounts(data || []);
    } catch {
      setAccounts([]);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return accounts.filter((acc) => {
      const matchSearch = !q
        || acc.loginId.toLowerCase().includes(q)
        || acc.userName.toLowerCase().includes(q)
        || acc.linkedId.toLowerCase().includes(q);
      const matchType = typeFilter === 'All' || acc.userType === typeFilter;
      const matchStatus = statusFilter === 'All' || acc.status === statusFilter;
      return matchSearch && matchType && matchStatus;
    });
  }, [accounts, search, typeFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedItems = filtered.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE);

  const stats = useMemo(() => {
    try {
      return userAccountsService.getStats();
    } catch {
      return { totalTeachers: 0, totalStudents: 0, activeAccounts: 0, inactiveAccounts: 0 };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accounts]);

  const handleResetFilters = () => {
    setSearch('');
    setTypeFilter('All');
    setStatusFilter('All');
    setCurrentPage(1);
  };

  const handleView = (item) => setViewItem(item);

  const openAdd = () => {
    setMode('add');
    setEditItem(null);
    setFormData({ ...emptyForm });
    setFormErrors({});
  };

  const openEdit = (item) => {
    setEditItem(item);
    setMode('edit');
    setFormData({
      userType: item.userType,
      linkedSelect: `${item.userName} (${item.linkedId})`,
      loginId: item.loginId,
      password: '',
      confirmPassword: '',
      status: item.status,
    });
    setFormErrors({});
  };

  const closeFormModal = () => {
    setMode(null);
    setEditItem(null);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    if (name === 'userType') {
      setFormData((prev) => ({ ...prev, userType: value, linkedSelect: '' }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    if (formErrors[name]) setFormErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.userType) errors.userType = 'Select user type';
    if (!formData.linkedSelect) errors.linkedSelect = 'Select a teacher or student';
    if (!formData.loginId.trim()) {
      errors.loginId = 'Login ID is required';
    } else if (accounts.some((a) => a.id !== (editItem ? editItem.id : null) && a.loginId.toLowerCase() === formData.loginId.trim().toLowerCase())) {
      errors.loginId = 'Login ID already exists';
    }
    if (mode === 'add') {
      if (!formData.password) errors.password = 'Password is required';
      else if (formData.password.length < 6) errors.password = 'Password must be at least 6 characters';
      if (!formData.confirmPassword) errors.confirmPassword = 'Confirm password is required';
      else if (formData.confirmPassword !== formData.password) errors.confirmPassword = 'Passwords do not match';
    }
    if (!formData.status) errors.status = 'Select status';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormSave = () => {
    if (!validateForm()) return;
    const linked = linkedMap[formData.linkedSelect] || null;
    if (!linked) {
      setFormErrors((prev) => ({ ...prev, linkedSelect: 'Select a valid teacher or student' }));
      return;
    }
    setSaving(true);
    try {
      if (mode === 'add') {
        userAccountsService.add({
          loginId: formData.loginId.trim(),
          userName: linked.name,
          userType: formData.userType,
          linkedId: linked.id,
          status: formData.status,
          password: formData.password,
        });
        toast.success('User account created successfully');
      } else if (editItem) {
        userAccountsService.update(editItem.id, {
          loginId: formData.loginId.trim(),
          userName: linked.name,
          userType: formData.userType,
          linkedId: linked.id,
          status: formData.status,
        });
        toast.success('User account updated successfully');
      }
      closeFormModal();
      loadData();
    } catch {
      toast.error('Failed to save user account');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = (item) => {
    const newStatus = item.status === 'Active' ? 'Inactive' : 'Active';
    try {
      userAccountsService.setStatus(item.id, newStatus);
      toast.success(`Account ${newStatus === 'Active' ? 'activated' : 'deactivated'} successfully`);
      loadData();
    } catch {
      toast.error('Failed to update account status');
    }
  };

  const openResetPassword = (item) => {
    setResetPwItem(item);
    setResetFormData({ newPassword: '', confirmPassword: '' });
    setResetFormErrors({});
  };

  const closeResetPassword = () => {
    setResetPwItem(null);
    setResetFormData({ newPassword: '', confirmPassword: '' });
    setResetFormErrors({});
  };

  const handleResetPwChange = (e) => {
    const { name, value } = e.target;
    setResetFormData((prev) => ({ ...prev, [name]: value }));
    if (resetFormErrors[name]) setResetFormErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleUpdatePassword = () => {
    if (!resetPwItem) return;
    const errors = {};
    if (!resetFormData.newPassword) {
      errors.newPassword = 'New password is required';
    } else if (resetFormData.newPassword.length < 6) {
      errors.newPassword = 'Password must be at least 6 characters';
    }
    if (!resetFormData.confirmPassword) {
      errors.confirmPassword = 'Confirm password is required';
    } else if (resetFormData.confirmPassword !== resetFormData.newPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    setResetFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setResetting(true);
    try {
      userAccountsService.resetPassword(resetPwItem.id, resetFormData.newPassword);
      toast.success(`Password reset successfully for ${resetPwItem.loginId}`);
      closeResetPassword();
      loadData();
    } catch {
      toast.error('Failed to reset password');
    } finally {
      setResetting(false);
    }
  };

  const handleDeleteConfirm = () => {
    if (!deleteItem) return;
    try {
      userAccountsService.remove(deleteItem.id);
      toast.success('User account deleted successfully');
      setDeleteItem(null);
      loadData();
    } catch {
      toast.error('Failed to delete user account');
    }
  };

  const renderViewModal = () => {
    if (!viewItem) return null;
    return (
      <Modal isOpen title="User Account Details" onClose={() => setViewItem(null)} maxWidth="max-w-md">
        <div className="max-h-[75vh] overflow-y-auto space-y-3">
          <div className="flex items-center gap-3 pb-2 border-b border-gray-200 dark:border-gray-700">
            <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getAvatarColor(viewItem.userName)} flex items-center justify-center text-white font-bold text-xs flex-shrink-0`}>
              {getInitials(viewItem.userName)}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">{viewItem.userName}</h3>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 font-mono">{viewItem.loginId}</p>
            </div>
            <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-medium border flex-shrink-0 ${statusStyles[viewItem.status] || statusStyles.Inactive}`}>
              {viewItem.status}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-2.5">
              <p className="text-[9px] text-gray-500 dark:text-gray-400 uppercase tracking-wider">User Type</p>
              <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-medium mt-0.5 ${typeStyles[viewItem.userType] || typeStyles.Student}`}>
                {viewItem.userType}
              </span>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-2.5">
              <p className="text-[9px] text-gray-500 dark:text-gray-400 uppercase tracking-wider">Linked ID</p>
              <p className="text-xs font-medium text-gray-800 dark:text-gray-200 mt-0.5 font-mono">{viewItem.linkedId}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-2.5">
              <p className="text-[9px] text-gray-500 dark:text-gray-400 uppercase tracking-wider">Last Login</p>
              <p className="text-xs font-medium text-gray-800 dark:text-gray-200 mt-0.5">{viewItem.lastLogin || '-'}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-2.5">
              <p className="text-[9px] text-gray-500 dark:text-gray-400 uppercase tracking-wider">Created At</p>
              <p className="text-xs font-medium text-gray-800 dark:text-gray-200 mt-0.5">{viewItem.createdAt || '-'}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-2.5">
              <p className="text-[9px] text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</p>
              <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-medium border mt-0.5 ${statusStyles[viewItem.status] || statusStyles.Inactive}`}>
                {viewItem.status}
              </span>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-2.5">
              <p className="text-[9px] text-gray-500 dark:text-gray-400 uppercase tracking-wider">Password Changed</p>
              <p className="text-xs font-medium text-gray-800 dark:text-gray-200 mt-0.5">{viewItem.passwordLastChanged || '-'}</p>
            </div>
          </div>

          <div>
            <Button variant="secondary" onClick={() => setViewItem(null)}>Close</Button>
          </div>
        </div>
      </Modal>
    );
  };

  const renderFormModal = () => {
    if (!mode) return null;
    const title = mode === 'add' ? 'Add User Account' : `Edit User Account - ${editItem?.loginId || ''}`;
    return (
      <Modal isOpen title={title} onClose={closeFormModal} maxWidth="max-w-md">
        <div className="max-h-[75vh] overflow-y-auto space-y-3">
          <SelectInput label="User Type" name="userType" value={formData.userType} onChange={handleFormChange} options={['Teacher', 'Student']} required />
          <SelectInput label={formData.userType === 'Teacher' ? 'Select Teacher' : 'Select Student'} name="linkedSelect"
            value={formData.linkedSelect} onChange={handleFormChange} options={linkedOptions} placeholder="Select..." required />
          {formErrors.linkedSelect && <p className="mt-[-10px] mb-4 text-xs text-red-600 dark:text-red-400">{formErrors.linkedSelect}</p>}

          <Input label="Login ID" name="loginId" type="text" value={formData.loginId} onChange={handleFormChange}
            placeholder="e.g. TCH-2025-021" required error={formErrors.loginId} />

          {mode === 'add' && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3">
                <Input label="Password" name="password" type="password" value={formData.password} onChange={handleFormChange}
                  placeholder="Min 6 characters" required error={formErrors.password} />
                <Input label="Confirm Password" name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleFormChange}
                  placeholder="Re-enter password" required error={formErrors.confirmPassword} />
              </div>
            </>
          )}

          <SelectInput label="Status" name="status" value={formData.status} onChange={handleFormChange} options={STATUS_OPTIONS} required />

          <div className="flex gap-2 pt-1 border-t border-gray-200 dark:border-gray-700">
            <div className="flex-1">
              <Button variant="secondary" onClick={closeFormModal}>Cancel</Button>
            </div>
            <div className="flex-1">
              <Button variant="primary" onClick={handleFormSave} loading={saving}>
                {mode === 'add' ? 'Create Account' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    );
  };

  const renderResetPasswordModal = () => {
    if (!resetPwItem) return null;
    return (
      <Modal isOpen title={`Reset Password - ${resetPwItem.loginId || ''}`} onClose={closeResetPassword} maxWidth="max-w-md">
        <div className="max-h-[75vh] overflow-y-auto">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Set a new password for <span className="font-medium text-gray-800 dark:text-gray-200">{resetPwItem.userName}</span> ({resetPwItem.loginId}).
          </p>
          <Input label="New Password" name="newPassword" type="password" value={resetFormData.newPassword} onChange={handleResetPwChange}
            placeholder="Min 6 characters" required error={resetFormErrors.newPassword} />
          <Input label="Confirm Password" name="confirmPassword" type="password" value={resetFormData.confirmPassword} onChange={handleResetPwChange}
            placeholder="Re-enter password" required error={resetFormErrors.confirmPassword} />
          <div className="flex gap-2 pt-1 border-t border-gray-200 dark:border-gray-700">
            <div className="flex-1">
              <Button variant="secondary" onClick={closeResetPassword}>Cancel</Button>
            </div>
            <div className="flex-1">
              <Button variant="primary" onClick={handleUpdatePassword} loading={resetting}>Update Password</Button>
            </div>
          </div>
        </div>
      </Modal>
    );
  };

  return (
    <div className="space-y-6">
      <nav className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
        <span>Dashboard</span>
        <span>/</span>
        <span className="text-gray-500 dark:text-gray-400">User Accounts</span>
        <span>/</span>
        <span className="text-blue-600 dark:text-blue-400 font-medium">User Accounts</span>
      </nav>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">User Accounts</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage Teacher Panel and Student Portal login accounts</p>
        </div>
        <button onClick={openAdd}
          className="px-4 py-2.5 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-sm transition-all flex items-center gap-2 cursor-pointer">
          <PlusIcon className="h-4 w-4" /> Add User Account
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard icon={UsersIcon} label="Total Teacher Accounts" value={stats.totalTeachers} color="blue" />
        <StatCard icon={UserGroupIcon} label="Total Student Accounts" value={stats.totalStudents} color="green" />
        <StatCard icon={CheckCircleIcon} label="Active Accounts" value={stats.activeAccounts} color="yellow" />
        <StatCard icon={XCircleIcon} label="Inactive Accounts" value={stats.inactiveAccounts} color="red" />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="w-full sm:w-64">
            <SearchInput placeholder="Search by login ID, name or linked ID..." value={search} onChange={(v) => { setSearch(v); setCurrentPage(1); }} />
          </div>
          <div className="w-full sm:w-36">
            <FilterDropdown label="User Type" options={USER_TYPES} value={typeFilter} onChange={(v) => { setTypeFilter(v); setCurrentPage(1); }} />
          </div>
          <div className="w-full sm:w-36">
            <FilterDropdown label="Status" options={STATUS_FILTERS} value={statusFilter} onChange={(v) => { setStatusFilter(v); setCurrentPage(1); }} />
          </div>
          <button onClick={handleResetFilters}
            className="px-4 py-2.5 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all flex items-center gap-2 cursor-pointer">
            <FunnelIcon className="h-4 w-4" /> Reset
          </button>
        </div>
      </div>

      <CardSection title={`User Accounts (${filtered.length})`}>
        <Table
          columns={columns}
          data={paginatedItems}
          renderRow={(item) => (
            <>
              <td className="px-4 py-3 whitespace-nowrap">
                <span className="text-xs font-mono text-gray-600 dark:text-gray-300">{item.loginId}</span>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${getAvatarColor(item.userName)} flex items-center justify-center text-white font-bold text-[8px] flex-shrink-0`}>
                    {getInitials(item.userName)}
                  </div>
                  <span className="text-xs font-medium text-gray-900 dark:text-white truncate max-w-[120px]">{item.userName}</span>
                </div>
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-medium ${typeStyles[item.userType] || typeStyles.Student}`}>
                  {item.userType}
                </span>
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <span className="text-xs font-mono text-gray-500 dark:text-gray-400">{item.linkedId}</span>
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-medium border ${statusStyles[item.status] || statusStyles.Inactive}`}>
                  {item.status}
                </span>
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <span className="text-xs text-gray-500 dark:text-gray-400">{item.lastLogin || '-'}</span>
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <div className="flex items-center gap-1">
                  <button onClick={() => handleView(item)}
                    className="p-1 rounded text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors cursor-pointer" title="View">
                    <EyeIcon className="h-4 w-4" />
                  </button>
                  <button onClick={() => openEdit(item)}
                    className="p-1 rounded text-yellow-600 dark:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/30 transition-colors cursor-pointer" title="Edit">
                    <PencilSquareIcon className="h-4 w-4" />
                  </button>
                  <button onClick={() => openResetPassword(item)}
                    className="p-1 rounded text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors cursor-pointer" title="Reset Password">
                    <KeyIcon className="h-4 w-4" />
                  </button>
                  <button onClick={() => handleToggleStatus(item)}
                    className={`p-1 rounded transition-colors cursor-pointer ${item.status === 'Active'
                      ? 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30'
                      : 'text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30'}`}
                    title={item.status === 'Active' ? 'Deactivate' : 'Activate'}>
                    {item.status === 'Active'
                      ? <ArrowDownCircleIcon className="h-4 w-4" />
                      : <ArrowUpCircleIcon className="h-4 w-4" />}
                  </button>
                  <button onClick={() => setDeleteItem(item)}
                    className="p-1 rounded text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors cursor-pointer" title="Delete">
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </>
          )}
        />
        {filtered.length > 0 && totalPages > 1 && (
          <div className="flex items-center justify-between pt-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Showing {Math.min(filtered.length, (safePage - 1) * ITEMS_PER_PAGE + 1)}&ndash;{Math.min(safePage * ITEMS_PER_PAGE, filtered.length)} of {filtered.length}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(Math.max(1, safePage - 1))}
                disabled={safePage === 1}
                className="px-3 py-1.5 rounded-lg text-sm font-medium border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-9 h-9 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                    safePage === page
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, safePage + 1))}
                disabled={safePage === totalPages}
                className="px-3 py-1.5 rounded-lg text-sm font-medium border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </CardSection>

      {renderViewModal()}
      {renderFormModal()}
      {renderResetPasswordModal()}

      <ConfirmationModal
        isOpen={!!deleteItem}
        onClose={() => setDeleteItem(null)}
        title="Delete User Account"
        message={`Are you sure you want to delete the account "${deleteItem?.loginId}" (${deleteItem?.userName})? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
};

export default UserAccounts;
