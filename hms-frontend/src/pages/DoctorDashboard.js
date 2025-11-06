// src/services/appointmentService.js

import apiClient from './apiClient'; // Assuming this is your configured Axios instance
// NOTE: Ensure your apiClient is correctly pointing to the live Render backend URL

const BASE_DOMAIN = "https://hospital-management-backend-v955.onrender.com"; 
const API_BASE = BASE_DOMAIN + "/api"; 
const APPOINTMENT_API_URL = API_BASE + "/appointments";
const DOCTOR_API_URL = API_BASE + "/doctors";


// 1. Fetch appointments accessible by the current user (GENERAL LIST)
// Backend endpoint: GET /api/appointments/my?startDate=...
const getMyAppointments = async (startDate, endDate) => {
    const params = {};
    
    if (startDate) {
        params.startDate = startDate; // Sends 'YYYY-MM-DD'
    }
    if (endDate) {
        params.endDate = endDate; // Sends 'YYYY-MM-DD'
    }

    // Axios will send parameters ONLY if they are populated
    const response = await apiClient.get(APPOINTMENT_API_URL + "/my", { params });
    return response.data;
};

// 2. Book a new appointment (POST /api/appointments)
const bookAppointment = async (appointmentData) => {
    const response = await apiClient.post(APPOINTMENT_API_URL, appointmentData);
    return response.data;
};

// 3. Update appointment status (PATCH /api/appointments/{id}/status)
const updateStatus = async (appointmentId, newStatus) => {
    const response = await apiClient.patch(
        `${APPOINTMENT_API_URL}/${appointmentId}/status?status=${newStatus}`
    );
    return response.data;
};

// 4. Fetch list of Doctors (GET /api/doctors)
const getDoctors = async () => {
    const response = await apiClient.get(DOCTOR_API_URL); 
    return response.data;
};


// Consolidate and export the final service object
const appointmentService = { 
    getMyAppointments, 
    bookAppointment, 
    updateStatus, 
    getDoctors 
};

export default appointmentService;
