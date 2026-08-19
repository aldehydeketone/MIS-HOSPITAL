const configs = {
  Scheduled: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  Completed: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  Cancelled: { bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-200' },
  Pending: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  Admitted: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  Outpatient: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
  Discharged: { bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-200' },
  Stable: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  Critical: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  Available: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  Occupied: { bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-200' },
};

export default function StatusBadge({ status }) {
  const c = configs[status] || { bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-200' };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${c.bg} ${c.text} ${c.border}`}>
      {status}
    </span>
  );
}
