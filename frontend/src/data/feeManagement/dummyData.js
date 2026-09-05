export const feeStructures = [
  { id: 1, feeType: 'Monthly Fee', className: 'Class 1', amount: 4000, frequency: 'Monthly', status: 'Active' },
  { id: 2, feeType: 'Monthly Fee', className: 'Class 2', amount: 4500, frequency: 'Monthly', status: 'Active' },
  { id: 3, feeType: 'Monthly Fee', className: 'Class 3', amount: 5000, frequency: 'Monthly', status: 'Active' },
  { id: 4, feeType: 'Monthly Fee', className: 'Class 4', amount: 5500, frequency: 'Monthly', status: 'Active' },
  { id: 5, feeType: 'Monthly Fee', className: 'Class 5', amount: 6000, frequency: 'Monthly', status: 'Active' },
  { id: 6, feeType: 'Monthly Fee', className: 'Class 6', amount: 6500, frequency: 'Monthly', status: 'Active' },
  { id: 7, feeType: 'Monthly Fee', className: 'Class 7', amount: 7000, frequency: 'Monthly', status: 'Active' },
  { id: 8, feeType: 'Monthly Fee', className: 'Class 8', amount: 7500, frequency: 'Monthly', status: 'Active' },
  { id: 9, feeType: 'Monthly Fee', className: 'Class 9', amount: 8000, frequency: 'Monthly', status: 'Active' },
  { id: 10, feeType: 'Monthly Fee', className: 'Class 10', amount: 8500, frequency: 'Monthly', status: 'Active' },
  { id: 11, feeType: 'Admission Fee', className: 'All Classes', amount: 15000, frequency: 'One-time', status: 'Active' },
  { id: 12, feeType: 'Exam Fee', className: 'Class 1-5', amount: 3000, frequency: 'Per Exam', status: 'Active' },
  { id: 13, feeType: 'Exam Fee', className: 'Class 6-8', amount: 4000, frequency: 'Per Exam', status: 'Active' },
  { id: 14, feeType: 'Exam Fee', className: 'Class 9-10', amount: 5000, frequency: 'Per Exam', status: 'Active' },
  { id: 15, feeType: 'Monthly Fee', className: 'Class 1', amount: 4000, frequency: 'Monthly', status: 'Inactive' },
];

export const students = [
  { id: 'STD-001', name: 'Ahmed Khan', class: 'Class 10', section: 'A', fatherName: 'Ali Khan', phone: '0301-1234567' },
  { id: 'STD-002', name: 'Sara Ali', class: 'Class 9', section: 'B', fatherName: 'Usman Ali', phone: '0302-2345678' },
  { id: 'STD-003', name: 'Hassan Raza', class: 'Class 8', section: 'A', fatherName: 'Mehmood Raza', phone: '0303-3456789' },
  { id: 'STD-004', name: 'Fatima Noor', class: 'Class 7', section: 'A', fatherName: 'Noor Ahmed', phone: '0304-4567890' },
  { id: 'STD-005', name: 'Bilal Shah', class: 'Class 10', section: 'B', fatherName: 'Shah Mehmood', phone: '0305-5678901' },
  { id: 'STD-006', name: 'Ayesha Siddiqui', class: 'Class 6', section: 'A', fatherName: 'Tariq Siddiqui', phone: '0306-6789012' },
  { id: 'STD-007', name: 'Omar Farooq', class: 'Class 5', section: 'B', fatherName: 'Farooq Ahmed', phone: '0307-7890123' },
  { id: 'STD-008', name: 'Zainab Malik', class: 'Class 4', section: 'A', fatherName: 'Malik Hussain', phone: '0308-8901234' },
  { id: 'STD-009', name: 'Hamza Tariq', class: 'Class 3', section: 'A', fatherName: 'Tariq Mehmood', phone: '0309-9012345' },
  { id: 'STD-010', name: 'Mehreen Aslam', class: 'Class 2', section: 'B', fatherName: 'Aslam Khan', phone: '0310-0123456' },
  { id: 'STD-011', name: 'Usman Ghani', class: 'Class 1', section: 'A', fatherName: 'Ghani Muhammad', phone: '0311-1234000' },
  { id: 'STD-012', name: 'Nadia Parveen', class: 'Class 9', section: 'A', fatherName: 'Parveen Ali', phone: '0312-2345000' },
];

export const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export const exams = ['First Term', 'Mid Term', 'Final Term'];

