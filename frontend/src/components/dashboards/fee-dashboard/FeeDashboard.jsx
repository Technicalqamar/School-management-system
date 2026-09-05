import { useState } from 'react';
import {
  CurrencyDollarIcon, ArrowTrendingUpIcon, ClockIcon, UserGroupIcon,
  CalendarDaysIcon, ArrowPathIcon, DocumentTextIcon, TrashIcon,
  PencilIcon, Cog6ToothIcon,
} from '@heroicons/react/24/outline';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import CardSection from '../../common/CardSection/CardSection';
import { dashboardStats, monthlyCollectionData, feeTypeCollectionData, pendingStudents, recentActivity } from '../../../data/feeManagement/dummyData';

const formatCurrency = (val) => `Rs. ${Number(val).toLocaleString()}`;

const activityConfig = {
  collected: { icon: CurrencyDollarIcon, bg: 'bg-green-50 dark:bg-green-900/20', text: 'text-green-600 dark:text-green-400' },
  updated: { icon: PencilIcon, bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-600 dark:text-blue-400' },
  deleted: { icon: TrashIcon, bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-600 dark:text-red-400' },
  receipt: { icon: DocumentTextIcon, bg: 'bg-purple-50 dark:bg-purple-900/20', text: 'text-purple-600 dark:text-purple-400' },
  structure: { icon: Cog6ToothIcon, bg: 'bg-yellow-50 dark:bg-yellow-900/20', text: 'text-yellow-600 dark:text-yellow-400' },
};

const statusStyles = {
  Paid: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700',
  Pending: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700',
};

const FeeDashboard = () => {
  const [search, setSearch] = useState('');

  const filteredPending = pendingStudents.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) || s.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <nav className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
        <span>Dashboard</span>
        <span>/</span>
        <span className="text-blue-600 dark:text-blue-400 font-medium">Fee Dashboard</span>
      </nav>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Fee Dashboard</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Overview of fee collections, payments and pending fees</p>
        </div>
        <button className="px-4 py-2.5 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all flex items-center gap-2 cursor-pointer">
          <ArrowPathIcon className="h-4 w-4" /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Collected</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{formatCurrency(dashboardStats.totalCollected)}</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
              <CurrencyDollarIcon className="h-6 w-6" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Monthly Collection</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{formatCurrency(dashboardStats.monthlyCollection)}</p>
            </div>
            <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400">
              <ArrowTrendingUpIcon className="h-6 w-6" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Admission Collection</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{formatCurrency(dashboardStats.admissionCollection)}</p>
            </div>
            <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400">
              <UserGroupIcon className="h-6 w-6" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Exam Collection</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{formatCurrency(dashboardStats.examCollection)}</p>
            </div>
            <div className="p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400">
              <CalendarDaysIcon className="h-6 w-6" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Pending Fees</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">{formatCurrency(dashboardStats.pendingFees)}</p>
            </div>
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400">
              <ClockIcon className="h-6 w-6" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Today's Collection</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">{formatCurrency(dashboardStats.todayCollection)}</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
              <CurrencyDollarIcon className="h-6 w-6" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CardSection title="Monthly Fee Collection">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyCollectionData} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v)} />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend verticalAlign="top" height={30} />
                <Bar dataKey="collected" fill="#2563eb" radius={[4, 4, 0, 0]} name="Collected" maxBarSize={40} />
                <Bar dataKey="pending" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Pending" maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardSection>

        <CardSection title="Fee Collection by Type">
          <div className="h-72 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={feeTypeCollectionData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {feeTypeCollectionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardSection>
      </div>

      <CardSection title="Collection Trends">
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyCollectionData} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v)} />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Legend verticalAlign="top" height={30} />
              <Line type="monotone" dataKey="collected" stroke="#2563eb" strokeWidth={2.5} dot={{ r: 4, fill: '#2563eb' }} activeDot={{ r: 6 }} name="Collected" />
              <Line type="monotone" dataKey="pending" stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 3, fill: '#f59e0b' }} name="Pending" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardSection>

      <CardSection title="Recent Activity">
        <div className="space-y-1">
          {recentActivity.map((activity) => {
            const cfg = activityConfig[activity.activityType] || activityConfig.collected;
            const Icon = cfg.icon;
            return (
              <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                <div className={`flex-shrink-0 p-2 rounded-lg ${cfg.bg} ${cfg.text}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{activity.title}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                        {activity.studentName ? (
                          <span>{activity.studentName}{activity.feeType ? ` \u2014 ${activity.feeType}` : ''}{activity.amount != null ? ` \u2014 ${formatCurrency(activity.amount)}` : ''}</span>
                        ) : (
                          <span>{activity.feeType}</span>
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {activity.feeType && (
                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium border ${
                          activity.feeType === 'Admission Fee' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-700'
                            : activity.feeType === 'Examination Fee' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-300 dark:border-orange-700'
                              : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700'
                        }`}>
                          {activity.feeType === 'Monthly Fee' ? 'M Fee' : activity.feeType === 'Admission Fee' ? 'A Fee' : 'E Fee'}
                        </span>
                      )}
                      <span className="text-[11px] text-gray-400 dark:text-gray-500 whitespace-nowrap">{activity.time}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardSection>

      <CardSection title="Students with Pending Fees">
        <div>
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search by student name or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-72 px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800/50">
                  <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider">Student ID</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider">Name</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider">Class</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider">Fee Type</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider">Amount</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider">Due Month</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider">Days Overdue</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredPending.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-gray-400 dark:text-gray-500">No pending fees found</td>
                  </tr>
                ) : (
                  filteredPending.map((student) => (
                    <tr key={student.id} className="bg-white dark:bg-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400 font-mono text-xs">{student.id}</td>
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{student.name}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{student.class} - {student.section}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{student.feeType}</td>
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{formatCurrency(student.amount)}</td>
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{student.dueMonth}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${student.daysOverdue > 30 ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'}`}>
                          {student.daysOverdue} days
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusStyles.Pending}`}>
                          Pending
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </CardSection>
    </div>
  );
};

export default FeeDashboard;
