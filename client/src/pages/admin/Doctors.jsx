import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import LoadingState from '../../components/common/LoadingState';
import Modal from '../../components/common/Modal';
import { doctors as doctorsApi } from '../../services/api';

function DoctorForm({ initial, onSubmit, onCancel, loading }) {
  const [form, setForm] = useState(initial || {
    email: '', password: '', name: '', specialization: '', department: '', contact: '', availability: ''
  });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }}>
      {!initial && (
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
            <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} required
              placeholder="doctor@hospital.test" className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Password <span className="text-red-500">*</span></label>
            <input type="password" value={form.password} onChange={(e) => set('password', e.target.value)} required
              placeholder="Min 8 characters" className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1" />
          </div>
        </div>
      )}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Doctor Name <span className="text-red-500">*</span></label>
          <input value={form.name} onChange={(e) => set('name', e.target.value)} required
            placeholder="Ananya Mehta" className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Specialization <span className="text-red-500">*</span></label>
          <input value={form.specialization} onChange={(e) => set('specialization', e.target.value)} required
            placeholder="Cardiology" className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Department <span className="text-red-500">*</span></label>
          <input value={form.department} onChange={(e) => set('department', e.target.value)} required
            placeholder="Cardiovascular Sciences" className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Contact</label>
          <input value={form.contact} onChange={(e) => set('contact', e.target.value)}
            placeholder="555-0101" className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1" />
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-medium text-gray-700 mb-1">Availability</label>
          <input value={form.availability} onChange={(e) => set('availability', e.target.value)}
            placeholder="Mon-Wed-Fri 9AM-4PM" className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1" />
        </div>
      </div>
      <div className="flex justify-end gap-3 mt-5">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50">Cancel</button>
        <button type="submit" disabled={loading} className="px-4 py-2 text-sm font-semibold text-white rounded-md disabled:opacity-60" style={{ backgroundColor: '#3D7068' }}>
          {loading ? 'Saving...' : (initial ? 'Save Changes' : 'Register Doctor')}
        </button>
      </div>
    </form>
  );
}

export default function AdminDoctors() {
  const [doctorList, setDoctorList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modal, setModal] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const load = () => {
    setLoading(true);
    doctorsApi.getAll().then((d) => setDoctorList(d.doctors)).catch((e) => setError(e.message)).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleCreate = async (form) => {
    setSaveError(''); setSaving(true);
    try { await doctorsApi.create(form); setModal(null); load(); }
    catch (e) { setSaveError(e.message); } finally { setSaving(false); }
  };

  const handleEdit = async (form) => {
    setSaveError(''); setSaving(true);
    try { await doctorsApi.update(modal.doctor.id, form); setModal(null); load(); }
    catch (e) { setSaveError(e.message); } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setSaving(true);
    try { await doctorsApi.delete(modal.doctor.id); setModal(null); load(); }
    catch (e) { setSaveError(e.message); } finally { setSaving(false); }
  };

  return (
    <DashboardLayout title="Doctors" subtitle="Registered medical staff and specialisations">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500">{doctorList.length} doctor{doctorList.length !== 1 ? 's' : ''}</p>
        <button id="btn-add-doctor" onClick={() => { setSaveError(''); setModal('create'); }}
          className="px-4 py-2 text-sm font-semibold text-white rounded-md hover:opacity-90 transition-colors"
          style={{ backgroundColor: '#3D7068' }}>
          + Add Doctor
        </button>
      </div>

      {loading && <LoadingState message="Loading doctors..." />}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {!loading && !error && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wide">Doctor ID</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wide">Name</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wide">Specialization</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wide">Department</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wide">Availability</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody>
              {doctorList.map((d) => (
                <tr key={d.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                  <td className="px-4 py-2.5 font-mono text-xs text-gray-500">DR-{String(d.id).padStart(4, '0')}</td>
                  <td className="px-4 py-2.5 font-medium text-gray-900">Dr. {d.name}</td>
                  <td className="px-4 py-2.5 text-gray-600">{d.specialization}</td>
                  <td className="px-4 py-2.5 text-gray-600">{d.department}</td>
                  <td className="px-4 py-2.5 text-gray-500 text-xs">{d.availability || '—'}</td>
                  <td className="px-4 py-2.5">
                    <div className="flex gap-2">
                      <button onClick={() => { setSaveError(''); setModal({ type: 'edit', doctor: d }); }}
                        className="text-xs text-gray-500 hover:text-gray-900 border border-gray-200 px-2 py-1 rounded hover:bg-gray-50">Edit</button>
                      <button onClick={() => { setSaveError(''); setModal({ type: 'delete', doctor: d }); }}
                        className="text-xs text-red-500 hover:text-red-700 border border-red-100 px-2 py-1 rounded hover:bg-red-50">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
              {doctorList.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400 text-sm">No doctors registered.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {modal === 'create' && (
        <Modal title="Register New Doctor" onClose={() => setModal(null)}>
          {saveError && <p className="text-sm text-red-600 mb-3">{saveError}</p>}
          <DoctorForm onSubmit={handleCreate} onCancel={() => setModal(null)} loading={saving} />
        </Modal>
      )}
      {modal?.type === 'edit' && (
        <Modal title="Edit Doctor Profile" onClose={() => setModal(null)}>
          {saveError && <p className="text-sm text-red-600 mb-3">{saveError}</p>}
          <DoctorForm initial={modal.doctor} onSubmit={handleEdit} onCancel={() => setModal(null)} loading={saving} />
        </Modal>
      )}
      {modal?.type === 'delete' && (
        <Modal title="Delete Doctor" onClose={() => setModal(null)}>
          <p className="text-sm text-gray-700 mb-1">Remove <strong>Dr. {modal.doctor.name}</strong> from the system?</p>
          <p className="text-xs text-gray-400 mb-5">Their login account and profile will be permanently deleted.</p>
          {saveError && <p className="text-sm text-red-600 mb-3">{saveError}</p>}
          <div className="flex justify-end gap-3">
            <button onClick={() => setModal(null)} className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50">Cancel</button>
            <button onClick={handleDelete} disabled={saving}
              className="px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-md disabled:opacity-60">
              {saving ? 'Deleting...' : 'Delete Doctor'}
            </button>
          </div>
        </Modal>
      )}
    </DashboardLayout>
  );
}
