// src/pages/ViewEditMedicalRecord.js (FINAL VERSION)

import React, { useState, useEffect } from 'react';
import { useParams,useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { Typography, Box, Alert, CircularProgress, Card, CardContent, TextField, Button } from '@mui/material';
import medicalRecordService from '../services/medicalRecordService'; // <-- REQUIRED SERVICE

const ViewEditMedicalRecord = () => {
    const { recordId } = useParams();
    const navigate= useNavigate();
    const [loading, setLoading] = useState(true);
    const [recordData, setRecordData] = useState(null);
    const [error, setError] = useState(null);
    
    // State to hold editable field values (if edit mode were enabled)
    const [notes, setNotes] = useState(''); 

    // --- Data Fetch Hook ---
    useEffect(() => {
        const fetchRecord = async () => {
            try {
                // ACTUAL API CALL to your Spring Boot backend
                const data = await medicalRecordService.getRecordById(recordId);
                setRecordData(data);
                setNotes(data.consultationNotes); // Initialize editable state
            } catch (err) {
                const errorMessage = err.response?.data?.message || `Failed to load record #${recordId}. Access denied or not found.`;
                setError(errorMessage);
            } finally {
                setLoading(false);
            }
        };

        if (recordId) {
            fetchRecord();
        }
    }, [recordId]); // Re-run if recordId changes

    // --- Placeholder Update Handler ---
    const handleUpdate = (e) => {
        e.preventDefault();
        // In a completed system, you would call:
        // medicalRecordService.updateRecord(recordId, { notes: notes, diagnosis: ... })
        alert(`Record ${recordId} updated successfully (SIMULATION).`);
        navigate('/records/list', { replace: true });
    };


    if (loading) return <Layout><Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box></Layout>;
    
    if (error || !recordData) return <Layout><Alert severity="error">{error || `Record ${recordId} not found.`}</Alert></Layout>;
    
    return (
        <Layout>
            <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
                <Typography variant="h4" gutterBottom align="center">
                    Medical Record Details #{recordId}
                </Typography>
                
                <Card sx={{ boxShadow: 3, mt: 3 }}>
                    <CardContent>
                        <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
                            Patient: **{recordData.patientName}** | Documented By: {recordData.doctorName}
                        </Typography>

                        <Box component="form" onSubmit={handleUpdate} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            
                            <TextField 
                                label="Diagnosis / Summary" 
                                value={recordData.diagnosis} // Display data fetched from backend
                                fullWidth 
                                variant="outlined" 
                                disabled // Keep disabled as this is usually fixed
                            />
                            
                            <TextField 
                                label="Consultation Notes" 
                                value={notes} // Use local state for potential editing
                                onChange={(e) => setNotes(e.target.value)}
                                fullWidth 
                                multiline
                                rows={10}
                                variant="outlined" 
                                // Enable editing, ready for the backend PUT/PATCH API
                            />
                            
                            <Button type="submit" variant="contained" color="primary">
                                Save Changes
                            </Button>
                        </Box>
                    </CardContent>
                </Card>
            </Box>
        </Layout>
    );
};

export default ViewEditMedicalRecord;