const STORAGE_KEY = 'portal_control';

const MODULE_CATALOG = {
  Student: [
    { id: 'stu-dashboard', name: 'Dashboard', description: 'Overview of academic progress and announcements', icon: 'Squares2X2Icon' },
    { id: 'stu-profile', name: 'Profile', description: 'View and manage personal profile details', icon: 'UserCircleIcon' },
    { id: 'stu-attendance', name: 'Attendance', description: 'Track attendance records and present days', icon: 'CheckCircleIcon' },
    { id: 'stu-fee', name: 'Fee', description: 'View fee details, dues and payment history', icon: 'CurrencyDollarIcon' },
    { id: 'stu-assignments', name: 'Assignments', description: 'View and submit homework assignments', icon: 'ClipboardDocumentListIcon' },
    { id: 'stu-results', name: 'Results', description: 'Check exam results and report cards', icon: 'ChartBarIcon' },
    { id: 'stu-events', name: 'Events', description: 'Browse school events and celebrations', icon: 'CalendarDaysIcon' },
    { id: 'stu-timetable', name: 'Timetable', description: 'View class schedule and daily periods', icon: 'ClockIcon' },
    { id: 'stu-library', name: 'Library', description: 'Browse library books and issued items', icon: 'BookOpenIcon' },
    { id: 'stu-leave', name: 'Leave', description: 'Apply for leave and track approvals', icon: 'SunIcon' },
  ],
  Teacher: [
    { id: 'tea-dashboard', name: 'Dashboard', description: 'Overview of teaching activities and alerts', icon: 'Squares2X2Icon' },
    { id: 'tea-attendance', name: 'Attendance', description: 'Mark and manage student attendance', icon: 'CheckCircleIcon' },
    { id: 'tea-assignments', name: 'Assignments', description: 'Create, assign and evaluate homework', icon: 'ClipboardDocumentListIcon' },
    { id: 'tea-students', name: 'Students', description: 'View assigned students and their records', icon: 'UserGroupIcon' },
    { id: 'tea-results', name: 'Results', description: 'Enter and publish student results', icon: 'ChartBarIcon' },
    { id: 'tea-events', name: 'Events', description: 'Manage school events and notices', icon: 'CalendarDaysIcon' },
    { id: 'tea-timetable', name: 'Timetable', description: 'View teaching schedule and periods', icon: 'ClockIcon' },
    { id: 'tea-leave', name: 'Leave', description: 'Apply for leave and track approvals', icon: 'SunIcon' },
    { id: 'tea-profile', name: 'Profile', description: 'View and manage personal profile details', icon: 'UserCircleIcon' },
  ],
};

const PORTAL_KEY = { Student: 'studentPortal', Teacher: 'teacherPanel' };

function pad(n) {
  return String(n).padStart(2, '0');
}

function nowString() {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function seedState() {
  const moduleStates = {};
  [...MODULE_CATALOG.Student, ...MODULE_CATALOG.Teacher].forEach((m) => {
    moduleStates[m.id] = true;
  });
  return {
    studentPortal: { status: 'Enabled', lastUpdated: nowString() },
    teacherPanel: { status: 'Enabled', lastUpdated: nowString() },
    moduleStates,
  };
}

function persist(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore storage write failures
  }
}

const portalControlService = {
  getState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.moduleStates) return parsed;
      }
    } catch {
      // ignore invalid stored data
    }
    const state = seedState();
    persist(state);
    return state;
  },

  getData() {
    const state = this.getState();
    return {
      portals: {
        Student: { status: state.studentPortal.status, lastUpdated: state.studentPortal.lastUpdated },
        Teacher: { status: state.teacherPanel.status, lastUpdated: state.teacherPanel.lastUpdated },
      },
      modules: {
        Student: MODULE_CATALOG.Student.map((m) => ({ ...m, portal: 'Student', enabled: state.moduleStates[m.id] !== false })),
        Teacher: MODULE_CATALOG.Teacher.map((m) => ({ ...m, portal: 'Teacher', enabled: state.moduleStates[m.id] !== false })),
      },
    };
  },

  setPortalStatus(portal, status) {
    const state = this.getState();
    state[PORTAL_KEY[portal]].status = status;
    state[PORTAL_KEY[portal]].lastUpdated = nowString();
    persist(state);
  },

  setModuleEnabled(portal, moduleId, enabled) {
    const state = this.getState();
    state.moduleStates[moduleId] = enabled;
    state[PORTAL_KEY[portal]].lastUpdated = nowString();
    persist(state);
  },

  setAllModules(portal, enabled) {
    const state = this.getState();
    MODULE_CATALOG[portal].forEach((m) => {
      state.moduleStates[m.id] = enabled;
    });
    state[PORTAL_KEY[portal]].lastUpdated = nowString();
    persist(state);
  },

  resetDefaults() {
    const state = seedState();
    persist(state);
  },

  getActiveUsers(portal) {
    const type = portal === 'Student' ? 'Student' : 'Teacher';
    try {
      const raw = localStorage.getItem('user_accounts');
      if (raw) {
        const items = JSON.parse(raw);
        return items.filter((a) => a.userType === type && a.status === 'Active').length;
      }
    } catch {
      // ignore invalid stored data
    }
    return type === 'Student' ? 24 : 20;
  },
};

export default portalControlService;
