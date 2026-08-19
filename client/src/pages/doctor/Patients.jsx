import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import LoadingState from '../../components/common/LoadingState';
import StatusBadge from '../../components/common/StatusBadge';
import { patients as patientsApi } from '../../services/api';

export default function DoctorPatients() {
  const navigate = useNavigate();
  const [patientList, setPatientList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    patientsApi.getAll()
      .then((d) => setPatientList(d.patients))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout title="My Patients" subtitle="Patients currently assigned to you">
      {loading && <LoadingState message="Loading patient records..." />}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {!loading && !error && (
        <>
          <p className="text-sm text-gray-500 mb-4">{patientList.length} patient{patientList.length !== 1 ? 's' : ''} assigned</p>
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wide">Patient ID</th>
                    <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wide">Name</th>
                    <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wide">Age</th>
                    <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wide">Gender</th>
                    <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wide">Status</th>
                    <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {patientList.map((p) => (
                    <tr key={p.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                      <td className="px-4 py-2.5 font-mono text-xs text-gray-500">{p.patient_code}</td>
                      <td className="px-4 py-2.5 font-medium text-gray-900">
                        <button onClick={() => navigate(`/doctor/patients/${p.id}`)}
                          className="hover:underline text-left" style={{ color: '#3D7068' }}>
                          {p.name}
                        </button>
                      </td>
                      <td className="px-4 py-2.5 text-gray-600">{p.age}</td>
                      <td className="px-4 py-2.5 text-gray-600">{p.gender}</td>
                      <td className="px-4 py-2.5"><StatusBadge status={p.admission_status} /></td>
                      <td className="px-4 py-2.5">
                        <button
                          onClick={() => navigate(`/doctor/medical-records/${p.id}`)}
                          className="text-xs px-2 py-1 text-white rounded hover:opacity-90 transition-colors"
                          style={{ backgroundColor: '#3D7068' }}
                        >
                          Medical Records
                        </button>
                      </td>
                    </tr>
                  ))}
                  {patientList.length === 0 && (
                    <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400 text-sm">No patients assigned to you.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
