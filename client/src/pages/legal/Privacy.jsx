import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { roleRoutes } from '../../auth/rolePermissions';

export default function Privacy() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const back = user ? roleRoutes[user.role] : '/login';

  return (
    <div className="min-h-screen bg-[#F6F5F2] px-6 py-12 max-w-3xl mx-auto">
      <button onClick={() => navigate(back)} className="text-sm text-gray-400 hover:text-gray-700 mb-8 flex items-center gap-1.5">
        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
        Back to Dashboard
      </button>

      <h1 className="text-2xl font-semibold text-gray-900 mb-2">Privacy Policy</h1>
      <p className="text-xs text-gray-400 font-mono mb-8">Academic Project · Not a production healthcare platform</p>

      <div className="prose prose-sm max-w-none text-gray-700 space-y-5">
        <section>
          <h2 className="text-base font-semibold text-gray-800 mb-2">1. Purpose</h2>
          <p>This Hospital MIS is an academic demonstration project built to illustrate role-based access control, privacy-focused data management, and clinical information system concepts. It is not a production healthcare platform and must not be used with real patient data.</p>
        </section>
        <section>
          <h2 className="text-base font-semibold text-gray-800 mb-2">2. Data Used</h2>
          <p>All patient records, doctor profiles, and appointment data used in this system are entirely fictional and created solely for demonstration purposes. Any resemblance to real persons is coincidental.</p>
        </section>
        <section>
          <h2 className="text-base font-semibold text-gray-800 mb-2">3. Role-Based Access</h2>
          <p>This system implements role-based access control (RBAC) enforced server-side. Admin, Doctor, and Staff roles have different levels of access to patient information. Medical records and sensitive clinical data are restricted to authorised roles only.</p>
        </section>
        <section>
          <h2 className="text-base font-semibold text-gray-800 mb-2">4. Compliance Disclaimer</h2>
          <p>This system does not claim compliance with HIPAA, GDPR, or any other healthcare data regulation. It is an academic project and has not undergone regulatory assessment for production healthcare use.</p>
        </section>
        <section>
          <h2 className="text-base font-semibold text-gray-800 mb-2">5. Audit Logging</h2>
          <p>All access to patient records is logged in an audit trail. Unauthorised access attempts are specifically recorded with relevant details.</p>
        </section>
      </div>
    </div>
  );
}
