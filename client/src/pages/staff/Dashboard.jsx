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

export default function StaffDashboard() {
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
    <DashboardLayout title="Dashboard" subtitle="Operational overview">
      {loading && <LoadingState message="Loading dashboard data..." />}
      {error && <p className="text-sm text-red-600">{error}</p>}
      {data && (
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <StatCard label="Total Patients" value={data.stats.totalPatients} />
            <StatCard label="Today's Appointments" value={data.stats.todayAppointments} />
            <StatCard label="Active Admissions" value={data.stats.activeAdmissions} />
          </div>

          <div>
            <h2 className="text-sm font-semibold text-gray-700 mb-3">Upcoming Appointments</h2>
            {data.upcomingAppointments && data.upcomingAppointments.length > 0 ? (
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wide">Date</th>
                      <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wide">Time</th>
                      <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wide">Patient</th>
                      <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wide">Doctor</th>
                      <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wide">Type</th>
                      <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wide">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.upcomingAppointments.map((a) => (
                      <tr key={a.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                        <td className="px-4 py-2.5 font-mono text-xs text-gray-600">{String(a.appointment_date).slice(0, 10)}</td>
                        <td className="px-4 py-2.5 font-mono text-xs text-gray-600">{formatTime(a.appointment_time)}</td>
                        <td className="px-4 py-2.5 text-gray-900">{a.patient_name}</td>
                        <td className="px-4 py-2.5 text-gray-600">Dr. {a.doctor_name}</td>
                        <td className="px-4 py-2.5 text-gray-600">{a.appointment_type}</td>
                        <td className="px-4 py-2.5"><StatusBadge status={a.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-gray-400">No upcoming appointments.</p>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
