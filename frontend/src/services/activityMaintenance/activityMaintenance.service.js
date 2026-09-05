const STORAGE_KEY = 'activity_maintenance';

const teacherNames = [
  'Amir Khan', 'Bilal Ahmed', 'Chetan Sharma', 'Danish Malik', 'Esha Nair',
  'Farah Siddiqui', 'Gaurav Verma', 'Hina Qureshi', 'Imran Sheikh', 'Jaya Rao',
  'Karan Mehta', 'Lubna Akhtar', 'Mohsin Ali', 'Nadia Farooq', 'Owais Ansari',
  'Priya Menon', 'Qasim Raza', 'Ritu Bajaj', 'Salman Iqbal', 'Tanya Kapoor',
];

const studentNames = [
  'Aarav Sharma', 'Vivaan Verma', 'Aditya Patel', 'Vihaan Singh', 'Arjun Kumar',
  'Sai Gupta', 'Pranav Reddy', 'Ananya Joshi', 'Diya Nair', 'Myra Iyer',
  'Rohan Desai', 'Ishaan Mehta', 'Ayaan Shah', 'Sara Pandey', 'Aanya Mishra',
  'Kabir Das', 'Rudra Ghosh', 'Navya Roy', 'Riya Sarkar', 'Shreya Sen',
  'Tanya Bose', 'Kavya Chakraborty', 'Anaya Mukherjee', 'Siya Banerjee',
];

const browsers = ['Chrome 126', 'Firefox 127', 'Edge 126', 'Safari 17', 'Opera 112'];
const devices = ['Desktop', 'Mobile', 'Tablet'];
const activities = ['Login', 'Login', 'Login', 'Logout', 'Logout', 'Failed Login', 'Password Changed'];

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pad(n) {
  return String(n).padStart(2, '0');
}

function randomLogTime() {
  const now = new Date();
  const past = new Date(now.getTime() - Math.floor(Math.random() * 14 * 24 * 60 * 60 * 1000));
  return `${past.getFullYear()}-${pad(past.getMonth() + 1)}-${pad(past.getDate())} ${pad(past.getHours())}:${pad(past.getMinutes())}`;
}

function generateLogs() {
  const people = [
    ...teacherNames.map((name, i) => ({ userId: `TCH-2025-${String(i + 1).padStart(3, '0')}`, userName: name, userType: 'Teacher' })),
    ...studentNames.map((name, i) => ({ userId: `STU-2025-${String(i + 1).padStart(3, '0')}`, userName: name, userType: 'Student' })),
  ];
  const logs = [];
  let id = 1;
  people.forEach((person) => {
    const count = randomInt(1, 3);
    for (let k = 0; k < count; k++) {
      const activity = activities[randomInt(0, activities.length - 1)];
      logs.push({
        id: `log_${id++}`,
        time: randomLogTime(),
        userId: person.userId,
        userName: person.userName,
        userType: person.userType,
        activity,
        browser: browsers[randomInt(0, browsers.length - 1)],
        device: devices[randomInt(0, devices.length - 1)],
        ip: `103.21.58.${randomInt(2, 250)}`,
        status: activity === 'Failed Login' ? 'Failed' : 'Success',
      });
    }
  });
  logs.sort((a, b) => b.time.localeCompare(a.time));
  return logs;
}

function seedMaintenance() {
  return {
    studentPortal: true,
    teacherPanel: true,
    message: 'Student Portal is under maintenance.\nPlease try again after some time.',
    template: 'Simple Maintenance',
  };
}

function seedState() {
  return {
    logs: generateLogs(),
    maintenance: seedMaintenance(),
  };
}

function persist(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore storage write failures
  }
}

const activityMaintenanceService = {
  getState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.logs && parsed.maintenance) return parsed;
      }
    } catch {
      // ignore invalid stored data
    }
    const state = seedState();
    persist(state);
    return state;
  },

  getLogs() {
    return this.getState().logs;
  },

  refreshLogs() {
    const state = this.getState();
    state.logs = generateLogs();
    persist(state);
    return state.logs;
  },

  getSettings() {
    return this.getState().maintenance;
  },

  saveSettings(settings) {
    const state = this.getState();
    state.maintenance = settings;
    persist(state);
  },
};

export default activityMaintenanceService;
