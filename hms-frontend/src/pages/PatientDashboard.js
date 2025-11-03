// src/pages/PatientDashboard.js

import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { Typography, Box, Grid, Card, CardContent, CardActionArea } from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import HistoryToggleOffIcon from '@mui/icons-material/HistoryToggleOff';
import { useAuth } from '../context/AuthContext'; 

const PatientDashboard = () => {
    const { user } = useAuth(); // Access the logged-in username

    const patientModules = [
        { 
            title: "View Appointments", 
            description: "Check upcoming and past appointments.", 
            icon: <CalendarMonthIcon sx={{ fontSize: 40 }} color="primary" />, 
            path: "/appointments/list" 
        },
        { 
            title: "Book New Appointment", 
            description: "Schedule a consultation with a doctor.", 
            icon: <HistoryToggleOffIcon sx={{ fontSize: 40 }} color="success" />, 
            path: "/appointments/book" 
        },
        { 
            title: "My Medical Records", 
            description: "Review diagnosis and consultation notes.", 
            icon: <HistoryToggleOffIcon sx={{ fontSize: 40 }} color="info" />, 
            path: "/records/list" 
        },
    ];

    return (
        <Layout>
            <Box sx={{ p: 4 }}>
                
                {/* 1. Welcome Hero Section */}
                <Box sx={{ 
                    mb: 5, 
                    p: 4, 
                    backgroundColor: '#e3f2fd', // Light blue background
                    borderRadius: 2,
                    boxShadow: 2
                }}>
                    <Typography variant="h3" gutterBottom color="primary.dark">
                        Welcome back, {user.name}!
                    </Typography>
                    <Typography variant="h6" color="text.secondary">
                        Your central hub for managing appointments and health records.
                    </Typography>
                </Box>
                
                {/* 2. Quick Action Modules */}
                <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
                    Quick Actions
                </Typography>
                
                <Grid container spacing={4}>
                    {patientModules.map((module) => (
                        <Grid item xs={12} sm={6} md={4} key={module.title}>
                            <Card sx={{ height: '100%', borderLeft: '5px solid #2196f3' }}>
                                <CardActionArea component={Link} to={module.path}>
                                    <CardContent>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                            {module.icon}
                                            <Typography variant="h6" component="div" sx={{ ml: 2 }}>
                                                {module.title}
                                            </Typography>
                                        </Box>
                                        <Typography variant="body2" color="text.secondary">
                                            {module.description}
                                        </Typography>
                                    </CardContent>
                                </CardActionArea>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Box>
        </Layout>
    );
};

export default PatientDashboard;