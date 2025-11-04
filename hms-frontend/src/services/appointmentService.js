// src/services/appointmentService.js

import axios from 'axios';

// CRITICAL: Set the base domain for the deployed backend service
const BASE_DOMAIN = "https://hospital-management-backend-v955.onrender.com"; // <-- Use your actual Render URL
const API_BASE = BASE_DOMAIN + "/api"; 
const APPOINTMENT_API_URL = API_BASE + "/appointments";
const DOCTOR_API_URL = API_BASE + "/doctors";


// 1. Fetch appointments accessible by the current user (used for general listing and date filtering)
// Backend endpoint: GET /api/appointments/my?startDate=...
const getMyAppointments = async (startDate, endDate) => {
    const params = {};
    
    // Check for non-empty strings before adding parameters (required for filtering)
    if (startDate) {
        params.startDate = startDate; // Sends 'YYYY-MM-DD'
    }
    if (endDate) {
        params.endDate = endDate; // Sends 'YYYY-MM-DD'
    }

    // Axios will send parameters ONLY if they are populated
    const response = await axios.get(APPOINTMENT_API_URL + "/my", { params });
    return response.data;
};

// 2. Fetch today's appointments (Used by DoctorDashboard)
// This is done by calling the general list endpoint but passing today's date as the filter.
const getTodayAppointments = async () => {
    // Helper to get today's date in YYYY-MM-DD format
    const getTodayDateString = () => {
        const d = new Date();
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const todayString = getTodayDateString();
    
    // Call the general filtering endpoint, passing today as the fixed range.
    const response = await axios.get(APPOINTMENT_API_URL + "/my", { 
        params: { 
            startDate: todayString, 
            endDate: todayString 
        } 
    });
    return response.data;
};

// 3. Book a new appointment (POST /api/appointments)
const bookAppointment = async (appointmentData) => {
    const response = await axios.post(APPOINTMENT_API_URL, appointmentData);
    return response.data;
};

// 4. Update appointment status (PATCH /api/appointments/{id}/status)
const updateStatus = async (appointmentId, newStatus) => {
    const response = await axios.patch(
        `${APPOINTMENT_API_URL}/${appointmentId}/status?status=${newStatus}`
    );
    return response.data;
};

// 5. Fetch list of Doctors (GET /api/doctors)
const getDoctors = async () => {
    // Call the dedicated Doctor API endpoint
    const response = await axios.get(DOCTOR_API_URL); 
    return response.data;
};


// Consolidate and export the final service object
const appointmentService = { 
    getMyAppointments, 
    getTodayAppointments, // Used specifically by the dashboard
    bookAppointment, 
    updateStatus, 
    getDoctors 
};

export default appointmentService;
