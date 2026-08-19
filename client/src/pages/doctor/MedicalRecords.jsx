import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import LoadingState from '../../components/common/LoadingState';
import SensitiveField from '../../components/privacy/SensitiveField';
import AccessAuditTag from '../../components/privacy/AccessAuditTag';
import Modal from '../../components/common/Modal';
import { medicalRecords as mrApi, patients as patientsApi } from '../../services/api';
import { formatDateTime } from '../../utils/formatters';
import { useAuth } from '../../auth/AuthContext';

function AddRecordForm({ patientId, onSuccess, onCancel }) {
  const [form, setForm] = useState({ diagnosis: '', prescription: '', notes: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSaving(true);
    try {
      await mrApi.create({ patient_id: Number(patientId), ...form });
      onSuccess();
    } catch (e) { setError(e.message); } finally { setSaving(false); }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Diagnosis <span className="text-red-500">*</span></label>
          <input value={form.diagnosis} onChange={(e) => set('diagnosis', e.target.value)} required
            placeholder="e.g. Mild Hypertension" className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Prescription <span className="text-red-500">*</span></label>
          <input value={form.prescription} onChange={(e) => set('prescription', e.target.value)} required
            placeholder="e.g. Amlodipine 5mg once daily" className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Clinical Notes</label>
          <textarea value={form.notes} onChange={(e) => set('notes', e.target.value)} rows={3}
            placeholder="Internal treatment notes..." className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 resize-none" />
        </div>
      </div>
      <div className="flex justify-end gap-3 mt-5">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50">Cancel</button>
        <button type="submit" disabled={saving} className="px-4 py-2 text-sm font-semibold text-white rounded-md disabled:opacity-60" style={{ backgroundColor: '#3D7068' }}>
          {saving ? 'Publishing...' : 'Publish Entry'}
        </button>
      </div>
    </form>
  );
}

export default function MedicalRecords() {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [forbidden, setForbidden] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const loadRecords = () => {
    setLoading(true);
    Promise.all([
      mrApi.getByPatient(patientId),
      patientsApi.getById(patientId),
    ])
      .then(([rd, pd]) => {
        setRecords(rd.records);
        setPatient(pd.patient);
      })
      .catch((e) => {
        if (e.status === 403) setForbidden(true);
        else setError(e.message);
      })
      .finally(() => setLoading(false));
  };

  useEffect(loadRecords, [patientId]);

  const backPath = user.role === 'doctor' ? '/doctor/patients' : '/admin/patients';

  if (loading) return <DashboardLayout title="Medical Records"><LoadingState message="Loading records..." /></DashboardLayout>;

  if (forbidden) return (
    <DashboardLayout title="Medical Records">
      <div className="text-center py-16">
        <p className="text-lg font-semibold text-gray-700 mb-2">Access Restricted</p>
        <p className="text-sm text-gray-500">You are not authorised to view medical records for this patient.</p>
        <button onClick={() => navigate(backPath)} className="mt-5 px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50">Go Back</button>
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout
      title={`Medical Records${patient ? ` · ${patient.patient_code}` : ''}`}
      subtitle={patient ? `${patient.name} — ${patient.gender}, ${patient.age} yrs` : ''}
    >
      <button onClick={() => navigate(backPath)} className="text-sm text-gray-400 hover:text-gray-700 mb-5 flex items-center gap-1.5">
        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
        Back to Patients
      </button>

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500">{records.length} record{records.length !== 1 ? 's' : ''}</p>
        {user.role === 'doctor' && (
          <button id="btn-add-record" onClick={() => setShowAddModal(true)}
            className="px-4 py-2 text-sm font-semibold text-white rounded-md hover:opacity-90" style={{ backgroundColor: '#3D7068' }}>
            + Add Diagnostic Entry
          </button>
        )}
      </div>

      {records.length === 0 ? (
        <p className="text-sm text-gray-400">No medical records found.</p>
      ) : (
        <div className="space-y-4">
          {records.map((r) => (
            <div key={r.id} className="bg-white rounded-lg border border-gray-200 p-5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span className="font-mono text-xs text-gray-400">MR-{String(r.id).padStart(4, '0')}</span>
                  <span className="text-xs text-gray-500 ml-3">by Dr. {r.doctor_name}</span>
                </div>
                <span className="font-mono text-xs text-gray-400">{formatDateTime(r.created_at)}</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SensitiveField label="Diagnosis" value={r.diagnosis} />
                <SensitiveField label="Prescription" value={r.prescription} />
                {r.notes && (
                  <div className="md:col-span-2">
                    <SensitiveField label="Clinical Notes" value={r.notes} />
                  </div>
                )}
              </div>
              <AccessAuditTag accessedBy={user.name} accessedAt={new Date().toISOString()} />
            </div>
          ))}
        </div>
      )}

      {showAddModal && (
        <Modal title="Add Diagnostic Entry" onClose={() => setShowAddModal(false)}>
          <AddRecordForm
            patientId={patientId}
            onSuccess={() => { setShowAddModal(false); loadRecords(); }}
            onCancel={() => setShowAddModal(false)}
          />
        </Modal>
      )}
    </DashboardLayout>
  );
}
