import { useState, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import {
  UserGroupIcon, AcademicCapIcon, WrenchScrewdriverIcon, Cog8ToothIcon, ArrowPathIcon,
} from '@heroicons/react/24/outline';
import Table from '../../common/Table/Table';
import CardSection from '../../common/CardSection/CardSection';
import SearchInput from '../../common/SearchInput/SearchInput';
import FilterDropdown from '../../common/FilterDropdown/FilterDropdown';
import DateInput from '../../common/DateInput/DateInput';
import SelectInput from '../../common/SelectInput/SelectInput';
import activityMaintenanceService from '../../../services/activityMaintenance/activityMaintenance.service';

const USER_TYPES = ['All', 'Teacher', 'Student'];
const ACTIVITY_FILTERS = ['All', 'Login', 'Logout', 'Failed Login', 'Password Changed'];
const ITEMS_PER_PAGE = 10;

const columns = [
  { key: 'time', label: 'Activity Time', className: 'px-2.5!' },
  { key: 'userId', label: 'Login ID', className: 'px-2.5!' },
  { key: 'userName', label: 'User Name', className: 'px-2.5!' },
  { key: 'userType', label: 'User Type', className: 'px-2.5!' },
  { key: 'activity', label: 'Activity', className: 'px-2.5!' },
  { key: 'browser', label: 'Browser', className: 'px-2.5!' },
  { key: 'device', label: 'Device', className: 'px-2.5!' },
  { key: 'ip', label: 'IP', className: 'px-2.5!' },
  { key: 'status', label: 'Status', className: 'px-2.5!' },
];

const userTypeStyles = {
  Teacher: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
  Student: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
};

const activityStyles = {
  Login: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
  Logout: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300',
  'Failed Login': 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
  'Password Changed': 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
};

const statusStyles = {
  Success: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700',
  Failed: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-300 dark:border-red-700',
};

const TEMPLATES = {
  'Simple Maintenance': { title: 'Under Maintenance', icon: WrenchScrewdriverIcon, theme: 'gray' },
  'School Notice': { title: 'School Notice', icon: AcademicCapIcon, theme: 'blue' },
  'Blue Theme': { title: "We'll Be Back Soon", icon: Cog8ToothIcon, theme: 'blue' },
  'Yellow Theme': { title: 'System Maintenance', icon: Cog8ToothIcon, theme: 'yellow' },
};

const TEMPLATE_OPTIONS = Object.keys(TEMPLATES);

const themeClasses = {
  gray: {
    box: 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700',
    icon: 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400',
    title: 'text-gray-900 dark:text-white',
    text: 'text-gray-500 dark:text-gray-400',
  },
  blue: {
    box: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
    icon: 'bg-blue-100 dark:bg-blue-800/40 text-blue-600 dark:text-blue-300',
    title: 'text-blue-900 dark:text-blue-100',
    text: 'text-blue-700 dark:text-blue-300',
  },
  yellow: {
    box: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800',
    icon: 'bg-amber-100 dark:bg-amber-800/40 text-amber-600 dark:text-amber-300',
    title: 'text-amber-900 dark:text-amber-100',
    text: 'text-amber-700 dark:text-amber-300',
  },
};

const ToggleSwitch = ({ checked, onChange, title }) => {
  return (
    <button
      onClick={onChange}
      title={title}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer flex-shrink-0 ${checked ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}
    >
      <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
    </button>
  );
};

const PortalCard = ({ label, icon: Icon, portalOn, onToggle }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className={`p-3 rounded-lg flex-shrink-0 ${portalOn ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400' : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'}`}>
            <Icon className="h-6 w-6" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">{label}</h3>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">{portalOn ? 'Portal is active' : 'Portal is under maintenance'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${portalOn ? statusStyles.Success : statusStyles.Failed}`}>
            {portalOn ? 'ON' : 'OFF'}
          </span>
          <ToggleSwitch
            checked={portalOn}
            onChange={onToggle}
            title={portalOn ? 'Turn off portal' : 'Turn on portal'}
          />
        </div>
      </div>
    </div>
  );
};

const ActivityMaintenance = () => {
  const [activeTab, setActiveTab] = useState('activity');

  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [activityFilter, setActivityFilter] = useState('All');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const [settings, setSettings] = useState(() => activityMaintenanceService.getSettings());

  const loadLogs = () => {
    try {
      setLogs(activityMaintenanceService.getLogs() || []);
    } catch {
      setLogs([]);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadLogs();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return logs.filter((log) => {
      const matchSearch = !q || log.userId.toLowerCase().includes(q) || log.userName.toLowerCase().includes(q);
      const matchType = typeFilter === 'All' || log.userType === typeFilter;
      const matchActivity = activityFilter === 'All' || log.activity === activityFilter;
      const date = log.time.slice(0, 10);
      const matchFrom = !fromDate || date >= fromDate;
      const matchTo = !toDate || date <= toDate;
      return matchSearch && matchType && matchActivity && matchFrom && matchTo;
    });
  }, [logs, search, typeFilter, activityFilter, fromDate, toDate]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedItems = filtered.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE);

  const handleRefresh = () => {
    setLogs(activityMaintenanceService.refreshLogs());
    setCurrentPage(1);
    toast.success('Activity logs refreshed');
  };

  const handleTogglePortal = (key, label) => {
    const next = { ...settings, [key]: !settings[key] };
    setSettings(next);
    activityMaintenanceService.saveSettings(next);
    toast.success(`${label} ${next[key] ? 'is active' : 'is now under maintenance'}`);
  };

  const handleMessageChange = (e) => {
    const next = { ...settings, message: e.target.value };
    setSettings(next);
    activityMaintenanceService.saveSettings(next);
  };

  const handleTemplateChange = (value) => {
    const next = { ...settings, template: value };
    setSettings(next);
    activityMaintenanceService.saveSettings(next);
  };

  const offPortals = [];
  if (!settings.studentPortal) offPortals.push('Student Portal');
  if (!settings.teacherPanel) offPortals.push('Teacher Panel');

  const previewLabel = offPortals.length === 2
    ? 'Student Portal & Teacher Panel'
    : offPortals[0] || 'Preview';

  const renderMaintenancePreview = ({ portalLabel, titleOverride, template, message, compact }) => {
    const tpl = TEMPLATES[template] || TEMPLATES['Simple Maintenance'];
    const theme = themeClasses[tpl.theme];
    const Icon = tpl.icon;
    return (
      <div className={`rounded-xl border p-6 text-center ${theme.box} ${compact ? 'py-5' : ''}`}>
        <p className="text-[10px] uppercase tracking-wider font-medium mb-3">{portalLabel}</p>
        <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center ${theme.icon}`}>
          <Icon className="h-8 w-8" />
        </div>
        <p className={`text-lg font-bold mt-4 ${theme.title}`}>{titleOverride || tpl.title}</p>
        <p className={`text-sm mt-2 max-w-md mx-auto whitespace-pre-line ${theme.text}`}>{message}</p>
        <button className="mt-5 inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors cursor-pointer">
          <ArrowPathIcon className="h-4 w-4" /> Retry
        </button>
      </div>
    );
  };

  const renderActivityTab = () => (
    <CardSection title={`Activity Logs (${filtered.length})`}>
      <div className="space-y-3 mb-5">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 items-end">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Search</span>
            <SearchInput placeholder="Search by Login ID..." value={search} onChange={(v) => { setSearch(v); setCurrentPage(1); }} />
          </div>
          <FilterDropdown label="User Type" options={USER_TYPES} value={typeFilter} onChange={(v) => { setTypeFilter(v); setCurrentPage(1); }} />
          <FilterDropdown label="Activity Type" options={ACTIVITY_FILTERS} value={activityFilter} onChange={(v) => { setActivityFilter(v); setCurrentPage(1); }} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 items-end">
          <DateInput label="From" name="fromDate" value={fromDate} onChange={(e) => { setFromDate(e.target.value); setCurrentPage(1); }} />
          <DateInput label="To" name="toDate" value={toDate} onChange={(e) => { setToDate(e.target.value); setCurrentPage(1); }} />
          <button onClick={handleRefresh}
            className="justify-self-start mb-4 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all flex items-center gap-2 cursor-pointer">
            <ArrowPathIcon className="h-4 w-4" /> Refresh
          </button>
        </div>
      </div>

      <Table
        columns={columns}
        data={paginatedItems}
        renderRow={(log) => (
          <>
            <td className="px-2.5 py-2.5 whitespace-nowrap">
              <span className="text-[11px] text-gray-500 dark:text-gray-400">{log.time}</span>
            </td>
            <td className="px-2.5 py-2.5 whitespace-nowrap">
              <span className="text-xs font-mono text-gray-600 dark:text-gray-300">{log.userId}</span>
            </td>
            <td className="px-2.5 py-2.5">
              <span className="text-xs font-medium text-gray-900 dark:text-white truncate max-w-[100px] block">{log.userName}</span>
            </td>
            <td className="px-2.5 py-2.5 whitespace-nowrap">
              <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-medium ${userTypeStyles[log.userType] || userTypeStyles.Student}`}>
                {log.userType}
              </span>
            </td>
            <td className="px-2.5 py-2.5 whitespace-nowrap">
              <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-medium ${activityStyles[log.activity] || activityStyles.Logout}`}>
                {log.activity}
              </span>
            </td>
            <td className="px-2.5 py-2.5">
              <span className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[70px] block">{log.browser}</span>
            </td>
            <td className="px-2.5 py-2.5">
              <span className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[70px] block">{log.device}</span>
            </td>
            <td className="px-2.5 py-2.5 whitespace-nowrap">
              <span className="text-xs font-mono text-gray-500 dark:text-gray-400">{log.ip}</span>
            </td>
            <td className="px-2.5 py-2.5 whitespace-nowrap">
              <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-medium border ${statusStyles[log.status] || statusStyles.Failed}`}>
                {log.status}
              </span>
            </td>
          </>
        )}
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
  );

  const renderMaintenanceTab = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
      <div className="space-y-4">
        <PortalCard label="Student Portal" icon={UserGroupIcon} portalOn={settings.studentPortal}
          onToggle={() => handleTogglePortal('studentPortal', 'Student Portal')} />
        {!settings.studentPortal && renderMaintenancePreview({
          portalLabel: 'Student Portal',
          titleOverride: 'Student Portal - Under Maintenance',
          template: settings.template,
          message: settings.message,
          compact: true,
        })}

        <PortalCard label="Teacher Panel" icon={AcademicCapIcon} portalOn={settings.teacherPanel}
          onToggle={() => handleTogglePortal('teacherPanel', 'Teacher Panel')} />
        {!settings.teacherPanel && renderMaintenancePreview({
          portalLabel: 'Teacher Panel',
          titleOverride: 'Teacher Panel - Under Maintenance',
          template: settings.template,
          message: settings.message,
          compact: true,
        })}
      </div>

      <div className="space-y-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-white">Maintenance Message</h3>
          <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">Shown to users when a portal is under maintenance.</p>
          <textarea
            value={settings.message}
            onChange={handleMessageChange}
            rows={4}
            placeholder="Student Portal is under maintenance. Please try again after some time."
            className="mt-3 w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-y"
          />
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-white">Maintenance Template</h3>
          <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">Choose a style for the maintenance screen.</p>
          <div className="mt-3">
            <SelectInput label="Template" name="template" value={settings.template} onChange={(e) => handleTemplateChange(e.target.value)} options={TEMPLATE_OPTIONS} />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-5 flex flex-col">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-white">Live Preview</h3>
          <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">This is exactly how users will see the maintenance screen.</p>
          <div className="mt-4 flex-1">
            {renderMaintenancePreview({
              portalLabel: previewLabel,
              template: settings.template,
              message: settings.message,
            })}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <nav className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
        <span>Dashboard</span>
        <span>/</span>
        <span className="text-gray-500 dark:text-gray-400">User Accounts</span>
        <span>/</span>
        <span className="text-blue-600 dark:text-blue-400 font-medium">Activity &amp; Maintenance</span>
      </nav>

      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Activity &amp; Maintenance</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Track user activity and manage portal maintenance settings.</p>
      </div>

      <div className="flex items-center gap-1 rounded-lg bg-gray-100 dark:bg-gray-700/50 p-1 w-fit max-w-full overflow-x-auto">
        <button
          onClick={() => setActiveTab('activity')}
          className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'activity'
              ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
          }`}
        >
          Activity Logs
        </button>
        <button
          onClick={() => setActiveTab('maintenance')}
          className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'maintenance'
              ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
          }`}
        >
          Maintenance Mode
        </button>
      </div>

      {activeTab === 'activity' ? renderActivityTab() : renderMaintenanceTab()}
    </div>
  );
};

export default ActivityMaintenance;
