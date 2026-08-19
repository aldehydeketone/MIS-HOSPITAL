import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Patients = () => {
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  
  // Form states
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Male');
  const [contact, setContact] = useState('');
  const [address, setAddress] = useState('');
  const [admissionStatus, setAdmissionStatus] = useState('Outpatient');
  const [doctorId, setDoctorId] = useState('');

  const { user, getHeaders } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPatients();
    if (user.role === 'admin' || user.role === 'staff') {
      fetchDoctors();
    }
  }, []);

  const fetchPatients = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/patients', {
        headers: getHeaders()
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to load patients');
      setPatients(data.patients);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchDoctors = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/doctors', {
        headers: getHeaders()
      });
      const data = await response.json();
      if (response.ok) {
        setDoctors(data.doctors);
      }
    } catch (err) {
      console.error('Failed to load doctors:', err.message);
    }
  };

  const openAddModal = () => {
    setIsEditMode(false);
    setCurrentId(null);
    setCode(`PAT-00${patients.length + 1}`);
    setName('');
    setAge('');
    setGender('Male');
    setContact('');
    setAddress('');
    setAdmissionStatus('Outpatient');
    setDoctorId(doctors[0]?.id || '');
    setIsModalOpen(true);
  };

  const openEditModal = (patient) => {
    setIsEditMode(true);
    setCurrentId(patient.id);
    setCode(patient.patient_code);
    setName(patient.name);
    setAge(patient.age);
    setGender(patient.gender);
    setContact(patient.contact || '');
    setAddress(patient.address || '');
    setAdmissionStatus(patient.admission_status);
    setDoctorId(patient.assigned_doctor_id || '');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const body = {
      patient_code: code,
      name,
      age: parseInt(age),
      gender,
      contact,
      address,
      admission_status: admissionStatus,
      assigned_doctor_id: doctorId ? parseInt(doctorId) : null
    };

    try {
      let response;
      if (isEditMode) {
        response = await fetch(`http://localhost:5000/api/patients/${currentId}`, {
          method: 'PUT',
          headers: getHeaders(),
          body: JSON.stringify(body)
        });
      } else {
        response = await fetch('http://localhost:5000/api/patients', {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify(body)
        });
      }

      const resData = await response.json();
      if (!response.ok) throw new Error(resData.message || 'Saving patient failed');

      setIsModalOpen(false);
      fetchPatients();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this patient record?')) return;
    try {
      const response = await fetch(`http://localhost:5000/api/patients/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Deletion failed');
      fetchPatients();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div style={{ padding: '2rem' }}>Loading directory...</div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Patients Directory</h1>
          <p className="page-description">Manage hospital patient records and clinical statuses.</p>
        </div>
        {(user.role === 'admin' || user.role === 'staff') && (
          <button className="btn btn-primary" onClick={openAddModal}>
            + Add New Patient
          </button>
        )}
      </div>

      {error && <div className="form-error">{error}</div>}

      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Code</th>
                <th>Name</th>
                <th>Age / Gender</th>
                <th>Admission</th>
                <th>Assigned Doctor</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {patients.length > 0 ? (
                patients.map((pat) => (
                  <tr key={pat.id}>
                    <td><strong>{pat.patient_code}</strong></td>
                    <td>{pat.name}</td>
                    <td>{pat.age} yrs / {pat.gender}</td>
                    <td>
                      <span className={`badge ${pat.admission_status === 'Admitted' ? 'danger' : pat.admission_status === 'Discharged' ? 'success' : 'info'}`}>
                        {pat.admission_status}
                      </span>
                    </td>
                    <td>{pat.doctor_name ? `Dr. ${pat.doctor_name}` : 'Unassigned'}</td>
                    <td>
                      <div className="btn-action-group">
                        <button className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={() => navigate(`/patients/${pat.id}`)}>
                          View Details
                        </button>
                        
                        {(user.role === 'doctor' || user.role === 'admin') && (
                          <button className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={() => navigate(`/medical-records/${pat.id}`)}>
                            Medical Records
                          </button>
                        )}

                        {(user.role === 'admin' || user.role === 'staff') && (
                          <button className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={() => openEditModal(pat)}>
                            Edit
                          </button>
                        )}
                        
                        {user.role === 'admin' && (
                          <button className="btn btn-danger" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={() => handleDelete(pat.id)}>
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center' }}>No patient records found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* INTAKE / EDIT MODAL */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">{isEditMode ? 'Modify Patient Record' : 'New Patient Intake'}</h3>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Patient Code</label>
                    <input type="text" className="form-control" value={code} onChange={(e) => setCode(e.target.value)} required disabled={isEditMode} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input type="text" className="form-control" value={name} onChange={(e) => setName(e.target.value)} required />
                  </div>
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Age</label>
                    <input type="number" className="form-control" value={age} onChange={(e) => setAge(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Gender</label>
                    <select className="form-control" value={gender} onChange={(e) => setGender(e.target.value)}>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Contact Number</label>
                    <input type="text" className="form-control" value={contact} onChange={(e) => setContact(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Admission Status</label>
                    <select className="form-control" value={admissionStatus} onChange={(e) => setAdmissionStatus(e.target.value)}>
                      <option value="Outpatient">Outpatient</option>
                      <option value="Admitted">Admitted</option>
                      <option value="Discharged">Discharged</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Assigned Treating Doctor</label>
                  <select className="form-control" value={doctorId} onChange={(e) => setDoctorId(e.target.value)}>
                    <option value="">-- Select Doctor --</option>
                    {doctors.map(doc => (
                      <option key={doc.id} value={doc.id}>Dr. {doc.name} ({doc.specialization})</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Residential Address</label>
                  <textarea className="form-control" rows="3" value={address} onChange={(e) => setAddress(e.target.value)}></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{isEditMode ? 'Save Changes' : 'Register Intake'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Patients;
