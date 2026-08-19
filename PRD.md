# Hospital Management MIS - Product Requirements Document (PRD)

## 1. Product Name

**HealthCare MIS - Privacy-Focused Hospital Management Information System**

## 2. Product Summary

HealthCare MIS is a web-based hospital information management system designed for small-scale academic demonstration.

The system provides different dashboards for administrators, doctors, and hospital staff while restricting access to information according to user roles.

The primary product goal is to demonstrate that hospital information can be managed through a simple digital system while applying basic privacy and access-control principles.

## 3. Problem Statement

Hospitals manage large amounts of information including patient details, appointments, doctors, staff information, and medical records.

If all users can access all information, confidential patient data can be exposed unnecessarily.

The proposed system addresses this problem by:
- Separating users by role
- Providing role-specific dashboards
- Restricting sensitive information
- Recording important user actions
- Providing centralized hospital information management

## 4. Target Users

### Administrator

Responsible for managing the hospital system.

Needs:
- Hospital-wide overview
- Patient management
- Doctor management
- Staff management
- Appointment overview
- Reports

### Doctor

Responsible for patient treatment.

Needs:
- Assigned patients
- Appointments
- Medical records
- Prescriptions
- Patient history

### Staff

Responsible for operational tasks.

Needs:
- Assigned patients
- Appointments
- Basic patient information
- Operational status

## 5. Product Goals

### Primary Goals

1. Create a functional hospital MIS.
2. Implement role-based access.
3. Demonstrate privacy-aware information visibility.
4. Provide dashboards for different users.
5. Implement basic CRUD operations.
6. Store data in a relational database.
7. Provide a clean and understandable user interface.

### Non-Goals

The MVP will not attempt to become a complete hospital ERP.

The following are intentionally excluded:
- Online payments
- Pharmacy management
- Insurance processing
- Laboratory integration
- AI diagnosis
- Telemedicine
- Real-time messaging
- Multi-hospital enterprise management

## 6. Functional Requirements

### FR-01 Authentication

The system must allow registered users to log in using email and password.

### FR-02 Role Identification

The system must identify whether the user is:
- Admin
- Doctor
- Staff

### FR-03 Role-Based Dashboard

After login, the user must be redirected to the dashboard associated with their role.

### FR-04 Patient Management

Authorized users must be able to:
- Create patient
- View patient
- Update patient
- Delete patient

### FR-05 Doctor Management

Admin must be able to:
- Create doctor
- View doctors
- Update doctor
- Delete doctor

### FR-06 Appointment Management

Authorized users must be able to:
- Create appointment
- View appointments
- Update appointment status

### FR-07 Medical Records

Authorized doctors must be able to:
- View authorized medical records
- Create medical records
- Update medical records

### FR-08 Privacy Control

The system must prevent users from accessing information outside their permission scope.

Example:

```text
Doctor → Assigned Patient → Medical Record → Allowed

Doctor → Unassigned Patient → Medical Record → Denied
```

### FR-09 Audit Log

The system should record important actions such as:
- Login
- Patient creation
- Patient update
- Medical record update
- Unauthorized access attempt

### FR-10 Dashboard Statistics

Dashboards should display relevant statistics using cards, tables, and simple charts.

## 7. Non-Functional Requirements

### Security

- Passwords must never be stored as plaintext.
- Protected APIs must require authentication.
- Role-based authorization must be checked on the backend.
- Sensitive data must not be unnecessarily exposed to users.

### Performance

For the small MVP, normal CRUD operations should respond quickly under typical demo usage.

### Usability

A user should be able to understand the main dashboard without training.

### Maintainability

The code should be separated into:
- Routes
- Controllers
- Middleware
- Database/model layer
- React components
- Pages

## 8. User Stories

### Admin

As an admin, I want to see hospital statistics so that I can understand the current hospital situation.

As an admin, I want to manage doctors and patients so that hospital information remains organized.

### Doctor

As a doctor, I want to see my assigned patients so that I can manage their treatment.

As a doctor, I want to create medical records so that patient treatment information is stored digitally.

### Staff

As staff, I want to see my assigned patients and appointments so that I can complete operational tasks.

### Privacy

As a hospital administrator, I want users to access only authorized information so that confidential patient information is protected.

## 9. Main Screens

1. Login
2. Admin Dashboard
3. Doctor Dashboard
4. Staff Dashboard
5. Patient List
6. Patient Details
7. Doctor List
8. Appointment List
9. Medical Records
10. User Profile
11. Access Denied
12. Audit Log

## 10. Main Navigation

```text
Login
  |
  +-- Admin
  |    +-- Dashboard
  |    +-- Patients
  |    +-- Doctors
  |    +-- Staff
  |    +-- Appointments
  |    +-- Reports
  |    +-- Audit Logs
  |
  +-- Doctor
  |    +-- Dashboard
  |    +-- My Patients
  |    +-- Appointments
  |    +-- Medical Records
  |
  +-- Staff
       +-- Dashboard
       +-- Assigned Patients
       +-- Appointments
```

## 11. Acceptance Criteria

### Authentication

- Valid credentials allow login.
- Invalid credentials show an error.
- Passwords are stored as hashes.
- Protected pages cannot be accessed without authentication.

### Authorization

- Admin can access admin features.
- Doctor can access doctor features.
- Staff can access staff features.
- Unauthorized API requests return `403 Forbidden`.

### Patient Management

- Patient can be created.
- Patient appears in the patient list.
- Patient details can be viewed.
- Patient can be updated.
- Patient can be deleted by an authorized user.

### Appointments

- Appointment can be created.
- Appointment appears in the correct dashboard.
- Appointment status can be changed.

### Medical Records

- Authorized doctor can create a record.
- Authorized users can view permitted records.
- Unauthorized users cannot access restricted records.

### Dashboard

- Dashboard statistics load from the database.
- Different roles see different information.

## 12. Suggested Project Scope

The project should be completed in the following order:

```text
1. Database
      ↓
2. Express Backend
      ↓
3. Authentication
      ↓
4. Role Authorization
      ↓
5. Patient CRUD
      ↓
6. Doctor CRUD
      ↓
7. Appointments
      ↓
8. Medical Records
      ↓
9. Dashboards
      ↓
10. Audit Logs
      ↓
11. UI Polish
```

## 13. Success Definition

The project is successful if a reviewer can log in as different users and clearly observe that:

1. Each user receives a different dashboard.
2. Hospital information can be managed.
3. Patient and appointment data are stored in the database.
4. Doctors can access relevant medical records.
5. Staff receives limited information.
6. Unauthorized access is blocked.
7. The privacy concept is visible and understandable during the demonstration.

## 14. Important Disclaimer

This project is an academic MVP. It is not intended for use with real patient information or deployment as a production healthcare system.

Real healthcare software would require substantially stronger security, privacy controls, compliance requirements, encryption, access auditing, infrastructure security, backup/recovery, and regulatory review.
