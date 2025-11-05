// src/components/Header.js

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
    AppBar, Toolbar, Typography, Button, Box, IconButton, 
    Drawer, List, ListItem, ListItemButton, ListItemText 
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import MenuIcon from '@mui/icons-material/Menu'; // Hamburger icon
import { useAuth } from '../context/AuthContext';
import './Header.css'; 

// --- Helper function to define all navigation links based on role ---
const getRoleLinks = (role) => {
    let links = [];

    if (role === 'ROLE_DOCTOR' || role === 'ROLE_ADMIN') {
        links = [
            // Doctor uses dashboard as schedule hub
            { title: 'Appointments', path: '/appointments/list' }, 
            { title: 'Patient Records', path: '/records/list' }
        ];
    } else if (role === 'ROLE_PATIENT') {
        links = [
            { title: 'My Appointments', path: '/appointments/list' },
            { title: 'Book Appointment', path: '/appointments/book' },
            { title: 'My Records', path: '/records/list' }
        ];
    }
    return links;
};
// ---------------------------------------------------


const Header = () => {
    const { user, role, logout } = useAuth();
    const navigate = useNavigate();
    
    // State for managing the mobile drawer visibility
    const [drawerOpen, setDrawerOpen] = useState(false); 
    
    // Hooks to detect screen size
    const theme = useTheme();
    // isMobile is true for screen sizes smaller than the 'md' breakpoint
    const isMobile = useMediaQuery(theme.breakpoints.down('md')); 

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const getDashboardPath = (userRole) => {
        if (!userRole) return '/';
        return `/${userRole.split('_')[1].toLowerCase()}/dashboard`;
    };

    // Get the links array based on the current role
    const links = getRoleLinks(role);


    // --- Drawer Content (Used for Mobile) ---
    const DrawerList = (
        <Box sx={{ width: 250 }} role="presentation" onClick={() => setDrawerOpen(false)}>
            <List>
                {/* Links for the main modules */}
                {links.map((link) => (
                    <ListItem key={link.title} disablePadding>
                        <ListItemButton component={Link} to={link.path}>
                            <ListItemText primary={link.title} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
            <Box sx={{ p: 2, borderTop: '1px solid #ccc' }}>
                <Button fullWidth onClick={handleLogout} variant="contained" color="error">
                    LOGOUT
                </Button>
            </Box>
        </Box>
    );

    
    // --- Desktop Navigation (Inline Buttons) ---
    const DesktopNavigation = (
        <Box sx={{ display: 'flex', gap: 2 }}>
            {links.map((link) => (
                <Button 
                    key={link.title}
                    color="inherit" 
                    component={Link} 
                    to={link.path}
                    sx={{ 
                        textTransform: 'none', 
                        border: '1px solid rgba(255,255,255,0.5)', 
                        minWidth: 120 
                    }}
                >
                    {link.title}
                </Button>
            ))}
        </Box>
    );


    return (
        <AppBar position="static" className="hms-header">
            <Toolbar>
                
                {/* 1. Brand/Logo Link */}
                <Typography variant="h6" component={Link} 
                    to={getDashboardPath(role)} 
                    sx={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center' }}
                > 
                    <LocalHospitalIcon sx={{ mr: 1 }} />
                    HMS | {role ? role.split('_')[1] : 'Guest'}
                </Typography>
                
                {/* --- SPACER AND NAVIGATION --- */}
                
                {user && (
                    <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                        
                        {/* Desktop Navigation Links */}
                        {!isMobile && DesktopNavigation}
                        
                        {/* User Welcome Message */}
                        <Typography variant="body1" component="span" sx={{ mr: 2, ml: 4 }}>
                            Welcome, {user?.name || user?.username}
                        </Typography>

                        {/* Logout Button (Desktop) */}
                        {!isMobile && (
                            <Button color="inherit" onClick={handleLogout} variant="outlined">
                                LOGOUT
                            </Button>
                        )}
                        
                        {/* 2. Mobile Hamburger Menu (Only visible on small screens) */}
                        {isMobile && (
                            <IconButton
                                color="inherit"
                                edge="end"
                                onClick={() => setDrawerOpen(true)}
                                sx={{ ml: 1 }}
                            >
                                <MenuIcon />
                            </IconButton>
                        )}
                    </Box>
                )}
                
                {/* Fallback for Guest user */}
                {!user && (
                    <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'flex-end' }}>
                        <Button color="inherit" component={Link} to="/">Login</Button>
                    </Box>
                )}
            </Toolbar>

            {/* 3. Drawer Component (Always defined, only opens on mobile click) */}
            <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
                {DrawerList}
            </Drawer>
        </AppBar>
    );
};

export default Header;
