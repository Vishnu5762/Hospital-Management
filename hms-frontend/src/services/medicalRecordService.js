// src/services/medicalRecordService.js

import axios from 'axios';

const BASE_DOMAIN = "https://hospital-management-backend-v955.onrender.com";
const API_URL = BASE_DOMAIN =+"/api/records"; 

// 1. Create a new medical record (POST /api/records)
const createRecord = async (recordData) => {
    // Axios automatically includes the JWT token
    const response = await axios.post(API_URL, recordData);
    return response.data;
};
const getRecordById = async (recordId) => {
    // Calls the secure backend endpoint: GET /api/records/{recordId}
    const response = await axios.get(`${API_URL}/${recordId}`);
    return response.data;
};

// 2. Fetch records accessible by the current user (GET /api/records/my)
const getMyAccessibleRecords = async () => {
    const response = await axios.get(API_URL + "/my");
    return response.data;
};

const medicalRecordService = { createRecord, getMyAccessibleRecords,getRecordById };
export default medicalRecordService;
