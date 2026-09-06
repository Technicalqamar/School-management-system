import { ApiError } from '../utils/apiError.js';

const validateDashboardQuery = (req, res, next) => {
  const { academicYear } = req.query;

  if (academicYear !== undefined && academicYear !== null && academicYear !== '') {
    const year = String(academicYear).trim();

    if (!/^\d{4}$/.test(year)) {
      throw new ApiError(400, 'Academic year must be a valid 4-digit year');
    }

    req.query.academicYear = year;
  } else {
    req.query.academicYear = '';
  }

  next();
};

export { validateDashboardQuery };