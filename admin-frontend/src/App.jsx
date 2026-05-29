import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
const AppLayout = lazy(() => import('./components/AppLayout'));
const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Employees = lazy(() => import('./pages/Employees'));
const Departments = lazy(() => import('./pages/Departments'));
const AttendanceHistory = lazy(() => import('./pages/Attendance'));
const AttendanceLogs = lazy(() => import('./pages/AttendanceLogs'));
const LeaveRequests = lazy(() => import('./pages/Leaves'));
const Profile = lazy(() => import('./pages/Profile'));


function App() {
  return (
    <Router>
      <AuthProvider>
        <Suspense fallback={<div className="flex justify-center items-center h-full"><div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div></div>}><Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<AppLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/employees" element={<Employees />} />
            <Route path="/departments" element={<Departments />} />
            <Route path="/attendance" element={<AttendanceHistory />} />
            <Route path="/attendance-logs" element={<AttendanceLogs />} />
            <Route path="/leaves" element={<LeaveRequests />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes></Suspense>
      </AuthProvider>
    </Router>
  );
}

export default App;
