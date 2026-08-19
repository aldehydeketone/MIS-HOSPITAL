import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const { getHeaders } = useContext(AuthContext);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/dashboard', {
        headers: getHeaders()
      });
      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.message || 'Failed to load stats');
      }
      setData(resData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '2rem' }}>Loading dashboard data...</div>;
  }

  if (error) {
    return <div className="form-error" style={{ margin: '2rem' }}>{error}</div>;
  }

  if (!data) return null;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-description">Welcome back! Review your operations for today.</p>
        </div>
      </div>

      {/* ADMIN DASHBOARD VIEW */}
      {data.role === 'admin' && (
        <>
          <div className="stats-grid">
            <div className="stat-card blue">
              <span className="stat-label">Total Patients</span>
              <span className="stat-value">{data.stats.totalPatients}</span>
            </div>
            <div className="stat-card green">
              <span className="stat-label">Total Doctors</span>
              <span className="stat-value">{data.stats.totalDoctors}</span>
            </div>
            <div className="stat-card orange">
              <span className="stat-label">Total Staff</span>
              <span className="stat-value">{data.stats.totalStaff}</span>
            </div>
            <div className="stat-card blue">
              <span className="stat-label">Total Appointments</span>
              <span className="stat-value">{data.stats.totalAppointments}</span>
            </div>
            <div className="stat-card green">
              <span className="stat-label">Admissions</span>
              <span className="stat-value">{data.stats.activeAdmissions}</span>
            </div>
          </div>

          <div className="card">
            <h3 className="card-title">Recent System Activity Logs</h3>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>User</th>
                    <th>Action</th>
                    <th>Entity Type</th>
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentActivities && data.recentActivities.length > 0 ? (
                    data.recentActivities.map((log) => (
                      <tr key={log.id}>
                        <td>{new Date(log.created_at).toLocaleString()}</td>
                        <td>{log.user_name || 'System'}</td>
                        <td>
                          <span className={`badge ${log.action.includes('UNAUTHORIZED') ? 'danger' : 'info'}`}>
                            {log.action}
                          </span>
                        </td>
                        <td>{log.entity_type || 'N/A'}</td>
                        <td>{log.details}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center' }}>No recent logs found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* DOCTOR DASHBOARD VIEW */}
      {data.role === 'doctor' && (
        <>
          <div className="stats-grid">
            <div className="stat-card blue">
              <span className="stat-label">My Patients</span>
              <span className="stat-value">{data.stats.assignedPatients}</span>
            </div>
            <div className="stat-card green">
              <span className="stat-label">Today's Appointments</span>
              <span className="stat-value">{data.stats.todayAppointments}</span>
            </div>
            <div className="stat-card orange">
              <span className="stat-label">Pending Appointments</span>
              <span className="stat-value">{data.stats.pendingAppointments}</span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '1.5rem' }}>
            <div className="card">
              <h3 className="card-title">Today's Appointments Schedule</h3>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Time</th>
                      <th>Patient</th>
                      <th>Type</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.appointments && data.appointments.length > 0 ? (
                      data.appointments.map((appt) => (
                        <tr key={appt.id}>
                          <td>{appt.appointment_time}</td>
                          <td>{appt.patient_name}</td>
                          <td>{appt.appointment_type}</td>
                          <td>
                            <span className={`badge ${appt.status === 'Completed' ? 'success' : appt.status === 'Pending' ? 'warning' : 'info'}`}>
                              {appt.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" style={{ textAlign: 'center' }}>No appointments scheduled for today.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="card">
              <h3 className="card-title">My Assigned Patients</h3>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Code</th>
                      <th>Name</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.patients && data.patients.length > 0 ? (
                      data.patients.map((pat) => (
                        <tr key={pat.id}>
                          <td>{pat.patient_code}</td>
                          <td>{pat.name}</td>
                          <td>
                            <span className={`badge ${pat.admission_status === 'Admitted' ? 'danger' : 'success'}`}>
                              {pat.admission_status}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="3" style={{ textAlign: 'center' }}>No patients assigned yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}

      {/* STAFF DASHBOARD VIEW */}
      {data.role === 'staff' && (
        <>
          <div className="stats-grid">
            <div className="stat-card blue">
              <span className="stat-label">Total Patient Directory</span>
              <span className="stat-value">{data.stats.totalPatients}</span>
            </div>
            <div className="stat-card green">
              <span className="stat-label">Today's Appointments</span>
              <span className="stat-value">{data.stats.todayAppointments}</span>
            </div>
            <div className="stat-card orange">
              <span className="stat-label">Active Admissions</span>
              <span className="stat-value">{data.stats.activeAdmissions}</span>
            </div>
          </div>

          <div className="card">
            <h3 className="card-title">Upcoming Appointments Calendar</h3>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Patient</th>
                    <th>Assigned Doctor</th>
                    <th>Type</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.upcomingAppointments && data.upcomingAppointments.length > 0 ? (
                    data.upcomingAppointments.map((appt) => (
                      <tr key={appt.id}>
                        <td>{new Date(appt.appointment_date).toLocaleDateString()}</td>
                        <td>{appt.appointment_time}</td>
                        <td>{appt.patient_name}</td>
                        <td>Dr. {appt.doctor_name}</td>
                        <td>{appt.appointment_type}</td>
                        <td>
                          <span className={`badge ${appt.status === 'Completed' ? 'success' : appt.status === 'Pending' ? 'warning' : 'info'}`}>
                            {appt.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center' }}>No upcoming appointments scheduled.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
