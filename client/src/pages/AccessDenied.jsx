import React from 'react';
import { useNavigate } from 'react-router-dom';

const AccessDenied = () => {
  const navigate = useNavigate();

  return (
    <div style={{ display: 'flex', minHeight: '80vh', alignItems: 'center', justifyContent: 'center' }}>
      <div className="denied-container">
        <div className="denied-icon">⚠️</div>
        <h2 className="denied-title">Access Denied</h2>
        <p className="denied-message">
          You do not have the required permissions to access this module or patient record. 
          This event has been logged for security audit.
        </p>
        <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default AccessDenied;
