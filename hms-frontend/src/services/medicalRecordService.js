// src/services/medicalRecordService.js

import axios from 'axios';

// CRITICAL: Set the base domain for the deployed backend service
const BASE_DOMAIN = "https://hospital-management-backend-v955.onrender.com"; 
const API_URL = BASE_DOMAIN + "/api/records"; 

// 1. Create a new medical record (POST /api/records)
const createRecord = async (recordData) => {
    // Sends data from CreateMedicalRecord.js to the secure backend endpoint
    const response = await axios.post(API_URL, recordData);
    return response.data;
};

// 2. Fetch a single record by ID (GET /api/records/{recordId})
const getRecordById = async (recordId) => {
    // Used by ViewEditMedicalRecord.js to fetch data for display/editing
    const response = await axios.get(`${API_URL}/${recordId}`);
    return response.data;
};

// 3. Fetch all records accessible by the current user (GET /api/records/my)
const getMyAccessibleRecords = async () => {
    // Used by MyRecords.js for listing, where backend applies role-based filtering
    const response = await axios.get(API_URL + "/my");
    return response.data;
};

// NOTE: You would add an updateRecord (PUT/PATCH) method here for full CRUD functionality

const medicalRecordService = { 
    createRecord, 
    getMyAccessibleRecords,
    getRecordById 
};

export default medicalRecordService;
