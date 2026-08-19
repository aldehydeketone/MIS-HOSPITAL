import DashboardLayout from '../../components/layout/DashboardLayout';

// Static bed availability demo - no backend endpoint
const BEDS = [
  { id: 'B-101', ward: 'General Ward', status: 'Available', patient: null },
  { id: 'B-102', ward: 'General Ward', status: 'Occupied', patient: 'PAT-001' },
  { id: 'B-103', ward: 'General Ward', status: 'Available', patient: null },
  { id: 'B-201', ward: 'ICU', status: 'Occupied', patient: 'PAT-002' },
  { id: 'B-202', ward: 'ICU', status: 'Available', patient: null },
  { id: 'B-301', ward: 'Paediatric Ward', status: 'Available', patient: null },
  { id: 'B-302', ward: 'Paediatric Ward', status: 'Available', patient: null },
];

export default function Beds() {
  const available = BEDS.filter((b) => b.status === 'Available').length;

  return (
    <DashboardLayout title="Bed Availability" subtitle="Current ward and bed occupancy">
      <div className="mb-4 px-4 py-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
        Demo data only. Bed management API not implemented in this academic project scope.
      </div>

      <div className="flex gap-4 mb-5">
        <div className="bg-white rounded-lg border border-gray-200 px-5 py-4">
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Total Beds</p>
          <p className="text-3xl font-semibold text-gray-900 mt-1">{BEDS.length}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 px-5 py-4">
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Available</p>
          <p className="text-3xl font-semibold mt-1" style={{ color: '#3B7A4E' }}>{available}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 px-5 py-4">
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Occupied</p>
          <p className="text-3xl font-semibold text-gray-900 mt-1">{BEDS.length - available}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wide">Bed ID</th>
              <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wide">Ward</th>
              <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wide">Status</th>
              <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wide">Patient</th>
            </tr>
          </thead>
          <tbody>
            {BEDS.map((b) => (
              <tr key={b.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                <td className="px-4 py-2.5 font-mono text-xs font-medium text-gray-700">{b.id}</td>
                <td className="px-4 py-2.5 text-gray-600">{b.ward}</td>
                <td className="px-4 py-2.5">
                  <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                    b.status === 'Available'
                      ? 'bg-green-50 text-green-700 border border-green-200'
                      : 'bg-gray-100 text-gray-600 border border-gray-200'
                  }`}>{b.status}</span>
                </td>
                <td className="px-4 py-2.5 font-mono text-xs text-gray-500">{b.patient || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}