export const recentCollections = [
  { id: 'REC-2026-001', studentName: 'Ahmed Ali', studentId: 'STU-1001', feeType: 'Monthly Fee', amount: 7500, discount: 0, fine: 0, totalPaid: 7500, paymentMethod: 'Cash', date: '2026-09-01', month: 'September', exam: null, status: 'Paid' },
  { id: 'REC-2026-002', studentName: 'Sara Malik', studentId: 'STU-1002', feeType: 'Monthly Fee', amount: 8000, discount: 500, fine: 0, totalPaid: 7500, paymentMethod: 'Bank Transfer', date: '2026-08-28', month: 'August', exam: null, status: 'Paid' },
  { id: 'REC-2026-003', studentName: 'Hassan Raza', studentId: 'STU-1003', feeType: 'Exam Fee', amount: 4500, discount: 0, fine: 200, totalPaid: 4700, paymentMethod: 'Online Payment', date: '2026-08-15', month: 'August', exam: 'Mid Term', status: 'Paid' },
  { id: 'REC-2026-004', studentName: 'Fatima Noor', studentId: 'STU-1004', feeType: 'Monthly Fee', amount: 8500, discount: 0, fine: 0, totalPaid: 8500, paymentMethod: 'Cash', date: '2026-09-02', month: 'September', exam: null, status: 'Paid' },
  { id: 'REC-2026-005', studentName: 'Bilal Shah', studentId: 'STU-1005', feeType: 'Admission Fee', amount: 20000, discount: 2000, fine: 0, totalPaid: 18000, paymentMethod: 'Bank Transfer', date: '2026-04-15', month: 'April', exam: null, status: 'Paid' },
  { id: 'REC-2026-006', studentName: 'Ayesha Siddiqui', studentId: 'STU-1006', feeType: 'Monthly Fee', amount: 6000, discount: 0, fine: 500, totalPaid: 6500, paymentMethod: 'Cash', date: '2026-08-20', month: 'August', exam: null, status: 'Paid' },
  { id: 'REC-2026-007', studentName: 'Omar Farooq', studentId: 'STU-1007', feeType: 'Exam Fee', amount: 3500, discount: 0, fine: 0, totalPaid: 3500, paymentMethod: 'Online Payment', date: '2026-08-10', month: 'August', exam: 'First Term', status: 'Paid' },
  { id: 'REC-2026-008', studentName: 'Zainab Malik', studentId: 'STU-1008', feeType: 'Monthly Fee', amount: 5000, discount: 0, fine: 0, totalPaid: 5000, paymentMethod: 'Cash', date: '2026-09-01', month: 'September', exam: null, status: 'Paid' },
  { id: 'REC-2026-009', studentName: 'Hamza Tariq', studentId: 'STU-1009', feeType: 'Exam Fee', amount: 3000, discount: 0, fine: 0, totalPaid: 0, paymentMethod: '-', date: '2026-09-01', month: 'September', exam: 'Mid Term', status: 'Pending' },
  { id: 'REC-2026-010', studentName: 'Nadia Parveen', studentId: 'STU-1012', feeType: 'Monthly Fee', amount: 8000, discount: 0, fine: 0, totalPaid: 4000, paymentMethod: 'Cash', date: '2026-08-15', month: 'August', exam: null, status: 'Paid' },
  { id: 'REC-2026-011', studentName: 'Khalid Pervez', studentId: 'STU-1013', feeType: 'Monthly Fee', amount: 7000, discount: 0, fine: 0, totalPaid: 7000, paymentMethod: 'Cash', date: '2026-09-01', month: 'September', exam: null, status: 'Paid' },
  { id: 'REC-2026-012', studentName: 'Danish Khan', studentId: 'STU-1015', feeType: 'Monthly Fee', amount: 8500, discount: 500, fine: 0, totalPaid: 8000, paymentMethod: 'Bank Transfer', date: '2026-08-25', month: 'August', exam: null, status: 'Paid' },
  { id: 'REC-2026-013', studentName: 'Sanaullah Babar', studentId: 'STU-1018', feeType: 'Exam Fee', amount: 4000, discount: 0, fine: 0, totalPaid: 4000, paymentMethod: 'Online Payment', date: '2026-08-29', month: 'August', exam: 'Final Term', status: 'Paid' },
  { id: 'REC-2026-014', studentName: 'Rabia Asif', studentId: 'STU-1016', feeType: 'Monthly Fee', amount: 5500, discount: 0, fine: 0, totalPaid: 5500, paymentMethod: 'Cash', date: '2026-09-02', month: 'September', exam: null, status: 'Paid' },
];

