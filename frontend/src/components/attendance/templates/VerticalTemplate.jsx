import CardHeader from './shared/CardHeader';
import CardPhoto from './shared/CardPhoto';
import CardInfoRow from './shared/CardInfoRow';
import QRCodePlaceholder from './shared/QRCodePlaceholder';
import { getInitials, formatClassName, frontHeaderHtml, backHeaderHtml, photoHtml, detailRowHtml, qrPlaceholderHtml, backFooterHtml, cropMarksHtml } from './shared/cardHtmlUtils';

const DEFAULT_VISIBILITY = {
  schoolLogo: true, schoolName: true, studentPhoto: true, studentName: true,
  fatherName: true, studentId: true, class: true, academicYear: true, qrCode: true,
  fatherPhone: true, schoolAddress: true, note: true,
};

const VerticalTemplateFront = ({ student, schoolInfo, layoutConfig }) => {
  const { cardWidth, cardHeight, borderRadius, photoSize, photoShape, nameFontSize, detailsFontSize, fontWeight, textColor, cardBgColor, primaryColor, secondaryColor } = layoutConfig;
  const visibility = { ...DEFAULT_VISIBILITY, ...(layoutConfig.visibility || {}) };
  return (
    <div className="mx-auto overflow-hidden shadow-sm"
      style={{ width: cardWidth, minHeight: cardHeight || undefined, borderRadius, backgroundColor: cardBgColor, border: '1px solid #e5e7eb' }}>
      {(visibility.schoolLogo || visibility.schoolName) && (
        <CardHeader schoolName={schoolInfo.name} primaryColor={primaryColor} secondaryColor={secondaryColor} visibility={visibility} />
      )}
      <div className="text-center" style={{ padding: '16px 20px' }}>
        {visibility.studentPhoto && <CardPhoto fullName={student.fullName} photoSize={photoSize} photoShape={photoShape} />}
        {visibility.studentName && (
          <h3 className="font-bold m-0" style={{ fontSize: nameFontSize, fontWeight, color: textColor }}>
            {student.fullName}
          </h3>
        )}
        {(visibility.fatherName || visibility.studentId || visibility.class) && (
          <div className="inline-block text-left" style={{ marginTop: 10 }}>
            {visibility.fatherName && <CardInfoRow label="Father" value={student.fatherName} detailsFontSize={detailsFontSize} fontWeight={fontWeight} textColor={textColor} />}
            {visibility.studentId && <CardInfoRow label="Student ID" value={student.studentId} detailsFontSize={detailsFontSize} fontWeight={fontWeight} textColor={textColor} />}
            {visibility.class && <CardInfoRow label="Class" value={formatClassName(student.class)} detailsFontSize={detailsFontSize} fontWeight={fontWeight} textColor={textColor} />}
          </div>
        )}
      </div>
    </div>
  );
};

const VerticalTemplateBack = ({ student, schoolInfo, layoutConfig }) => {
  const { cardWidth, cardHeight, borderRadius, detailsFontSize, fontWeight, textColor, cardBgColor, primaryColor, secondaryColor, qrSize } = layoutConfig;
  const visibility = { ...DEFAULT_VISIBILITY, ...(layoutConfig.visibility || {}) };
  return (
    <div className="mx-auto overflow-hidden"
      style={{ width: cardWidth, minHeight: cardHeight || undefined, borderRadius, backgroundColor: cardBgColor, border: '1px solid #e5e7eb' }}>
      <CardHeader title="QR Scanner" primaryColor={primaryColor} secondaryColor={secondaryColor} />
      <div className="text-center" style={{ padding: '20px 20px 12px' }}>
        {visibility.qrCode && <QRCodePlaceholder size={qrSize} />}
        {(visibility.fatherPhone || visibility.schoolAddress) && (
          <div className="inline-block text-left" style={{ marginTop: 14 }}>
            {visibility.fatherPhone && <CardInfoRow label="Phone" value={student.fatherPhone} detailsFontSize={detailsFontSize} fontWeight={fontWeight} textColor={textColor} />}
            {visibility.schoolAddress && <CardInfoRow label="Address" value={schoolInfo.address} detailsFontSize={detailsFontSize} fontWeight={fontWeight} textColor={textColor} />}
          </div>
        )}
      </div>
      {visibility.note && (
        <div className="border-t border-gray-100 dark:border-gray-700" style={{ padding: '10px 16px 12px' }}>
          <p className="text-center m-0 text-gray-400 dark:text-gray-500" style={{ fontSize: 8, lineHeight: 1.5 }}>
            This ID card must be carried daily while attending school. Loss of this card should be reported immediately to the school administration.
          </p>
        </div>
      )}
    </div>
  );
};

