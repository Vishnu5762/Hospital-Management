// src/pages/ForgotPassword.js

import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { TextField, Button, Box, Typography, Card, CardContent, CircularProgress, Alert } from '@mui/material';
import axios from 'axios';
import Layout from '../components/Layout'; // Use Layout to maintain background style
import './Login.css'; // Reusing login styles

const ForgotPassword = () => {
    const [searchParams] = useSearchParams();
    const [username, setUsername] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [message, setMessage] = useState(null);
    const [stage, setStage] = useState(1); // 1: Request Email, 2: Enter OTP, 3: Success
    const [submitting, setSubmitting] = useState(false);
    const navigate = useNavigate();

    // Stage 1: Request OTP (Send Username)
    const handleRequestOtp = async (e) => {
        e.preventDefault();
        setMessage(null);
        setSubmitting(true);
        try {
            // Backend sends OTP to console/database
            const response = await axios.post("/api/auth/password/request-otp", null, { params: { username } });
            
            setMessage({ type: 'success', text: response.data || 'OTP sent. Check console for the code.' });
            setStage(2); // Move to OTP verification stage
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data || 'Failed to send OTP.' });
        } finally {
            setSubmitting(false);
        }
    };

    // Stage 2: Verify OTP and Reset Password
    const handleResetPassword = async (e) => {
        e.preventDefault();
        setMessage(null);
        setSubmitting(true);

        if (newPassword.length < 6) {
             setMessage({ type: 'error', text: 'Password must be at least 6 characters long.' });
             setSubmitting(false);
             return;
        }

        try {
            // Submit username, OTP, and new password to the backend
            const response = await axios.post("/api/auth/password/reset", null, { 
                params: { 
                    username, 
                    otp, 
                    newPassword 
                } 
            });
            
            setMessage({ type: 'success', text: response.data || 'Password reset successfully!' });
            setStage(3); // Move to success stage

        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data || 'Reset failed. Invalid/Expired OTP or Username.' });
        } finally {
            setSubmitting(false);
        }
    };
    
    // --- Conditional Rendering ---
    
    // Stage 3: Success View
    if (stage === 3) {
        return (
            <Layout>
                <Box sx={{ p: 5, textAlign: 'center' }}>
                    <Alert severity="success" sx={{ mb: 3 }}>{message.text}</Alert>
                    <Typography variant="body1">
                        You can now proceed to the login page with your new password.
                    </Typography>
                    <Button variant="contained" sx={{ mt: 3 }} onClick={() => navigate('/')}>Go to Login</Button>
                </Box>
            </Layout>
        );
    }
    
    // Stage 1 & 2: Forms
    return (
        <Layout>
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '90vh' }}>
                <Card sx={{ minWidth: 350, maxWidth: 400, p: 3, boxShadow: 4 }}>
                    <CardContent>
                        <Typography variant="h5" gutterBottom align="center" sx={{ mb: 3 }}>
                            {stage === 1 ? 'Request Password Reset' : 'Verify & Set New Password'}
                        </Typography>
                        
                        {message && (<Alert severity={message.type} sx={{ mb: 2 }}>{message.text}</Alert>)}

                        <Box component="form" onSubmit={stage === 1 ? handleRequestOtp : handleResetPassword} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            
                            {/* Input: Username */}
                            <TextField
                                label="Username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                fullWidth
                                required
                                disabled={stage === 2} // Disable if we've successfully moved past stage 1
                            />
                            
                            {/* Stage 1 Button */}
                            {stage === 1 && (
                                <Button type="submit" variant="contained" size="large" disabled={submitting}>
                                    {submitting ? <CircularProgress size={24} color="inherit" /> : 'Send OTP'}
                                </Button>
                            )}

                            {/* Stage 2 Inputs (OTP and New Password) */}
                            {stage === 2 && (
                                <>
                                    <TextField
                                        label="6-Digit OTP Code"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        fullWidth
                                        required
                                        inputProps={{ maxLength: 6 }}
                                    />
                                    <TextField
                                        label="New Password (min 6 chars)"
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        fullWidth
                                        required
                                    />
                                    <Button type="submit" variant="contained" size="large" disabled={submitting}>
                                        {submitting ? <CircularProgress size={24} color="inherit" /> : 'Reset Password'}
                                    </Button>
                                </>
                            )}
                            
                            <Button variant="text" size="small" onClick={() => navigate('/')} sx={{ mt: 1 }}>
                                Cancel and Go Back to Login
                            </Button>
                        </Box>
                    </CardContent>
                </Card>
            </Box>
        </Layout>
    );
};

export default ForgotPassword;