import { useState, useCallback } from 'react';
import { MagnifyingGlassIcon, PrinterIcon, UserIcon, CurrencyDollarIcon, ClockIcon } from '@heroicons/react/24/outline';
import Table from '../../common/Table/Table';
import Button from '../../common/Button/Button';
import Modal from '../../common/Modal/Modal';
import { studentsWithFeeStatus, recentCollections, months, feeStructures, outstandingDues } from '../../../data/feeManagement/dummyData';
import { useSchoolConfig } from '../../../contexts/SchoolConfigContext';

const FEE_TYPES = ['All Fee Types', 'Monthly Fee', 'Admission Fee', 'Exam Fee'];
const ALL_MONTHS = ['All Months', ...months];

const formatCurrency = (val) => `Rs. ${Number(val || 0).toLocaleString()}`;

const getInitials = (name) => name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();

const getFeeAmount = (className, feeType) => {
  if (feeType === 'Admission Fee') {
    const found = feeStructures.find((f) => f.feeType === 'Admission Fee' && f.className === 'All Classes' && f.status === 'Active');
    return found ? found.amount : 0;
  }
  if (feeType === 'Exam Fee') {
    const num = parseInt(className.replace(/\D/g, ''), 10);
    let rangeKey = 'Class 1-5';
    if (num >= 6 && num <= 8) rangeKey = 'Class 6-8';
    else if (num >= 9) rangeKey = 'Class 9-10';
    const found = feeStructures.find((f) => f.feeType === 'Exam Fee' && f.className === rangeKey && f.status === 'Active');
    return found ? found.amount : 0;
  }
  if (feeType === 'Monthly Fee') {
    const found = feeStructures.find((f) => f.feeType === 'Monthly Fee' && f.className === className && f.status === 'Active');
    return found ? found.amount : 0;
  }
  return 0;
};

