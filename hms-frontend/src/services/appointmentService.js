
import axios from 'axios';

const API_URL = "/api/appointments"; 

const getMyAppointments = async (startDate, endDate) => {
    const params = {};
    
    // Check if the date string is present before adding it to parameters
    if (startDate) {
        params.startDate = startDate; // Sends 'YYYY-MM-DD'
    }
    if (endDate) {
        params.endDate = endDate; // Sends 'YYYY-MM-DD'
    }

    // Axios will send the parameters ONLY if they are populated
    const response = await axios.get(API_URL + "/my", { params });
    return response.data;
};
const getTodayAppointments = async () => {
    // Calls the new backend endpoint
    const response = await axios.get(API_URL + "/today");
    return response.data;
};
const updateStatus = async (appointmentId, newStatus) => {
    
    const response = await axios.patch(
        `${API_URL}/${appointmentId}/status?status=${newStatus}`
    );
    return response.data;
};
// 2. Book a new appointment
const bookAppointment = async (appointmentData) => {
    const response = await axios.post(API_URL, appointmentData);
    return response.data;
};

// 3. Fetch list of Doctors (for the booking form)
const getDoctors = async () => {
    // Note: You need to create this endpoint in Spring Boot (e.g., /api/doctors)
    const response = await axios.get("/api/doctors"); 
    return response.data;
};
const getTodayAppointmentsForDoctor = async () => {
    // This calls the dedicated backend endpoint restricted to doctors
    const response = await axios.get(API_URL + "/today"); 
    return response.data;
};
const appointmentService = { getMyAppointments, bookAppointment, getDoctors , updateStatus, getTodayAppointments,getTodayAppointmentsForDoctor};
export default appointmentService;