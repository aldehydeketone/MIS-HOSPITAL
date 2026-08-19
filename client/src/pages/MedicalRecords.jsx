import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const MedicalRecords = () => {
  const { patientId } = useParams();
  const [patient, setPatient] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [diagnosis, setDiagnosis] = useState('');
  const [prescription, setPrescription] = useState('');
  const [notes, setNotes] = useState('');

  const { user, getHeaders } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPatientAndRecords();
  }, [patientId]);

  const fetchPatientAndRecords = async () => {
    try {
      // 1. Fetch Patient Info (to display header and check Doctor assignment)
      const patientResponse = await fetch(`http://localhost:5000/api/patients/${patientId}`, {
        headers: getHeaders()
      });
      
      if (patientResponse.status === 403) {
        navigate('/access-denied');
        return;
      }

      const patientData = await patientResponse.json();
      if (!patientResponse.ok) throw new Error(patientData.message || 'Failed to load patient info');
      setPatient(patientData.patient);

      // 2. Fetch Medical Records
      const recordResponse = await fetch(`http://localhost:5000/api/medical-records/${patientId}`, {
        headers: getHeaders()
      });
      const recordData = await recordResponse.json();
      if (!recordResponse.ok) throw new Error(recordData.message || 'Failed to load records');
      setRecords(recordData.records);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRecord = async (e) => {
    e.preventDefault();
    setError('');

    const body = {
      patient_id: parseInt(patientId),
      diagnosis,
      prescription,
      notes
    };

    try {
      const response = await fetch('http://localhost:5000/api/medical-records', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(body)
      });
      const data = await response.json();
      
      if (response.status === 403) {
        throw new Error('Forbidden: You are not authorized to write medical records for this patient.');
      }
      if (!response.ok) throw new Error(data.message || 'Failed to create record');

      setDiagnosis('');
      setPrescription('');
      setNotes('');
      setIsModalOpen(false);
      fetchPatientAndRecords();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div style={{ padding: '2rem' }}>Loading clinical files...</div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Medical Records: {patient?.name}</h1>
          <p className="page-description">
            Confidential history files for <strong>{patient?.patient_code}</strong>. Assigned Doctor: Dr. {patient?.doctor_name || 'Unassigned'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-secondary" onClick={() => navigate('/patients')}>
            Back to Directory
          </button>
          {user.role === 'doctor' && patient?.assigned_doctor_id === user.profileId && (
            <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
              + Add Diagnostic Entry
            </button>
          )}
        </div>
      </div>

      {error && <div className="form-error">{error}</div>}

      <div className="card">
        <h3 className="card-title">Clinical Entry Timeline</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1rem' }}>
          {records.length > 0 ? (
            records.map((rec) => (
              <div key={rec.id} style={{ border: '1px solid var(--border)', borderRadius: '8px', padding: '1.25rem', backgroundColor: 'var(--bg-surface)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', borderBottom: '1px dashed var(--border)', paddingBottom: '0.5rem' }}>
                  <span style={{ fontWeight: 600, color: 'var(--primary)' }}>Written by: Dr. {rec.doctor_name}</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date(rec.created_at).toLocaleString()}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  <div>
                    <h5 style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>DIAGNOSIS</h5>
                    <p style={{ fontWeight: 500, fontSize: '0.95rem' }}>{rec.diagnosis}</p>
                  </div>
                  <div>
                    <h5 style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>PRESCRIPTION</h5>
                    <p style={{ fontWeight: 500, fontSize: '0.95rem', color: 'var(--success)' }}>{rec.prescription}</p>
                  </div>
                </div>
                {rec.notes && (
                  <div style={{ marginTop: '0.75rem', backgroundColor: 'var(--primary-light)', padding: '0.75rem', borderRadius: '4px', fontSize: '0.9rem' }}>
                    <strong>Clinical Notes: </strong> {rec.notes}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
              No medical records registered for this patient.
            </div>
          )}
        </div>
      </div>

      {/* CREATE ENTRY MODAL (Doctor only) */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">New Clinical Log Entry</h3>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>&times;</button>
            </div>
            <form onSubmit={handleCreateRecord}>
              <div className="modal-body">
                
                <div className="form-group">
                  <label className="form-label">Clinical Diagnosis</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Essential Hypertension, Acute Tonsillitis"
                    value={diagnosis}
                    onChange={(e) => setDiagnosis(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Prescription (Medicines & Dosages)</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Lisinopril 10mg once daily for 30 days"
                    value={prescription}
                    onChange={(e) => setPrescription(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Internal Treatment Notes</label>
                  <textarea
                    className="form-control"
                    rows="4"
                    placeholder="e.g. Advised low salt diet, lifestyle modifications, repeat test in 2 weeks."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  ></textarea>
                </div>

              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Publish Entry</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicalRecords;
