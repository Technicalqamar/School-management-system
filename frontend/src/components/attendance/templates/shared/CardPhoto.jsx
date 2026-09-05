import { getInitials } from './cardHtmlUtils';

const shapeClasses = { circle: 'rounded-full', rounded: 'rounded-xl', square: 'rounded-none' };

const CardPhoto = ({ fullName, photoSize = 80, photoShape = 'circle' }) => (
  <div
    className={`${shapeClasses[photoShape] || shapeClasses.circle} bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold ring-2 ring-yellow-400 mb-3`}
    style={{ width: photoSize, height: photoSize, fontSize: Math.round(photoSize * 0.3) }}
  >
    {getInitials(fullName)}
  </div>
);

export default CardPhoto;
