import { useState, useEffect, useCallback } from 'react';
import {
  UserGroupIcon, AcademicCapIcon, UserCircleIcon, UserMinusIcon,
  BriefcaseIcon, BookOpenIcon, ArrowPathIcon,
  UsersIcon, ClockIcon, Cog6ToothIcon,
  WrenchScrewdriverIcon, TrashIcon,
} from '@heroicons/react/24/outline';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import StatCard from '../../common/StatCard/StatCard';
import CardSection from '../../common/CardSection/CardSection';
import SelectInput from '../../common/SelectInput/SelectInput';
import SearchInput from '../../common/SearchInput/SearchInput';
import FilterDropdown from '../../common/FilterDropdown/FilterDropdown';
import ConfirmationModal from '../../common/ConfirmationModal/ConfirmationModal';
import userDashboardService from '../../../services/userDashboard/userDashboard.service';

const getInitials = (name) => {
  if (!name) return 'N/A';
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
};

const getAvatarColor = (name) => {
  const colors = [
    'from-blue-500 to-blue-700', 'from-green-500 to-green-700', 'from-purple-500 to-purple-700',
    'from-pink-500 to-pink-700', 'from-indigo-500 to-indigo-700', 'from-teal-500 to-teal-700',
    'from-orange-500 to-orange-700', 'from-cyan-500 to-cyan-700',
  ];
  let hash = 0;
  const str = name || '';
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
};

const statusStyles = {
  Success: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700',
  Failed: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-300 dark:border-red-700',
};

const typeStyles = {
  Teacher: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
  Student: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
};

