import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [currentAppt, setCurrentAppt] = useState(null);

  // Scheduling Form states
  const [patientId, setPatientId] = useState('');
  const [doctorId, setDoctorId] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [type, setType] = useState('Consultation');
  const [status, setStatus] = useState('Scheduled');

  const { user, getHeaders } = useContext(AuthContext);

  useEffect(() => {
    fetchAppointments();
    if (user.role === 'admin' || user.role === 'staff') {
      fetchPatients();
      fetchDoctors();
    }
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/appointments', {
        headers: getHeaders()
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to load appointments');
      setAppointments(data.appointments);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/patients', {
        headers: getHeaders()
      });
      const data = await response.json();
      if (response.ok) setPatients(data.patients);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchDoctors = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/doctors', {
        headers: getHeaders()
      });
      const data = await response.json();
      if (response.ok) setDoctors(data.doctors);
    } catch (err) {
      console.error(err);
    }
  };

  const openAddModal = () => {
    setPatientId(patients[0]?.id || '');
    setDoctorId(doctors[0]?.id || '');
    setDate(new Date().toISOString().split('T')[0]);
    setTime('10:00:00');
    setType('Consultation');
    setStatus('Scheduled');
    setIsModalOpen(true);
  };

  const openStatusModal = (appt) => {
    setCurrentAppt(appt);
    setStatus(appt.status);
    setIsStatusModalOpen(true);
  };

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const body = {
      patient_id: parseInt(patientId),
      doctor_id: parseInt(doctorId),
      appointment_date: date,
      appointment_time: time,
      appointment_type: type,
      status
    };

    try {
      const response = await fetch('http://localhost:5000/api/appointments', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(body)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Scheduling failed');

      setIsModalOpen(false);
      fetchAppointments();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleStatusSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch(`http://localhost:5000/api/appointments/${currentAppt.id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ status })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Status update failed');

      setIsStatusModalOpen(false);
      fetchAppointments();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div style={{ padding: '2rem' }}>Loading appointments calendar...</div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Clinic Appointments</h1>
          <p className="page-description">Schedule, modify, and track patient clinical slots.</p>
        </div>
        {(user.role === 'admin' || user.role === 'staff') && (
          <button className="btn btn-primary" onClick={openAddModal}>
            + Schedule Appointment
          </button>
        )}
      </div>

      {error && <div className="form-error">{error}</div>}

      <div className="card">
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
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments.length > 0 ? (
                appointments.map((appt) => (
                  <tr key={appt.id}>
                    <td><strong>{new Date(appt.appointment_date).toLocaleDateString()}</strong></td>
                    <td>{appt.appointment_time}</td>
                    <td>{appt.patient_name}</td>
                    <td>Dr. {appt.doctor_name}</td>
                    <td>{appt.appointment_type}</td>
                    <td>
                      <span className={`badge ${appt.status === 'Completed' ? 'success' : appt.status === 'Cancelled' ? 'danger' : appt.status === 'Pending' ? 'warning' : 'info'}`}>
                        {appt.status}
                      </span>
                    </td>
                    <td>
                      <button className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={() => openStatusModal(appt)}>
                        Update Status
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center' }}>No appointments scheduled.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* SCHEDULE MODAL (Admin, Staff only) */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">Schedule Patient Appointment</h3>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>&times;</button>
            </div>
            <form onSubmit={handleScheduleSubmit}>
              <div className="modal-body">
                
                <div className="form-group">
                  <label className="form-label">Select Patient</label>
                  <select className="form-control" value={patientId} onChange={(e) => setPatientId(e.target.value)} required>
                    <option value="">-- Select Patient --</option>
                    {patients.map(pat => (
                      <option key={pat.id} value={pat.id}>{pat.name} ({pat.patient_code})</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Assign Doctor</label>
                  <select className="form-control" value={doctorId} onChange={(e) => setDoctorId(e.target.value)} required>
                    <option value="">-- Select Doctor --</option>
                    {doctors.map(doc => (
                      <option key={doc.id} value={doc.id}>Dr. {doc.name} ({doc.specialization})</option>
                    ))}
                  </select>
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Appointment Date</label>
                    <input type="date" className="form-control" value={date} onChange={(e) => setDate(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Appointment Time</label>
                    <input type="text" className="form-control" placeholder="e.g. 10:00:00" value={time} onChange={(e) => setTime(e.target.value)} required />
                  </div>
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Appointment Type</label>
                    <select className="form-control" value={type} onChange={(e) => setType(e.target.value)}>
                      <option value="Consultation">Consultation</option>
                      <option value="Checkup">Checkup</option>
                      <option value="Follow-up">Follow-up</option>
                      <option value="Emergency">Emergency</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Initial Status</label>
                    <select className="form-control" value={status} onChange={(e) => setStatus(e.target.value)}>
                      <option value="Scheduled">Scheduled</option>
                      <option value="Pending">Pending</option>
                    </select>
                  </div>
                </div>

              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Book Slot</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* UPDATE STATUS MODAL (All roles, doctor restricted to own appts) */}
      {isStatusModalOpen && currentAppt && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Update Appointment Status</h3>
              <button className="modal-close" onClick={() => setIsStatusModalOpen(false)}>&times;</button>
            </div>
            <form onSubmit={handleStatusSubmit}>
              <div className="modal-body">
                <p style={{ fontSize: '0.9rem', marginBottom: '1rem', color: 'var(--text-muted)' }}>
                  Updating status for appointment of <strong>{currentAppt.patient_name}</strong> with <strong>Dr. {currentAppt.doctor_name}</strong>.
                </p>
                <div className="form-group">
                  <label className="form-label">Select Status</label>
                  <select className="form-control" value={status} onChange={(e) => setStatus(e.target.value)}>
                    <option value="Scheduled">Scheduled</option>
                    <option value="Pending">Pending</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsStatusModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Status</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Appointments;
