import express from 'express';
import { getFeeDashboard } from '../controllers/feeDashboard.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/role.middleware.js';
import { validateDashboardQuery } from '../validations/feeDashboard.validation.js';

const router = express.Router();

router.get(
  '/',
  protect,
  authorize('admin'),
  validateDashboardQuery,
  getFeeDashboard,
);

export default router;