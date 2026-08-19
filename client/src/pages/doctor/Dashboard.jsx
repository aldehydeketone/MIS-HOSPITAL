import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import LoadingState from '../../components/common/LoadingState';
import StatusBadge from '../../components/common/StatusBadge';
import { dashboard as dashboardApi } from '../../services/api';
import { formatTime } from '../../utils/formatters';

function StatCard({ label, value }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 px-5 py-4">
      <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{label}</p>
      <p className="text-3xl font-semibold text-gray-900 mt-1">{value}</p>
    </div>
  );
}

export default function DoctorDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    dashboardApi.getStats()
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout title="Dashboard" subtitle="Your clinical summary">
      {loading && <LoadingState message="Loading dashboard data..." />}
      {error && <p className="text-sm text-red-600">{error}</p>}
      {data && (
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <StatCard label="My Patients" value={data.stats.assignedPatients} />
            <StatCard label="Today's Appointments" value={data.stats.todayAppointments} />
            <StatCard label="Pending Cases" value={data.stats.pendingAppointments} />
          </div>

          {/* Today's appointments */}
          <div>
            <h2 className="text-sm font-semibold text-gray-700 mb-3">Today's Appointments</h2>
            {data.appointments && data.appointments.length > 0 ? (
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wide">Time</th>
                      <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wide">Patient</th>
                      <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wide">Type</th>
                      <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wide">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.appointments.map((a) => (
                      <tr key={a.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                        <td className="px-4 py-2.5 font-mono text-xs text-gray-600">{formatTime(a.appointment_time)}</td>
                        <td className="px-4 py-2.5 text-gray-900">{a.patient_name}</td>
                        <td className="px-4 py-2.5 text-gray-600">{a.appointment_type}</td>
                        <td className="px-4 py-2.5"><StatusBadge status={a.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-gray-400">No appointments scheduled for today.</p>
            )}
          </div>

          {/* My patients */}
          <div>
            <h2 className="text-sm font-semibold text-gray-700 mb-3">My Recent Patients</h2>
            {data.patients && data.patients.length > 0 ? (
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wide">Patient ID</th>
                      <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wide">Name</th>
                      <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wide">Age</th>
                      <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wide">Gender</th>
                      <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wide">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.patients.map((p) => (
                      <tr key={p.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                        <td className="px-4 py-2.5 font-mono text-xs text-gray-500">{p.patient_code}</td>
                        <td className="px-4 py-2.5 font-medium text-gray-900">{p.name}</td>
                        <td className="px-4 py-2.5 text-gray-600">{p.age}</td>
                        <td className="px-4 py-2.5 text-gray-600">{p.gender}</td>
                        <td className="px-4 py-2.5"><StatusBadge status={p.admission_status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-gray-400">No patients assigned.</p>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
