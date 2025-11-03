// src/pages/Login.js

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom'; 
import { useAuth } from '../context/AuthContext';
import { TextField, Button, Box, Typography, Card, CardContent, CircularProgress } from '@mui/material'; // Added CircularProgress for loading
import './Login.css'; // <-- External CSS for centering and structure

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false); // State for loading indicator
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setMessage('');
        setLoading(true); // Start loading
        try {
            const user = await login(username, password);
            
            // Redirect based on role
            if (user.role === "ROLE_ADMIN") {
                navigate("/admin/dashboard");
            } else if (user.role === "ROLE_DOCTOR") {
                navigate("/doctor/dashboard");
            } else if (user.role === "ROLE_PATIENT") {
                navigate("/patient/dashboard");
            }
        } catch (error) {
            setMessage("Login failed. Check username and password.");
        } finally {
            setLoading(false); // Stop loading
        }
    };

    return (
        // 1. OUTER BOX: Centers the entire content vertically and horizontally (uses external CSS)
        <Box className="login-page-container" sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            minHeight: '100vh', 
            // Ensures the background shine is visible
            
        }}> 
            {/* 2. CARD: Holds the login form structure */}
            <Card className="login-card" sx={{ 
                minWidth: 350, 
                maxWidth: 400,
                p: 3, 
                boxShadow: 3
            }}>
                <CardContent>
                    <Typography variant="h5" component="div" gutterBottom align="center" sx={{ mb: 4 }}>
                        Hospital Management Login
                    </Typography>
                    
                    {/* 3. FORM FIELDS: Stacked and Spaced */}
                    <Box component="form" onSubmit={handleLogin} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        
                        <TextField
                            label="Username *" 
                            variant="outlined"
                            fullWidth
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                        <TextField
                            label="Password *" 
                            type="password"
                            variant="outlined"
                            fullWidth
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        
                        <Button 
                            type="submit" 
                            variant="contained" 
                            size="large" 
                            color="primary" 
                            fullWidth 
                            sx={{ mt: 2 }}
                            disabled={loading} // Disable button while loading
                        >
                            {loading ? <CircularProgress size={24} color="inherit" /> : 'LOGIN'}
                        </Button>
                        
                        {message && (
                            <Typography color="error" align="center" variant="body2" sx={{ mt: 1 }}>
                                {message}
                            </Typography>
                        )}

                        {/* 4. NAVIGATION LINKS SECTION (Register and Forgot Password) */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                            
                            {/* Register Link */}
                            <Typography 
                                variant="body2" 
                                component={Link} 
                                to="/register" 
                                sx={{ textDecoration: 'none', color: 'primary.main', fontWeight: 'bold' }}
                            >
                                New User? **Register**
                            </Typography>
                            
                            {/* Forgot Password Link */}
                            <Typography 
                                variant="body2" 
                                component={Link} 
                                to="/forgot-password" 
                                sx={{ textDecoration: 'none', color: 'text.secondary' }}
                            >
                                Forgot Password?
                            </Typography>
                        </Box>
                    </Box>
                </CardContent>
            </Card>
        </Box>
    );
};

export default Login;