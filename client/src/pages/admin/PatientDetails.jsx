import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import LoadingState from '../../components/common/LoadingState';
import StatusBadge from '../../components/common/StatusBadge';
import SensitiveField from '../../components/privacy/SensitiveField';
import AccessAuditTag from '../../components/privacy/AccessAuditTag';
import { patients as patientsApi, medicalRecords as mrApi } from '../../services/api';
import { formatDateTime } from '../../utils/formatters';
import { useAuth } from '../../auth/AuthContext';

export default function PatientDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [patient, setPatient] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    patientsApi.getById(id)
      .then((d) => {
        setPatient(d.patient);
        // Load medical records for admin/doctor
        if (user.role !== 'staff') {
          return mrApi.getByPatient(id).then((r) => setRecords(r.records)).catch(() => {});
        }
      })
      .catch((e) => {
        if (e.status === 403) setAccessDenied(true);
        else setError(e.message);
      })
      .finally(() => setLoading(false));
  }, [id, user.role]);

  // Determine back path
  const backPath = user.role === 'admin' ? '/admin/patients' : '/doctor/patients';

  if (loading) return <DashboardLayout title="Patient Details"><LoadingState message="Loading patient..." /></DashboardLayout>;
  if (accessDenied) return <DashboardLayout title="Patient Details">
    <div className="text-center py-16">
      <p className="text-lg font-semibold text-gray-700 mb-2">Access Restricted</p>
      <p className="text-sm text-gray-500">You are not authorised to view this patient record.</p>
      <button onClick={() => navigate(-1)} className="mt-5 px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50">Go Back</button>
    </div>
  </DashboardLayout>;
  if (error) return <DashboardLayout title="Patient Details"><p className="text-sm text-red-600">{error}</p></DashboardLayout>;

  return (
    <DashboardLayout
      title={`Patient · ${patient.patient_code}`}
      subtitle={`${patient.name} — ${patient.gender}, ${patient.age} yrs`}
    >
      <button onClick={() => navigate(backPath)} className="text-sm text-gray-400 hover:text-gray-700 mb-5 flex items-center gap-1.5">
        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
        Back to Patients
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Demographics */}
        <div className="lg:col-span-1 bg-white rounded-lg border border-gray-200 p-5">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">Demographics</h2>
          <div className="space-y-3">
            <div>
              <span className="block text-xs font-medium text-gray-500 mb-1">Patient ID</span>
              <span className="text-sm font-mono text-gray-900">{patient.patient_code}</span>
            </div>
            <div>
              <span className="block text-xs font-medium text-gray-500 mb-1">Full Name</span>
              <span className="text-sm font-semibold text-gray-900">{patient.name}</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="block text-xs font-medium text-gray-500 mb-1">Age</span>
                <span className="text-sm text-gray-900">{patient.age}</span>
              </div>
              <div>
                <span className="block text-xs font-medium text-gray-500 mb-1">Gender</span>
                <span className="text-sm text-gray-900">{patient.gender}</span>
              </div>
            </div>
            <div>
              <span className="block text-xs font-medium text-gray-500 mb-1">Status</span>
              <StatusBadge status={patient.admission_status} />
            </div>
            <div>
              <span className="block text-xs font-medium text-gray-500 mb-1">Assigned Doctor</span>
              <span className="text-sm text-gray-900">{patient.doctor_name ? `Dr. ${patient.doctor_name}` : '—'}</span>
            </div>
            {patient.contact && <div>
              <span className="block text-xs font-medium text-gray-500 mb-1">Contact</span>
              <span className="text-sm text-gray-900">{patient.contact}</span>
            </div>}
            {patient.address && <div>
              <span className="block text-xs font-medium text-gray-500 mb-1">Address</span>
              <span className="text-sm text-gray-900">{patient.address}</span>
            </div>}
            <div>
              <span className="block text-xs font-medium text-gray-500 mb-1">Registered</span>
              <span className="text-xs font-mono text-gray-500">{formatDateTime(patient.created_at)}</span>
            </div>
          </div>
        </div>

        {/* Medical Records */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Medical Records</h2>
            {user.role === 'doctor' && (
              <button
                onClick={() => navigate(`/doctor/medical-records/${id}`)}
                className="text-xs font-semibold px-3 py-1.5 text-white rounded transition-colors hover:opacity-90"
                style={{ backgroundColor: '#3D7068' }}
              >
                + Add Record
              </button>
            )}
          </div>

          {user.role === 'staff' ? (
            <div className="py-8 text-center">
              <p className="text-sm text-gray-400">Medical records are restricted for your role.</p>
            </div>
          ) : records.length === 0 ? (
            <p className="text-sm text-gray-400">No medical records found for this patient.</p>
          ) : (
            <div className="space-y-4">
              {records.map((r) => (
                <div key={r.id} className="border border-gray-100 rounded-md p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <span className="text-xs font-mono text-gray-400">MR-{String(r.id).padStart(4, '0')}</span>
                      <span className="text-xs text-gray-400 ml-3">Dr. {r.doctor_name}</span>
                    </div>
                    <span className="text-xs font-mono text-gray-400">{formatDateTime(r.created_at)}</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <SensitiveField label="Diagnosis" value={r.diagnosis} />
                    <SensitiveField label="Prescription" value={r.prescription} />
                    {r.notes && <div className="md:col-span-2"><SensitiveField label="Clinical Notes" value={r.notes} /></div>}
                  </div>
                  <AccessAuditTag accessedBy={user.name} accessedAt={new Date().toISOString()} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
