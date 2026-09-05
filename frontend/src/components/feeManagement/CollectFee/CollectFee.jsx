import { useState, useCallback } from 'react';
import { MagnifyingGlassIcon, CheckCircleIcon, CurrencyRupeeIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import Table from '../../common/Table/Table';
import Button from '../../common/Button/Button';
import Modal from '../../common/Modal/Modal';
import Input from '../../common/Input/Input';
import SelectInput from '../../common/SelectInput/SelectInput';
import { studentsWithFeeStatus, feeStructures, paymentMethods, months, exams } from '../../../data/feeManagement/dummyData';

const FEE_TYPES = ['Monthly Fee', 'Admission Fee', 'Exam Fee'];

const formatCurrency = (val) => `Rs. ${Number(val || 0).toLocaleString()}`;

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

const getInitials = (name) => name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();

const StudentAvatar = ({ name, className: cls }) => (
  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0 ${cls || 'bg-gradient-to-br from-blue-500 to-blue-700'}`}>
    {getInitials(name)}
  </div>
);

const CollectFee = ({ onDataChange }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [feeType, setFeeType] = useState('');
  const [month, setMonth] = useState('');
  const [exam, setExam] = useState('');
  const [amountPaid, setAmountPaid] = useState('');
  const [discount, setDiscount] = useState('');
  const [fine, setFine] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [errors, setErrors] = useState({});

  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [receiptData, setReceiptData] = useState(null);

  const handleSearch = useCallback(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) {
      setSearchResults([]);
      setHasSearched(false);
      return;
    }
    const results = studentsWithFeeStatus.filter(
      (s) => s.id.toLowerCase() === q || s.id.toLowerCase().includes(q)
    );
    setSearchResults(results);
    setHasSearched(true);
  }, [searchQuery]);

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  const feeAmount = selectedStudent && feeType ? getFeeAmount(selectedStudent.class, feeType) : 0;
  const totalPayable = feeAmount - Number(discount || 0) + Number(fine || 0);
  const remainingAmount = totalPayable - Number(amountPaid || 0);

  const openCollectModal = (student) => {
    setSelectedStudent(student);
    setFeeType('');
    setMonth('');
    setExam('');
    setAmountPaid('');
    setDiscount('');
    setFine('');
    setPaymentMethod('');
    setErrors({});
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedStudent(null);
    setFeeType('');
    setMonth('');
    setExam('');
    setAmountPaid('');
    setDiscount('');
    setFine('');
    setPaymentMethod('');
    setErrors({});
  };

  const resetFormFields = () => {
    setAmountPaid('');
    setDiscount('');
    setFine('');
    setPaymentMethod('');
    setErrors({});
  };

  const handleFeeTypeChange = (e) => {
    setFeeType(e.target.value);
    resetFormFields();
  };

  const validate = () => {
    const newErrors = {};
    if (!feeType) newErrors.feeType = 'Please select a payment type';
    if (!month) newErrors.month = 'Please select a month';
    if (feeType === 'Exam Fee' && !exam) newErrors.exam = 'Please select an exam';
    if (!amountPaid || Number(amountPaid) <= 0) newErrors.amountPaid = 'Enter a valid amount';
    if (Number(amountPaid) > totalPayable) newErrors.amountPaid = 'Amount cannot exceed total payable';
    if (!paymentMethod) newErrors.paymentMethod = 'Please select a payment method';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCollectFee = () => {
    if (!validate()) return;

    const receiptId = `REC-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`;

    const receipt = {
      id: receiptId,
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      studentId: selectedStudent.id,
      studentName: selectedStudent.name,
      fatherName: selectedStudent.fatherName,
      className: selectedStudent.class,
      section: selectedStudent.section,
      feeType,
      month,
      exam: feeType === 'Exam Fee' ? exam : null,
      feeAmount,
      discount: Number(discount || 0),
      fine: Number(fine || 0),
      totalPayable,
      amountPaid: Number(amountPaid),
      remainingAmount,
      paymentMethod,
    };

    setReceiptData(receipt);
    setShowReceiptModal(true);
    closeModal();
    toast.success(`Fee collected successfully from ${selectedStudent.name}`);
    onDataChange?.();
  };

  const tableColumns = [
    { key: 'name', label: 'Student Name' },
    { key: 'fatherName', label: 'Father Name' },
    { key: 'class', label: 'Class' },
    { key: 'actions', label: 'Action', className: 'text-right' },
  ];

  const renderRow = (student) => (
    <>
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <StudentAvatar name={student.name} />
          <div>
            <p className="font-medium text-gray-900 dark:text-white">{student.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">{student.id}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{student.fatherName}</td>
      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{student.class}</td>
      <td className="px-4 py-3 text-right">
        <button
          onClick={() => openCollectModal(student)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transition-all cursor-pointer shadow-sm"
        >
          <CurrencyRupeeIcon className="h-3.5 w-3.5" />
          Collect Fee
        </button>
      </td>
    </>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Collect Fee</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Search for a student by ID and collect their fee payment
        </p>
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

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        {hasSearched && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
            {searchResults.length} student{searchResults.length !== 1 ? 's' : ''} found
          </p>
        )}
        <Table columns={tableColumns} data={searchResults} renderRow={renderRow} />
      </div>

      <Modal isOpen={showModal} onClose={closeModal} title="Collect Fee" maxWidth="max-w-2xl">
        {selectedStudent && (
          <div className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 border border-blue-200 dark:border-blue-800">
              <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-2">Student Information</p>
              <div className="flex items-center gap-3">
                <StudentAvatar name={selectedStudent.name} className="w-11 h-11 text-sm bg-gradient-to-br from-blue-600 to-blue-800" />
                <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-sm flex-1">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Student Name</span>
                    <p className="font-semibold text-gray-900 dark:text-white">{selectedStudent.name}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Student ID</span>
                    <p className="font-mono font-semibold text-gray-900 dark:text-white">{selectedStudent.id}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Father Name</span>
                    <p className="font-semibold text-gray-900 dark:text-white">{selectedStudent.fatherName}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Class</span>
                    <p className="font-semibold text-gray-900 dark:text-white">{selectedStudent.class}</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <SelectInput
                label="Select Payment Type"
                name="feeType"
                value={feeType}
                onChange={handleFeeTypeChange}
                options={FEE_TYPES}
                placeholder="Select payment type"
                required
              />
              {errors.feeType && <p className="text-xs text-red-600 dark:text-red-400 -mt-3 mb-2">{errors.feeType}</p>}
            </div>

            {feeType && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <SelectInput
                      label="Select Month"
                      name="month"
                      value={month}
                      onChange={(e) => { setMonth(e.target.value); if (errors.month) setErrors((p) => ({ ...p, month: '' })); }}
                      options={months}
                      placeholder="Select month"
                      required
                    />
                    {errors.month && <p className="text-xs text-red-600 dark:text-red-400 -mt-3 mb-2">{errors.month}</p>}
                  </div>
                  {feeType === 'Exam Fee' && (
                    <div>
                      <SelectInput
                        label="Select Exam"
                        name="exam"
                        value={exam}
                        onChange={(e) => { setExam(e.target.value); if (errors.exam) setErrors((p) => ({ ...p, exam: '' })); }}
                        options={exams}
                        placeholder="Select exam"
                        required
                      />
                      {errors.exam && <p className="text-xs text-red-600 dark:text-red-400 -mt-3 mb-2">{errors.exam}</p>}
                    </div>
                  )}
                </div>

                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700 space-y-3">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Fee Calculation</p>

                  <div className="flex items-center justify-between py-1">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Original Fee</span>
                    <span className="text-lg font-bold text-gray-900 dark:text-white">{formatCurrency(feeAmount)}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="Discount"
                      name="discount"
                      type="number"
                      value={discount}
                      onChange={(e) => { const v = e.target.value; if (v === '' || /^\d*$/.test(v)) setDiscount(v); }}
                      placeholder="0"
                    />
                    <Input
                      label="Fine"
                      name="fine"
                      type="number"
                      value={fine}
                      onChange={(e) => { const v = e.target.value; if (v === '' || /^\d*$/.test(v)) setFine(v); }}
                      placeholder="0"
                    />
                  </div>

                  <div className="border-t border-gray-200 dark:border-gray-700 pt-3 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Total Payable</span>
                      <span className="text-lg font-bold text-blue-600 dark:text-blue-400">{formatCurrency(totalPayable)}</span>
                    </div>

                    <Input
                      label="Amount Paid"
                      name="amountPaid"
                      type="number"
                      value={amountPaid}
                      onChange={(e) => { const v = e.target.value; if (v === '' || /^\d*$/.test(v)) { setAmountPaid(v); if (errors.amountPaid) setErrors((p) => ({ ...p, amountPaid: '' })); } }}
                      placeholder="0"
                      required
                      error={errors.amountPaid}
                    />

                    <div className="flex items-center justify-between py-1">
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Remaining Amount</span>
                      <span className={`text-lg font-bold ${remainingAmount > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                        {formatCurrency(remainingAmount)}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <SelectInput
                    label="Payment Method"
                    name="paymentMethod"
                    value={paymentMethod}
                    onChange={(e) => { setPaymentMethod(e.target.value); if (errors.paymentMethod) setErrors((p) => ({ ...p, paymentMethod: '' })); }}
                    options={paymentMethods}
                    placeholder="Select payment method"
                    required
                  />
                  {errors.paymentMethod && <p className="text-xs text-red-600 dark:text-red-400 -mt-3 mb-2">{errors.paymentMethod}</p>}
                </div>

                <div className="flex gap-3 pt-1">
                  <Button variant="secondary" onClick={closeModal} className="flex-1">Cancel</Button>
                  <Button onClick={handleCollectFee} className="flex-1">Collect Fee</Button>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      <Modal isOpen={showReceiptModal} onClose={() => { setShowReceiptModal(false); setReceiptData(null); }} title="Payment Receipt" maxWidth="max-w-md">
        {receiptData && (
          <div className="space-y-5">
            <div className="text-center">
              <div className="mx-auto w-14 h-14 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-3">
                <CheckCircleIcon className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">Fee Collected Successfully</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Receipt #{receiptData.id}</p>
            </div>

            <div className="flex items-center gap-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
              <StudentAvatar name={receiptData.studentName} className="w-11 h-11 text-sm bg-gradient-to-br from-blue-600 to-blue-800" />
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">{receiptData.studentName}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{receiptData.fatherName} | {receiptData.studentId}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{receiptData.className}</p>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700 text-sm space-y-2.5">
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Payment Date</span>
                <span className="font-medium text-gray-900 dark:text-white">{receiptData.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Payment Type</span>
                <span className="font-medium text-gray-900 dark:text-white">{receiptData.feeType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Month</span>
                <span className="font-medium text-gray-900 dark:text-white">{receiptData.month}</span>
              </div>
              {receiptData.exam && (
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Exam</span>
                  <span className="font-medium text-gray-900 dark:text-white">{receiptData.exam}</span>
                </div>
              )}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-2.5 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Original Fee</span>
                  <span className="text-gray-900 dark:text-white">{formatCurrency(receiptData.feeAmount)}</span>
                </div>
                {receiptData.discount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Discount</span>
                    <span className="text-green-600 dark:text-green-400">- {formatCurrency(receiptData.discount)}</span>
                  </div>
                )}
                {receiptData.fine > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Fine</span>
                    <span className="text-red-600 dark:text-red-400">+ {formatCurrency(receiptData.fine)}</span>
                  </div>
                )}
                <div className="flex justify-between font-semibold">
                  <span className="text-gray-700 dark:text-gray-300">Total Payable</span>
                  <span className="text-gray-900 dark:text-white">{formatCurrency(receiptData.totalPayable)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Amount Paid</span>
                  <span className="font-semibold text-blue-600 dark:text-blue-400">{formatCurrency(receiptData.amountPaid)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700 dark:text-gray-300 font-semibold">Remaining Amount</span>
                  <span className={`font-bold ${receiptData.remainingAmount > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                    {formatCurrency(receiptData.remainingAmount)}
                  </span>
                </div>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-700 pt-2.5 flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Payment Method</span>
                <span className="font-medium text-gray-900 dark:text-white">{receiptData.paymentMethod}</span>
              </div>
            </div>

            <Button variant="secondary" onClick={() => { setShowReceiptModal(false); setReceiptData(null); }}>
              Close
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CollectFee;
