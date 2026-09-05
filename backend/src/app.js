import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes.js';
import profileRoutes from './routes/profile.routes.js';
import studentRoutes from './routes/student.routes.js';
import studentPromotionRoutes from './routes/studentPromotion.routes.js';
import securityLockRoutes from './routes/securityLock.routes.js';
import teacherRoutes from './routes/teacher.routes.js';
import classRoutes from './routes/class.routes.js';
import subjectRoutes from './routes/subject.routes.js';
import timetableRoutes from './routes/timetable.routes.js';
import timetableDesignRoutes from './routes/timetableDesign.routes.js';
import schoolSettingsRoutes from './routes/schoolSettings.routes.js';
import studentAttendanceRoutes from './routes/studentAttendance.routes.js';
import eventRoutes from './routes/event.routes.js';
import holidayRoutes from './routes/holiday.routes.js';
import eventGalleryRoutes from './routes/eventGallery.routes.js';
import { errorHandler } from './middlewares/error.middleware.js';

dotenv.config();

const app = express();

// Security headers (cross-origin to allow frontend on different port to load images)
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// CORS
app.use(cors());

// Response compression
app.use(compression());

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
});

app.use('/api/v1/auth', authLimiter, authRoutes);
app.use('/api/v1/profile', profileRoutes);
app.use('/api/v1/students', studentPromotionRoutes);
app.use('/api/v1/students', studentRoutes);
app.use('/api/v1/auth/security-lock', securityLockRoutes);
app.use('/api/v1/teachers', teacherRoutes);
app.use('/api/v1/classes', classRoutes);
app.use('/api/v1/subjects', subjectRoutes);
app.use('/api/v1/timetables', timetableRoutes);
app.use('/api/v1/timetable-design', timetableDesignRoutes);
app.use('/api/v1/school-settings', schoolSettingsRoutes);
app.use('/api/v1/student-attendance', studentAttendanceRoutes);
app.use('/api/v1/events', eventRoutes);
app.use('/api/v1/holidays', holidayRoutes);
app.use('/api/v1/event-gallery', eventGalleryRoutes);

// Health check
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Error handling middleware
app.use(errorHandler);

export default app;
