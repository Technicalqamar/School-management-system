const STORAGE_KEY = 'user_accounts';

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

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pad(n) {
  return String(n).padStart(2, '0');
}

function todayString() {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function randomLoginTime() {
  const month = randomInt(1, 6);
  const day = randomInt(1, 28);
  const hours = randomInt(8, 20);
  const mins = randomInt(0, 59);
  return `2025-${pad(month)}-${pad(day)} ${pad(hours)}:${pad(mins)}`;
}

function randomCreatedDate() {
  const month = randomInt(1, 4);
  const day = randomInt(1, 28);
  return `2025-${pad(month)}-${pad(day)}`;
}

function generateAccounts() {
  const teachers = teacherNames.map((name, i) => ({
    id: `ua_t${i + 1}`,
    loginId: `TCH-2025-${String(i + 1).padStart(3, '0')}`,
    userName: name,
    userType: 'Teacher',
    linkedId: `TCH${String(101 + i)}`,
    status: Math.random() < 0.85 ? 'Active' : 'Inactive',
    lastLogin: Math.random() < 0.15 ? '-' : randomLoginTime(),
    createdAt: randomCreatedDate(),
    password: 'demo1234',
  }));

  const students = studentNames.map((name, i) => ({
    id: `ua_s${i + 1}`,
    loginId: `STU-2025-${String(i + 1).padStart(3, '0')}`,
    userName: name,
    userType: 'Student',
    linkedId: `ADM${String(2025100 + i)}`,
    status: Math.random() < 0.7 ? 'Active' : 'Inactive',
    lastLogin: Math.random() < 0.1 ? '-' : randomLoginTime(),
    createdAt: randomCreatedDate(),
    password: 'demo1234',
  }));

  return [...teachers, ...students];
}

function persist(items) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // ignore storage write failures
  }
}

const teacherRefs = teacherNames.map((name, i) => ({ id: `TCH${String(101 + i)}`, name }));
const studentRefs = studentNames.map((name, i) => ({ id: `ADM${String(2025100 + i)}`, name }));

const userAccountsService = {
  getAll() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch {
      // ignore invalid stored data
    }
    const data = generateAccounts();
    persist(data);
    return data;
  },

  getById(id) {
    const items = this.getAll();
    return items.find((item) => item.id === id) || null;
  },

  add(data) {
    const items = this.getAll();
    const newAccount = {
      id: `ua_${Date.now()}`,
      createdAt: todayString(),
      lastLogin: '-',
      ...data,
    };
    items.push(newAccount);
    persist(items);
    return newAccount;
  },

  update(id, data) {
    const items = this.getAll();
    const idx = items.findIndex((item) => item.id === id);
    if (idx === -1) return null;
    const updated = { ...items[idx], ...data };
    items[idx] = updated;
    persist(items);
    return updated;
  },

  remove(id) {
    const items = this.getAll();
    const filtered = items.filter((item) => item.id !== id);
    persist(filtered);
  },

  setStatus(id, status) {
    const items = this.getAll();
    const idx = items.findIndex((item) => item.id === id);
    if (idx === -1) return null;
    items[idx] = { ...items[idx], status };
    persist(items);
    return items[idx];
  },

  resetPassword(id, newPassword = 'demo1234') {
    const items = this.getAll();
    const idx = items.findIndex((item) => item.id === id);
    if (idx === -1) return null;
    items[idx] = { ...items[idx], password: newPassword, passwordLastChanged: todayString() };
    persist(items);
    return items[idx];
  },

  getStats() {
    const items = this.getAll();
    return {
      totalTeachers: items.filter((item) => item.userType === 'Teacher').length,
      totalStudents: items.filter((item) => item.userType === 'Student').length,
      activeAccounts: items.filter((item) => item.status === 'Active').length,
      inactiveAccounts: items.filter((item) => item.status === 'Inactive').length,
    };
  },

  getTeachers() {
    return teacherRefs;
  },

  getStudents() {
    return studentRefs;
  },
};

export default userAccountsService;
