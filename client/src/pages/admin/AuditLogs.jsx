import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import LoadingState from '../../components/common/LoadingState';
import { auditLogs as logsApi } from '../../services/api';
import { formatDateTime } from '../../utils/formatters';

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    logsApi.getAll()
      .then((d) => setLogs(d.logs))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout title="Audit Logs" subtitle="System-wide access and action log">
      {loading && <LoadingState message="Loading audit logs..." />}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {!loading && !error && (
        <>
          <p className="text-sm text-gray-500 mb-4">{logs.length} log entr{logs.length !== 1 ? 'ies' : 'y'}</p>
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wide">#</th>
                    <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wide">User</th>
                    <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wide">Action</th>
                    <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wide">Entity</th>
                    <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wide">Details</th>
                    <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wide">Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((l, idx) => {
                    const isUnauth = l.action?.includes('UNAUTHORIZED');
                    return (
                      <tr key={l.id} className={`border-b border-gray-50 last:border-0 hover:bg-gray-50/50 ${isUnauth ? 'bg-red-50/30' : ''}`}>
                        <td className="px-4 py-2.5 font-mono text-xs text-gray-400">{String(l.id).padStart(4, '0')}</td>
                        <td className="px-4 py-2.5 text-gray-700">{l.user_name || <span className="text-gray-400">System</span>}</td>
                        <td className="px-4 py-2.5">
                          <span className={`font-mono text-xs px-1.5 py-0.5 rounded ${isUnauth ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
                            {l.action}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 font-mono text-xs text-gray-500">
                          {l.entity_type}{l.entity_id ? `·${l.entity_id}` : ''}
                        </td>
                        <td className="px-4 py-2.5 text-gray-600 max-w-xs truncate text-xs">{l.details}</td>
                        <td className="px-4 py-2.5 font-mono text-xs text-gray-400">{formatDateTime(l.created_at)}</td>
                      </tr>
                    );
                  })}
                  {logs.length === 0 && (
                    <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400 text-sm">No audit entries found.</td></tr>
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
