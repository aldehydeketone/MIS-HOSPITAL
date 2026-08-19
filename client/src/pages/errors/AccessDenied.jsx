import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { roleRoutes } from '../../auth/rolePermissions';

export default function AccessDenied() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const dashboardPath = user ? (roleRoutes[user.role] || '/login') : '/login';

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
      <div
        className="w-14 h-14 rounded-full flex items-center justify-center mb-5"
        style={{ backgroundColor: '#fdf2f2' }}
      >
        <svg width="24" height="24" fill="none" stroke="#B23A3A" strokeWidth="1.75" viewBox="0 0 24 24">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
      </div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-2">Access Restricted</h1>
      <p className="text-sm text-gray-500 mb-1 max-w-sm">
        Your current role does not have permission to access this resource.
      </p>
      <p className="text-xs text-gray-400 mb-8 max-w-xs">
        If you believe this is an error, contact your system administrator.
      </p>
      <button
        onClick={() => navigate(dashboardPath)}
        className="px-5 py-2.5 text-sm font-semibold text-white rounded-md transition-colors hover:opacity-90"
        style={{ backgroundColor: '#3D7068' }}
      >
        Return to Dashboard
      </button>
    </div>
  );
}
