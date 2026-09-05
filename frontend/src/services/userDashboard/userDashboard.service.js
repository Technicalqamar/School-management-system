const DASHBOARD_KEY = 'user_dashboard_data';

const userNames = [
  'Aarav Sharma', 'Vivaan Verma', 'Aditya Patel', 'Vihaan Singh', 'Arjun Kumar',
  'Sai Gupta', 'Pranav Reddy', 'Ananya Joshi', 'Diya Nair', 'Myra Iyer',
  'Rohan Desai', 'Ishaan Mehta', 'Ayaan Shah', 'Sara Pandey', 'Aanya Mishra',
  'Kabir Das', 'Rudra Ghosh', 'Navya Roy', 'Riya Sarkar', 'Shreya Sen',
  'Tanya Bose', 'Kavya Chakraborty', 'Anaya Mukherjee', 'Siya Banerjee',
  'Jiya Chatterjee', 'Reyansh Sharma', 'Laksh Verma', 'Arush Patel',
  'Harsh Singh', 'Nandini Kumar', 'Shanaya Gupta', 'Jhanvi Reddy',
];

const userTypes = ['Teacher', 'Student', 'Admin'];
const browsers = ['Chrome', 'Firefox', 'Safari', 'Edge', 'Brave'];

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomPick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pad(n) {
  return String(n).padStart(2, '0');
}

function generateLoginActivity() {
  const data = [];
  for (let i = 0; i < 25; i++) {
    const day = randomInt(1, 28);
    const month = randomInt(4, 6);
    const hours = randomInt(8, 20);
    const mins = randomInt(0, 59);
    const status = Math.random() < 0.82 ? 'Success' : 'Failed';
    data.push({
      id: `login_${i + 1}`,
      loginId: `LG-2025-${String(1000 + i)}`,
      userName: randomPick(userNames),
      userType: randomPick(userTypes),
      loginTime: `2025-${pad(month)}-${pad(day)} ${pad(hours)}:${pad(mins)}`,
      status,
      browser: randomPick(browsers),
    });
  }
  data.sort((a, b) => b.loginTime.localeCompare(a.loginTime));
  return data;
}

function generateAllData() {
  return {
    totalTeachers: 48,
    totalStudents: 546,
    activeAccounts: 421,
    inactiveAccounts: 32,
    activeTeacherPortals: 45,
    activeStudentPortals: 375,
    growthRates: {
      totalTeachers: '+4.5%',
      totalStudents: '+5.2%',
      activeAccounts: '+7.8%',
      inactiveAccounts: '-2.1%',
      activeTeacherPortals: '+3.4%',
      activeStudentPortals: '+6.9%',
    },
    growthUp: {
      totalTeachers: true,
      totalStudents: true,
      activeAccounts: true,
      inactiveAccounts: false,
      activeTeacherPortals: true,
      activeStudentPortals: true,
    },
    accountComparison: [
      { month: 'Jan', teachers: 38, students: 480 },
      { month: 'Feb', teachers: 40, students: 492 },
      { month: 'Mar', teachers: 41, students: 505 },
      { month: 'Apr', teachers: 43, students: 518 },
      { month: 'May', teachers: 45, students: 531 },
      { month: 'Jun', teachers: 48, students: 546 },
    ],
    dailyLoginActivity: [
      { day: 'Mon', logins: 142, uniqueUsers: 118 },
      { day: 'Tue', logins: 156, uniqueUsers: 126 },
      { day: 'Wed', logins: 148, uniqueUsers: 121 },
      { day: 'Thu', logins: 164, uniqueUsers: 132 },
      { day: 'Fri', logins: 158, uniqueUsers: 127 },
      { day: 'Sat', logins: 92, uniqueUsers: 71 },
      { day: 'Sun', logins: 64, uniqueUsers: 49 },
    ],
    portalStatus: [
      { name: 'Teacher Portal', icon: 'teacher', total: 48, active: 45, inactive: 3, color: 'green' },
      { name: 'Student Portal', icon: 'student', total: 546, active: 375, inactive: 171, color: 'blue' },
      { name: 'Admin Accounts', icon: 'admin', total: 6, active: 5, inactive: 1, color: 'yellow' },
    ],
    loginActivity: generateLoginActivity(),
  };
}

const userDashboardService = {
  getDashboardData() {
    try {
      const raw = localStorage.getItem(DASHBOARD_KEY);
      if (raw) return JSON.parse(raw);
    } catch {
      // ignore invalid stored data
    }
    const data = generateAllData();
    try {
      localStorage.setItem(DASHBOARD_KEY, JSON.stringify(data));
    } catch {
      // ignore storage write failures
    }
    return data;
  },

  refreshDashboard() {
    try {
      localStorage.removeItem(DASHBOARD_KEY);
    } catch {
      // ignore storage removal failures
    }
    const data = generateAllData();
    try {
      localStorage.setItem(DASHBOARD_KEY, JSON.stringify(data));
    } catch {
      // ignore storage write failures
    }
    return data;
  },

  removeLoginActivity(id) {
    try {
      const raw = localStorage.getItem(DASHBOARD_KEY);
      if (!raw) return;
      const data = JSON.parse(raw);
      data.loginActivity = (data.loginActivity || []).filter((item) => item.id !== id);
      localStorage.setItem(DASHBOARD_KEY, JSON.stringify(data));
    } catch {
      // ignore storage write failures
    }
  },
};

export default userDashboardService;
