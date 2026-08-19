import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import ProtectedRoute from './auth/ProtectedRoute';

// Auth
import Login from './pages/auth/Login';

// Error pages
import AccessDenied from './pages/errors/AccessDenied';
import NotFound from './pages/errors/NotFound';

// Legal pages
import Privacy from './pages/legal/Privacy';
import Terms from './pages/legal/Terms';

// Admin pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminPatients from './pages/admin/Patients';
import AdminPatientDetails from './pages/admin/PatientDetails';
import AdminDoctors from './pages/admin/Doctors';
import AdminAppointments from './pages/admin/Appointments';
import AccessControl from './pages/admin/AccessControl';
import AuditLogs from './pages/admin/AuditLogs';

// Doctor pages
import DoctorDashboard from './pages/doctor/Dashboard';
import DoctorPatients from './pages/doctor/Patients';
import DoctorPatientDetails from './pages/doctor/PatientDetails';
import DoctorAppointments from './pages/admin/Appointments'; // reuse with doctor role
import DoctorMedicalRecords from './pages/doctor/MedicalRecords';

// Staff pages
import StaffDashboard from './pages/staff/Dashboard';
import StaffAppointments from './pages/staff/Appointments';
import StaffBilling from './pages/staff/Billing';
import StaffBeds from './pages/staff/Beds';

function AdminRoute({ children }) {
  return <ProtectedRoute allowedRoles={['admin']}>{children}</ProtectedRoute>;
}
function DoctorRoute({ children }) {
  return <ProtectedRoute allowedRoles={['doctor']}>{children}</ProtectedRoute>;
}
function StaffRoute({ children }) {
  return <ProtectedRoute allowedRoles={['staff']}>{children}</ProtectedRoute>;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/403" element={<AccessDenied />} />
          <Route path="/404" element={<NotFound />} />

          {/* Root redirect — goes to login if not logged in */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Admin routes */}
          <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/admin/patients" element={<AdminRoute><AdminPatients /></AdminRoute>} />
          <Route path="/admin/patients/:id" element={<AdminRoute><AdminPatientDetails /></AdminRoute>} />
          <Route path="/admin/doctors" element={<AdminRoute><AdminDoctors /></AdminRoute>} />
          <Route path="/admin/appointments" element={<AdminRoute><AdminAppointments /></AdminRoute>} />
          <Route path="/admin/access-control" element={<AdminRoute><AccessControl /></AdminRoute>} />
          <Route path="/admin/audit-logs" element={<AdminRoute><AuditLogs /></AdminRoute>} />

          {/* Doctor routes */}
          <Route path="/doctor/dashboard" element={<DoctorRoute><DoctorDashboard /></DoctorRoute>} />
          <Route path="/doctor/patients" element={<DoctorRoute><DoctorPatients /></DoctorRoute>} />
          <Route path="/doctor/patients/:id" element={<DoctorRoute><DoctorPatientDetails /></DoctorRoute>} />
          <Route path="/doctor/appointments" element={<DoctorRoute><DoctorAppointments /></DoctorRoute>} />
          <Route path="/doctor/medical-records/:patientId" element={<DoctorRoute><DoctorMedicalRecords /></DoctorRoute>} />

          {/* Staff routes */}
          <Route path="/staff/dashboard" element={<StaffRoute><StaffDashboard /></StaffRoute>} />
          <Route path="/staff/appointments" element={<StaffRoute><StaffAppointments /></StaffRoute>} />
          <Route path="/staff/billing" element={<StaffRoute><StaffBilling /></StaffRoute>} />
          <Route path="/staff/beds" element={<StaffRoute><StaffBeds /></StaffRoute>} />

          {/* Old /dashboard route for backward compat (Playwright tests use it) */}
          <Route path="/dashboard" element={
            <ProtectedRoute allowedRoles={['admin', 'doctor', 'staff']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />

          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
