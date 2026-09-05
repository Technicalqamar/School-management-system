import { ACADEMIC_YEARS, CLASS_NAMES } from '../../utils/classNames';

const STORAGE_KEY = 'qr_management_students';

const NAMES = [
  'Ahmed Khan', 'Sara Ali', 'Muhammad Usman', 'Fatima Zahra', 'Ali Raza',
  'Ayesha Bibi', 'Hassan Javed', 'Zainab Malik', 'Omar Farooq', 'Hira Batool',
  'Hamza Sheikh', 'Mahnoor Ahmed', 'Bilal Hussain', 'Laiba Noor', 'Tahir Iqbal',
  'Sana Mirza', 'Rayan Akhtar', 'Iqra Aziz', 'Zayan Siddiqui', 'Eman Tariq',
  'Aryan Bhatti', 'Rida Fatima', 'Shahmir Ali', 'Dua Hasan', 'Rohail Shah',
  'Minahil Zafar', 'Saim Riaz', 'Aleena Khan', 'Huzaifa Khalid', 'Amna Rizvi',
  'Arham Sheikh', 'Sehrish Ali', 'Ibrahim Hashmi', 'Fiza Qureshi', 'Rayyan Ansari',
  'Noor Fatima', 'Moin Abbas', 'Sidra Iqbal', 'Rafay Mansoor', 'Hania Amir',
];

function generateId(yearLabel, index) {
  const prefix = yearLabel.split('-')[0];
  return `STD-${prefix}-${String(index).padStart(4, '0')}`;
}

function generateDummyStudents() {
  const students = [];
  let globalIdx = 1;

  ACADEMIC_YEARS.slice(0, 3).forEach((year) => {
    CLASS_NAMES.forEach((cls) => {
      const count = Math.floor(Math.random() * 3) + 2;
      for (let i = 0; i < count; i++) {
        const name = NAMES[Math.floor(Math.random() * NAMES.length)];
        students.push({
          id: `qr_${globalIdx}`,
          fullName: name,
          studentId: generateId(year, globalIdx),
          class: cls,
          academicYear: year,
          qrStatus: Math.random() > 0.25 ? 'Generated' : 'Pending',
          cardStatus: Math.random() > 0.5 ? 'Printed' : 'Not Printed',
          createdAt: new Date().toISOString(),
        });
        globalIdx++;
      }
    });
  });

  return students;
}

const qrManagementService = {
  loadStudents() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
      const dummy = generateDummyStudents();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dummy));
      return dummy;
    } catch { return []; }
  },

  saveStudents(students) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
      return true;
    } catch { return false; }
  },

  updateStudent(id, changes) {
    const list = this.loadStudents();
    const idx = list.findIndex((s) => s.id === id);
    if (idx === -1) return null;
    list[idx] = { ...list[idx], ...changes };
    this.saveStudents(list);
    return list[idx];
  },

  generateMissing() {
    const list = this.loadStudents();
    let count = 0;
    list.forEach((s) => {
      if (s.qrStatus === 'Pending') { s.qrStatus = 'Generated'; count++; }
    });
    this.saveStudents(list);
    return count;
  },

  markPrinted(ids) {
    const list = this.loadStudents();
    list.forEach((s) => {
      if (ids.includes(s.id)) s.cardStatus = 'Printed';
    });
    this.saveStudents(list);
  },

  getStudentsByFilter(year, cls) {
    let list = this.loadStudents();
    if (year) list = list.filter((s) => s.academicYear === year);
    if (cls) list = list.filter((s) => s.class === cls);
    return list;
  },

  getStats(students) {
    const total = students.length;
    const generated = students.filter((s) => s.qrStatus === 'Generated').length;
    const printed = students.filter((s) => s.cardStatus === 'Printed').length;
    const pending = total - generated;
    return { total, generated, printed, pending };
  },
};

export { ACADEMIC_YEARS, CLASS_NAMES as CLASS_LIST };
export default qrManagementService;
