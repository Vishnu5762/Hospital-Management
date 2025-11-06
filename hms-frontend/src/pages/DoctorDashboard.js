// src/pages/DoctorDashboard.js

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { 
    Typography, Grid, Card, CardContent, CardActionArea, Box, 
    Table, TableContainer, TableHead, TableRow, TableCell, TableBody, 
    Alert, CircularProgress, Button, Paper 
} from '@mui/material';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import PeopleIcon from '@mui/icons-material/People';
import PostAddIcon from '@mui/icons-material/PostAdd'; 
import RefreshIcon from '@mui/icons-material/Refresh'; 
import appointmentService from '../services/appointmentService'; 
import { useAuth } from '../context/AuthContext'; 

// ========================================================================
// 1. NESTED COMPONENT: DoctorAppointmentTable 
// ========================================================================
const DoctorAppointmentTable = ({ appointments, role, onStatusUpdate }) => { 
    console.log("in the DoctorAppointmenttable"+appointments);
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

    if (appointments.length === 0) {
        return <Alert severity="info" sx={{ mt: 2 }}>You have no appointments scheduled for today.</Alert>;
    }

    return (
        <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table size="small">
                <TableHead>
                    <TableRow sx={{ backgroundColor: '#e0e0e0' }}>
                        <TableCell>Time</TableCell>
                        <TableCell>Patient</TableCell>
                        <TableCell>Reason</TableCell>
                        <TableCell>Status</TableCell>
                        {role === 'ROLE_DOCTOR' && <TableCell align="center">Manage</TableCell>} 
                        {role === 'ROLE_DOCTOR' && <TableCell align="center">Record</TableCell>} 
                    </TableRow>
                </TableHead>
                <TableBody>
                    {appointments.map((appt) => (
                        <TableRow key={appt.id}>
                            <TableCell>{new Date(appt.appointmentTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</TableCell>
                            <TableCell>{appt.patientName}</TableCell>
                            <TableCell>{appt.reason}</TableCell>
                            <TableCell>
                                <Typography variant="body2" color={appt.status === 'SCHEDULED' ? 'primary' : appt.status === 'COMPLETED' ? 'success' : 'error'}>
                                    {appt.status}
                                </Typography>
                            </TableCell>
                            
                            {/* 1. Manage Column (Status Update) */}
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

                            {/* 2. Record Column (Creation/Updated Text) */}
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
// 2. MAIN COMPONENT: DoctorDashboard (FIXED FETCHING LOGIC)
// ========================================================================
const DoctorDashboard = () => {
    const { role, user } = useAuth(); 
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Helper function to check if an appointment is for today (CRITICAL FOR LOCAL FILTERING)
    const isToday = (appointmentTime) => {
        // Normalizes times to midnight for reliable date comparison
        const today = new Date();
        today.setHours(0, 0, 0, 0); 

        const apptDate = new Date(appointmentTime);
        apptDate.setHours(0, 0, 0, 0); 
        
        return apptDate.getTime() === today.getTime();
    };

    // Function to fetch appointments from the backend (MODIFIED FOR LOCAL FILTERING)
    const fetchAppointments = async () => {
        try {
            // CRITICAL FIX: Call the general endpoint that fetches ALL of the doctor's appointments
            const response = await appointmentService.getTodayAppointmentsForDoctor(); 
            const allAppointments = response.data; 
        
            setAppointments(allAppointments); // Set only today's appointments to the state
            console.log("in fetch appointments"+allAppointments);
            setError(null); // Clear previous errors on successful fetch
        } catch (err) {
            // Set the error state to display the alert
            setError("Failed to fetch appointments. Check backend console for generic list endpoint."); 
            console.error("Appointment fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    // Load appointments on component mount
    useEffect(() => {
        fetchAppointments();
    }, []);

    // Function to update local state after a successful API status change
    const handleLocalStatusUpdate = (apptId, newStatus) => {
        setAppointments(prev => 
            prev.map(a => {
                if (a.id === apptId) {
                    return { ...a, status: newStatus, hasRecord: false };
                }
                return a;
            })
        );
    };

    const modules = [
        { title: "My Patient Records", icon: <PeopleIcon sx={{ fontSize: 40 }} color="success" />, path: "/records/list" }, 
    ];

    return (
        <Layout>
            <Box sx={{ p: 3 }}>
                
                {/* 1. Welcome Hero Section (STYLED CONTENT) */}
                <Box sx={{ 
                    mb: 5, 
                    p: 4, 
                    backgroundColor: '#e3f2fd',
                    borderRadius: 2,
                    boxShadow: 2
                }}>
                    <Typography variant="h3" gutterBottom color="primary.dark">
                        Welcome back, Dr. {user?.name || 'Guest'}!
                    </Typography>
                    <Typography variant="h6" color="text.secondary">
                        Your management hub for patient care and documentation.
                    </Typography>
                </Box>

                {/* 2. Quick Action Modules */}
                <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
                    Quick Actions
                </Typography>
                
                <Grid container spacing={4} sx={{ mb: 4 }}>
                    {modules.map((module) => (
                        <Grid item xs={12} sm={6} md={3} key={module.title}>
                            <Card className="feature-card">
                                <CardActionArea component={Link} to={module.path}> 
                                    <CardContent sx={{ textAlign: 'center', p: 3 }}>
                                        {module.icon}
                                        <Typography variant="h6" sx={{ mt: 1 }}>{module.title}</Typography>
                                    </CardContent>
                                </CardActionArea>
                            </Card>
                        </Grid>
                    ))}
                </Grid>

                {/* 3. Schedule List Section */}
                <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
                    Today's Schedule
                </Typography>
                
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}><CircularProgress /></Box>
                ) : (
                    // Renders the Appointment Table OR the "No appointments" alert
                    <DoctorAppointmentTable 
                        appointments={appointments} 
                        role={role}
                        onStatusUpdate={handleLocalStatusUpdate} 
                    />
                )}
            </Box>
        </Layout>
    );
};

export default DoctorDashboard;
