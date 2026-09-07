import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SchoolConfigProvider, useSchoolConfig } from './contexts/SchoolConfigContext';
import { LoaderProvider } from './contexts/LoaderContext';
import SplashScreen from './components/common/SplashScreen/SplashScreen';
import FullPageLoader from './components/common/FullPageLoader/FullPageLoader';
import ProtectedRoute from './components/ProtectedRoute';
import { ADMIN_MODULES } from './constants/adminModules';

import AdminLoginPage from './pages/auth/AdminAuth/AdminLogin';
import AdminForgotPasswordPage from './pages/auth/AdminAuth/ForgotPassword';
import AdminVerifyOTPPage from './pages/auth/AdminAuth/VerifyOTP';
import AdminResetPasswordPage from './pages/auth/AdminAuth/ResetPassword';
import TeacherLoginPage from './pages/auth/TeacherAuth/TeacherLogin';
import StudentLoginPage from './pages/auth/StudentAuth/StudentLogin';
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import StudentDashboard from './pages/student/StudentDashboard';
import PortalAccess from './pages/portal/PortalAccess';
import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import StudentManagement from './pages/admin/StudentManagement';
import StudentProfilePage from './pages/admin/StudentProfile';
import TeacherManagement from './pages/admin/TeacherManagement';
import ClassManagement from './pages/admin/ClassManagement';
import SubjectManagement from './pages/admin/SubjectManagement';
import TimetableManagement from './pages/admin/TimetableManagement';
import AttendanceManagement from './pages/admin/AttendanceManagement';
import EventsHolidays from './pages/admin/EventsHolidays';
import FeeDashboardPage from './pages/admin/dashboards/FeeDashboard';
import FeeStructurePage from './pages/admin/FeeManagement/FeeStructure';
import CollectFeePage from './pages/admin/FeeManagement/CollectFee';
import StudentFeeDetailsPage from './pages/admin/FeeManagement/StudentFeeDetails';
import FeeReportsPage from './pages/admin/FeeManagement/Reports';
import OutstandingDuesPage from './pages/admin/FeeManagement/OutstandingDues';
import SchoolSettings from './pages/admin/SchoolSettings';
import ExaminationDashboardPage from './pages/admin/dashboards/ExaminationDashboard';
import ExamSetupPage from './pages/admin/ExamManagement/ExamSetup';
import SubjectMarksPage from './pages/admin/ExamManagement/SubjectMarks';
import ExamSchedulePage from './pages/admin/ExamManagement/ExamSchedule';
import MarksEntryPage from './pages/admin/ExamManagement/MarksEntry';
import ResultsPage from './pages/admin/ExamManagement/Results';
import ResultHistoryPage from './pages/admin/ExamManagement/ResultHistory';
import AllAccountsPage from './pages/admin/UserAccounts/AllAccounts';
import CreateAccountPage from './pages/admin/UserAccounts/CreateAccount';
import AccountAccessPage from './pages/admin/UserAccounts/AccountAccess';

function IndexRedirect() {
  const { user, role, loading: authLoading, DASHBOARD_ROUTES } = useAuth();
  const { loading: configLoading, preferences } = useSchoolConfig();

  if (authLoading) return null;
  if (!user || !role) return <Navigate to="/admin/login" replace />;

  if (role !== 'admin') {
    return <Navigate to={DASHBOARD_ROUTES[role] || '/admin/login'} replace />;
  }

  if (configLoading) return <FullPageLoader />;

  const landingPage = preferences?.defaultLandingPage;
  const route = ADMIN_MODULES[landingPage] || '/admin';
  return <Navigate to={route} replace />;
}
function AppContent() {
  const { loading: authLoading } = useAuth();
  const { loaded: configLoaded, login: loginConfig } = useSchoolConfig();
  const splashEnabled = configLoaded ? (loginConfig?.splashEnabled ?? true) : true;
  const loaderStyle = configLoaded ? (loginConfig?.loaderStyle || '') : '';

  const [splashTimerExpired, setSplashTimerExpired] = useState(false);

  useEffect(() => {
    if (authLoading || !splashEnabled) return;
    const resetId = setTimeout(() => setSplashTimerExpired(false), 0);
    const timerId = setTimeout(() => setSplashTimerExpired(true), 1200);
    return () => { clearTimeout(resetId); clearTimeout(timerId); };
  }, [authLoading, splashEnabled]);

  const splashVisible = authLoading || (splashEnabled && !splashTimerExpired);

  return (
    <>
      <SplashScreen visible={splashVisible} loaderStyle={loaderStyle} />
      <Toaster position="top-right" reverseOrder={false} />
      <Routes>
        <Route path="/login" element={<Navigate to="/admin/login" replace />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin/forgot-password" element={<AdminForgotPasswordPage />} />
        <Route path="/admin/verify-otp" element={<AdminVerifyOTPPage />} />
        <Route path="/admin/reset-password" element={<AdminResetPasswordPage />} />
        <Route path="/teacher/login" element={<TeacherLoginPage />} />
        <Route path="/student/login" element={<StudentLoginPage />} />

        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="students" element={<StudentManagement />} />
            <Route path="students/:studentId" element={<StudentProfilePage />} />
            <Route path="teachers" element={<TeacherManagement />} />
            <Route path="classes" element={<ClassManagement />} />
            <Route path="subjects" element={<SubjectManagement />} />
            <Route path="timetable" element={<TimetableManagement />} />
            <Route path="attendance" element={<AttendanceManagement />} />
            <Route path="events" element={<EventsHolidays />} />
            <Route path="fees/dashboard" element={<FeeDashboardPage />} />
            <Route path="fees/fee-structure" element={<FeeStructurePage />} />
            <Route path="fees/collect-fee" element={<CollectFeePage />} />
            <Route path="fees/student-fee-details" element={<StudentFeeDetailsPage />} />
            <Route path="fees/reports" element={<FeeReportsPage />} />
            <Route path="fees/outstanding-dues" element={<OutstandingDuesPage />} />
            <Route path="settings" element={<SchoolSettings />} />
            <Route path="exams/dashboard" element={<ExaminationDashboardPage />} />
            <Route path="exams/setup" element={<ExamSetupPage />} />
            <Route path="exams/subjects-marks" element={<SubjectMarksPage />} />
            <Route path="exams/schedule" element={<ExamSchedulePage />} />
            <Route path="exams/marks-entry" element={<MarksEntryPage />} />
            <Route path="exams/results" element={<ResultsPage />} />
            <Route path="exams/result-history" element={<ResultHistoryPage />} />
            <Route path="accounts/all" element={<AllAccountsPage />} />
            <Route path="accounts/create" element={<CreateAccountPage />} />
            <Route path="accounts/access" element={<AccountAccessPage />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['teacher']} />}>
          <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['student']} />}>
          <Route path="/student/dashboard" element={<StudentDashboard />} />
        </Route>

        <Route path="/portal/access" element={<PortalAccess />} />

        <Route path="/" element={<IndexRedirect />} />
        <Route path="*" element={<Navigate to="/admin/login" replace />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <SchoolConfigProvider>
        <LoaderProvider>
          <AppContent />
        </LoaderProvider>
      </SchoolConfigProvider>
    </AuthProvider>
  );
}

export default App;