export const monthlyCollectionData = [
  { month: 'Apr', collected: 320000, pending: 45000 },
  { month: 'May', collected: 350000, pending: 38000 },
  { month: 'Jun', collected: 280000, pending: 62000 },
  { month: 'Jul', collected: 310000, pending: 51000 },
  { month: 'Aug', collected: 385000, pending: 28000 },
  { month: 'Sep', collected: 120000, pending: 185000 },
];

export const feeTypeCollectionData = [
  { name: 'Monthly Fee', value: 1850000, fill: '#2563eb' },
  { name: 'Admission Fee', value: 320000, fill: '#22c55e' },
  { name: 'Exam Fee', value: 195000, fill: '#f59e0b' },
];

export const pendingStudents = [
  { id: 'STU-1011', name: 'Usman Ghani', class: 'Class 1', section: 'A', feeType: 'Monthly Fee', amount: 4000, dueMonth: 'September 2026', daysOverdue: 2 },
  { id: 'STU-1012', name: 'Nadia Parveen', class: 'Class 9', section: 'A', feeType: 'Monthly Fee', amount: 8000, dueMonth: 'September 2026', daysOverdue: 2 },
  { id: 'STU-1009', name: 'Hamza Tariq', class: 'Class 2', section: 'A', feeType: 'Exam Fee', amount: 3000, dueMonth: 'September 2026', daysOverdue: 2 },
  { id: 'STU-1007', name: 'Omar Farooq', class: 'Class 4', section: 'B', feeType: 'Monthly Fee', amount: 5500, dueMonth: 'August 2026', daysOverdue: 32 },
  { id: 'STU-1003', name: 'Hassan Raza', class: 'Class 7', section: 'A', feeType: 'Exam Fee', amount: 4500, dueMonth: 'August 2026', daysOverdue: 28 },
];

