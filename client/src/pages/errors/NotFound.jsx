import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { roleRoutes } from '../../auth/rolePermissions';

export default function NotFound() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const dashboardPath = user ? (roleRoutes[user.role] || '/login') : '/login';

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#F6F5F2] text-center px-6">
      <p className="text-6xl font-mono font-medium text-gray-200 mb-4">404</p>
      <h1 className="text-xl font-semibold text-gray-900 mb-2">Page Not Found</h1>
      <p className="text-sm text-gray-500 mb-8">The page you requested does not exist.</p>
      <button
        onClick={() => navigate(dashboardPath)}
        className="px-5 py-2.5 text-sm font-semibold text-white rounded-md hover:opacity-90 transition-colors"
        style={{ backgroundColor: '#3D7068' }}
      >
        Return to Dashboard
      </button>
    </div>
  );
}
