import DashboardLayout from '../../components/layout/DashboardLayout';
import { formatDateTime } from '../../utils/formatters';

// Static billing demo - backend has no billing endpoint, using minimal frontend table
// In a real system, this would call /api/billing
const DEMO_BILLS = [
  { id: 'BILL-0001', patient_code: 'PAT-001', patient_name: 'John Doe', amount: '₹2,400', status: 'Paid', date: '2026-08-15' },
  { id: 'BILL-0002', patient_code: 'PAT-002', patient_name: 'Jane Smith', amount: '₹8,200', status: 'Pending', date: '2026-08-16' },
];

function StatusChip({ s }) {
  return (
    <span className={`text-xs px-2 py-0.5 rounded font-medium ${
      s === 'Paid' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
    }`}>{s}</span>
  );
}

export default function Billing() {
  return (
    <DashboardLayout title="Billing" subtitle="Patient billing summary">
      <div className="mb-4 px-4 py-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
        Demo data only. Billing API not implemented in this academic project scope.
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wide">Bill ID</th>
              <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wide">Patient ID</th>
              <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wide">Patient Name</th>
              <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wide">Amount</th>
              <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wide">Status</th>
              <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wide">Date</th>
            </tr>
          </thead>
          <tbody>
            {DEMO_BILLS.map((b) => (
              <tr key={b.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                <td className="px-4 py-2.5 font-mono text-xs text-gray-500">{b.id}</td>
                <td className="px-4 py-2.5 font-mono text-xs text-gray-500">{b.patient_code}</td>
                <td className="px-4 py-2.5 text-gray-900">{b.patient_name}</td>
                <td className="px-4 py-2.5 font-mono text-gray-900 font-medium">{b.amount}</td>
                <td className="px-4 py-2.5"><StatusChip s={b.status} /></td>
                <td className="px-4 py-2.5 font-mono text-xs text-gray-500">{b.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}