export const outstandingDues = [
  { id: 'DUE-2026-001', studentId: 'STU-1002', studentName: 'Sara Malik', feeType: 'Monthly Fee', month: 'June', exam: null, amount: 8000, discount: 0, fine: 0, totalPaid: 0, remaining: 8000, dueDate: '2026-06-05', status: 'Unpaid' },
  { id: 'DUE-2026-002', studentId: 'STU-1002', studentName: 'Sara Malik', feeType: 'Monthly Fee', month: 'July', exam: null, amount: 8000, discount: 0, fine: 0, totalPaid: 0, remaining: 8000, dueDate: '2026-07-05', status: 'Unpaid' },
  { id: 'DUE-2026-003', studentId: 'STU-1006', studentName: 'Ayesha Siddiqui', feeType: 'Monthly Fee', month: 'June', exam: null, amount: 6000, discount: 0, fine: 0, totalPaid: 2000, remaining: 4000, dueDate: '2026-06-05', status: 'Partial' },
  { id: 'DUE-2026-004', studentId: 'STU-1006', studentName: 'Ayesha Siddiqui', feeType: 'Monthly Fee', month: 'July', exam: null, amount: 6000, discount: 0, fine: 0, totalPaid: 0, remaining: 6000, dueDate: '2026-07-05', status: 'Unpaid' },
  { id: 'DUE-2026-005', studentId: 'STU-1012', studentName: 'Nadia Parveen', feeType: 'Monthly Fee', month: 'May', exam: null, amount: 8000, discount: 0, fine: 0, totalPaid: 0, remaining: 8000, dueDate: '2026-05-05', status: 'Unpaid' },
  { id: 'DUE-2026-006', studentId: 'STU-1012', studentName: 'Nadia Parveen', feeType: 'Monthly Fee', month: 'June', exam: null, amount: 8000, discount: 0, fine: 0, totalPaid: 0, remaining: 8000, dueDate: '2026-06-05', status: 'Unpaid' },
  { id: 'DUE-2026-007', studentId: 'STU-1012', studentName: 'Nadia Parveen', feeType: 'Monthly Fee', month: 'July', exam: null, amount: 8000, discount: 0, fine: 0, totalPaid: 0, remaining: 8000, dueDate: '2026-07-05', status: 'Unpaid' },
  { id: 'DUE-2026-008', studentId: 'STU-1015', studentName: 'Danish Khan', feeType: 'Monthly Fee', month: 'July', exam: null, amount: 8500, discount: 0, fine: 0, totalPaid: 0, remaining: 8500, dueDate: '2026-07-05', status: 'Unpaid' },
  { id: 'DUE-2026-009', studentId: 'STU-1015', studentName: 'Danish Khan', feeType: 'Exam Fee', month: 'August', exam: 'Mid Term', amount: 5000, discount: 0, fine: 0, totalPaid: 0, remaining: 5000, dueDate: '2026-08-10', status: 'Unpaid' },
  { id: 'DUE-2026-010', studentId: 'STU-1003', studentName: 'Hassan Raza', feeType: 'Monthly Fee', month: 'June', exam: null, amount: 7000, discount: 0, fine: 0, totalPaid: 0, remaining: 7000, dueDate: '2026-06-05', status: 'Unpaid' },
  { id: 'DUE-2026-011', studentId: 'STU-1003', studentName: 'Hassan Raza', feeType: 'Monthly Fee', month: 'July', exam: null, amount: 7000, discount: 0, fine: 0, totalPaid: 0, remaining: 7000, dueDate: '2026-07-05', status: 'Unpaid' },
  { id: 'DUE-2026-012', studentId: 'STU-1009', studentName: 'Hamza Tariq', feeType: 'Monthly Fee', month: 'July', exam: null, amount: 4500, discount: 0, fine: 0, totalPaid: 0, remaining: 4500, dueDate: '2026-07-05', status: 'Unpaid' },
  { id: 'DUE-2026-013', studentId: 'STU-1009', studentName: 'Hamza Tariq', feeType: 'Exam Fee', month: 'August', exam: 'First Term', amount: 3000, discount: 0, fine: 0, totalPaid: 0, remaining: 3000, dueDate: '2026-08-10', status: 'Unpaid' },
  { id: 'DUE-2026-014', studentId: 'STU-1007', studentName: 'Omar Farooq', feeType: 'Monthly Fee', month: 'June', exam: null, amount: 5500, discount: 0, fine: 0, totalPaid: 0, remaining: 5500, dueDate: '2026-06-05', status: 'Unpaid' },
  { id: 'DUE-2026-015', studentId: 'STU-1007', studentName: 'Omar Farooq', feeType: 'Monthly Fee', month: 'July', exam: null, amount: 5500, discount: 0, fine: 0, totalPaid: 0, remaining: 5500, dueDate: '2026-07-05', status: 'Unpaid' },
  { id: 'DUE-2026-016', studentId: 'STU-1007', studentName: 'Omar Farooq', feeType: 'Monthly Fee', month: 'August', exam: null, amount: 5500, discount: 0, fine: 0, totalPaid: 1500, remaining: 4000, dueDate: '2026-08-05', status: 'Partial' },
  { id: 'DUE-2026-017', studentId: 'STU-1011', studentName: 'Usman Ghani', feeType: 'Monthly Fee', month: 'June', exam: null, amount: 4000, discount: 0, fine: 0, totalPaid: 0, remaining: 4000, dueDate: '2026-06-05', status: 'Unpaid' },
  { id: 'DUE-2026-018', studentId: 'STU-1011', studentName: 'Usman Ghani', feeType: 'Monthly Fee', month: 'July', exam: null, amount: 4000, discount: 0, fine: 0, totalPaid: 0, remaining: 4000, dueDate: '2026-07-05', status: 'Unpaid' },
  { id: 'DUE-2026-019', studentId: 'STU-1011', studentName: 'Usman Ghani', feeType: 'Monthly Fee', month: 'August', exam: null, amount: 4000, discount: 0, fine: 0, totalPaid: 0, remaining: 4000, dueDate: '2026-08-05', status: 'Unpaid' },
];

export const paymentMethods = ['Cash', 'Bank Transfer', 'Online Payment'];

export const dashboardStats = {
  totalCollected: 3250000,
  monthlyCollection: 185000,
  admissionCollection: 420000,
  examCollection: 285000,
  pendingFees: 315000,
  todayCollection: 42500,
};

