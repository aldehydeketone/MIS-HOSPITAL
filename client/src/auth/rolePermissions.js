// Role-based permissions for frontend route guards and UI visibility
export const ROLES = {
  ADMIN: 'admin',
  DOCTOR: 'doctor',
  STAFF: 'staff',
};

// Route access by role prefix
export const roleRoutes = {
  admin: '/admin/dashboard',
  doctor: '/doctor/dashboard',
  staff: '/staff/dashboard',
};

// Navigation items per role
export const navItems = {
  admin: [
    { label: 'Dashboard', href: '/admin/dashboard', icon: 'grid' },
    { label: 'Patients', href: '/admin/patients', icon: 'users' },
    { label: 'Doctors', href: '/admin/doctors', icon: 'stethoscope' },
    { label: 'Staff', href: '/admin/staff', icon: 'users' },
    { label: 'Appointments', href: '/admin/appointments', icon: 'calendar' },
    { label: 'Access Control', href: '/admin/access-control', icon: 'shield' },
    { label: 'Audit Logs', href: '/admin/audit-logs', icon: 'file-text' },
  ],
  doctor: [
    { label: 'Dashboard', href: '/doctor/dashboard', icon: 'grid' },
    { label: 'My Patients', href: '/doctor/patients', icon: 'users' },
    { label: 'Appointments', href: '/doctor/appointments', icon: 'calendar' },
  ],
  staff: [
    { label: 'Dashboard', href: '/staff/dashboard', icon: 'grid' },
    { label: 'Appointments', href: '/staff/appointments', icon: 'calendar' },
    { label: 'Billing', href: '/staff/billing', icon: 'credit-card' },
    { label: 'Bed Availability', href: '/staff/beds', icon: 'activity' },
  ],
};
