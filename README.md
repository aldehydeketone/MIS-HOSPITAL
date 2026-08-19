# Hospital MIS

A lightweight, full-stack Hospital Management Information System built with React, Node.js, and MySQL. Designed with a focus on simplicity, speed, and clean UX for healthcare facilities.

For a detailed breakdown of the architecture, features, and future scope, please read [ABOUT_PROJECT.md](./ABOUT_PROJECT.md).

## Features
- Patient and doctor management
- Appointment scheduling and tracking
- Clean, responsive UI tailored for healthcare environments
- Automated database initialization and seeding for easy deployment

## Tech Stack
- **Frontend:** React, Tailwind CSS
- **Backend:** Node.js, Express
- **Database:** MySQL

## Local Development

### Prerequisites
- Node.js (v18+)
- MySQL (v8+)

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/aldehydeketone/MIS-HOSPITAL.git
   cd MIS-HOSPITAL
   ```

2. **Install dependencies**
   ```bash
   # Install backend dependencies
   cd server
   npm install

   # Install frontend dependencies
   cd ../client
   npm install
   ```

3. **Environment Variables**
   Create a `.env` file in the `server` directory:
   ```env
   PORT=5000
   MYSQLHOST=localhost
   MYSQLUSER=root
   MYSQLPASSWORD=your_password
   MYSQLDATABASE=hospital_mis
   MYSQLPORT=3306
   ```

4. **Run the application**
   The backend will automatically create the required database tables and seed initial data on startup.
   
   ```bash
   # Terminal 1: Start backend
   cd server
   npm start

   # Terminal 2: Start frontend
   cd client
   npm start
   ```

## Deployment
The app is configured for seamless deployment on platforms like Railway. It uses dynamic database initialization, meaning no manual schema setup is required on the production server.