const portalIconMap = {
  teacher: { Icon: BriefcaseIcon, text: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400', bar: 'bg-green-500' },
  student: { Icon: AcademicCapIcon, text: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400', bar: 'bg-blue-500' },
};

const quickActions = [
  { icon: UsersIcon, label: 'Manage User Accounts', desc: 'Create, edit and manage all user accounts' },
  { icon: Cog6ToothIcon, label: 'Portal Control', desc: 'Enable or disable teacher and student portals' },
  { icon: ClockIcon, label: 'Login Activity', desc: 'Monitor login attempts and session activity' },
  { icon: WrenchScrewdriverIcon, label: 'Maintenance', desc: 'Run system maintenance and cleanup tasks' },
];

const ITEMS_PER_PAGE = 10;

const UserDashboard = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [selectedType, setSelectedType] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteItem, setDeleteItem] = useState(null);

  const loadData = useCallback(() => {
    try {
      const result = userDashboardService.getDashboardData();
      setData(result);
      setError(null);
    } catch {
      setError('Failed to load dashboard data');
    }
  }, []);

  useEffect(() => { // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData();
  }, [loadData]);

  const handleRefresh = () => {
    try {
      setData(null);
      setError(null);
      const result = userDashboardService.refreshDashboard();
      setData(result);
      setCurrentPage(1);
    } catch {
      setError('Failed to refresh data');
    }
  };

  const handleTypeChange = (e) => { setSelectedType(e.target.value); setCurrentPage(1); };
  const handleStatusChange = (val) => { setStatusFilter(val); setCurrentPage(1); };
  const handleSearch = (val) => { setSearch(val); setCurrentPage(1); };

  const handleConfirmDelete = () => {
    if (!deleteItem) return;
    try {
      userDashboardService.removeLoginActivity(deleteItem.id);
      setData((prev) => prev
        ? { ...prev, loginActivity: (prev.loginActivity || []).filter((x) => x.id !== deleteItem.id) }
        : prev);
      setDeleteItem(null);
    } catch {
      // ignore delete failures
    }
  };

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
            <span className="text-2xl text-red-500">!</span>
          </div>
          <p className="text-gray-500 dark:text-gray-400">{error}</p>
          <button onClick={handleRefresh}
            className="mt-4 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 cursor-pointer"
          >Try Again</button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const d = data;

  const statKeys = ['totalTeachers', 'totalStudents', 'activeAccounts', 'inactiveAccounts', 'activeTeacherPortals', 'activeStudentPortals'];

  const statCards = [
    { icon: UserGroupIcon, label: 'Total Teachers', value: String(d.totalTeachers ?? 0), color: 'blue' },
    { icon: AcademicCapIcon, label: 'Total Students', value: String(d.totalStudents ?? 0), color: 'green' },
    { icon: UserCircleIcon, label: 'Active User Accounts', value: String(d.activeAccounts ?? 0), color: 'blue' },
    { icon: UserMinusIcon, label: 'Inactive Accounts', value: String(d.inactiveAccounts ?? 0), color: 'red' },
    { icon: BriefcaseIcon, label: 'Active Teacher Panels', value: String(d.activeTeacherPortals ?? 0), color: 'yellow' },
    { icon: BookOpenIcon, label: 'Active Student Portals', value: String(d.activeStudentPortals ?? 0), color: 'green' },
  ];

  const growthRates = d.growthRates || {};
  const growthUp = d.growthUp || {};

  const allLogins = (d.loginActivity || []).filter((item) => item.userType === 'Teacher' || item.userType === 'Student');
  const query = search.trim().toLowerCase();
  const filteredLogins = allLogins.filter((item) => {
    if (selectedType !== 'All' && item.userType !== selectedType) return false;
    if (statusFilter !== 'All' && item.status !== statusFilter) return false;
    if (query && !(item.userName.toLowerCase().includes(query) || item.loginId.toLowerCase().includes(query))) return false;
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filteredLogins.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedLogins = filteredLogins.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE);

  const portalCards = (d.portalStatus || [])
    .filter((p) => p.icon !== 'admin')
    .map((p) => ({ ...p, name: p.name === 'Teacher Portal' ? 'Teacher Panel' : p.name }));

  return (
    <div className="space-y-6">
      <nav className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
        <span>Dashboard</span>
        <span>/</span>
        <span className="text-gray-500 dark:text-gray-400">User Management</span>
        <span>/</span>
        <span className="text-blue-600 dark:text-blue-400 font-medium">User Dashboard</span>
      </nav>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">User Dashboard</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Overview of user accounts, portals and login activity</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4">
        <div className="flex flex-wrap items-end gap-4">
          <div className="w-full sm:w-44">
            <SelectInput label="User Type" name="userType" value={selectedType} onChange={handleTypeChange}
              options={['All', 'Teacher', 'Student']} className="!mb-0" />
          </div>
          <div className="w-full sm:w-64">
            <SearchInput placeholder="Search by user name or login ID..." value={search} onChange={handleSearch} />
          </div>
          <div className="w-full sm:w-40">
            <FilterDropdown label="Status" options={['All', 'Success', 'Failed']} value={statusFilter} onChange={handleStatusChange} />
          </div>
          <button onClick={handleRefresh}
            className="px-4 py-2.5 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all flex items-center gap-2 cursor-pointer">
            <ArrowPathIcon className="h-4 w-4" /> Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((card, idx) => {
          const key = statKeys[idx];
          const rate = growthRates[key];
          const up = growthUp[key];
          return (
            <div key={card.label} className="relative">
              <StatCard icon={card.icon} label={card.label} value={card.value} color={card.color} />
              {rate && (
                <span className={`absolute bottom-2 right-3 text-[10px] font-medium flex items-center gap-0.5 ${up ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                  <span className={up ? '' : 'rotate-180 inline-block'}>&#9650;</span>
                  {rate}
                </span>
              )}
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CardSection title="Teacher vs Student Accounts">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={d.accountComparison || []} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false}
                  tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v)} />
                <Tooltip />
                <Legend verticalAlign="top" height={30} />
                <Bar dataKey="teachers" fill="#2563eb" radius={[4, 4, 0, 0]} name="Teachers" maxBarSize={40} />
                <Bar dataKey="students" fill="#22c55e" radius={[4, 4, 0, 0]} name="Students" maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardSection>

        <CardSection title="Daily Login Activity">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={d.dailyLoginActivity || []} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Legend verticalAlign="top" height={30} />
                <Line type="monotone" dataKey="logins" stroke="#2563eb" strokeWidth={2.5} dot={{ r: 4, fill: '#2563eb' }} activeDot={{ r: 6 }} name="Logins" />
                <Line type="monotone" dataKey="uniqueUsers" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 3, fill: '#94a3b8' }} name="Unique Users" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardSection>
      </div>

      <CardSection title="Recent Login Activity">
        <div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800/50">
                  <th className="px-1.5 py-2 text-left font-semibold text-gray-600 dark:text-gray-300 text-[10px] uppercase tracking-wider whitespace-nowrap">Login ID</th>
                  <th className="px-1.5 py-2 text-left font-semibold text-gray-600 dark:text-gray-300 text-[10px] uppercase tracking-wider whitespace-nowrap">User Name</th>
                  <th className="px-1.5 py-2 text-left font-semibold text-gray-600 dark:text-gray-300 text-[10px] uppercase tracking-wider whitespace-nowrap">User Type</th>
                  <th className="px-1.5 py-2 text-left font-semibold text-gray-600 dark:text-gray-300 text-[10px] uppercase tracking-wider whitespace-nowrap">Login Time</th>
                  <th className="px-1.5 py-2 text-left font-semibold text-gray-600 dark:text-gray-300 text-[10px] uppercase tracking-wider whitespace-nowrap">Status</th>
                  <th className="px-1.5 py-2 text-left font-semibold text-gray-600 dark:text-gray-300 text-[10px] uppercase tracking-wider whitespace-nowrap">Browser</th>
                  <th className="px-1.5 py-2 text-left font-semibold text-gray-600 dark:text-gray-300 text-[10px] uppercase tracking-wider whitespace-nowrap">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {paginatedLogins.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-1.5 py-6 text-center text-gray-400 dark:text-gray-500">No login activity found</td>
                  </tr>
                ) : (
                  paginatedLogins.map((item) => (
                    <tr key={item.id} className="bg-white dark:bg-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <td className="px-1.5 py-2 text-[10px] text-gray-400 dark:text-gray-500 whitespace-nowrap font-mono">{item.loginId}</td>
                      <td className="px-1.5 py-2">
                        <div className="flex items-center gap-1.5">
                          <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${getAvatarColor(item.userName)} flex items-center justify-center text-white font-bold text-[7px] flex-shrink-0`}>
                            {getInitials(item.userName)}
                          </div>
                          <span className="text-[11px] font-medium text-gray-900 dark:text-white truncate max-w-[90px]">{item.userName}</span>
                        </div>
                      </td>
                      <td className="px-1.5 py-2 whitespace-nowrap">
                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-medium ${typeStyles[item.userType] || typeStyles.Student}`}>
                          {item.userType}
                        </span>
                      </td>
                      <td className="px-1.5 py-2 text-[10px] text-gray-500 dark:text-gray-400 whitespace-nowrap">{item.loginTime}</td>
                      <td className="px-1.5 py-2 whitespace-nowrap">
                        <span className={`inline-flex items-center px-1 py-0.5 rounded-full text-[8px] font-medium border ${statusStyles[item.status] || statusStyles.Failed}`}>
                          {item.status || 'Failed'}
                        </span>
                      </td>
                      <td className="px-1.5 py-2 text-[10px] text-gray-500 dark:text-gray-400 whitespace-nowrap">{item.browser || '-'}</td>
                      <td className="px-1.5 py-2 whitespace-nowrap">
                        <button onClick={() => setDeleteItem(item)}
                          className="p-1 text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors cursor-pointer"
                          aria-label={`Delete ${item.loginId}`}>
                          <TrashIcon className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {filteredLogins.length > 0 && totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Showing {Math.min(filteredLogins.length, (safePage - 1) * ITEMS_PER_PAGE + 1)}&ndash;{Math.min(safePage * ITEMS_PER_PAGE, filteredLogins.length)} of {filteredLogins.length}
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
        </div>
      </CardSection>

      <CardSection title="Portal Status Overview">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {portalCards.length === 0 ? (
            <div className="py-6 text-center text-gray-400 dark:text-gray-500 col-span-full">No portal data</div>
          ) : (
            portalCards.map((portal) => {
              const style = portalIconMap[portal.icon] || portalIconMap.teacher;
              const IconComp = style.Icon;
              const percentage = portal.total > 0 ? Math.round((portal.active / portal.total) * 100) : 0;
              return (
                <div key={portal.name} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-lg ${style.text}`}>
                      <IconComp className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-800 dark:text-white">{portal.name}</p>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400">{portal.total} accounts</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3 text-[11px]">
                    <span className="text-green-600 dark:text-green-400 font-medium">{portal.active} Active</span>
                    <span className="text-red-500 dark:text-red-400 font-medium">{portal.inactive} Inactive</span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full mt-2 overflow-hidden">
                    <div className={`h-full rounded-full ${style.bar}`} style={{ width: `${percentage}%` }} />
                  </div>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1.5">{percentage}% active</p>
                </div>
              );
            })
          )}
        </div>
      </CardSection>

      <CardSection title="Quick Actions">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => {
            const IconComp = action.icon;
            return (
              <button key={action.label}
                className="text-left bg-gray-50 dark:bg-gray-700/30 rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:bg-gray-100 dark:hover:bg-gray-700 hover:shadow-md transition-all cursor-pointer">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                    <IconComp className="h-5 w-5" />
                  </div>
                  <span className="text-[10px] font-medium text-gray-400 dark:text-gray-500 px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded-full">Coming Soon</span>
                </div>
                <p className="text-sm font-semibold text-gray-800 dark:text-white mt-3">{action.label}</p>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">{action.desc}</p>
              </button>
            );
          })}
        </div>
      </CardSection>

      <ConfirmationModal
        isOpen={!!deleteItem}
        onClose={() => setDeleteItem(null)}
        title="Delete Login Record"
        message={`Are you sure you want to delete the login record for "${deleteItem?.userName}" (${deleteItem?.loginId})? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};

export default UserDashboard;
