import { getImageUrl } from '../../../utils/imageUrl';

export const getInitials = (name) =>
  name
    ? name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'S';

export const gradeBadgeClass = (grade) => {
  switch (grade) {
    case 'A+':
      return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300';
    case 'A':
      return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300';
    case 'B':
      return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300';
    case 'C':
      return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300';
    case 'D':
      return 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300';
    case 'F':
      return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300';
    default:
      return 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400';
  }
};

export const statusBadgeClass = (status) => {
  switch (status) {
    case 'Passed':
      return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300';
    case 'Failed':
      return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300';
    default:
      return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300';
  }
};

export const buildMarksheetHtml = (record, schoolInfo = {}) => {
  if (!record) return '';
  const addressParts = [schoolInfo.address, schoolInfo.city, schoolInfo.province].filter(Boolean).join(', ');
  const schoolAddress = [addressParts, schoolInfo.country].filter(Boolean).join(', ');
  const contactLine = [schoolInfo.contact, schoolInfo.email, schoolInfo.website].filter(Boolean).join('  •  ');
  const photoUrl = getImageUrl(record.student.studentImage);
  const generatedOn = new Date().toLocaleString();

  const subjectRows = record.subjectResults
    .map((subj) => {
      const statusText = !subj.entered ? 'Pending' : subj.passed ? 'Pass' : 'Fail';
      const statusCls = !subj.entered ? 'status-pending' : subj.passed ? 'status-pass' : 'status-fail';
      return `<tr>
        <td style="font-weight:600;">${subj.subjectName}</td>
        <td>${subj.totalMarks}</td>
        <td>${subj.entered ? subj.obtainedMarks : '-'}</td>
        <td>${subj.entered ? `${subj.percentage}%` : '-'}</td>
        <td>${subj.entered ? `<span class="badge grade-${subj.grade.replace('+', 'P')}">${subj.grade}</span>` : '-'}</td>
        <td><span class="${statusCls}">${statusText}</span></td>
      </tr>`;
    })
    .join('');

  const overallStatus = record.status || 'Pending';
  const overallStatusClass =
    overallStatus === 'Passed' ? 'val green' : overallStatus === 'Failed' ? 'val red' : 'val';

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Marksheet - ${record.student.studentId}</title>
  <style>
    @page { size: A4 portrait; margin: 12mm; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', Arial, sans-serif; -webkit-print-color-adjust: exact; print-color-adjust: exact; color: #1f2937; background: #fff; font-size: 11px; }
    .rpt-hdr { background: linear-gradient(135deg, #1e3a5f, #1e40af); padding: 18px 24px; border-radius: 6px 6px 0 0; color: #fff; display: flex; justify-content: space-between; align-items: center; }
    .rpt-hdr h1 { font-size: 18px; font-weight: 700; letter-spacing: 0.3px; }
    .rpt-hdr p { font-size: 11px; color: rgba(255,255,255,0.75); margin-top: 2px; }
    .rpt-hdr .logo { max-height: 52px; max-width: 52px; border-radius: 8px; background: #fff; padding: 3px; }
    .rpt-hdr .date { text-align: right; }
    .rpt-hdr .date p { font-size: 10px; }
    .rpt-hdr .date p:last-child { color: #fff; font-weight: 600; font-size: 11px; }
    .rpt-body { padding: 16px 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 6px 6px; }
    .rpt-title { text-align: center; margin-bottom: 14px; }
    .rpt-title h2 { font-size: 16px; color: #1e40af; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; }
    .rpt-title p { font-size: 10px; color: #6b7280; margin-top: 2px; font-weight: 600; }
    .student-grid { display: flex; gap: 18px; align-items: center; margin-bottom: 14px; }
    .student-photo { width: 84px; height: 92px; border: 1px solid #e5e7eb; border-radius: 6px; overflow: hidden; flex-shrink: 0; display: flex; align-items: center; justify-content: center; background: #f9fafb; }
    .student-photo img { width: 100%; height: 100%; object-fit: cover; }
    .student-photo .fallback { font-size: 22px; font-weight: 700; color: #9ca3af; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; flex: 1; }
    .info-card { background: #f3f4f6; padding: 8px 10px; border-radius: 4px; }
    .info-card .lbl { font-size: 9px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600; }
    .info-card .val { font-size: 11px; font-weight: 700; color: #111827; margin-top: 2px; }
    .sec-title { font-size: 13px; font-weight: 700; color: #1e40af; margin: 16px 0 8px; padding-bottom: 4px; border-bottom: 2px solid #1e40af; }
    table { width: 100%; border-collapse: collapse; font-size: 10px; margin-bottom: 12px; }
    thead th { background: #1e40af; color: #fff; padding: 7px 8px; text-align: center; font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
    thead th:first-child { text-align: left; }
    tbody td { padding: 6px 8px; border-bottom: 1px solid #e5e7eb; text-align: center; }
    tbody td:first-child { text-align: left; }
    tbody tr:nth-child(even) { background: #f9fafb; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 10px; font-size: 9px; font-weight: 700; }
    .grade-AP { background: #d1fae5; color: #065f46; }
    .grade-A { background: #bbf7d0; color: #166534; }
    .grade-B { background: #dbeafe; color: #1e40af; }
    .grade-C { background: #fef9c3; color: #854d0e; }
    .grade-D { background: #ffedd5; color: #c2410c; }
    .grade-F { background: #fee2e2; color: #991b1b; }
    .status-pass { background: #dcfce7; color: #166534; padding: 2px 8px; border-radius: 10px; font-size: 9px; font-weight: 600; }
    .status-fail { background: #fee2e2; color: #991b1b; padding: 2px 8px; border-radius: 10px; font-size: 9px; font-weight: 600; }
    .status-pending { background: #fef9c3; color: #854d0e; padding: 2px 8px; border-radius: 10px; font-size: 9px; font-weight: 600; }
    .summary-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; margin-bottom: 14px; }
    .summary-card { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 4px; padding: 10px; text-align: center; }
    .summary-card .lbl { font-size: 9px; color: #6b7280; text-transform: uppercase; font-weight: 600; }
    .summary-card .val { font-size: 14px; font-weight: 700; color: #111827; margin-top: 2px; }
    .val.green { color: #16a34a; }
    .val.red { color: #dc2626; }
    .val.blue { color: #2563eb; }
    .signatures { display: flex; justify-content: space-between; margin-top: 44px; padding-top: 8px; }
    .signature { text-align: center; font-size: 11px; color: #374151; width: 30%; }
    .signature .line { border-top: 1px solid #374151; padding-top: 6px; font-weight: 600; }
    .ftr { border-top: 1px solid #e5e7eb; margin-top: 16px; padding-top: 8px; display: flex; justify-content: space-between; font-size: 8px; color: #9ca3af; }
    @media print { body { margin: 0; padding: 0; } .rpt-body { border: none; } }
  </style>
</head>
<body>
  <div class="rpt-hdr">
    <div>
      ${schoolInfo.logo ? `<img class="logo" src="${getImageUrl(schoolInfo.logo)}" alt="Logo" />` : ''}
    </div>
    <div>
      <h1>${schoolInfo.name || 'School Name'}</h1>
      <p>${[schoolAddress, schoolInfo.registrationNumber ? `Reg. No: ${schoolInfo.registrationNumber}` : ''].filter(Boolean).join('  •  ')}</p>
      ${contactLine ? `<p>${contactLine}</p>` : ''}
    </div>
    <div class="date">
      <p>Generated On</p>
      <p>${generatedOn}</p>
    </div>
  </div>
  <div class="rpt-body">
    <div class="rpt-title">
      <h2>Examination Marksheet</h2>
      <p>${record.exam?.name || 'Exam'} (${record.exam?.type || ''}) &mdash; Academic Year ${record.academicYear}</p>
    </div>
    <div>
      <div class="sec-title">Student Information</div>
      <div class="student-grid">
        <div class="student-photo">
          ${photoUrl ? `<img src="${photoUrl}" alt="Student photo" />` : `<span class="fallback">${getInitials(record.student.fullName)}</span>`}
        </div>
        <div class="info-grid">
          <div class="info-card"><div class="lbl">Student ID</div><div class="val">${record.student.studentId}</div></div>
          <div class="info-card"><div class="lbl">Student Name</div><div class="val">${record.student.fullName}</div></div>
          <div class="info-card"><div class="lbl">Father's Name</div><div class="val">${record.student.fatherName || '-'}</div></div>
          <div class="info-card"><div class="lbl">Class</div><div class="val">${record.className}</div></div>
          <div class="info-card"><div class="lbl">Academic Year</div><div class="val">${record.academicYear}</div></div>
          <div class="info-card"><div class="lbl">Exam Term</div><div class="val">${record.exam?.type || record.exam?.name || '-'}</div></div>
        </div>
      </div>
    </div>
    <div>
      <div class="sec-title">Marksheet</div>
      <table>
        <thead>
          <tr>
            <th>Subject</th><th>Total Marks</th><th>Obtained Marks</th><th>Percentage</th><th>Grade</th><th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${subjectRows}
        </tbody>
      </table>
    </div>
    <div class="summary-grid">
      <div class="summary-card"><div class="lbl">Total Marks</div><div class="val">${record.totalMarks}</div></div>
      <div class="summary-card"><div class="lbl">Obtained Marks</div><div class="val blue">${record.obtainedMarks !== null ? record.obtainedMarks : '-'}</div></div>
      <div class="summary-card"><div class="lbl">Overall Percentage</div><div class="val blue">${record.percentage !== null ? `${record.percentage}%` : '-'}</div></div>
      <div class="summary-card"><div class="lbl">Overall Grade</div><div class="val">${record.grade}</div></div>
      <div class="summary-card"><div class="lbl">Pass / Fail</div><div class="${overallStatusClass}">${overallStatus}</div></div>
    </div>
    <div class="signatures">
      <div class="signature"><div class="line">Class Teacher</div></div>
      <div class="signature"><div class="line">Exam Controller</div></div>
      <div class="signature"><div class="line">Principal</div></div>
    </div>
    <div class="ftr">
      <span>${schoolInfo.name || 'School'} &mdash; Examination Marksheet</span>
      <span>Page 1 of 1</span>
    </div>
  </div>
</body>
</html>`;
};

export const printMarksheet = (html, setPrinting) => {
  if (!html) return;
  setPrinting(true);
  try {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      window.print();
      return;
    }
    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 500);
  } finally {
    setPrinting(false);
  }
};

export const downloadMarksheetPdf = async (html, filename, setExporting) => {
  if (!html) return;
  setExporting(true);
  try {
    const { default: html2pdf } = await import('html2pdf.js');
    const el = document.createElement('div');
    el.innerHTML = html;
    el.style.position = 'fixed';
    el.style.left = '-9999px';
    el.style.top = '0';
    document.body.appendChild(el);
    await html2pdf()
      .set({
        margin: [8, 8, 8, 8],
        filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      })
      .from(el)
      .save();
    document.body.removeChild(el);
  } catch {
    document.querySelectorAll('div[style*="left: -9999px"]').forEach((node) => node.remove());
  } finally {
    setExporting(false);
  }
};