export const studentsWithFeeStatus = [
  { id: 'STU-1001', name: 'Ahmed Ali', class: 'Class 8', section: 'A', fatherName: 'Muhammad Ali', phone: '0301-1111111', gender: 'Male', fatherPhone: '0300-1111110', admissionDate: '2025-04-10', feeStatus: 'Paid', monthlyFee: 7500, admissionFee: 22000, examFee: 4500, totalDue: 7500, totalPaid: 7500, remaining: 0, lastPaymentDate: '2026-09-01', lastFeeType: 'Monthly Fee' },
  { id: 'STU-1002', name: 'Sara Malik', class: 'Class 9', section: 'B', fatherName: 'Malik Shah', phone: '0302-2222222', gender: 'Female', fatherPhone: '0300-2222220', admissionDate: '2025-04-12', feeStatus: 'Partially Paid', monthlyFee: 8000, admissionFee: 22000, examFee: 5000, totalDue: 8000, totalPaid: 5000, remaining: 3000, lastPaymentDate: '2026-08-28', lastFeeType: 'Monthly Fee' },
  { id: 'STU-1003', name: 'Hassan Raza', class: 'Class 7', section: 'A', fatherName: 'Raza Hussain', phone: '0303-3333333', gender: 'Male', fatherPhone: '0300-3333330', admissionDate: '2025-04-08', feeStatus: 'Pending', monthlyFee: 7000, admissionFee: 20000, examFee: 4500, totalDue: 7000, totalPaid: 0, remaining: 7000, lastPaymentDate: null, lastFeeType: null },
  { id: 'STU-1004', name: 'Fatima Noor', class: 'Class 10', section: 'A', fatherName: 'Noor Ahmed', phone: '0304-4444444', gender: 'Female', fatherPhone: '0300-4444440', admissionDate: '2025-03-20', feeStatus: 'Paid', monthlyFee: 8500, admissionFee: 22000, examFee: 5000, totalDue: 8500, totalPaid: 8500, remaining: 0, lastPaymentDate: '2026-09-02', lastFeeType: 'Monthly Fee' },
  { id: 'STU-1005', name: 'Bilal Shah', class: 'Class 6', section: 'B', fatherName: 'Shah Mehmood', phone: '0305-5555555', gender: 'Male', fatherPhone: '0300-5555550', admissionDate: '2025-04-15', feeStatus: 'Pending', monthlyFee: 6500, admissionFee: 20000, examFee: 4000, totalDue: 6500, totalPaid: 0, remaining: 6500, lastPaymentDate: null, lastFeeType: null },
  { id: 'STU-1006', name: 'Ayesha Siddiqui', class: 'Class 5', section: 'A', fatherName: 'Tariq Siddiqui', phone: '0306-6666666', gender: 'Female', fatherPhone: '0300-6666660', admissionDate: '2025-04-05', feeStatus: 'Partially Paid', monthlyFee: 6000, admissionFee: 18000, examFee: 4000, totalDue: 6000, totalPaid: 3000, remaining: 3000, lastPaymentDate: '2026-08-20', lastFeeType: 'Monthly Fee' },
  { id: 'STU-1007', name: 'Omar Farooq', class: 'Class 4', section: 'B', fatherName: 'Farooq Ahmed', phone: '0307-7777777', gender: 'Male', fatherPhone: '0300-7777770', admissionDate: '2025-04-18', feeStatus: 'Pending', monthlyFee: 5500, admissionFee: 18000, examFee: 3500, totalDue: 5500, totalPaid: 0, remaining: 5500, lastPaymentDate: null, lastFeeType: null },
  { id: 'STU-1008', name: 'Zainab Malik', class: 'Class 3', section: 'A', fatherName: 'Malik Hussain', phone: '0308-8888888', gender: 'Female', fatherPhone: '0300-8888880', admissionDate: '2025-04-02', feeStatus: 'Paid', monthlyFee: 5000, admissionFee: 15000, examFee: 3500, totalDue: 5000, totalPaid: 5000, remaining: 0, lastPaymentDate: '2026-09-01', lastFeeType: 'Monthly Fee' },
  { id: 'STU-1009', name: 'Hamza Tariq', class: 'Class 2', section: 'A', fatherName: 'Tariq Mehmood', phone: '0309-9999999', gender: 'Male', fatherPhone: '0300-9999990', admissionDate: '2025-04-20', feeStatus: 'Pending', monthlyFee: 4500, admissionFee: 15000, examFee: 3000, totalDue: 4500, totalPaid: 0, remaining: 4500, lastPaymentDate: null, lastFeeType: null },
  { id: 'STU-1010', name: 'Mehreen Aslam', class: 'Class 1', section: 'B', fatherName: 'Aslam Khan', phone: '0310-1010101', gender: 'Female', fatherPhone: '0300-1010100', admissionDate: '2025-04-22', feeStatus: 'Paid', monthlyFee: 4000, admissionFee: 15000, examFee: 3000, totalDue: 4000, totalPaid: 4000, remaining: 0, lastPaymentDate: '2026-08-30', lastFeeType: 'Monthly Fee' },
  { id: 'STU-1011', name: 'Usman Ghani', class: 'Class 1', section: 'A', fatherName: 'Ghani Muhammad', phone: '0311-1212121', gender: 'Male', fatherPhone: '0300-1212120', admissionDate: '2025-04-25', feeStatus: 'Pending', monthlyFee: 4000, admissionFee: 15000, examFee: 3000, totalDue: 4000, totalPaid: 0, remaining: 4000, lastPaymentDate: null, lastFeeType: null },
  { id: 'STU-1012', name: 'Nadia Parveen', class: 'Class 9', section: 'A', fatherName: 'Parveen Ali', phone: '0312-1313131', gender: 'Female', fatherPhone: '0300-1313130', admissionDate: '2025-04-07', feeStatus: 'Partially Paid', monthlyFee: 8000, admissionFee: 22000, examFee: 5000, totalDue: 8000, totalPaid: 4000, remaining: 4000, lastPaymentDate: '2026-08-15', lastFeeType: 'Monthly Fee' },
  { id: 'STU-1013', name: 'Khalid Pervez', class: 'Class 7', section: 'B', fatherName: 'Pervez Ahmed', phone: '0313-1414141', gender: 'Male', fatherPhone: '0300-1414140', admissionDate: '2025-04-11', feeStatus: 'Paid', monthlyFee: 7000, admissionFee: 20000, examFee: 4500, totalDue: 7000, totalPaid: 7000, remaining: 0, lastPaymentDate: '2026-09-01', lastFeeType: 'Monthly Fee' },
  { id: 'STU-1014', name: 'Hina Bibi', class: 'Class 6', section: 'A', fatherName: 'Abdul Sattar', phone: '0314-1515151', gender: 'Female', fatherPhone: '0300-1515150', admissionDate: '2025-04-14', feeStatus: 'Pending', monthlyFee: 6500, admissionFee: 20000, examFee: 4000, totalDue: 6500, totalPaid: 0, remaining: 6500, lastPaymentDate: null, lastFeeType: null },
  { id: 'STU-1015', name: 'Danish Khan', class: 'Class 10', section: 'B', fatherName: 'Khan Muhammad', phone: '0315-1616161', gender: 'Male', fatherPhone: '0300-1616160', admissionDate: '2025-03-28', feeStatus: 'Partially Paid', monthlyFee: 8500, admissionFee: 22000, examFee: 5000, totalDue: 8500, totalPaid: 6000, remaining: 2500, lastPaymentDate: '2026-08-25', lastFeeType: 'Monthly Fee' },
  { id: 'STU-1016', name: 'Rabia Asif', class: 'Class 4', section: 'A', fatherName: 'Asif Mehmood', phone: '0316-1717171', gender: 'Female', fatherPhone: '0300-1717170', admissionDate: '2025-04-16', feeStatus: 'Paid', monthlyFee: 5500, admissionFee: 18000, examFee: 3500, totalDue: 5500, totalPaid: 5500, remaining: 0, lastPaymentDate: '2026-09-02', lastFeeType: 'Monthly Fee' },
  { id: 'STU-1017', name: 'Faisal Naveed', class: 'Class 3', section: 'B', fatherName: 'Naveed Akhtar', phone: '0317-1818181', gender: 'Male', fatherPhone: '0300-1818180', admissionDate: '2025-04-19', feeStatus: 'Pending', monthlyFee: 5000, admissionFee: 15000, examFee: 3500, totalDue: 5000, totalPaid: 0, remaining: 5000, lastPaymentDate: null, lastFeeType: null },
  { id: 'STU-1018', name: 'Sanaullah Babar', class: 'Class 8', section: 'B', fatherName: 'Babar Khan', phone: '0318-1919191', gender: 'Male', fatherPhone: '0300-1919190', admissionDate: '2025-04-09', feeStatus: 'Paid', monthlyFee: 7500, admissionFee: 22000, examFee: 4500, totalDue: 7500, totalPaid: 7500, remaining: 0, lastPaymentDate: '2026-08-29', lastFeeType: 'Exam Fee' },
];

