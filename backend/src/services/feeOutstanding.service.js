import Student from '../models/student.model.js';
import FeeStructure from '../models/feeStructure.model.js';
import FeeCollection from '../models/feeCollection.model.js';
import SchoolSettings from '../models/schoolSettings.model.js';

const CLASS_TO_FEE_CLASS = {
  Montessori: 'Montessori',
  Nursery: 'Nursery',
  'KG 1': 'KG1',
  'KG 2': 'KG2',
  'Class 1': '1',
  'Class 2': '2',
  'Class 3': '3',
  'Class 4': '4',
  'Class 5': '5',
  'Class 6': '6',
  'Class 7': '7',
  'Class 8': '8',
  'Class 9': '9',
  'Class 10': '10',
};

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const EXAMS = ['First Term', 'Mid Term', 'Final Term'];

const EXAM_MONTHS = {
  'First Term': 'March',
  'Mid Term': 'July',
  'Final Term': 'November',
};

const FEE_TYPE_LABELS = {
  Admission: 'Admission Fee',
  Monthly: 'Monthly Fee',
  Examination: 'Examination Fee',
};

const getCurrentAcademicYear = async () => {
  const settings = await SchoolSettings.getSettings();

  if (settings?.currentAcademicYear && /^\d{4}$/.test(settings.currentAcademicYear)) {
    return settings.currentAcademicYear;
  }

  return String(new Date().getFullYear());
};

const getOutstandingDues = async ({ academicYear: requestedYear } = {}) => {
  const academicYear = requestedYear || (await getCurrentAcademicYear());

  const currentMonthIndex = new Date().getMonth();

  const [structures, students, payments] = await Promise.all([
    FeeStructure.find({ academicYear, isDeleted: { $ne: true }, status: 'Active' }),
    Student.find({ status: 'Active' }),
    FeeCollection.find({ academicYear }),
  ]);

  const structureByFeeClass = new Map();

  for (const structure of structures) {
    if (!structureByFeeClass.has(structure.className)) {
      structureByFeeClass.set(structure.className, structure);
    }
  }

  const paymentsByStudent = new Map();

  for (const payment of payments) {
    const key = String(payment.student);

    if (!paymentsByStudent.has(key)) {
      paymentsByStudent.set(key, []);
    }

    paymentsByStudent.get(key).push(payment);
  }

  const entries = [];

  for (const student of students) {
    const feeClassName = CLASS_TO_FEE_CLASS[student.class] || student.class;
    const structure = structureByFeeClass.get(feeClassName);

    if (!structure) continue;

    const studentPayments = paymentsByStudent.get(String(student._id)) || [];

    const monthData = new Map();
    const examData = new Map();
    const admissionData = { paid: 0, discount: 0, fine: 0, base: 0, hasRecord: false };

    for (const payment of studentPayments) {
      if (payment.feeType === 'Monthly') {
        const data = monthData.get(payment.month) || { paid: 0, discount: 0, fine: 0, base: 0, hasRecord: false };
        data.paid += Number(payment.amountPaid) || 0;
        data.discount += Number(payment.discount) || 0;
        data.fine += Number(payment.lateFine) || 0;
        if (!data.hasRecord) data.base = Number(payment.baseAmount) || 0;
        data.hasRecord = true;
        monthData.set(payment.month, data);
      } else if (payment.feeType === 'Examination') {
        const data = examData.get(payment.exam) || { paid: 0, discount: 0, fine: 0, base: 0, hasRecord: false };
        data.paid += Number(payment.amountPaid) || 0;
        data.discount += Number(payment.discount) || 0;
        data.fine += Number(payment.lateFine) || 0;
        if (!data.hasRecord) data.base = Number(payment.baseAmount) || 0;
        data.hasRecord = true;
        examData.set(payment.exam, data);
      } else if (payment.feeType === 'Admission') {
        admissionData.paid += Number(payment.amountPaid) || 0;
        admissionData.discount += Number(payment.discount) || 0;
        admissionData.fine += Number(payment.lateFine) || 0;
        if (!admissionData.hasRecord) admissionData.base = Number(payment.baseAmount) || 0;
        admissionData.hasRecord = true;
      }
    }

    const dues = [];

    const admissionDate = student.admissionDate || student.createdAt;
    const academicYearNum = Number(academicYear);
    let duesStartMonthIndex = 0;

    if (admissionDate) {
      const parsedAdmission = new Date(admissionDate);

      if (!Number.isNaN(parsedAdmission.getTime())) {
        const admissionYear = parsedAdmission.getFullYear();

        if (admissionYear === academicYearNum) {
          duesStartMonthIndex = parsedAdmission.getMonth();
        } else if (admissionYear > academicYearNum) {
          duesStartMonthIndex = MONTHS.length;
        }
      }
    }

    const pushDue = ({ id, feeType, month, exam, amount, discount, fine, paid }) => {
      const remaining = Math.max(0, amount - paid + fine - discount);

      if (remaining <= 0) return;

      dues.push({
        id,
        feeType,
        month,
        exam: exam || null,
        amount,
        discount,
        fine,
        totalPaid: paid,
        remaining,
        status: paid <= 0 ? 'Unpaid' : 'Partial',
      });
    };

    const admissionApplicable = Number(structure.admissionFee) || 0;

    if (admissionApplicable > 0) {
      pushDue({
        id: `OD-${student.studentId}-Admission`,
        feeType: FEE_TYPE_LABELS.Admission,
        month: 'January',
        exam: null,
        amount: admissionData.hasRecord ? admissionData.base : admissionApplicable,
        discount: admissionData.discount,
        fine: admissionData.fine,
        paid: admissionData.paid,
      });
    }

    const monthlyApplicable = Number(structure.monthlyFee) || 0;

    for (let i = 0; i < MONTHS.length; i++) {
      if (monthlyApplicable <= 0) break;
      if (i < duesStartMonthIndex || i > currentMonthIndex) continue;

      const month = MONTHS[i];
      const data = monthData.get(month);

      pushDue({
        id: `OD-${student.studentId}-Monthly-${month}`,
        feeType: FEE_TYPE_LABELS.Monthly,
        month,
        exam: null,
        amount: data?.hasRecord ? data.base : monthlyApplicable,
        discount: data?.discount || 0,
        fine: data?.fine || 0,
        paid: data?.paid || 0,
      });
    }

    const examApplicable = Number(structure.examFee) || 0;

    for (const exam of EXAMS) {
      if (examApplicable <= 0) continue;

      const examMonthIndex = MONTHS.indexOf(EXAM_MONTHS[exam]);

      if (examMonthIndex < duesStartMonthIndex || examMonthIndex > currentMonthIndex) continue;

      const data = examData.get(exam);

      pushDue({
        id: `OD-${student.studentId}-Exam-${exam}`,
        feeType: FEE_TYPE_LABELS.Examination,
        month: EXAM_MONTHS[exam],
        exam,
        amount: data?.hasRecord ? data.base : examApplicable,
        discount: data?.discount || 0,
        fine: data?.fine || 0,
        paid: data?.paid || 0,
      });
    }

    const totalOutstanding = dues.reduce((sum, due) => sum + due.remaining, 0);

    if (totalOutstanding > 0) {
      entries.push({
        studentId: student.studentId,
        studentName: student.fullName,
        student: {
          _id: student._id,
          id: student.studentId,
          name: student.fullName,
          fatherName: student.fatherName,
          class: student.class,
        },
        dues,
        totalOutstanding,
      });
    }
  }

  entries.sort((a, b) => b.totalOutstanding - a.totalOutstanding);

  return { academicYear, entries };
};

export default { getOutstandingDues };