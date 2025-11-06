// src/services/appointmentService.js

import apiClient from './apiClient'; // Your configured Axios instance

const BASE_DOMAIN = "https://hospital-management-backend-v955.onrender.com"; 
const API_BASE = BASE_DOMAIN + "/api"; 
const APPOINTMENT_API_URL = API_BASE + "/appointments";
const DOCTOR_API_URL = API_BASE + "/doctors";

// 1. Fetch user's appointments (optional, not used in dashboard)
const getMyAppointments = async (startDate, endDate) => {
    const params = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    const response = await apiClient.get(APPOINTMENT_API_URL + "/my", { params });
    return response.data;
};

// 2. Book a new appointment
const bookAppointment = async (appointmentData) => {
    const response = await apiClient.post(APPOINTMENT_API_URL, appointmentData);
    return response.data;
};

// 3. Update appointment status
const updateStatus = async (appointmentId, newStatus) => {
    const response = await apiClient.patch(
        `${APPOINTMENT_API_URL}/${appointmentId}/status?status=${newStatus}`
    );
    return response.data;
};

// ✅ 4. Get today's appointments for doctor
const getTodayAppointmentsForDoctor = async () => {
    const response = await apiClient.get(APPOINTMENT_API_URL + "/today"); 
    return response.data;
};

// 5. Fetch all doctors
const getDoctors = async () => {
    const response = await apiClient.get(DOCTOR_API_URL); 
    return response.data;
};

// Export all
const appointmentService = { 
    getMyAppointments, 
    bookAppointment, 
    updateStatus, 
    getDoctors,
    getTodayAppointmentsForDoctor
};

export default appointmentService;
