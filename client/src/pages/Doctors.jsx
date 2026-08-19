import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const Doctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  // Form states (Creating doctor also creates a linked user account)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [department, setDepartment] = useState('');
  const [contact, setContact] = useState('');
  const [availability, setAvailability] = useState('');

  const { user, getHeaders } = useContext(AuthContext);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/doctors', {
        headers: getHeaders()
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to load doctors');
      setDoctors(data.doctors);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setIsEditMode(false);
    setCurrentId(null);
    setEmail('');
    setPassword('');
    setName('');
    setSpecialization('');
    setDepartment('');
    setContact('');
    setAvailability('');
    setIsModalOpen(true);
  };

  const openEditModal = (doc) => {
    setIsEditMode(true);
    setCurrentId(doc.id);
    setEmail(doc.email || 'doctor@hospital.test'); // email is inside linked user accounts
    setPassword(''); // don't fill password
    setName(doc.name);
    setSpecialization(doc.specialization);
    setDepartment(doc.department);
    setContact(doc.contact || '');
    setAvailability(doc.availability || '');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const body = {
      email,
      password: password || undefined,
      name,
      specialization,
      department,
      contact,
      availability
    };

    try {
      let response;
      if (isEditMode) {
        // Remove password if not editing it
        const updateBody = { ...body };
        delete updateBody.email; // email is readonly usually
        delete updateBody.password;
        
        response = await fetch(`http://localhost:5000/api/doctors/${currentId}`, {
          method: 'PUT',
          headers: getHeaders(),
          body: JSON.stringify(updateBody)
        });
      } else {
        response = await fetch('http://localhost:5000/api/doctors', {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify(body)
        });
      }

      const resData = await response.json();
      if (!response.ok) throw new Error(resData.message || 'Saving doctor failed');

      setIsModalOpen(false);
      fetchDoctors();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete doctor profile and their user login account? This will set assigned patients to unassigned.')) return;
    try {
      const response = await fetch(`http://localhost:5000/api/doctors/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Deletion failed');
      fetchDoctors();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div style={{ padding: '2rem' }}>Loading doctors...</div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Medical Staff / Doctors</h1>
          <p className="page-description">Manage doctor profiles and assign operational schedules.</p>
        </div>
        {user.role === 'admin' && (
          <button className="btn btn-primary" onClick={openAddModal}>
            + Add New Doctor
          </button>
        )}
      </div>

      {error && <div className="form-error">{error}</div>}

      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Specialization</th>
                <th>Department</th>
                <th>Contact</th>
                <th>Availability</th>
                {user.role === 'admin' && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {doctors.length > 0 ? (
                doctors.map((doc) => (
                  <tr key={doc.id}>
                    <td><strong>Dr. {doc.name}</strong></td>
                    <td>{doc.specialization}</td>
                    <td>{doc.department}</td>
                    <td>{doc.contact || 'N/A'}</td>
                    <td>{doc.availability || 'Schedule not configured'}</td>
                    {user.role === 'admin' && (
                      <td>
                        <div className="btn-action-group">
                          <button className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={() => openEditModal(doc)}>
                            Edit
                          </button>
                          <button className="btn btn-danger" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={() => handleDelete(doc.id)}>
                            Delete
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={user.role === 'admin' ? 6 : 5} style={{ textAlign: 'center' }}>No doctors found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE/EDIT MODAL */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">{isEditMode ? 'Modify Doctor Details' : 'Register New Medical Doctor'}</h3>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                
                {!isEditMode && (
                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label">Email Address (Login ID)</label>
                      <input type="email" className="form-control" placeholder="e.g. doctor@hospital.test" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Password</label>
                      <input type="password" className="form-control" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    </div>
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Doctor Name</label>
                  <input type="text" className="form-control" placeholder="e.g. John Austin" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Specialization</label>
                    <input type="text" className="form-control" placeholder="e.g. Cardiology" value={specialization} onChange={(e) => setSpecialization(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Department</label>
                    <input type="text" className="form-control" placeholder="e.g. Child Health" value={department} onChange={(e) => setDepartment(e.target.value)} required />
                  </div>
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Contact Number</label>
                    <input type="text" className="form-control" placeholder="e.g. 555-0101" value={contact} onChange={(e) => setContact(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Availability Schedule</label>
                    <input type="text" className="form-control" placeholder="e.g. Mon-Fri 9AM-5PM" value={availability} onChange={(e) => setAvailability(e.target.value)} />
                  </div>
                </div>

              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{isEditMode ? 'Save Changes' : 'Register Profile'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Doctors;
