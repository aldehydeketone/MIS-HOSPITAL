const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Basic health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Hospital MIS API is running smoothly',
    timestamp: new Date().toISOString()
  });
});

// Import and register routes
const authRoutes = require('./routes/authRoutes');
const patientRoutes = require('./routes/patientRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const recordRoutes = require('./routes/recordRoutes');
const logRoutes = require('./routes/logRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/medical-records', recordRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/dashboard', dashboardRoutes);

// --- Serve React Frontend ---
const path = require('path');
app.use(express.static(path.join(__dirname, '../client/dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});
// ----------------------------

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('API Error:', err.message);
  res.status(err.status || 500).json({
    status: 'error',
    message: err.message || 'Internal server error'
  });
});

const { testConnection } = require('./config/db');

// Start server
const server = app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  await testConnection();
});

module.exports = { app, server };
