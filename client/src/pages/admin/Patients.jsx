import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import LoadingState from '../../components/common/LoadingState';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import { patients as patientsApi, doctors as doctorsApi } from '../../services/api';

function PatientForm({ initial, doctors, onSubmit, onCancel, loading }) {
  const [form, setForm] = useState(initial || {
    patient_code: '', name: '', age: '', gender: 'Male', contact: '',
    address: '', admission_status: 'Outpatient', assigned_doctor_id: ''
  });

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Patient Code *</label>
          <input value={form.patient_code} onChange={(e) => set('patient_code', e.target.value)} required
            placeholder="PT-2291" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono focus:border-[var(--color-primary)] outline-none transition-colors" disabled={!!initial} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
          <input value={form.name} onChange={(e) => set('name', e.target.value)} required
            placeholder="Aarav Sharma" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-[var(--color-primary)] outline-none transition-colors" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Age *</label>
          <input type="number" min="0" max="150" value={form.age} onChange={(e) => set('age', e.target.value)} required
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-[var(--color-primary)] outline-none transition-colors" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Gender *</label>
          <select value={form.gender} onChange={(e) => set('gender', e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-[var(--color-primary)] outline-none transition-colors bg-white">
            <option>Male</option><option>Female</option><option>Other</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
          <input value={form.contact} onChange={(e) => set('contact', e.target.value)}
            placeholder="555-0101" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-[var(--color-primary)] outline-none transition-colors" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Admission Status</label>
          <select value={form.admission_status} onChange={(e) => set('admission_status', e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-[var(--color-primary)] outline-none transition-colors bg-white">
            <option>Outpatient</option><option>Admitted</option><option>Discharged</option>
          </select>
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Assigned Doctor</label>
          <select value={form.assigned_doctor_id} onChange={(e) => set('assigned_doctor_id', e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-[var(--color-primary)] outline-none transition-colors bg-white">
            <option value="">— Unassigned —</option>
            {doctors.map((d) => <option key={d.id} value={d.id}>Dr. {d.name} ({d.specialization})</option>)}
          </select>
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
          <textarea value={form.address} onChange={(e) => set('address', e.target.value)} rows={2}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-[var(--color-primary)] outline-none transition-colors resize-none" />
        </div>
      </div>
      <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
        <button type="submit" disabled={loading}
          className="px-4 py-2 text-sm font-semibold text-white rounded-lg shadow-sm disabled:opacity-60 transition-all hover:opacity-90"
          style={{ backgroundColor: 'var(--color-primary)' }}>
          {loading ? 'Saving...' : (initial ? 'Save Changes' : 'Create Patient')}
        </button>
      </div>
    </form>
  );
}

export default function AdminPatients() {
  const navigate = useNavigate();
  const [patientList, setPatientList] = useState([]);
  const [doctorList, setDoctorList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modal, setModal] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const load = () => {
    setLoading(true);
    Promise.all([patientsApi.getAll(), doctorsApi.getAll()])
      .then(([pd, dd]) => { setPatientList(pd.patients); setDoctorList(dd.doctors); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleCreate = async (form) => {
    setSaveError(''); setSaving(true);
    try {
      await patientsApi.create({ ...form, age: Number(form.age), assigned_doctor_id: form.assigned_doctor_id || null });
      setModal(null); load();
    } catch (e) { setSaveError(e.message); } finally { setSaving(false); }
  };

  const handleEdit = async (form) => {
    setSaveError(''); setSaving(true);
    try {
      await patientsApi.update(modal.patient.id, { ...form, age: Number(form.age), assigned_doctor_id: form.assigned_doctor_id || null });
      setModal(null); load();
    } catch (e) { setSaveError(e.message); } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setSaving(true);
    try { await patientsApi.delete(modal.patient.id); setModal(null); load(); }
    catch (e) { setSaveError(e.message); } finally { setSaving(false); }
  };

  return (
    <DashboardLayout title="Patients" subtitle="Manage patient records, admissions, and assignments">
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-gray-500 font-medium">{patientList.length} total patients</p>
        <button onClick={() => { setSaveError(''); setModal('create'); }}
          className="px-4 py-2 text-sm font-semibold text-white rounded-lg shadow-sm hover:opacity-90 transition-all flex items-center gap-2"
          style={{ backgroundColor: 'var(--color-primary)' }}>
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add Patient
        </button>
      </div>

      {loading && <LoadingState message="Loading patients..." />}
      {error && <p className="text-sm text-red-600 bg-red-50 p-4 rounded-lg">{error}</p>}

      {!loading && !error && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Patient ID</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Age/Gender</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Assigned Doctor</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {patientList.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-gray-500">{p.patient_code}</td>
                    <td className="px-6 py-4">
                      <button onClick={() => navigate(`/admin/patients/${p.id}`)}
                        className="font-medium hover:underline text-left" style={{ color: 'var(--color-primary)' }}>
                        {p.name}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-gray-700">{p.age}y, {p.gender}</td>
                    <td className="px-6 py-4 text-gray-600">{p.doctor_name ? `Dr. ${p.doctor_name}` : '—'}</td>
                    <td className="px-6 py-4"><StatusBadge status={p.admission_status} /></td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <button onClick={() => { setSaveError(''); setModal({ type: 'edit', patient: p }); }}
                          className="text-gray-500 hover:text-gray-900 text-sm font-medium transition-colors">
                          Edit
                        </button>
                        <button onClick={() => { setSaveError(''); setModal({ type: 'delete', patient: p }); }}
                          className="text-red-500 hover:text-red-700 text-sm font-medium transition-colors">
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {patientList.length === 0 && (
                  <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-400">No patients found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals... */}
      {modal === 'create' && (
        <Modal title="Add New Patient" onClose={() => setModal(null)}>
          {saveError && <p className="text-sm text-red-600 mb-4 bg-red-50 p-3 rounded-md">{saveError}</p>}
          <PatientForm doctors={doctorList} onSubmit={handleCreate} onCancel={() => setModal(null)} loading={saving} />
        </Modal>
      )}

      {modal?.type === 'edit' && (
        <Modal title="Edit Patient Record" onClose={() => setModal(null)}>
          {saveError && <p className="text-sm text-red-600 mb-4 bg-red-50 p-3 rounded-md">{saveError}</p>}
          <PatientForm
            initial={{ ...modal.patient, assigned_doctor_id: modal.patient.assigned_doctor_id || '' }}
            doctors={doctorList}
            onSubmit={handleEdit}
            onCancel={() => setModal(null)}
            loading={saving}
          />
        </Modal>
      )}

      {modal?.type === 'delete' && (
        <Modal title="Confirm Deletion" onClose={() => setModal(null)}>
          <div className="mb-6">
            <p className="text-gray-800 font-medium mb-1">
              Delete patient <strong>{modal.patient.name}</strong> ({modal.patient.patient_code})?
            </p>
            <p className="text-sm text-gray-500">This action cannot be undone and will permanently remove all associated medical records and appointments.</p>
          </div>
          {saveError && <p className="text-sm text-red-600 mb-4 bg-red-50 p-3 rounded-md">{saveError}</p>}
          <div className="flex justify-end gap-3">
            <button onClick={() => setModal(null)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
            <button onClick={handleDelete} disabled={saving}
              className="px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm disabled:opacity-60 transition-all">
              {saving ? 'Deleting...' : 'Delete Patient'}
            </button>
          </div>
        </Modal>
      )}
    </DashboardLayout>
  );
}