const StudentFeeDetails = () => {
  const { schoolInfo, branding } = useSchoolConfig();
  const [searchQuery, setSearchQuery] = useState('');
  const [foundStudent, setFoundStudent] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  const [feeTypeFilter, setFeeTypeFilter] = useState('All Fee Types');
  const [monthFilter, setMonthFilter] = useState('All Months');

  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [receiptItem, setReceiptItem] = useState(null);

  const handleSearch = useCallback(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) {
      setFoundStudent(null);
      setHasSearched(false);
      return;
    }
    const student = studentsWithFeeStatus.find(
      (s) => s.id.toLowerCase() === q || s.id.toLowerCase().includes(q)
    );
    setFoundStudent(student || null);
    setHasSearched(true);
  }, [searchQuery]);

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  const studentPayments = foundStudent
    ? recentCollections.filter((r) => r.studentId === foundStudent.id)
    : [];

  const filteredPayments = studentPayments.filter((r) => {
    const matchesFeeType = feeTypeFilter === 'All Fee Types' || r.feeType === feeTypeFilter;
    const matchesMonth = monthFilter === 'All Months' || r.month === monthFilter;
    return matchesFeeType && matchesMonth;
  });

  const monthlyPaid = studentPayments.filter((r) => r.feeType === 'Monthly Fee' && r.status === 'Paid').reduce((sum, r) => sum + r.totalPaid, 0);
  const monthlyDue = studentPayments.filter((r) => r.feeType === 'Monthly Fee').reduce((sum, r) => sum + (r.amount - r.totalPaid), 0);
  const admissionPaid = studentPayments.filter((r) => r.feeType === 'Admission Fee' && r.status === 'Paid').reduce((sum, r) => sum + r.totalPaid, 0);
  const admissionDue = studentPayments.filter((r) => r.feeType === 'Admission Fee').reduce((sum, r) => sum + (r.amount - r.totalPaid), 0);
  const examPaid = studentPayments.filter((r) => r.feeType === 'Exam Fee' && r.status === 'Paid').reduce((sum, r) => sum + r.totalPaid, 0);
  const examDue = studentPayments.filter((r) => r.feeType === 'Exam Fee').reduce((sum, r) => sum + (r.amount - r.totalPaid), 0);
  const totalPaid = monthlyPaid + admissionPaid + examPaid;
  const totalRemaining = monthlyDue + admissionDue + examDue;

  const handleViewReceipt = (item) => {
    setReceiptItem(item);
    setShowReceiptModal(true);
  };

  const handlePrint = () => {
    const receiptEl = document.getElementById('thermal-receipt');
    if (!receiptEl) return;
    const printWindow = window.open('', '_blank', 'width=400,height=700');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Receipt ${receiptItem?.id || ''}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Courier New', Courier, monospace; width: 280px; margin: 0 auto; padding: 10px 12px; color: #000; background: #fff; }
          .receipt-header { text-align: center; margin-bottom: 8px; }
          .receipt-header img { width: 40px; height: 40px; object-fit: contain; margin-bottom: 4px; }
          .receipt-header .school-name { font-size: 13px; font-weight: 700; letter-spacing: 0.5px; }
          .receipt-header .school-sub { font-size: 9px; color: #555; margin-top: 1px; }
          .receipt-title { text-align: center; font-size: 12px; font-weight: 700; letter-spacing: 1px; margin: 8px 0 6px; }
          .sep { border: none; border-top: 1px dashed #000; margin: 6px 0; }
          .sep-solid { border: none; border-top: 1px solid #000; margin: 6px 0; }
          .info-row { display: flex; justify-content: space-between; font-size: 10px; line-height: 1.7; }
          .info-row .label { color: #444; }
          .info-row .value { font-weight: 600; text-align: right; }
          .section-title { font-size: 10px; font-weight: 700; letter-spacing: 0.5px; margin: 8px 0 4px; }
          .fee-row { display: flex; justify-content: space-between; font-size: 10px; line-height: 1.7; }
          .fee-row .label { color: #444; }
          .fee-row .value { font-weight: 500; text-align: right; }
          .total-row { display: flex; justify-content: space-between; font-size: 11px; font-weight: 700; line-height: 1.8; border-top: 1px solid #000; margin-top: 4px; padding-top: 4px; }
          .paid-row { display: flex; justify-content: space-between; font-size: 12px; font-weight: 700; line-height: 1.8; border-top: 1px dashed #000; margin-top: 4px; padding-top: 4px; }
          .receipt-footer { text-align: center; margin-top: 10px; font-size: 9px; color: #555; }
          .receipt-footer .thanks { font-size: 10px; font-weight: 600; color: #000; margin-bottom: 2px; }
          .sig-stamp { display: flex; justify-content: space-between; align-items: flex-end; margin: 10px 0; }
          .sig-stamp .sig-stamp-item { text-align: center; flex: 1; }
          .sig-stamp img { height: 32px; object-fit: contain; margin-bottom: 4px; }
          .sig-stamp .placeholder { height: 32px; display: flex; align-items: flex-end; justify-content: center; margin-bottom: 4px; }
          .sig-stamp .placeholder .line { border-bottom: 1px solid #888; width: 80px; }
          .sig-stamp .placeholder .stamp-circle { width: 32px; height: 32px; border: 1px dashed #888; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 7px; color: #888; text-align: center; line-height: 1.2; }
          .sig-stamp .sig-stamp-label { font-size: 8px; color: #555; text-transform: uppercase; letter-spacing: 0.5px; }
        </style>
      </head>
      <body>
        ${receiptEl.innerHTML}
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => { printWindow.print(); printWindow.close(); }, 300);
  };

  const getShowMonth = () => feeTypeFilter === 'All Fee Types' || feeTypeFilter === 'Monthly Fee' || feeTypeFilter === 'Admission Fee';
  const getShowExam = () => feeTypeFilter === 'All Fee Types' || feeTypeFilter === 'Exam Fee';

  const paymentColumns = [
    { key: 'id', label: 'Receipt No.' },
    { key: 'feeType', label: 'Fee Type' },
  ];

  if (getShowMonth()) {
    paymentColumns.push({ key: 'month', label: 'Month' });
  }
  if (getShowExam()) {
    paymentColumns.push({ key: 'exam', label: 'Exam' });
  }

  paymentColumns.push(
    { key: 'amount', label: 'Amount' },
    { key: 'discount', label: 'Discount' },
    { key: 'fine', label: 'Fine' },
    { key: 'totalPaid', label: 'Paid' },
    { key: 'status', label: 'Status' },
    { key: 'date', label: 'Date' },
    { key: 'actions', label: 'Action', className: 'text-right' },
  );

  const renderPaymentRow = (item) => (
    <>
      <td className="px-4 py-3 font-mono text-xs font-medium text-blue-600 dark:text-blue-400">{item.id}</td>
      <td className="px-4 py-3 text-sm">
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
          item.feeType === 'Monthly Fee' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' :
          item.feeType === 'Admission Fee' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' :
          'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
        }`}>
          {item.feeType}
        </span>
      </td>
      {getShowMonth() && (
        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{item.month || '-'}</td>
      )}
      {getShowExam() && (
        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{item.exam || '-'}</td>
      )}
      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white font-medium">{formatCurrency(item.amount)}</td>
      <td className="px-4 py-3 text-sm text-green-600 dark:text-green-400">{item.discount > 0 ? formatCurrency(item.discount) : '-'}</td>
      <td className="px-4 py-3 text-sm text-red-600 dark:text-red-400">{item.fine > 0 ? formatCurrency(item.fine) : '-'}</td>
      <td className="px-4 py-3 text-sm font-bold text-gray-900 dark:text-white">{formatCurrency(item.totalPaid)}</td>
      <td className="px-4 py-3">
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
          item.status === 'Paid' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
        }`}>{item.status}</span>
      </td>
      <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{item.date}</td>
      <td className="px-4 py-3 text-right">
        <button
          onClick={() => handleViewReceipt(item)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transition-all cursor-pointer shadow-sm"
        >
          View
        </button>
      </td>
    </>
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Student Fee Details</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Search for a student to view their complete fee details and payment history</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center gap-3 max-w-lg">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by Student ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
          <button
            onClick={handleSearch}
            className="px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transition-all cursor-pointer shadow-sm whitespace-nowrap"
          >
            Search
          </button>
        </div>
      </div>

      {hasSearched && !foundStudent && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 text-center">
          <UserIcon className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400 text-sm">No student found with the given ID</p>
        </div>
      )}

      {foundStudent && (
        <>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
            <div className="flex items-center gap-2 mb-4">
              <UserIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">Student Information</h3>
            </div>
            <div className="flex flex-col sm:flex-row items-start gap-5">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white font-bold text-lg flex-shrink-0 ring-2 ring-blue-200 dark:ring-blue-900">
                {getInitials(foundStudent.name)}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-8 gap-y-3 flex-1 text-sm">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Student Name</p>
                  <p className="mt-0.5 font-semibold text-gray-900 dark:text-white">{foundStudent.name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Student ID</p>
                  <p className="mt-0.5 font-semibold text-gray-900 dark:text-white font-mono">{foundStudent.id}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Father Name</p>
                  <p className="mt-0.5 font-semibold text-gray-900 dark:text-white">{foundStudent.fatherName}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Class</p>
                  <p className="mt-0.5 font-semibold text-gray-900 dark:text-white">{foundStudent.class}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Gender</p>
                  <p className="mt-0.5 font-semibold text-gray-900 dark:text-white">{foundStudent.gender}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Father Phone</p>
                  <p className="mt-0.5 font-semibold text-gray-900 dark:text-white">{foundStudent.fatherPhone}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Admission Date</p>
                  <p className="mt-0.5 font-semibold text-gray-900 dark:text-white">{foundStudent.admissionDate}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <CurrencyDollarIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Monthly Fee</p>
              </div>
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">Total</span><span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(foundStudent.monthlyFee * 12)}</span></div>
                <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">Paid</span><span className="font-semibold text-green-600 dark:text-green-400">{formatCurrency(monthlyPaid)}</span></div>
                <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">Remaining</span><span className="font-semibold text-red-600 dark:text-red-400">{formatCurrency(monthlyDue)}</span></div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <CurrencyDollarIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Admission Fee</p>
              </div>
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">Total</span><span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(foundStudent.admissionFee)}</span></div>
                <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">Paid</span><span className="font-semibold text-green-600 dark:text-green-400">{formatCurrency(admissionPaid)}</span></div>
                <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">Remaining</span><span className="font-semibold text-red-600 dark:text-red-400">{formatCurrency(admissionDue)}</span></div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                  <CurrencyDollarIcon className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                </div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Exam Fee</p>
              </div>
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">Total</span><span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(foundStudent.examFee * 3)}</span></div>
                <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">Paid</span><span className="font-semibold text-green-600 dark:text-green-400">{formatCurrency(examPaid)}</span></div>
                <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">Remaining</span><span className="font-semibold text-red-600 dark:text-red-400">{formatCurrency(examDue)}</span></div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white">
              <div className="flex items-center gap-2 mb-2">
                <CurrencyDollarIcon className="h-5 w-5" />
                <p className="text-xs font-semibold uppercase tracking-wider opacity-90">Total Paid</p>
              </div>
              <p className="text-2xl font-bold">{formatCurrency(totalPaid)}</p>
            </div>

            <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-4 text-white sm:col-span-2 lg:col-span-2">
              <div className="flex items-center gap-2 mb-2">
                <ClockIcon className="h-5 w-5" />
                <p className="text-xs font-semibold uppercase tracking-wider opacity-90">Total Remaining</p>
              </div>
              <p className="text-2xl font-bold">{formatCurrency(totalRemaining)}</p>
            </div>
          </div>

          {(() => {
            const studentDues = outstandingDues.filter((d) => d.studentId === foundStudent.id && d.remaining > 0);
            const totalPreviousDues = studentDues.reduce((sum, d) => sum + d.remaining, 0);
            if (studentDues.length === 0) return null;
            return (
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-orange-200 dark:border-orange-800 p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                      <ClockIcon className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                    </div>
                    <p className="text-xs font-semibold text-orange-600 dark:text-orange-400 uppercase tracking-wider">Previous Outstanding Dues</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Outstanding</p>
                    <p className="text-lg font-bold text-orange-600 dark:text-orange-400">{formatCurrency(totalPreviousDues)}</p>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-gray-800/50">
                        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Fee Type</th>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Month/Exam</th>
                        <th className="px-3 py-2 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Paid</th>
                        <th className="px-3 py-2 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Remaining</th>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {studentDues.map((d) => (
                        <tr key={d.id} className="bg-white dark:bg-gray-800/50">
                          <td className="px-3 py-2">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                              d.feeType === 'Monthly Fee' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' :
                              d.feeType === 'Admission Fee' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' :
                              'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                            }`}>{d.feeType}</span>
                          </td>
                          <td className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300">{d.month}{d.exam ? ` / ${d.exam}` : ''}</td>
                          <td className="px-3 py-2 text-sm text-gray-900 dark:text-white text-right">{formatCurrency(d.totalPaid)}</td>
                          <td className="px-3 py-2 text-sm font-bold text-red-600 dark:text-red-400 text-right">{formatCurrency(d.remaining)}</td>
                          <td className="px-3 py-2">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                              d.status === 'Partial' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300' :
                              'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                            }`}>{d.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
                  <div className="text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Current Month Due: </span>
                    <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(totalRemaining)}</span>
                    <span className="text-gray-400 mx-2">|</span>
                    <span className="text-gray-500 dark:text-gray-400">Previous Outstanding: </span>
                    <span className="font-semibold text-orange-600 dark:text-orange-400">{formatCurrency(totalPreviousDues)}</span>
                    <span className="text-gray-400 mx-2">|</span>
                    <span className="text-gray-500 dark:text-gray-400">Total: </span>
                    <span className="font-bold text-red-600 dark:text-red-400">{formatCurrency(totalRemaining + totalPreviousDues)}</span>
                  </div>
                </div>
              </div>
            );
          })()}

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center gap-2 mb-4">
              <ClockIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">Payment History</h3>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <select
                value={feeTypeFilter}
                onChange={(e) => setFeeTypeFilter(e.target.value)}
                className="px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
              >
                {FEE_TYPES.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              <select
                value={monthFilter}
                onChange={(e) => setMonthFilter(e.target.value)}
                className="px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
              >
                {ALL_MONTHS.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            <Table columns={paymentColumns} data={filteredPayments} renderRow={renderPaymentRow} />
          </div>
        </>
      )}

      <Modal isOpen={showReceiptModal} onClose={() => { setShowReceiptModal(false); setReceiptItem(null); }} title="Fee Receipt" maxWidth="max-w-sm">
        {receiptItem && (
          <div className="flex flex-col items-center">
            <div id="thermal-receipt" className="w-[280px] bg-white text-black p-3 font-mono text-[10px] leading-tight">
              <div className="receipt-header text-center mb-2">
                {schoolInfo.logo ? (
                  <img src={schoolInfo.logo} alt="School Logo" className="w-10 h-10 object-contain mx-auto mb-1" />
                ) : (
                  <div className="w-10 h-10 rounded-full border border-black flex items-center justify-center mx-auto mb-1 text-xs font-bold">
                    {schoolInfo.name ? schoolInfo.name.charAt(0) : 'S'}
                  </div>
                )}
                <div className="text-[13px] font-bold tracking-wide">{schoolInfo.name || 'School Name'}</div>
                {schoolInfo.address && <div className="text-[9px] text-gray-600 mt-0.5">{schoolInfo.address}{schoolInfo.city ? `, ${schoolInfo.city}` : ''}</div>}
              </div>

              <div className="text-[12px] font-bold tracking-widest text-center my-2">FEE RECEIPT</div>
              <hr className="sep" />

              <div className="space-y-0">
                <div className="info-row"><span className="label">Receipt No:</span><span className="value">{receiptItem.id}</span></div>
                <div className="info-row"><span className="label">Date:</span><span className="value">{receiptItem.date}</span></div>
                <hr className="sep" />
                <div className="info-row"><span className="label">Student:</span><span className="value">{receiptItem.studentName}</span></div>
                <div className="info-row"><span className="label">Student ID:</span><span className="value">{receiptItem.studentId}</span></div>
                <div className="info-row"><span className="label">Father Name:</span><span className="value">{foundStudent?.fatherName || '-'}</span></div>
                <div className="info-row"><span className="label">Class:</span><span className="value">{foundStudent?.class || '-'}</span></div>
              </div>

              <hr className="sep" />
              <div className="section-title">FEE DETAILS</div>
              <hr className="sep-solid" />

              <div className="space-y-0">
                <div className="fee-row"><span className="label">Fee Type:</span><span className="value">{receiptItem.feeType}</span></div>
                {receiptItem.feeType === 'Monthly Fee' && receiptItem.month && (
                  <div className="fee-row"><span className="label">Month:</span><span className="value">{receiptItem.month}</span></div>
                )}
                {receiptItem.feeType === 'Admission Fee' && receiptItem.month && (
                  <div className="fee-row"><span className="label">Month:</span><span className="value">{receiptItem.month}</span></div>
                )}
                {receiptItem.feeType === 'Exam Fee' && (
                  <>
                    {receiptItem.month && <div className="fee-row"><span className="label">Month:</span><span className="value">{receiptItem.month}</span></div>}
                    {receiptItem.exam && <div className="fee-row"><span className="label">Exam:</span><span className="value">{receiptItem.exam}</span></div>}
                  </>
                )}
                <div className="fee-row"><span className="label">Original Fee:</span><span className="value">{formatCurrency(receiptItem.amount)}</span></div>
                {receiptItem.discount > 0 && <div className="fee-row"><span className="label">Discount:</span><span className="value">- {formatCurrency(receiptItem.discount)}</span></div>}
                {receiptItem.fine > 0 && <div className="fee-row"><span className="label">Fine:</span><span className="value">+ {formatCurrency(receiptItem.fine)}</span></div>}
                <div className="paid-row"><span>AMOUNT PAID:</span><span>{formatCurrency(receiptItem.totalPaid)}</span></div>
                <div className="fee-row"><span className="label">Remaining:</span><span className="value font-bold">{formatCurrency(receiptItem.amount - receiptItem.discount + receiptItem.fine - receiptItem.totalPaid)}</span></div>
                <div className="fee-row"><span className="label">Payment Method:</span><span className="value">{receiptItem.paymentMethod}</span></div>
              </div>

              <hr className="sep" />

              <div className="sig-stamp">
                <div className="sig-stamp-item">
                  {branding.signature ? (
                    <img src={branding.signature} alt="Principal Signature" />
                  ) : (
                    <div className="placeholder">
                      <div className="line"></div>
                    </div>
                  )}
                  <div className="sig-stamp-label">Principal Signature</div>
                </div>
                <div className="sig-stamp-item">
                  {branding.stamp ? (
                    <img src={branding.stamp} alt="School Stamp" />
                  ) : (
                    <div className="placeholder">
                      <div className="stamp-circle">School<br/>Stamp</div>
                    </div>
                  )}
                  <div className="sig-stamp-label">School Stamp</div>
                </div>
              </div>

              <hr className="sep" />
              <div className="receipt-footer">
                <div className="thanks">Thank You</div>
                <hr className="sep-solid mt-1" />
              </div>
            </div>

            <div className="flex gap-3 pt-4 w-full">
              <Button variant="secondary" onClick={() => { setShowReceiptModal(false); setReceiptItem(null); }} className="flex-1">Close</Button>
              <Button onClick={handlePrint} className="flex items-center justify-center gap-2 flex-1">
                <PrinterIcon className="h-4 w-4" /> Print Receipt
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default StudentFeeDetails;
