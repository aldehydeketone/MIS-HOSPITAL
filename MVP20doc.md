# Hospital Management MIS - MVP Technical Document

## 1. MVP Goal

Build a small working Hospital Management Information System that demonstrates hospital data management and privacy-focused role-based access.

The MVP should be easy to build, easy to demonstrate, and easy to explain during a project presentation.

## 2. Core Features

### 2.1 Login

Users log in using:
- Email
- Password

After successful authentication, the application identifies the user's role.

Supported roles:
- Admin
- Doctor
- Staff

## 3. Role Permissions

| Feature | Admin | Doctor | Staff |
|---|---|---|---|
| Login | Yes | Yes | Yes |
| View dashboard | Yes | Yes | Yes |
| Manage patients | Full | Assigned patients | Limited |
| View appointments | All | Own | Assigned |
| Manage doctors | Yes | No | No |
| Medical records | View/Manage | Manage assigned | Limited/No |
| User management | Yes | No | No |
| Audit logs | Yes | Limited | No |

The exact permissions can be simplified if required for the demonstration.

## 4. Patient Module

### Add Patient

Required fields:
- Name
- Age
- Gender
- Contact
- Address
- Admission status
- Assigned doctor

### Patient List

Display:
- Patient ID
- Name
- Age
- Gender
- Doctor
- Status
- Action

Actions:
- View
- Edit
- Delete

## 5. Doctor Module

Doctor information:
- Name
- Specialization
- Department
- Contact
- Availability

Admin can:
- Add doctor
- Edit doctor
- View doctor
- Remove doctor

## 6. Appointment Module

Appointment fields:
- Patient
- Doctor
- Date
- Time
- Type
- Status

Statuses:
- Scheduled
- Completed
- Cancelled
- Pending

## 7. Medical Record Module

A doctor can create a record for an authorized patient.

Fields:
- Patient
- Diagnosis
- Prescription
- Notes
- Date

The frontend should not expose medical records to users who do not have permission.

## 8. Dashboard Requirements

### Admin Dashboard

Show:
- Total patients
- Total doctors
- Total staff
- Today's appointments
- Current admissions
- Recent activity

### Doctor Dashboard

Show:
- My patients
- Today's appointments
- Pending cases
- Recent records

### Staff Dashboard

Show:
- Assigned patients
- Today's appointments
- Basic operational information

## 9. Privacy Feature

Privacy is the main project theme.

Example:

```text
Doctor A
   ↓
Requests Patient 101
   ↓
Is Patient 101 assigned to Doctor A?
   ↓
YES → Allow access
NO  → Deny access
```

The backend should perform this check.

A user should never be trusted simply because the frontend shows or hides a button.

## 10. Authentication Flow

```text
Login Form
    ↓
POST /api/auth/login
    ↓
Validate email/password
    ↓
Compare bcrypt password hash
    ↓
Generate JWT
    ↓
Return token + role
    ↓
Store token on client
    ↓
Use token for protected requests
```

## 11. Error Handling

The API should return simple HTTP status codes.

```text
200 OK
201 Created
400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found
500 Internal Server Error
```

Example:

```json
{
  "message": "You are not authorized to access this patient record."
}
```

## 12. Basic Security

Implement:
- bcrypt password hashing
- JWT authentication
- Role-based authorization
- Protected API routes
- Input validation
- CORS configuration
- No plaintext passwords in database

For a college MVP, this is enough to demonstrate the privacy concept.

## 13. UI Requirements

The interface should be clean and simple.

Recommended layout:

```text
+--------------------------------------------------+
| Logo                         User / Notification |
+----------------+---------------------------------+
| Sidebar        |                                 |
|                | Dashboard                        |
| Dashboard      |                                 |
| Patients       | Statistic Cards                 |
| Doctors        |                                 |
| Appointments   | Tables / Charts                 |
| Records        |                                 |
|                |                                 |
+----------------+---------------------------------+
```

Use:
- White/light background
- Blue healthcare-oriented accent
- Cards
- Tables
- Simple charts
- Responsive layout

## 14. Demo Data

Use fake data only.

Example:
- 20 patients
- 5 doctors
- 8 staff members
- 15 appointments
- Sample medical records

Do not use real patient information.

## 15. Minimum Demo Scenario

The final demo should follow this sequence:

### Step 1
Login as Admin.

### Step 2
Show Admin Dashboard.

### Step 3
Create a new patient.

### Step 4
Create an appointment for the patient.

### Step 5
Logout.

### Step 6
Login as Doctor.

### Step 7
Show that the doctor sees assigned patients and appointments.

### Step 8
Open the patient's medical record.

### Step 9
Logout and login as Staff.

### Step 10
Show that staff receives limited information.

### Step 11
Attempt unauthorized access.

### Step 12
Show `403 Forbidden` or an access-denied message.

This demonstrates the privacy-focused concept clearly.

## 16. MVP Completion Criteria

The MVP is complete when:

- Login works
- Three roles work
- Patients can be created and viewed
- Doctors can be managed
- Appointments can be created
- Medical records can be created
- Dashboards display data
- Role restrictions work
- Unauthorized API requests are rejected
- Database stores the data
- Demo can be completed without manual database editing

## 17. Future Scope

Possible future features:
- Billing
- Pharmacy
- Laboratory reports
- Insurance management
- SMS/email notifications
- Advanced analytics
- Document upload
- Multi-hospital support
- Stronger audit and compliance controls

These should not be implemented in the MVP.
