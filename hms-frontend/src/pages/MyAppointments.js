// src/pages/MyAppointments.js

import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import appointmentService from '../services/appointmentService';
import { 
    Typography, Paper, Table, TableContainer, TableHead, TableRow, TableCell, TableBody, 
    Alert, CircularProgress, Button, Box
} from '@mui/material';
import DateFilter from '../components/DateFilter'; // Assuming DateFilter.js is implemented
import PostAddIcon from '@mui/icons-material/PostAdd';
import RefreshIcon from '@mui/icons-material/Refresh'; 

// ========================================================================
// APPOINTMENT TABLE COMPONENT (Nested for clean separation)
// ========================================================================
const AppointmentManagementTable = ({ appointments, role, onStatusUpdate }) => {
    
    // Handles the status update API call and triggers parent state change
    const handleStatusUpdate = async (apptId, currentStatus) => {
        const newStatus = 'COMPLETED'; 
        
        try {
            const updatedAppt = await appointmentService.updateStatus(apptId, newStatus); 
            onStatusUpdate(updatedAppt.id, updatedAppt.status); 
        } catch (error) {
            alert(`Failed to update status. Check backend console for details.`); 
            console.error("Status update failed:", error);
        }
    };
    
    return (
        <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table size="small">
                <TableHead>
                    <TableRow sx={{ backgroundColor: '#e0e0e0' }}>
                        <TableCell>Date & Time</TableCell>
                        <TableCell>Doctor</TableCell>
                        <TableCell>Patient</TableCell>
                        <TableCell>Status</TableCell>
                        {role === 'ROLE_DOCTOR' && <TableCell align="center">Manage</TableCell>} 
                        {role === 'ROLE_DOCTOR' && <TableCell align="center">Record</TableCell>}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {appointments.map((appt) => (
                        <TableRow key={appt.id}>
                            {/* FIX: Use the combined date string and separate display time */}
                            <TableCell>
                                {/* Date component from LocalDateTime */}
                                {new Date(appt.appointmentTime).toLocaleDateString()}
                                <br />
                                {/* TIME: Use the guaranteed display string */}
                                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                    {appt.displayTime} 
                                </Typography>
                            </TableCell>
                            
                            <TableCell>{appt.doctorName}</TableCell>
                            <TableCell>{appt.patientName}</TableCell>
                            <TableCell>
                                <Typography variant="body2" color={appt.status === 'SCHEDULED' ? 'primary' : appt.status === 'COMPLETED' ? 'success' : 'error'}>
                                    {appt.status}
                                </Typography>
                            </TableCell>
                            
                            {/* 1. Manage Column (Status Update) - DOCTOR ONLY */}
                            {role === 'ROLE_DOCTOR' && (
                                <TableCell align="center">
                                    {appt.status === 'SCHEDULED' ? ( 
                                        <Button 
                                            variant="outlined" 
                                            size="small" 
                                            color="primary"
                                            startIcon={<RefreshIcon />}
                                            onClick={() => handleStatusUpdate(appt.id, appt.status)}
                                        >
                                            Update Status
                                        </Button>
                                    ) : (
                                        <Typography variant="caption" color="text.secondary">-</Typography>
                                    )}
                                </TableCell>
                            )}

                            {/* 2. Record Column (Creation/Updated Text) - DOCTOR ONLY */}
                            {role === 'ROLE_DOCTOR' && (
                                <TableCell align="center">
                                    {appt.hasRecord ? ( 
                                        <Typography variant="caption" color="success" sx={{ fontWeight: 'bold' }}>Record Updated</Typography>
                                    ) : (
                                        appt.status === 'COMPLETED' ? (
                                            <Button 
                                                variant="contained" 
                                                size="small" 
                                                color="success"
                                                startIcon={<PostAddIcon />}
                                                component={Link}
                                                to={`/records/create/${appt.patientId}/${appt.doctorId}`} 
                                                state={{ patientName: appt.patientName, doctorName: appt.doctorName, apptId: appt.id }}
                                            >
                                                Create Record
                                            </Button>
                                        ) : (
                                            <Typography variant="caption" color="text.secondary">-</Typography>
                                        )
                                    )}
                                </TableCell>
                            )}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};
// ========================================================================


// ========================================================================
// MAIN COMPONENT: MyAppointments
// ========================================================================
const MyAppointments = () => {
    const { role } = useAuth();
    const location = useLocation();
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [filterDates, setFilterDates] = useState({ startDate: null, endDate: null }); // State for filtering

    // Function to fetch appointments from the backend
    const fetchAppointments = async () => {
        try {
            const data = await appointmentService.getMyAppointments(
                filterDates.startDate, 
                filterDates.endDate
            );
            setAppointments(data);
        }catch (err) {
            setError("Failed to fetch appointments.");
            console.error("Appointment fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    // Load appointments on component mount or when filters change
    useEffect(() => {
        fetchAppointments();
        
        // Handle success message after redirect from record creation
        if (location.state?.successMsg) {
            setSuccessMessage("Medical record created successfully.");
            // Clear the state after reading it
            window.history.replaceState({}, document.title, location.pathname); 
        }
    }, [location.state, filterDates]); 

    // Function to update local state after a successful API status change
    const handleLocalStatusUpdate = (apptId, newStatus) => {
        setAppointments(prev => 
            prev.map(a => {
                if (a.id === apptId) {
                    return { 
                        ...a, 
                        status: newStatus,
                        hasRecord: false 
                    };
                }
                return a;
            })
        );
    };
    
    // Function passed to the DateFilter component
    const handleFilterChange = (start, end) => {
        setLoading(true);
        setFilterDates({ startDate: start, endDate: end });
    };


    if (loading) return <Layout><Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box></Layout>;
    
    return (
        <Layout>
            <Box sx={{ p: 3 }}>
                <Typography variant="h4" gutterBottom>
                    My Appointments
                </Typography>
                
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                
                {/* Display POST-SUBMISSION SUCCESS ALERT */}
                {successMessage && <Alert severity="success" sx={{ mb: 2 }}>{successMessage}</Alert>}
                
                {/* 1. Date Filtering Component */}
                <DateFilter onFilter={handleFilterChange} />
                
                {/* 2. Render the full management table */}
                <AppointmentManagementTable 
                    appointments={appointments} 
                    role={role}
                    onStatusUpdate={handleLocalStatusUpdate}
                />
            </Box>
        </Layout>
    );
};
export default MyAppointments;