const VerticalTemplate = ({ student, schoolInfo, side, layoutConfig = {} }) => {
  const merged = { cardWidth: 320, cardHeight: 0, cardPadding: 16, borderRadius: 12, photoSize: 80, photoShape: 'circle', qrSize: 140, qrPosition: 'center', nameFontSize: 16, detailsFontSize: 12, fontWeight: 700, primaryColor: '#2563eb', secondaryColor: '#1e40af', textColor: '#1f2937', cardBgColor: '#ffffff', ...layoutConfig };
  if (side === 'back') return <VerticalTemplateBack student={student} schoolInfo={schoolInfo} layoutConfig={merged} />;
  return <VerticalTemplateFront student={student} schoolInfo={schoolInfo} layoutConfig={merged} />;
};

VerticalTemplate.toHtml = (student, schoolInfo, frontConfig = {}, backConfig = {}) => {
  const merge = (cfg) => ({
    cardWidth: 320, cardHeight: 0, borderRadius: 12, photoSize: 80,
    photoShape: 'circle', qrSize: 140, nameFontSize: 16,
    detailsFontSize: 12, fontWeight: 700, primaryColor: '#2563eb', secondaryColor: '#1e40af',
    textColor: '#1f2937', cardBgColor: '#ffffff', ...cfg
  });

  const front = merge(frontConfig);
  const back = merge(backConfig);
  const fVis = { ...DEFAULT_VISIBILITY, ...(frontConfig.visibility || {}) };
  const bVis = { ...DEFAULT_VISIBILITY, ...(backConfig.visibility || {}) };

  const cardWidth = front.cardWidth;
  const commonHeight = Math.max(front.cardHeight || 0, back.cardHeight || 0);
  const gap = 16;
  const initials = getInitials(student.fullName);

  let frontDetails = '';
  if (fVis.fatherName) frontDetails += detailRowHtml('Father', student.fatherName, front.detailsFontSize, front.fontWeight, front.textColor);
  if (fVis.studentId) frontDetails += detailRowHtml('Student ID', student.studentId, front.detailsFontSize, front.fontWeight, front.textColor);
  if (fVis.class) frontDetails += detailRowHtml('Class', formatClassName(student.class), front.detailsFontSize, front.fontWeight, front.textColor);

  let backDetails = '';
  if (bVis.fatherPhone) backDetails += detailRowHtml('Phone', student.fatherPhone, back.detailsFontSize, back.fontWeight, back.textColor);
  if (bVis.schoolAddress) backDetails += detailRowHtml('Address', schoolInfo.address, back.detailsFontSize, back.fontWeight, back.textColor);

  const frontInner = `
    ${fVis.schoolLogo || fVis.schoolName ? frontHeaderHtml(schoolInfo.name, front.primaryColor, front.secondaryColor) : ''}
    <div style="padding:16px 20px;text-align:center;">
      ${fVis.studentPhoto ? photoHtml(initials, front.photoSize, front.photoShape) : ''}
      ${fVis.studentName ? `<h3 style="font-size:${front.nameFontSize}px;font-weight:${front.fontWeight};color:${front.textColor};margin:0;">${student.fullName}</h3>` : ''}
      ${frontDetails ? `<div style="margin-top:10px;text-align:left;display:inline-block;">${frontDetails}</div>` : ''}
    </div>`;

  const backInner = `
    ${backHeaderHtml(back.primaryColor, back.secondaryColor)}
    <div style="padding:20px 20px 12px;text-align:center;">
      ${bVis.qrCode ? qrPlaceholderHtml(back.qrSize) : ''}
      ${backDetails ? `<div style="margin-top:14px;text-align:left;display:inline-block;">${backDetails}</div>` : ''}
    </div>
    ${bVis.note ? backFooterHtml() : ''}`;

  const crop = cropMarksHtml();
  const cardWrap = (cfg, inner) => `
    <div style="width:${cardWidth}px;height:100%;min-height:${commonHeight || 220}px;border-radius:${cfg.borderRadius}px;overflow:hidden;background:${cfg.cardBgColor};border:1px solid #e5e7eb;">
      ${inner}
    </div>`;

  return `
    <div style="page-break-after:always;display:flex;justify-content:center;padding:15mm 0;">
      <div style="position:relative;">${crop}${cardWrap(front, frontInner)}</div>
      <div style="width:${gap}px;flex-shrink:0;"></div>
      <div style="position:relative;">${crop}${cardWrap(back, backInner)}</div>
    </div>`;
};

export default VerticalTemplate;
