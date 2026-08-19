import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const { getHeaders } = useContext(AuthContext);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/logs', {
        headers: getHeaders()
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to load logs');
      setLogs(data.logs);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={{ padding: '2rem' }}>Loading system logs...</div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Security & Audit Logs</h1>
          <p className="page-description">Hospital compliance record and database access audits.</p>
        </div>
      </div>

      {error && <div className="form-error">{error}</div>}

      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Author ID</th>
                <th>User Identity</th>
                <th>Role</th>
                <th>Action Type</th>
                <th>Target Table</th>
                <th>Target ID</th>
                <th>Compliance Details</th>
              </tr>
            </thead>
            <tbody>
              {logs.length > 0 ? (
                logs.map((log) => (
                  <tr key={log.id}>
                    <td>{new Date(log.created_at).toLocaleString()}</td>
                    <td><strong>{log.user_id || 'SYSTEM'}</strong></td>
                    <td>{log.user_name || 'System Auto'} ({log.user_email || 'N/A'})</td>
                    <td>
                      <span className="badge info">{log.user_role || 'System'}</span>
                    </td>
                    <td>
                      <span className={`badge ${log.action.includes('UNAUTHORIZED') ? 'danger' : 'success'}`}>
                        {log.action}
                      </span>
                    </td>
                    <td>{log.entity_type || 'N/A'}</td>
                    <td>{log.entity_id || 'N/A'}</td>
                    <td>{log.details}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center' }}>No audit logs recorded.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AuditLogs;
