import { asyncHandler } from '../utils/asyncHandler.js';
import feeDashboardService from '../services/feeDashboard.service.js';

const getFeeDashboard = asyncHandler(async (req, res) => {
  const result = await feeDashboardService.getDashboard({
    academicYear: req.query.academicYear,
  });

  return res.status(200).json({
    success: true,
    message: 'Fee dashboard fetched successfully',
    data: result,
  });
});

export { getFeeDashboard };