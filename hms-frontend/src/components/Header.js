// src/components/Header.js

import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Header.css'; 

// --- NEW HELPER FUNCTION FOR ROLE-SPECIFIC LINKS ---
const RoleNavigation = ({ role }) => {
    if (!role) return null;
    
    // Define links based on role
    let links = [];

    if (role === 'ROLE_DOCTOR' || role === 'ROLE_ADMIN') {
        links = [
            // FIX: Direct Doctor's 'Schedule' button to their integrated dashboard view
            { title: 'Appointments', path: '/appointments/list' }, // <-- CORRECTED PATH
            
            // Patient Records list view remains here
            { title: 'Patient Records', path: '/records/list' } 
        ];
    } else if (role === 'ROLE_PATIENT') {
        links = [
            { title: 'My Appointments', path: '/appointments/list' },
            { title: 'Book Appointment', path: '/appointments/book' },
            { title: 'My Records', path: '/records/list' } 
        ];
    }

    return (
        <Box sx={{ ml: 4, display: 'flex', gap: 2 }}>
            {links.map((link) => (
                <Button 
                    key={link.title}
                    color="inherit" 
                    component={Link} 
                    to={link.path}
                    sx={{ textTransform: 'none', border: '1px solid rgba(255,255,255,0.5)' }} // Simple styling
                >
                    {link.title}
                </Button>
            ))}
        </Box>
    );
};
// ---------------------------------------------------


const Header = () => {
    const { user, role, logout } = useAuth();
    const navigate = useNavigate();
    // ... handleLogout and getDashboardPath methods ...

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const getDashboardPath = (userRole) => {
        if (!userRole) return '/';
        return `/${userRole.split('_')[1].toLowerCase()}/dashboard`;
    };

    return (
        <AppBar position="static" className="hms-header">
            <Toolbar>
                
                {/* 1. Brand/Logo Link */}
                <Typography variant="h6" component={Link} 
                    to={getDashboardPath(role)} 
                    className="hms-brand" 
                    sx={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center' }}
                > 
                    <LocalHospitalIcon sx={{ mr: 1 }} />
                    HMS | {role ? role.split('_')[1] : 'Guest'}
                </Typography>
                
                {/* 2. Role-Based Navigation Links (NEW LOCATION) */}
                <RoleNavigation role={role} />

                {/* --- Spacer to push user info to the right --- */}
                <Box sx={{ flexGrow: 1 }} /> 
                
                {/* 3. User Info and Logout */}
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {user ? (
                        <>
                            <Typography variant="body1" component="span" sx={{ mr: 2 }}>
                                Welcome, {user.name}
                            </Typography>
                            <Button color="inherit" onClick={handleLogout} variant="outlined">
                                LOGOUT
                            </Button>
                        </>
                    ) : (
                        <Button color="inherit" component={Link} to="/">
                            Login
                        </Button>
                    )}
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default Header;