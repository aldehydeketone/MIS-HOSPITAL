# Hospital Management MIS - Architecture

## 1. Project Overview

The Hospital Management MIS is a small, privacy-focused web application for managing basic hospital information such as patients, doctors, appointments, medical records, and staff operations.

The project is intentionally designed as an MVP. It focuses on demonstrating:

- Hospital information management
- Role-based access
- Privacy-aware data visibility
- Simple dashboards
- CRUD operations
- Basic authentication and authorization

This is a demonstration/academic project, not a production healthcare system.

## 2. Technology Stack

### Frontend
- React
- Vite
- JavaScript
- HTML5
- CSS3 / Tailwind CSS
- React Router

### Backend
- Node.js
- Express.js
- REST APIs

### Database
- MySQL

### Authentication
- JWT-based authentication
- Password hashing with bcrypt
- Role-based authorization

## 3. High-Level Architecture

```text
+-----------------------------+
|        React Frontend       |
|                             |
| Login | Dashboards | CRUD   |
+-------------+---------------+
              |
              | HTTP / REST API
              v
+-----------------------------+
|       Express Backend       |
|                             |
| Auth Middleware             |
| Role Authorization          |
| Patient APIs                |
| Doctor APIs                 |
| Appointment APIs            |
| Medical Record APIs         |
| Audit APIs                  |
+-------------+---------------+
              |
              | SQL
              v
+-----------------------------+
|          MySQL              |
|                             |
| Users                       |
| Patients                    |
| Doctors                     |
| Appointments                |
| Medical Records             |
| Audit Logs                  |
+-----------------------------+
```

## 4. Main Modules

### Authentication
Handles:
- Login
- Logout
- Password hashing
- JWT generation
- JWT verification

### User and Role Management
Roles:
- Admin
- Doctor
- Staff

Each role receives different permissions.

### Patient Management
Admin and authorized staff can manage patient information.

Typical fields:
- Patient ID
- Name
- Age
- Gender
- Contact
- Address
- Admission status
- Assigned doctor

### Doctor Management
Stores:
- Doctor ID
- Name
- Specialization
- Department
- Contact
- Availability

### Appointment Management
Stores:
- Appointment ID
- Patient
- Doctor
- Date
- Time
- Appointment type
- Status

### Medical Records
Stores:
- Patient
- Doctor
- Diagnosis
- Prescription
- Notes
- Record date

Access should be restricted according to the logged-in user's role.

### Dashboard
Different dashboards are shown depending on the user's role.

Admin:
- Total patients
- Doctors
- Staff
- Appointments
- Admissions
- Reports

Doctor:
- Assigned patients
- Today's appointments
- Pending cases
- Recent medical records

Staff:
- Assigned patients
- Today's appointments
- Basic patient information
- Operational tasks

### Audit Logging
Important actions can be stored in an audit log.

Example:
- User logged in
- Patient created
- Patient record viewed
- Medical record updated
- Appointment created

## 5. Privacy and Authorization Model

```text
ADMIN
  |
  +-- Hospital-wide access
  +-- User management
  +-- Patient management
  +-- Appointment management
  +-- Reports

DOCTOR
  |
  +-- Assigned patients
  +-- Appointments
  +-- Medical records
  +-- Prescriptions

STAFF
  |
  +-- Limited patient information
  +-- Appointments
  +-- Operational information
```

The backend must enforce authorization. Hiding a button in React is not sufficient for security.

Example:

```text
Frontend hides restricted button
          +
Backend checks JWT
          +
Backend checks role
          =
Authorized request
```

## 6. Database Design

### users
- id
- name
- email
- password_hash
- role
- created_at

### patients
- id
- patient_code
- name
- age
- gender
- contact
- address
- admission_status
- assigned_doctor_id
- created_at

### doctors
- id
- name
- specialization
- department
- contact
- availability

### appointments
- id
- patient_id
- doctor_id
- appointment_date
- appointment_time
- appointment_type
- status

### medical_records
- id
- patient_id
- doctor_id
- diagnosis
- prescription
- notes
- created_at

### audit_logs
- id
- user_id
- action
- entity_type
- entity_id
- created_at

## 7. API Structure

```text
POST   /api/auth/login

GET    /api/patients
POST   /api/patients
GET    /api/patients/:id
PUT    /api/patients/:id
DELETE /api/patients/:id

GET    /api/doctors
POST   /api/doctors
PUT    /api/doctors/:id

GET    /api/appointments
POST   /api/appointments
PUT    /api/appointments/:id

GET    /api/medical-records/:patientId
POST   /api/medical-records

GET    /api/dashboard/admin
GET    /api/dashboard/doctor
GET    /api/dashboard/staff
```

## 8. Frontend Structure

```text
src/
├── components/
│   ├── Navbar.jsx
│   ├── Sidebar.jsx
│   ├── StatCard.jsx
│   └── ProtectedRoute.jsx
│
├── pages/
│   ├── Login.jsx
│   ├── AdminDashboard.jsx
│   ├── DoctorDashboard.jsx
│   ├── StaffDashboard.jsx
│   ├── Patients.jsx
│   ├── Doctors.jsx
│   ├── Appointments.jsx
│   └── MedicalRecords.jsx
│
├── services/
│   └── api.js
│
├── context/
│   └── AuthContext.jsx
│
└── App.jsx
```

## 9. Backend Structure

```text
server/
├── controllers/
├── routes/
├── middleware/
│   ├── authMiddleware.js
│   └── roleMiddleware.js
├── models/
├── services/
├── config/
├── db/
└── server.js
```

## 10. Request Flow

```text
User
  ↓
React UI
  ↓
HTTP Request
  ↓
JWT Authentication Middleware
  ↓
Role Authorization Middleware
  ↓
Controller
  ↓
Database Query
  ↓
Response
  ↓
React UI
```

## 11. Deployment

For a simple demonstration:
- Frontend can be deployed separately as a static React application.
- Express backend can run on a Node hosting service.
- MySQL can use a hosted MySQL instance.

For local demonstration, run:
- React on localhost
- Express on localhost
- MySQL locally

## 12. MVP Principle

The project should remain small.

Do not add:
- AI diagnosis
- Payment gateway
- Pharmacy management
- Laboratory integration
- Microservices
- Real-time chat
- Complex billing
- Advanced analytics

These are outside the MVP scope.
