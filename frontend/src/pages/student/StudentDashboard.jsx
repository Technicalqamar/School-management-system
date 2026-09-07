import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/common/Button/Button';

const StudentDashboard = ({ portalContext }) => {
  const { user, logout } = useAuth();

  const isAdminPortalAccess = !!portalContext;
  const displayUser = isAdminPortalAccess ? portalContext.user : user;

  const handleLogout = async () => {
    if (isAdminPortalAccess) {
      await portalContext.onExit();
      return;
    }
    await logout();
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Student Dashboard</h1>
        <Button onClick={handleLogout} className="w-auto" variant={isAdminPortalAccess ? 'secondary' : 'danger'}>
          {isAdminPortalAccess ? 'Exit Portal' : 'Logout'}
        </Button>
      </div>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow dark:shadow-none">
        <p className="text-lg text-gray-900 dark:text-white">
          Welcome, <span className="font-semibold">{displayUser?.fullName}</span> (Student)
        </p>
        <p className="text-gray-600 dark:text-gray-400">Student ID: {displayUser?.studentId}</p>
      </div>
    </div>
  );
};

export default StudentDashboard;