export const recentActivity = [
  { id: 1, activityType: 'collected', title: 'Fee Collected', studentName: 'Ahmed Ali', feeType: 'Monthly Fee', amount: 7500, date: '2026-09-04', time: '02:35 PM' },
  { id: 2, activityType: 'receipt', title: 'Receipt Generated', studentName: 'Sara Malik', feeType: 'Monthly Fee', amount: 7500, date: '2026-09-04', time: '01:20 PM' },
  { id: 3, activityType: 'collected', title: 'Fee Collected', studentName: 'Fatima Noor', feeType: 'Monthly Fee', amount: 8500, date: '2026-09-04', time: '11:45 AM' },
  { id: 4, activityType: 'updated', title: 'Fee Updated', studentName: 'Bilal Shah', feeType: 'Admission Fee', amount: 18000, date: '2026-09-04', time: '10:10 AM' },
  { id: 5, activityType: 'collected', title: 'Fee Collected', studentName: 'Ayesha Siddiqui', feeType: 'Monthly Fee', amount: 6500, date: '2026-09-04', time: '09:30 AM' },
  { id: 6, activityType: 'structure', title: 'Fee Structure Updated', studentName: null, feeType: 'Examination Fee', amount: null, date: '2026-09-03', time: '04:15 PM' },
  { id: 7, activityType: 'deleted', title: 'Fee Deleted', studentName: 'Omar Farooq', feeType: 'Monthly Fee', amount: 5500, date: '2026-09-03', time: '03:00 PM' },
  { id: 8, activityType: 'collected', title: 'Fee Collected', studentName: 'Zainab Malik', feeType: 'Monthly Fee', amount: 5000, date: '2026-09-03', time: '02:25 PM' },
  { id: 9, activityType: 'receipt', title: 'Receipt Generated', studentName: 'Khalid Pervez', feeType: 'Monthly Fee', amount: 7000, date: '2026-09-03', time: '11:00 AM' },
  { id: 10, activityType: 'collected', title: 'Fee Collected', studentName: 'Rabia Asif', feeType: 'Monthly Fee', amount: 5500, date: '2026-09-02', time: '03:40 PM' },
];

