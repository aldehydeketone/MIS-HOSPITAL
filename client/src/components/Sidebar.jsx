import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Sidebar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        HealthCare <span>MIS</span>
      </div>

      <nav style={{ flex: 1 }}>
        <ul className="sidebar-menu">
          <li>
            <NavLink to="/dashboard" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              Dashboard
            </NavLink>
          </li>

          {/* Admin routes */}
          {user.role === 'admin' && (
            <>
              <li>
                <NavLink to="/patients" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                  Patients
                </NavLink>
              </li>
              <li>
                <NavLink to="/doctors" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                  Doctors
                </NavLink>
              </li>
              <li>
                <NavLink to="/appointments" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                  Appointments
                </NavLink>
              </li>
              <li>
                <NavLink to="/logs" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                  Audit Logs
                </NavLink>
              </li>
            </>
          )}

          {/* Doctor routes */}
          {user.role === 'doctor' && (
            <>
              <li>
                <NavLink to="/patients" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                  My Patients
                </NavLink>
              </li>
              <li>
                <NavLink to="/appointments" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                  Appointments
                </NavLink>
              </li>
            </>
          )}

          {/* Staff routes */}
          {user.role === 'staff' && (
            <>
              <li>
                <NavLink to="/patients" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                  Patients
                </NavLink>
              </li>
              <li>
                <NavLink to="/appointments" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                  Appointments
                </NavLink>
              </li>
            </>
          )}
        </ul>
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-user-name">{user.name}</div>
          <div className="sidebar-user-role">{user.role}</div>
        </div>
        <button className="btn-logout" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
