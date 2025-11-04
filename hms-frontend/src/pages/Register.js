// src/pages/Register.js

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { TextField, Button, Box, Typography, Card, CardContent, FormControl, InputLabel, Select, MenuItem, CircularProgress } from '@mui/material';
import axios from 'axios';
import './Login.css'; 

const Register = () => {
    // --- State Management ---
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');         // State for display name
    const [mobileNumber, setMobileNumber] = useState(''); // State for phone number
    const [specialization, setSpecialization] = useState(''); // State for doctor specialization
    const [role, setRole] = useState('ROLE_PATIENT'); 
    const [message, setMessage] = useState('');
    const [submitting, setSubmitting] = useState(false);
    
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setMessage('');
        setSubmitting(true);
        
        // 1. Construct the Payload
        const payload = { 
            username, 
            password,
            fullName,          // Sent to backend
            mobileNumber,      // Sent to backend
            role,
            // Conditionally include specialization
            specialization: role === 'ROLE_DOCTOR' ? specialization : null 
        };
        
        try {
            // 2. Submit to Backend
            await axios.post("https://hospital-management-backend-v955.onrender.com/api/auth/register", payload);
            
            setMessage("Registration successful! You can now log in.");
            
            // 3. Redirect to login after a short delay
            setTimeout(() => navigate('/'), 1000); 
        } catch (error) {
        console.error("Registration Error:", error.response); 
        
        let displayMessage = "Registration failed: Please check required fields.";

        // Check for specific validation errors (HTTP 400 Bad Request)
        const validationErrors = error.response?.data?.errors;
        
        if (validationErrors && validationErrors.length > 0) {
            // Find the first field error and format it for the user
            const firstError = validationErrors[0];
            
            // Example: "Password Error: size must be between 6 and 40"
            displayMessage = `${firstError.field}: ${firstError.defaultMessage}`;
            
        } else if (error.response?.status === 409) {
            // Check for specific status codes like 409 Conflict (often used for unique constraint violation)
            displayMessage = "Registration failed: Username is already taken.";
            
        } else if (error.response?.data) {
            // Fallback for general custom error messages from the backend
            displayMessage = `Registration failed: ${error.response.data}`;
        }
        
        setMessage(displayMessage);
    } finally {
        setSubmitting(false);
    }
    };

    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
            <Card className="login-card" sx={{ minWidth: 350, maxWidth: 400, p: 3, boxShadow: 3 }}>
                <CardContent>
                    <Typography variant="h5" gutterBottom align="center">
                        User Registration
                    </Typography>
                    
                    {/* Form container with spacing */}
                    <Box component="form" onSubmit={handleRegister} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        
                        {/* 1. Full Name (New Field) */}
                        <TextField 
                            label="Full Name" 
                            fullWidth 
                            required 
                            value={fullName} 
                            onChange={(e) => setFullName(e.target.value)}
                        />
                        
                        {/* 2. Mobile Number (New Field) */}
                        <TextField 
                            label="Mobile Number" 
                            fullWidth 
                            required 
                            value={mobileNumber} 
                            onChange={(e) => setMobileNumber(e.target.value)}
                        />

                        {/* 3. Username */}
                        <TextField 
                            label="Username" 
                            fullWidth 
                            required 
                            value={username} 
                            onChange={(e) => setUsername(e.target.value)}
                        />
                        
                        {/* 4. Password */}
                        <TextField 
                            label="Password" 
                            type="password" 
                            fullWidth 
                            required 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        
                        {/* 5. Role Selection */}
                        <FormControl fullWidth variant="outlined" sx={{ mt: 1 }}>
                            <InputLabel id="role-label">Register As</InputLabel>
                            <Select 
                                labelId="role-label" 
                                id="role-select" 
                                value={role} 
                                label="Register As" 
                                onChange={(e) => {
                                    setRole(e.target.value);
                                    setSpecialization('');
                                }}
                            >
                                <MenuItem value={"ROLE_PATIENT"}>Patient</MenuItem>
                                <MenuItem value={"ROLE_DOCTOR"}>Doctor</MenuItem>
                            </Select>
                        </FormControl>
                        
                        {/* 6. Conditional: Specialization Field for Doctors */}
                        {role === 'ROLE_DOCTOR' && (
                            <TextField 
                                label="Specialization (e.g., Cardiology)" 
                                fullWidth 
                                required 
                                value={specialization} 
                                onChange={(e) => setSpecialization(e.target.value)}
                            />
                        )}

                        {/* 7. Submission Button */}
                        <Button 
                            type="submit" 
                            variant="contained" 
                            size="large" 
                            sx={{ mt: 2 }}
                            disabled={submitting}
                        >
                            {submitting ? <CircularProgress size={24} color="inherit" /> : 'Register Account'}
                        </Button>

                        {/* Messages and Login Link */}
                        {message && (<Typography color={message.includes("successful") ? 'success' : 'error'} align="center" sx={{ mt: 1 }}>{message}</Typography>)}
                        
                        <Typography variant="body2" component={Link} to="/" align="center" sx={{ mt: 2 }}>
                            Already have an account? Login
                        </Typography>
                    </Box>
                </CardContent>
            </Card>
        </Box>
    );
};

export default Register;