export const academicYears = ['2026', '2025'];

const CLASS_MONTHLY_FEES = {
  'Montessori': 3500, 'Nursery': 3500, 'KG1': 3800, 'KG2': 3800,
  'Class 1': 4000, 'Class 2': 4500, 'Class 3': 5000, 'Class 4': 5500,
  'Class 5': 6000, 'Class 6': 6500, 'Class 7': 7000, 'Class 8': 7500,
  'Class 9': 8000, 'Class 10': 8500,
};

const STUDENT_ADMISSION_FEES = {
  'STU-1001': 22000, 'STU-1002': 22000, 'STU-1003': 20000, 'STU-1004': 22000,
  'STU-1005': 20000, 'STU-1006': 18000, 'STU-1007': 18000, 'STU-1008': 15000,
  'STU-1009': 15000, 'STU-1010': 15000, 'STU-1011': 15000, 'STU-1012': 22000,
  'STU-1013': 20000, 'STU-1014': 20000, 'STU-1015': 22000, 'STU-1016': 18000,
  'STU-1017': 15000, 'STU-1018': 22000,
};

const STUDENT_EXAM_FEES = {
  'STU-1001': 4500, 'STU-1002': 5000, 'STU-1003': 4500, 'STU-1004': 5000,
  'STU-1005': 4000, 'STU-1006': 4000, 'STU-1007': 3500, 'STU-1008': 3500,
  'STU-1009': 3000, 'STU-1010': 3000, 'STU-1011': 3000, 'STU-1012': 5000,
  'STU-1013': 4500, 'STU-1014': 4000, 'STU-1015': 5000, 'STU-1016': 3500,
  'STU-1017': 3500, 'STU-1018': 4500,
};

const DUE_MONTHS = {
  'STU-1002': ['June', 'July'], 'STU-1003': ['June', 'July'],
  'STU-1006': ['July'], 'STU-1007': ['June', 'July', 'August'],
  'STU-1009': ['July', 'August'], 'STU-1011': ['June', 'July', 'August'],
  'STU-1012': ['May', 'June', 'July'], 'STU-1014': ['June', 'July', 'August'],
  'STU-1015': ['July'], 'STU-1017': ['June', 'July', 'August'],
};

