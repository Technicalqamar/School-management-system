import express from 'express';
import { createClass, getAllClasses, getClassDetails, updateClass, deleteClass } from '../controllers/class.controller.js';
import { validateCreateClass, validateUpdateClass } from '../validations/class.validation.js';
import { protect } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/role.middleware.js';

const router = express.Router();

router.get(
  '/',
  protect,
  authorize('admin'),
  getAllClasses,
);

router.get(
  '/:id/details',
  protect,
  authorize('admin'),
  getClassDetails,
);

router.post(
  '/',
  protect,
  authorize('admin'),
  validateCreateClass,
  createClass,
);

router.put(
  '/:id',
  protect,
  authorize('admin'),
  validateUpdateClass,
  updateClass,
);

router.delete(
  '/:id',
  protect,
  authorize('admin'),
  deleteClass,
);

export default router;
