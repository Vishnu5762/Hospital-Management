// src/pages/CreateMedicalRecord.js

import React, { useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { Typography, Box, TextField, Button, Grid, Card, CardContent, Alert, CircularProgress } from '@mui/material';
import medicalRecordService from '../services/medicalRecordService'; // <-- NOW CORRECTLY IMPORTED

const CreateMedicalRecord = () => {
    
    // 1. Get IDs from URL parameters
    const { patientId, doctorId } = useParams(); 
    // 2. Get names and apptId from navigation state (passed from MyAppointments.js)
    const location = useLocation();
    const navigate = useNavigate();
    
    // FIX: Safely extract apptId from navigation state
    const apptId = location.state?.apptId; 

    // Default state with pre-filled IDs
    const [formData, setFormData] = useState({
        // IDs for the MedicalRecordRequest DTO:
        patientId: parseInt(patientId),
        doctorId: parseInt(doctorId),
        appointmentId: apptId, // <-- CRITICAL FIX: Pass the acquired Appointment ID
        
        diagnosis: '',
        consultationNotes: '',
    });
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState(null);

    // Update form data on change
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Safety check: Ensure appointmentId is not null before proceeding
        if (!formData.appointmentId) {
            setMessage({ type: 'error', text: 'Appointment ID is missing. Please navigate from the schedule list.' });
            return;
        }

        setSubmitting(true);
        setMessage(null);
        
        try {
            // API CALL: Submit the form data to the Spring Boot endpoint
            await medicalRecordService.createRecord(formData);
            
            setMessage({ type: 'success', text: `Record successfully created for Patient ID ${patientId}. Redirecting...` });
            
            // Redirect back to the appointment list after a delay
            setTimeout(() => navigate('/appointments/list', { replace: true, state: { successMsg: true } }), 2000);
        } catch (error) {
            console.error("Record Creation Error:", error);
            const errorMessage = error.response?.data?.message || error.response?.data || 'Failed to save medical record. Check backend.';
            setMessage({ type: 'error', text: errorMessage });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Layout>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 4 }}>
                <Typography variant="h4" gutterBottom>
                    Create Medical Record
                </Typography>
                <Typography variant="subtitle1" sx={{ mb: 3 }}>
                    Patient: **{location.state?.patientName || `ID ${patientId}`}** | Doctor: {location.state?.doctorName || `ID ${doctorId}`}
                </Typography>

                {message && <Alert severity={message.type} sx={{ mb: 2, width: '100%', maxWidth: 600 }}>{message.text}</Alert>}

                <Card sx={{ maxWidth: 600, width: '100%', boxShadow: 4 }}>
                    <CardContent>
                        <Box component="form" onSubmit={handleSubmit}>
                            <Grid container spacing={3}>
                                
                                {/* Diagnosis Field */}
                                <Grid item xs={12}>
                                    <TextField label="Diagnosis / ICD Code" name="diagnosis" fullWidth required variant="outlined" 
                                        value={formData.diagnosis}
                                        onChange={handleChange}
                                    />
                                </Grid>
                                
                                {/* Consultation Notes Field */}
                                <Grid item xs={12}>
                                    <TextField label="Consultation Notes (Detailed)" name="consultationNotes" fullWidth multiline rows={8} required variant="outlined" 
                                        value={formData.consultationNotes}
                                        onChange={handleChange}
                                    />
                                </Grid>
                                
                                {/* Final Submit Button */}
                                <Grid item xs={12}>
                                    <Button type="submit" variant="contained" color="success" fullWidth disabled={submitting}>
                                        {submitting ? <CircularProgress size={24} color="inherit" /> : 'Finalize Record'}
                                    </Button>
                                </Grid>
                            </Grid>
                        </Box>
                    </CardContent>
                </Card>
            </Box>
        </Layout>
    );
};

export default CreateMedicalRecord;