import FeeStructure from '../models/feeStructure.model.js';
import FeeCollection from '../models/feeCollection.model.js';
import SchoolSettings from '../models/schoolSettings.model.js';
import feeReportService from './feeReport.service.js';
import feeOutstandingService from './feeOutstanding.service.js';

const MONTHS_FULL = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const SHORT_MONTHS = {
  January: 'Jan', February: 'Feb', March: 'Mar', April: 'Apr', May: 'May', June: 'Jun',
  July: 'Jul', August: 'Aug', September: 'Sep', October: 'Oct', November: 'Nov', December: 'Dec',
};

const FEE_TYPE_COLORS = {
  'Monthly Fee': '#2563eb',
  'Admission Fee': '#22c55e',
  'Examination Fee': '#f59e0b',
};

const PAYMENT_TYPE_TO_LABEL = {
  Monthly: 'Monthly Fee',
  Admission: 'Admission Fee',
  Examination: 'Examination Fee',
};

const getCurrentAcademicYear = async () => {
  const settings = await SchoolSettings.getSettings();

  if (settings?.currentAcademicYear && /^\d{4}$/.test(settings.currentAcademicYear)) {
    return settings.currentAcademicYear;
  }

  return String(new Date().getFullYear());
};

const round = (value) => Math.round((Number(value) + Number.EPSILON) * 100) / 100;

const formatISODate = (date) => {
  if (!date || Number.isNaN(new Date(date).getTime())) return '';

  const value = new Date(date);

  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`;
};

const formatClock = (date) => {
  if (!date || Number.isNaN(new Date(date).getTime())) return '';

  const value = new Date(date);
  let hours = value.getHours();
  const meridiem = hours >= 12 ? 'PM' : 'AM';

  hours = hours % 12 || 12;

  return `${String(hours).padStart(2, '0')}:${String(value.getMinutes()).padStart(2, '0')} ${meridiem}`;
};

const computeDaysOverdue = (year, monthName, today) => {
  const index = MONTHS_FULL.indexOf(monthName);

  if (index === -1) return 0;

  const todayUtc = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  const dueUtc = Date.UTC(year, index + 1, 0);

  return Math.max(0, Math.floor((todayUtc - dueUtc) / 86400000));
};

const buildMonthlyTrend = ({ entries, payments }) => {
  const collectedByMonth = new Map();
  const pendingByMonth = new Map();

  for (const payment of payments) {
    if (payment.feeType !== 'Monthly') continue;

    const month = payment.month || '';
    const current = collectedByMonth.get(month) || 0;

    collectedByMonth.set(month, round(current + (Number(payment.amountPaid) || 0)));
  }

  for (const entry of entries) {
    for (const due of entry.dues) {
      if (due.feeType !== 'Monthly Fee') continue;

      const current = pendingByMonth.get(due.month) || 0;

      pendingByMonth.set(due.month, round(current + (Number(due.remaining) || 0)));
    }
  }

  return MONTHS_FULL.map((month) => ({
    month: SHORT_MONTHS[month],
    monthFull: month,
    collected: round(collectedByMonth.get(month) || 0),
    pending: round(pendingByMonth.get(month) || 0),
  }));
};

const buildPendingStudents = ({ entries, academicYear, today }) => {
  const rows = [];

  for (const entry of entries) {
    for (const due of entry.dues) {
      rows.push({
        id: entry.studentId,
        name: entry.studentName,
        class: entry.student?.class || '',
        feeType: due.feeType,
        amount: round(due.remaining),
        dueMonth: due.month || '',
        exam: due.exam || null,
        daysOverdue: computeDaysOverdue(academicYear, due.month, today),
        status: due.status,
      });
    }
  }

  rows.sort((a, b) => b.daysOverdue - a.daysOverdue || b.amount - a.amount);

  return rows.slice(0, 20);
};

const buildRecentActivity = ({ payments }) =>
  payments.slice(0, 10).map((payment, index) => ({
    id: payment.receiptId || index + 1,
    activityType: 'collected',
    title: 'Fee Collected',
    studentName: payment.studentName || '',
    feeType: PAYMENT_TYPE_TO_LABEL[payment.feeType] || payment.feeType,
    amount: round(payment.amountPaid),
    date: formatISODate(payment.paymentDate),
    time: formatClock(payment.paymentDate),
  }));

const getDashboard = async ({ academicYear } = {}) => {
  const effectiveYear = academicYear || (await getCurrentAcademicYear());

  const [reportResult, outstandingResult, payments, activeStructureCount] = await Promise.all([
    feeReportService.getReport({ scope: 'Overall', academicYear: effectiveYear, feeType: 'All Fees' }),
    feeOutstandingService.getOutstandingDues({ academicYear: effectiveYear }),
    FeeCollection.find({ academicYear: effectiveYear }).sort({ paymentDate: -1, createdAt: -1 }).lean(),
    FeeStructure.countDocuments({ academicYear: effectiveYear, isDeleted: { $ne: true }, status: 'Active' }),
  ]);

  const report = reportResult.report;
  const { entries } = outstandingResult;

  const collectedByType = { 'Monthly Fee': 0, 'Admission Fee': 0, 'Examination Fee': 0 };
  const today = new Date();
  const todayKey = formatISODate(today);
  let todayCollection = 0;

  for (const payment of payments) {
    const label = PAYMENT_TYPE_TO_LABEL[payment.feeType];

    if (label) {
      collectedByType[label] = round(collectedByType[label] + (Number(payment.amountPaid) || 0));
    }

    if (formatISODate(payment.paymentDate) === todayKey) {
      todayCollection += Number(payment.amountPaid) || 0;
    }
  }

  const totalExpected = round(report.totalExpected);
  const totalCollected = round(report.totalCollected);
  const pendingFees = round(entries.reduce((sum, entry) => sum + (entry.totalOutstanding || 0), 0));

  const summary = {
    totalStudents: report.totalStudents,
    totalExpected,
    totalCollected,
    monthlyCollection: collectedByType['Monthly Fee'],
    admissionCollection: collectedByType['Admission Fee'],
    examCollection: collectedByType['Examination Fee'],
    pendingFees,
    todayCollection: round(todayCollection),
    collectionPercentage: totalExpected > 0 ? round((totalCollected / totalExpected) * 100) : 0,
    totalTransactions: report.totalTransactions,
    paidStudents: report.paidStudents,
    pendingStudents: report.pendingStudents,
  };

  return {
    academicYear: effectiveYear,
    hasData: activeStructureCount > 0 && report.totalStudents > 0,
    summary,
    monthlyCollectionData: buildMonthlyTrend({ entries, payments }),
    feeTypeCollectionData: [
      { name: 'Monthly Fee', value: collectedByType['Monthly Fee'], fill: FEE_TYPE_COLORS['Monthly Fee'] },
      { name: 'Admission Fee', value: collectedByType['Admission Fee'], fill: FEE_TYPE_COLORS['Admission Fee'] },
      { name: 'Examination Fee', value: collectedByType['Examination Fee'], fill: FEE_TYPE_COLORS['Examination Fee'] },
    ],
    classWiseData: (report.classSummaries || []).map((item) => ({
      className: item.className,
      totalStudents: item.totalStudents,
      totalExpected: item.totalExpected,
      totalCollected: item.totalCollected,
      totalDue: item.totalDue,
      paidStudents: item.paidStudents,
      pendingStudents: item.pendingStudents,
    })),
    recentActivity: buildRecentActivity({ payments }),
    pendingStudents: buildPendingStudents({ entries, academicYear: effectiveYear, today }),
  };
};

export default { getDashboard };