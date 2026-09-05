import { useState, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import {
  UserGroupIcon, AcademicCapIcon, CheckCircleIcon, XCircleIcon, ArrowPathIcon, FunnelIcon,
  Squares2X2Icon, UserCircleIcon, CurrencyDollarIcon, ClipboardDocumentListIcon,
  ChartBarIcon, CalendarDaysIcon, ClockIcon, BookOpenIcon, SunIcon,
  ArrowTopRightOnSquareIcon,
} from '@heroicons/react/24/outline';
import StatCard from '../../common/StatCard/StatCard';
import CardSection from '../../common/CardSection/CardSection';
import SearchInput from '../../common/SearchInput/SearchInput';
import FilterDropdown from '../../common/FilterDropdown/FilterDropdown';
import ConfirmationModal from '../../common/ConfirmationModal/ConfirmationModal';
import Modal from '../../common/Modal/Modal';
import Table from '../../common/Table/Table';
import portalControlService from '../../../services/portalControl/portalControl.service';

const STATUS_FILTERS = ['All', 'Enabled', 'Disabled'];
const ITEMS_PER_PAGE = 10;

const statusStyles = {
  Enabled: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700',
  Disabled: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-300 dark:border-red-700',
};

const portalMeta = {
  Student: { label: 'Student Portal', icon: UserGroupIcon },
  Teacher: { label: 'Teacher Panel', icon: AcademicCapIcon },
};

const MODULE_ICONS = {
  Squares2X2Icon, UserCircleIcon, CheckCircleIcon, CurrencyDollarIcon,
  ClipboardDocumentListIcon, ChartBarIcon, CalendarDaysIcon, ClockIcon,
  BookOpenIcon, SunIcon, UserGroupIcon,
};

const columns = [
  { key: 'name', label: 'Module' },
  { key: 'description', label: 'Description' },
  { key: 'status', label: 'Status' },
  { key: 'action', label: 'Action' },
];

const PortalSection = ({ portalKey, label, icon: SectionIcon, portal, modules, activeUsers, onTogglePortal, onToggleModule, onEnableAll, onDisableAll, onReset, openLabel, onOpenAccess }) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);

  const enabledCount = modules.filter((m) => m.enabled).length;
  const disabledCount = modules.length - enabledCount;
  const isEnabled = portal.status === 'Enabled';

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return modules.filter((m) => {
      const matchSearch = !q || m.name.toLowerCase().includes(q);
      const matchStatus = statusFilter === 'All'
        || (statusFilter === 'Enabled' ? m.enabled : !m.enabled);
      return matchSearch && matchStatus;
    });
  }, [modules, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedItems = filtered.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE);

  const handleResetFilters = () => {
    setSearch('');
    setStatusFilter('All');
    setCurrentPage(1);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className={`p-3 rounded-lg flex-shrink-0 ${isEnabled ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400' : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'}`}>
            <SectionIcon className="h-6 w-6" />
          </div>
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white truncate">{label}</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {activeUsers} active users · Last updated: {portal.lastUpdated || '-'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onTogglePortal(portalKey, 'Enabled')}
            disabled={isEnabled}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              isEnabled
                ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-sm cursor-pointer'
            }`}
          >
            <CheckCircleIcon className="h-4 w-4" /> Enable
          </button>
          <button
            onClick={() => onTogglePortal(portalKey, 'Disabled')}
            disabled={!isEnabled}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              !isEnabled
                ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-sm cursor-pointer'
            }`}
          >
            <XCircleIcon className="h-4 w-4" /> Disable
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard icon={Squares2X2Icon} label="Total Modules" value={modules.length} color="blue" />
        <StatCard icon={CheckCircleIcon} label="Enabled Modules" value={enabledCount} color="green" />
        <StatCard icon={XCircleIcon} label="Disabled Modules" value={disabledCount} color="red" />
        <StatCard icon={SectionIcon} label={`${label} Status`} value={portal.status || 'Disabled'} color={portalKey === 'Student' ? 'blue' : 'yellow'} />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="w-full sm:w-64">
            <SearchInput placeholder="Search module..." value={search} onChange={(v) => { setSearch(v); setCurrentPage(1); }} />
          </div>
          <div className="w-full sm:w-36">
            <FilterDropdown label="Status" options={STATUS_FILTERS} value={statusFilter} onChange={(v) => { setStatusFilter(v); setCurrentPage(1); }} />
          </div>
          <button onClick={handleResetFilters}
            className="px-4 py-2.5 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all flex items-center gap-2 cursor-pointer">
            <FunnelIcon className="h-4 w-4" /> Reset
          </button>
          <div className="flex flex-wrap items-center gap-2 ml-auto">
            <button onClick={() => onEnableAll(portalKey)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900/50 transition-all cursor-pointer">
              <CheckCircleIcon className="h-3.5 w-3.5" /> Enable All
            </button>
            <button onClick={() => onDisableAll(portalKey)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/50 transition-all cursor-pointer">
              <XCircleIcon className="h-3.5 w-3.5" /> Disable All
            </button>
            <button onClick={onReset}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all cursor-pointer">
              <ArrowPathIcon className="h-3.5 w-3.5" /> Reset Default
            </button>
          </div>
        </div>
      </div>

      <CardSection title={`Modules (${filtered.length})`}>
        <Table
          columns={columns}
          data={paginatedItems}
          renderRow={(module) => {
            const Icon = MODULE_ICONS[module.icon] || Squares2X2Icon;
            return (
              <>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-lg flex-shrink-0 ${module.enabled ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-medium text-gray-900 dark:text-white">{module.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[280px] block">{module.description}</span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-medium border ${statusStyles[module.enabled ? 'Enabled' : 'Disabled']}`}>
                    {module.enabled ? 'Enabled' : 'Disabled'}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onToggleModule(module)}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer ${module.enabled ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                      title={module.enabled ? 'Disable module' : 'Enable module'}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${module.enabled ? 'translate-x-[18px]' : 'translate-x-0.5'}`} />
                    </button>
                    <button
                      onClick={onOpenAccess}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-all cursor-pointer whitespace-nowrap"
                      title={openLabel}
                    >
                      <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5" /> {openLabel}
                    </button>
                  </div>
                </td>
              </>
            );
          }}
        />
        {filtered.length > 0 && totalPages > 1 && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4">
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
    </div>
  );
};

const PortalControl = () => {
  const [activeTab, setActiveTab] = useState('Student');
  const [portals, setPortals] = useState({ Student: {}, Teacher: {} });
  const [modules, setModules] = useState({ Student: [], Teacher: [] });
  const [resetOpen, setResetOpen] = useState(false);
  const [accessOpen, setAccessOpen] = useState(null);

  const loadData = () => {
    const data = portalControlService.getData();
    setPortals(data.portals);
    setModules(data.modules);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData();
  }, []);

  const activeUsers = {
    Student: portalControlService.getActiveUsers('Student'),
    Teacher: portalControlService.getActiveUsers('Teacher'),
  };

  const handleTogglePortal = (key, status) => {
    portalControlService.setPortalStatus(key, status);
    toast.success(`${portalMeta[key].label} ${status === 'Enabled' ? 'enabled' : 'disabled'} successfully`);
    loadData();
  };

  const handleToggleModule = (module) => {
    const next = !module.enabled;
    portalControlService.setModuleEnabled(module.portal, module.id, next);
    toast.success(`${module.name} module ${next ? 'enabled' : 'disabled'}`);
    loadData();
  };

  const handleEnableAll = (key) => {
    portalControlService.setAllModules(key, true);
    toast.success(`All ${portalMeta[key].label} modules enabled`);
    loadData();
  };

  const handleDisableAll = (key) => {
    portalControlService.setAllModules(key, false);
    toast.success(`All ${portalMeta[key].label} modules disabled`);
    loadData();
  };

  const handleResetConfirm = () => {
    portalControlService.resetDefaults();
    toast.success('Portal control reset to defaults');
    setResetOpen(false);
    loadData();
  };

  return (
    <div className="space-y-6">
      <nav className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
        <span>Dashboard</span>
        <span>/</span>
        <span className="text-gray-500 dark:text-gray-400">User Accounts</span>
        <span>/</span>
        <span className="text-blue-600 dark:text-blue-400 font-medium">Portal Control</span>
      </nav>

      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Portal Control</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage access to Student Portal and Teacher Panel.</p>
      </div>

      <div className="flex items-center gap-1 rounded-lg bg-gray-100 dark:bg-gray-700/50 p-1 w-fit max-w-full overflow-x-auto">
        <button
          onClick={() => setActiveTab('Student')}
          className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'Student'
              ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
          }`}
        >
          Student Portal
        </button>
        <button
          onClick={() => setActiveTab('Teacher')}
          className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'Teacher'
              ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
          }`}
        >
          Teacher Panel
        </button>
      </div>

      <div className={activeTab === 'Student' ? '' : 'hidden'}>
        <PortalSection
          portalKey="Student"
          label={portalMeta.Student.label}
          icon={portalMeta.Student.icon}
          portal={portals.Student}
          modules={modules.Student || []}
          activeUsers={activeUsers.Student}
          onTogglePortal={handleTogglePortal}
          onToggleModule={handleToggleModule}
          onEnableAll={handleEnableAll}
          onDisableAll={handleDisableAll}
          onReset={() => setResetOpen(true)}
          openLabel="Open Portal"
          onOpenAccess={() => setAccessOpen('Student')}
        />
      </div>

      <div className={activeTab === 'Teacher' ? '' : 'hidden'}>
        <PortalSection
          portalKey="Teacher"
          label={portalMeta.Teacher.label}
          icon={portalMeta.Teacher.icon}
          portal={portals.Teacher}
          modules={modules.Teacher || []}
          activeUsers={activeUsers.Teacher}
          onTogglePortal={handleTogglePortal}
          onToggleModule={handleToggleModule}
          onEnableAll={handleEnableAll}
          onDisableAll={handleDisableAll}
          onReset={() => setResetOpen(true)}
          openLabel="Open Panel"
          onOpenAccess={() => setAccessOpen('Teacher')}
        />
      </div>

      <ConfirmationModal
        isOpen={resetOpen}
        onClose={() => setResetOpen(false)}
        title="Reset Default Configuration"
        message="This will enable all modules and activate both Student Portal and Teacher Panel. Continue?"
        confirmLabel="Reset"
        variant="danger"
        onConfirm={handleResetConfirm}
      />

      <Modal
        isOpen={accessOpen !== null}
        onClose={() => setAccessOpen(null)}
        title={accessOpen === 'Teacher' ? 'Teacher Panel - Direct Admin Access' : 'Student Portal - Direct Admin Access'}
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
            <ArrowTopRightOnSquareIcon className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-800 dark:text-blue-200">
              Direct Admin Access will be connected after backend integration.
            </p>
          </div>
          <button
            onClick={() => setAccessOpen(null)}
            className="w-full py-2.5 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors cursor-pointer"
          >
            Got It
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default PortalControl;
