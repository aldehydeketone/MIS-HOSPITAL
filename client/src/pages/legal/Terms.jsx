import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { roleRoutes } from '../../auth/rolePermissions';

export default function Terms() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const back = user ? roleRoutes[user.role] : '/login';

  return (
    <div className="min-h-screen bg-[#F6F5F2] px-6 py-12 max-w-3xl mx-auto">
      <button onClick={() => navigate(back)} className="text-sm text-gray-400 hover:text-gray-700 mb-8 flex items-center gap-1.5">
        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
        Back to Dashboard
      </button>

      <h1 className="text-2xl font-semibold text-gray-900 mb-2">Terms of Use</h1>
      <p className="text-xs text-gray-400 font-mono mb-8">Academic Project · Demo Only</p>

      <div className="prose prose-sm max-w-none text-gray-700 space-y-5">
        <section>
          <h2 className="text-base font-semibold text-gray-800 mb-2">1. Academic Use Only</h2>
          <p>This system is developed as a college project to demonstrate hospital management concepts. It must not be deployed in any real clinical environment or used with actual patient, doctor, or staff data.</p>
        </section>
        <section>
          <h2 className="text-base font-semibold text-gray-800 mb-2">2. Demo Credentials</h2>
          <p>Login credentials provided with this system are for demonstration and testing purposes only. Do not use real personal information or passwords.</p>
        </section>
        <section>
          <h2 className="text-base font-semibold text-gray-800 mb-2">3. No Liability</h2>
          <p>The developers of this system accept no liability for any use of this software outside the scope of an academic demonstration. This is not a certified or audited medical system.</p>
        </section>
        <section>
          <h2 className="text-base font-semibold text-gray-800 mb-2">4. Fictional Data</h2>
          <p>All patient names, medical records, doctor profiles, and clinical data in this system are entirely fictional. They are used solely to illustrate system functionality in an academic setting.</p>
        </section>
        <section>
          <h2 className="text-base font-semibold text-gray-800 mb-2">5. Role-Based Access</h2>
          <p>By using this system, you agree to operate only within the permissions granted by your assigned role. Attempts to access unauthorised resources are logged and constitute misuse of the system.</p>
        </section>
      </div>
    </div>
  );
}