const PARTIAL_MONTHS = {
  'STU-1002': { 'August': { paid: 5000, discount: 0, fine: 0 } },
  'STU-1006': { 'June': { paid: 2000, discount: 0, fine: 0 } },
  'STU-1007': { 'August': { paid: 1500, discount: 0, fine: 0 } },
  'STU-1012': { 'August': { paid: 4000, discount: 0, fine: 0 } },
  'STU-1015': { 'August': { paid: 6000, discount: 500, fine: 0 } },
};

const ALL_MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export const monthlyBreakdown = (() => {
  const records = [];
  let id = 1;

  studentsWithFeeStatus.forEach((student) => {
    const monthlyFee = CLASS_MONTHLY_FEES[student.class] || 5000;
    const admissionFee = STUDENT_ADMISSION_FEES[student.id] || 15000;
    const examFee = STUDENT_EXAM_FEES[student.id] || 4000;
    const dueMonths = DUE_MONTHS[student.id] || [];
    const partials = PARTIAL_MONTHS[student.id] || {};

    ALL_MONTHS.forEach((month) => {
      const isDue = dueMonths.includes(month);
      const partial = partials[month];

      if (isDue && partial) {
        records.push({
          id: `MB-${String(id++).padStart(3, '0')}`,
          studentId: student.id, studentName: student.name,
          class: student.class, section: student.section,
          month, year: '2026', feeType: 'Monthly Fee',
          expected: monthlyFee, paid: partial.paid,
          discount: partial.discount, fine: partial.fine,
          netPaid: partial.paid - partial.discount + partial.fine,
          due: monthlyFee - partial.paid + partial.discount - partial.fine,
          status: 'Partially Paid', date: `2026-${ALL_MONTHS.indexOf(month) + 1 < 10 ? '0' : ''}${ALL_MONTHS.indexOf(month) + 1}-15`,
        });
      } else if (isDue) {
        records.push({
          id: `MB-${String(id++).padStart(3, '0')}`,
          studentId: student.id, studentName: student.name,
          class: student.class, section: student.section,
          month, year: '2026', feeType: 'Monthly Fee',
          expected: monthlyFee, paid: 0, discount: 0, fine: 0,
          netPaid: 0, due: monthlyFee, status: 'Due', date: null,
        });
      } else {
        records.push({
          id: `MB-${String(id++).padStart(3, '0')}`,
          studentId: student.id, studentName: student.name,
          class: student.class, section: student.section,
          month, year: '2026', feeType: 'Monthly Fee',
          expected: monthlyFee, paid: monthlyFee, discount: 0, fine: 0,
          netPaid: monthlyFee, due: 0, status: 'Paid',
          date: `2026-${ALL_MONTHS.indexOf(month) + 1 < 10 ? '0' : ''}${ALL_MONTHS.indexOf(month) + 1}-01`,
        });
      }
    });

    records.push({
      id: `MB-${String(id++).padStart(3, '0')}`,
      studentId: student.id, studentName: student.name,
      class: student.class, section: student.section,
      month: 'April', year: '2026', feeType: 'Admission Fee',
      expected: admissionFee, paid: admissionFee, discount: 2000, fine: 0,
      netPaid: admissionFee - 2000, due: 0, status: 'Paid', date: '2026-04-10',
    });

    ['First Term', 'Mid Term', 'Final Term'].forEach((exam, i) => {
      const examMonths = ['March', 'July', 'November'];
      const examMonth = examMonths[i];
      const isExamDue = (student.id === 'STU-1009' && exam === 'Mid Term')
        || (student.id === 'STU-1015' && exam === 'Mid Term');

      records.push({
        id: `MB-${String(id++).padStart(3, '0')}`,
        studentId: student.id, studentName: student.name,
        class: student.class, section: student.section,
        month: examMonth, year: '2026', feeType: 'Examination Fee',
        expected: examFee, paid: isExamDue ? 0 : examFee,
        discount: 0, fine: isExamDue ? 0 : 0,
        netPaid: isExamDue ? 0 : examFee,
        due: isExamDue ? examFee : 0,
        status: isExamDue ? 'Due' : 'Paid',
        date: isExamDue ? null : `2026-${String(i * 4 + 3).padStart(2, '0')}-10`,
        exam,
      });
    });
  });

  return records;
})();
