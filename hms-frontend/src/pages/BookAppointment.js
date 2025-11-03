// src/pages/BookAppointment.js

import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { 
    Typography, 
    Box, 
    TextField, 
    Button, 
    CircularProgress, 
    Alert, 
    FormControl, 
    InputLabel, 
    Select, 
    MenuItem,
    Grid,
    Card,           
    CardContent 
} from '@mui/material';
import appointmentService from '../services/appointmentService';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const BookAppointment = () => {
    const { user, role } = useAuth();
    const navigate = useNavigate();
    
    // State for form data, doctor list, and UI feedback
    const [doctors, setDoctors] = useState([]);
    const [formData, setFormData] = useState({
        doctorId: '', 
        patientId: user.role === 'ROLE_PATIENT' ? user.id : '', 
        appointmentTime: '', // Stores the datetime-local string (YYYY-MM-DDTHH:MM)
        reason: '',
        displayTimeString: '', // <--- NEW: Stores the raw HH:MM time string for persistence
    });
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState(null);

    // Fetch list of doctors on component mount
    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                const docList = await appointmentService.getDoctors();
                setDoctors(docList);
            } catch (err) {
                setMessage({ type: 'error', text: 'Failed to load doctor list. Check backend connectivity.' });
            } finally {
                setLoading(false);
            }
        };
        fetchDoctors();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        // 1. Update the form state normally
        setFormData(prev => ({ ...prev, [name]: value }));
        
        // 2. CRITICAL FIX: Extract and save the raw time string
        if (name === 'appointmentTime' && value) {
            // Extracts "HH:MM" part (e.g., "22:14") from the datetime-local value
            const timeString = value.slice(11, 16); 
            setFormData(prev => ({ ...prev, displayTimeString: timeString }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setMessage(null);
        
        try {
            const appointmentRequest = {
                // Pass all standard fields
                ...formData,
                // Send the required time string separately for backend persistence
                displayTimeString: formData.displayTimeString, 
                // Ensure date format is ISO string for the DB appointmentTime field (for sorting/querying)
                appointmentTime: new Date(formData.appointmentTime).toISOString().slice(0, 19), 
            };

            await appointmentService.bookAppointment(appointmentRequest);
            setMessage({ type: 'success', text: 'Appointment booked successfully! Redirecting...' });
            setTimeout(() => navigate('/appointments/list'), 2000);

        } catch (error) {
            console.error("Booking Error:", error);
            setMessage({ type: 'error', text: error.response?.data.message || 'Failed to book appointment.' });
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <Layout><CircularProgress sx={{ display: 'block', margin: '20px auto' }} /></Layout>;

    return (
        <Layout>
            {/* Outer container for centering */}
            <Box 
                sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    width: '100%', 
                    mt: 4 
                }}
            >
                <Typography variant="h4" gutterBottom align="center" sx={{ mb: 4 }}>
                    Book New Appointment
                </Typography>
                
                {message && (
                    <Alert severity={message.type} sx={{ mb: 3, maxWidth: 450, width: '100%' }}>
                        {message.text}
                    </Alert>
                )}

                {/* Card containing the form */}
                <Card sx={{ maxWidth: 450, width: '100%', boxShadow: 4 }}>
                    <CardContent>
                        
                        <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
                            <Grid container spacing={3}> 
                                
                                {/* 1. Doctor Selection */}
                                <Grid item xs={12}>
                                    <FormControl fullWidth required variant="outlined">
                                        <Select
        labelId="doctor-label"
        name="doctorId"
        value={formData.doctorId}
        // Use placeholder text from the default MenuItem instead of the label
        // The 'label' prop on Select is used if the InputLabel is present. We can omit it here.
        displayEmpty 
        onChange={handleChange}
    >
        {/* Explicit Placeholder MenuItem (This is what you want to see) */}
        <MenuItem value="" disabled>
            None (Select Doctor)
        </MenuItem>
        
        {/* Mapping through the fetched doctors */}
        {doctors.map((doc) => (
            <MenuItem key={doc.id} value={doc.id}>
                {doc.name} - {doc.specialization}
            </MenuItem>
        ))}
    </Select>
                                    </FormControl>
                                </Grid>

                                {/* 2. Patient ID Input (Conditional) */}
                                {user.role !== 'ROLE_PATIENT' && (
                                    <Grid item xs={12}>
                                        <TextField
                                            label="Patient ID (Who is receiving treatment)"
                                            name="patientId"
                                            type="number"
                                            fullWidth
                                            required
                                            value={formData.patientId}
                                            onChange={handleChange}
                                            variant="outlined"
                                        />
                                    </Grid>
                                )}

                                {/* 3. Date/Time Picker */}
                                <Grid item xs={12}>
                                    <TextField
                                        label="Appointment Date and Time"
                                        name="appointmentTime"
                                        type="datetime-local"
                                        fullWidth
                                        required
                                        InputLabelProps={{ shrink: true }}
                                        value={formData.appointmentTime}
                                        onChange={handleChange}
                                        variant="outlined"
                                    />
                                </Grid>
                                
                                {/* 4. Reason */}
                                <Grid item xs={12}>
                                    <TextField
                                        label="Reason for Appointment"
                                        name="reason"
                                        multiline
                                        rows={4} 
                                        fullWidth
                                        value={formData.reason}
                                        onChange={handleChange}
                                        variant="outlined"
                                    />
                                </Grid>

                                {/* 5. Submit Button */}
                                <Grid item xs={12}>
                                    <Button 
                                        type="submit" 
                                        variant="contained" 
                                        size="large"
                                        color="primary" 
                                        fullWidth
                                        disabled={submitting}
                                    >
                                        {submitting ? <CircularProgress size={24} color="inherit" /> : 'CONFIRM BOOKING'}
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

export default BookAppointment;