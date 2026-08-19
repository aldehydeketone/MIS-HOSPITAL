import DashboardLayout from '../../components/layout/DashboardLayout';

const matrix = [
  { resource: 'Patient Directory', admin: 'Full Access', doctor: 'Assigned Only', staff: 'Basic View' },
  { resource: 'Patient Details', admin: 'Full Access', doctor: 'Assigned Only', staff: 'Basic Info' },
  { resource: 'Medical Records', admin: 'Full Access', doctor: 'Assigned Only', staff: 'Restricted' },
  { resource: 'Diagnosis / Prescription', admin: 'Full (Reveal)', doctor: 'Assigned (Reveal)', staff: 'Restricted' },
  { resource: 'Appointments', admin: 'Full CRUD', doctor: 'Own / Status Only', staff: 'Operational' },
  { resource: 'Doctor Management', admin: 'Full CRUD', doctor: 'View Only', staff: 'View Only' },
  { resource: 'Audit Logs', admin: 'Full Access', doctor: 'Restricted', staff: 'Restricted' },
  { resource: 'Access Control', admin: 'Full Access', doctor: 'Restricted', staff: 'Restricted' },
  { resource: 'Billing', admin: 'Restricted', doctor: 'Restricted', staff: 'Operational' },
  { resource: 'Bed Availability', admin: 'Restricted', doctor: 'Restricted', staff: 'View Only' },
];

function CellBadge({ text }) {
  const isRestricted = text === 'Restricted';
  const isFull = text.startsWith('Full');
  return (
    <span className={`text-xs px-2 py-0.5 rounded font-medium ${
      isRestricted ? 'bg-gray-100 text-gray-400' :
      isFull ? 'bg-green-50 text-green-700' :
      'bg-blue-50 text-blue-700'
    }`}>{text}</span>
  );
}

export default function AccessControl() {
  return (
    <DashboardLayout title="Access Control" subtitle="Role-based permission matrix for this system">
      <div className="mb-5 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800 font-medium mb-1">Role-Based Access Control (RBAC)</p>
        <p className="text-xs text-blue-700">
          All access restrictions are enforced server-side via JWT role validation.
          The frontend hides restricted navigation, but the backend enforces all permissions regardless of UI state.
          Unauthorised API access attempts are logged in Audit Logs.
        </p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide w-64">Resource</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-400 inline-block"></span> Admin
                </span>
              </th>
              <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-400 inline-block"></span> Doctor
                </span>
              </th>
              <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-green-400 inline-block"></span> Staff
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {matrix.map((row, i) => (
              <tr key={i} className={`border-b border-gray-50 last:border-0 ${i % 2 === 0 ? '' : 'bg-gray-50/40'}`}>
                <td className="px-5 py-3 font-medium text-gray-800">{row.resource}</td>
                <td className="px-5 py-3"><CellBadge text={row.admin} /></td>
                <td className="px-5 py-3"><CellBadge text={row.doctor} /></td>
                <td className="px-5 py-3"><CellBadge text={row.staff} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-4 text-xs text-gray-500">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="font-semibold text-gray-700 mb-1">Admin</p>
          <p>System-wide access. Can manage all entities. Sees all audit logs. Sensitive fields require manual reveal.</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="font-semibold text-gray-700 mb-1">Doctor</p>
          <p>Access limited to assigned patients only. Cross-patient access attempts are blocked and logged.</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="font-semibold text-gray-700 mb-1">Staff</p>
          <p>Operational access for scheduling and billing. Medical records and diagnoses are completely blocked at API level.</p>
        </div>
      </div>
    </DashboardLayout>
  );
}
