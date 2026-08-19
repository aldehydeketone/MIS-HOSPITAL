// Central API service - all backend calls go through here
const BASE_URL = 'http://localhost:5000/api';

function getToken() {
  return localStorage.getItem('token');
}

function authHeaders() {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: { ...authHeaders(), ...(options.headers || {}) },
  });

  if (res.status === 401) {
    // Session expired — clear and redirect
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
    throw new Error('Session expired. Please log in again.');
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message = data.message || `Request failed (${res.status})`;
    const err = new Error(message);
    err.status = res.status;
    throw err;
  }

  return data;
}

// Auth
export const auth = {
  login: (email, password) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  me: () => request('/auth/me'),
};

// Dashboard
export const dashboard = {
  getStats: () => request('/dashboard'),
};

// Patients
export const patients = {
  getAll: () => request('/patients'),
  getById: (id) => request(`/patients/${id}`),
  create: (data) => request('/patients', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/patients/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => request(`/patients/${id}`, { method: 'DELETE' }),
};

// Doctors
export const doctors = {
  getAll: () => request('/doctors'),
  getById: (id) => request(`/doctors/${id}`),
  create: (data) => request('/doctors', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/doctors/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => request(`/doctors/${id}`, { method: 'DELETE' }),
};

// Appointments
export const appointments = {
  getAll: () => request('/appointments'),
  create: (data) => request('/appointments', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/appointments/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
};

// Medical Records
export const medicalRecords = {
  getByPatient: (patientId) => request(`/medical-records/${patientId}`),
  create: (data) => request('/medical-records', { method: 'POST', body: JSON.stringify(data) }),
};

// Audit Logs
export const auditLogs = {
  getAll: () => request('/logs'),
};
