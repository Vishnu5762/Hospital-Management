import React from 'react';
import Header from './Header'; // Assumes you have Header.js in the same directory
import { Box, Container } from '@mui/material';


const Layout = ({ children }) => {
    return (
        // Box is used as the outer container, spanning the full height/width
        <Box sx={{ flexGrow: 1 }}>
            
            {/* 1. Header is placed at the top of every page */}
            <Header />
            
            {/* 2. Container holds the main content with max-width and internal padding (mt/mb) */}
            <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
                {children}
            </Container>
        </Box>
    );
};

export default Layout;