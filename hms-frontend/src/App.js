// src/App.js

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute'; 
import Layout from './components/Layout'; // Layout wrapper
import Header from './components/Header'; // Imported for reference
import ViewEditMedicalRecord from './pages/ViewEditMedicalRecord';
// --- Pages Imports ---
import PatientDashboard from './pages/PatientDashboard';
import MyRecords from './pages/MyRecords';
import CreateMedicalRecord from './pages/CreateMedicalRecord';
import Login from './pages/Login';
import Register from './pages/Register'; 
import MyAppointments from './pages/MyAppointments'; // <-- EXISTING APPOINTMENT LIST
import BookAppointment from './pages/BookAppointment'; // <-- NEW APPOINTMENT FORM PAGE
import './App.css'
import DoctorDashboard from './pages/DoctorDashboard';
import ForgotPassword from './pages/ForgotPassword';
// --- Placeholder Components ---
const AdminDashboard = () => <Layout><h1>Admin Dashboard - Full Access</h1></Layout>;
// const DoctorDashboard = () => <Layout><h1>Doctor Dashboard - Your Patients & Schedule</h1></Layout>;
//const ForgotPassword = () => <Layout><h1>Forgot Password (Under Construction)</h1></Layout>; 


const App = () => {
    // Wrapping AppRoutes in AuthProvider
    return (
        <AuthProvider>
            <AppRoutes />
        </AuthProvider>
    );
};

// ----------------------------------------------------------------------
// Routing Logic
// ----------------------------------------------------------------------

const AppRoutes = () => {
    const { isLoggedIn, role } = useAuth();
    
    // Determines the appropriate redirect path after login
    const getDashboardPath = (userRole) => {
        if (userRole === "ROLE_ADMIN") return "/admin/dashboard";
        if (userRole === "ROLE_DOCTOR") return "/doctor/dashboard";
        if (userRole === "ROLE_PATIENT") return "/patient/dashboard";
        return "/";
    };

    return (
        <Routes>
            {/* 1. Public Routes */}
            <Route path="/" element={isLoggedIn ? <Navigate to={getDashboardPath(role)} /> : <Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* 2. Protected Routes */}
            
            {/* Admin Dashboard */}
            <Route path="/admin/dashboard" element={<ProtectedRoute requiredRole="ROLE_ADMIN"><AdminDashboard /></ProtectedRoute>} />
            
            {/* Doctor Dashboard */}
            <Route path="/doctor/dashboard" element={<ProtectedRoute requiredRole="ROLE_DOCTOR"><DoctorDashboard /></ProtectedRoute>} />
            
            {/* Patient Dashboard */}
            <Route path="/patient/dashboard" element={<ProtectedRoute requiredRole="ROLE_PATIENT"><PatientDashboard /></ProtectedRoute>} />
            
            {/* --- APPOINTMENTS MODULE ROUTES --- */}
            
            {/* Appointment List (Accessible by all roles) */}
            <Route path="/appointments/list" element={<ProtectedRoute>
                <MyAppointments />
            </ProtectedRoute>} />
            
            {/* Appointment Booking Form (Typically Admin and Patient can book) */}
            <Route path="/appointments/book" element={<ProtectedRoute requiredRoles={["ROLE_ADMIN", "ROLE_PATIENT"]}>
                <BookAppointment />
            </ProtectedRoute>} />
            <Route 
                path="/records/create/:patientId/:doctorId" 
                element={<ProtectedRoute requiredRole="ROLE_DOCTOR">
                    <CreateMedicalRecord />
                </ProtectedRoute>} 
            />
            <Route 
                path="/records/list" 
                element={<ProtectedRoute requiredRoles={["ROLE_ADMIN", "ROLE_DOCTOR", "ROLE_PATIENT"]}>
                    <MyRecords /> {/* <-- The component that fetches and displays the secure list */}
                </ProtectedRoute>} 
            />
            {/* General Dashboard Catch-all */}
            <Route path="/dashboard" element={isLoggedIn ? <Navigate to={getDashboardPath(role)} /> : <Navigate to="/" />} />

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" />} />
            <Route path="/records/view/:recordId" element={<ProtectedRoute requiredRoles={["ROLE_DOCTOR", "ROLE_ADMIN"]}>
    <ViewEditMedicalRecord />
</ProtectedRoute>} />
        </Routes>
    );
};

export default App;