import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const PatientDetails = () => {
  const { id } = useParams();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const { getHeaders } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const fetchDetails = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/patients/${id}`, {
        headers: getHeaders()
      });
      const data = await response.json();

      if (response.status === 403) {
        navigate('/access-denied');
        return;
      }

      if (!response.ok) {
        throw new Error(data.message || 'Failed to load details');
      }

      setPatient(data.patient);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={{ padding: '2rem' }}>Loading details...</div>;
  if (error) return <div className="form-error" style={{ margin: '2rem' }}>{error}</div>;
  if (!patient) return null;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Patient Profile: {patient.name}</h1>
          <p className="page-description">Clinical record summary and contact logs.</p>
        </div>
        <button className="btn btn-secondary" onClick={() => navigate('/patients')}>
          Back to Directory
        </button>
      </div>

      <div className="card" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
        <div>
          <h3 style={{ borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', marginBottom: '1rem', fontWeight: 600 }}>
            Demographic details
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div>
              <span style={{ fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.85rem' }}>PATIENT CODE</span>
              <p style={{ fontWeight: 600, fontSize: '1.1rem' }}>{patient.patient_code}</p>
            </div>
            <div>
              <span style={{ fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.85rem' }}>AGE / GENDER</span>
              <p>{patient.age} years / {patient.gender}</p>
            </div>
            <div>
              <span style={{ fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.85rem' }}>CONTACT NUMBER</span>
              <p>{patient.contact || 'No phone number provided'}</p>
            </div>
            <div>
              <span style={{ fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.85rem' }}>ADDRESS</span>
              <p>{patient.address || 'No residential address provided'}</p>
            </div>
          </div>
        </div>

        <div>
          <h3 style={{ borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', marginBottom: '1rem', fontWeight: 600 }}>
            Hospital Status & Assignment
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div>
              <span style={{ fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.85rem' }}>ADMISSION STATUS</span>
              <p style={{ marginTop: '0.25rem' }}>
                <span className={`badge ${patient.admission_status === 'Admitted' ? 'danger' : 'success'}`}>
                  {patient.admission_status}
                </span>
              </p>
            </div>
            <div>
              <span style={{ fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.85rem' }}>ASSIGNED TREATING DOCTOR</span>
              <p style={{ fontWeight: 500 }}>{patient.doctor_name ? `Dr. ${patient.doctor_name}` : 'Not assigned'}</p>
            </div>
            <div>
              <span style={{ fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.85rem' }}>RECORD CREATION TIMESTAMP</span>
              <p>{new Date(patient.created_at).toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDetails;
