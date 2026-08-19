import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import LoadingState from '../../components/common/LoadingState';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import { appointments as aptApi, patients as patientsApi, doctors as doctorsApi } from '../../services/api';
import { formatDateTime, formatTime } from '../../utils/formatters';
import { useAuth } from '../../auth/AuthContext';

function AppointmentForm({ patients, doctors, onSubmit, onCancel, loading }) {
  const [form, setForm] = useState({
    patient_id: '', doctor_id: '', appointment_date: '', appointment_time: '', appointment_type: 'Consultation', status: 'Scheduled'
  });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }}>
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="block text-xs font-medium text-gray-700 mb-1">Patient <span className="text-red-500">*</span></label>
          <select value={form.patient_id} onChange={(e) => set('patient_id', e.target.value)} required
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-1">
            <option value="">— Select Patient —</option>
            {patients.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.patient_code})</option>)}
          </select>
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-medium text-gray-700 mb-1">Doctor <span className="text-red-500">*</span></label>
          <select value={form.doctor_id} onChange={(e) => set('doctor_id', e.target.value)} required
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-1">
            <option value="">— Select Doctor —</option>
            {doctors.map((d) => <option key={d.id} value={d.id}>Dr. {d.name} ({d.specialization})</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Date <span className="text-red-500">*</span></label>
          <input type="date" value={form.appointment_date} onChange={(e) => set('appointment_date', e.target.value)} required
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Time <span className="text-red-500">*</span></label>
          <input type="time" value={form.appointment_time} onChange={(e) => set('appointment_time', e.target.value)} required
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Type <span className="text-red-500">*</span></label>
          <select value={form.appointment_type} onChange={(e) => set('appointment_type', e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-1">
            <option>Consultation</option><option>Follow-up</option><option>Checkup</option><option>Emergency</option><option>Procedure</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
          <select value={form.status} onChange={(e) => set('status', e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-1">
            <option>Scheduled</option><option>Pending</option>
          </select>
        </div>
      </div>
      <div className="flex justify-end gap-3 mt-5">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50">Cancel</button>
        <button type="submit" disabled={loading} className="px-4 py-2 text-sm font-semibold text-white rounded-md disabled:opacity-60" style={{ backgroundColor: '#3D7068' }}>
          {loading ? 'Scheduling...' : 'Schedule Appointment'}
        </button>
      </div>
    </form>
  );
}

export default function AdminAppointments() {
  const { user } = useAuth();
  const [apts, setApts] = useState([]);
  const [patients, setPatients] = useState([]);
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modal, setModal] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [statusUpdate, setStatusUpdate] = useState({});

  const load = () => {
    setLoading(true);
    const base = [aptApi.getAll()];
    if (user.role !== 'doctor') base.push(patientsApi.getAll(), doctorsApi.getAll());
    Promise.all(base)
      .then(([ad, pd, dd]) => {
        setApts(ad.appointments);
        if (pd) setPatients(pd.patients);
        if (dd) setDocs(dd.doctors);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleCreate = async (form) => {
    setSaveError(''); setSaving(true);
    try {
      await aptApi.create({ ...form, patient_id: Number(form.patient_id), doctor_id: Number(form.doctor_id) });
      setModal(null); load();
    } catch (e) { setSaveError(e.message); } finally { setSaving(false); }
  };

  const handleStatusUpdate = async (apt) => {
    const newStatus = statusUpdate[apt.id];
    if (!newStatus) return;
    setSaving(true);
    try { await aptApi.update(apt.id, { status: newStatus }); load(); }
    catch (e) { alert(e.message); } finally { setSaving(false); }
  };

  const isAdmin = user.role === 'admin';
  const isStaff = user.role === 'staff';
  const canCreate = isAdmin || isStaff;

  const title = isAdmin ? 'Appointments' : (isStaff ? 'Appointments' : 'My Appointments');

  return (
    <DashboardLayout title={title} subtitle="Appointment schedule and status management">
      {canCreate && (
        <div className="flex justify-end mb-4">
          <button id="btn-schedule-appointment" onClick={() => { setSaveError(''); setModal('create'); }}
            className="px-4 py-2 text-sm font-semibold text-white rounded-md hover:opacity-90" style={{ backgroundColor: '#3D7068' }}>
            + Schedule Appointment
          </button>
        </div>
      )}

      {loading && <LoadingState message="Loading appointments..." />}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {!loading && !error && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wide">ID</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wide">Date</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wide">Time</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wide">Patient</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wide">Doctor</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wide">Type</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wide">Status</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wide">Update</th>
                </tr>
              </thead>
              <tbody>
                {apts.map((a) => (
                  <tr key={a.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                    <td className="px-4 py-2.5 font-mono text-xs text-gray-400">APT-{String(a.id).padStart(4, '0')}</td>
                    <td className="px-4 py-2.5 font-mono text-xs text-gray-600">{a.appointment_date ? String(a.appointment_date).slice(0, 10) : '—'}</td>
                    <td className="px-4 py-2.5 font-mono text-xs text-gray-600">{formatTime(a.appointment_time)}</td>
                    <td className="px-4 py-2.5 text-gray-900">{a.patient_name}</td>
                    <td className="px-4 py-2.5 text-gray-600">Dr. {a.doctor_name}</td>
                    <td className="px-4 py-2.5 text-gray-600">{a.appointment_type}</td>
                    <td className="px-4 py-2.5"><StatusBadge status={a.status} /></td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <select
                          value={statusUpdate[a.id] || a.status}
                          onChange={(e) => setStatusUpdate((s) => ({ ...s, [a.id]: e.target.value }))}
                          className="border border-gray-200 rounded text-xs px-2 py-1 bg-white"
                        >
                          <option value="Scheduled">Scheduled</option>
                          <option value="Pending">Pending</option>
                          <option value="Completed">Completed</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                        <button
                          onClick={() => handleStatusUpdate(a)}
                          disabled={saving}
                          className="text-xs px-2 py-1 text-white rounded disabled:opacity-60"
                          style={{ backgroundColor: '#3D7068' }}
                        >
                          Save
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {apts.length === 0 && (
                  <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-400 text-sm">No appointments found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {modal === 'create' && (
        <Modal title="Schedule New Appointment" onClose={() => setModal(null)}>
          {saveError && <p className="text-sm text-red-600 mb-3">{saveError}</p>}
          <AppointmentForm patients={patients} doctors={docs} onSubmit={handleCreate} onCancel={() => setModal(null)} loading={saving} />
        </Modal>
      )}
    </DashboardLayout>
  );
}
