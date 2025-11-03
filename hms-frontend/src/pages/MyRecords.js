// src/pages/MyRecords.js

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; 
import Layout from '../components/Layout';
import { 
    Typography, Paper, Table, TableContainer, TableHead, TableRow, TableCell, TableBody, 
    Alert, CircularProgress, Box, Button 
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility'; 
import medicalRecordService from '../services/medicalRecordService';
import { useAuth } from '../context/AuthContext';
import DateFilter from '../components/DateFilter'; // <-- NEW: Import DateFilter

const MyRecords = () => {
    const { role } = useAuth();
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // NEW STATE: To manage the start and end dates for filtering
    const [filterDates, setFilterDates] = useState({ startDate: null, endDate: null });

    /**
     * Data Fetching Function (MODIFIED to accept filters)
     */
    const fetchRecords = async () => {
        try {
            // Pass the date parameters to the API call
            const data = await medicalRecordService.getMyAccessibleRecords(
                filterDates.startDate, 
                filterDates.endDate
            );
            setRecords(data);
        } catch (err) {
            setError("Failed to fetch medical records. Access denied or server error.");
            console.error("Records fetch error:", err);
        } finally {
            setLoading(false);
        }
    };
    
    // Function passed to the DateFilter component
    const handleFilterChange = (start, end) => {
        setLoading(true);
        // This triggers the useEffect hook to re-fetch data
        setFilterDates({ startDate: start, endDate: end });
    };


    // Load records on component mount OR when filterDates change
    useEffect(() => {
        fetchRecords();
    }, [filterDates]); // <-- DEPENDENCY ADDED: Re-fetches data whenever filters change


    if (loading) return <Layout><Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box></Layout>;
    
    /**
     * Helper to define table columns and order based on the user's role.
     */
    const getColumns = () => {
        let base = [
            { id: 'recordedAt', label: 'Date' },
            { id: 'diagnosis', label: 'Diagnosis' },
        ];

        if (role === 'ROLE_ADMIN') {
            base.push({ id: 'patientName', label: 'Patient' });
            base.push({ id: 'doctorName', label: 'Doctor' });
        } else if (role === 'ROLE_DOCTOR') {
            base.push({ id: 'patientName', label: 'Patient' }); 
        } else if (role === 'ROLE_PATIENT') {
            base.push({ id: 'doctorName', label: 'Doctor' });   
        }
        
        base.push({ id: 'consultationNotes', label: 'Notes Preview' });
        
        if (role === 'ROLE_DOCTOR' || role === 'ROLE_ADMIN') {
            base.push({ id: 'action', label: 'Action', align: 'center' });
        }
        
        return base;
    };

    const columns = getColumns();

    return (
        <Layout>
            <Typography variant="h4" gutterBottom>
                {role === 'ROLE_PATIENT' ? 'My Medical History' : 'Accessible Medical Records'}
            </Typography>

            {/* 1. Date Filtering Component (New) */}
            <DateFilter onFilter={handleFilterChange} />
            
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            
            {records.length === 0 ? (
                <Alert severity="info">No medical records found for your profile.</Alert>
            ) : (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                                {columns.map((col) => (
                                    <TableCell key={col.id} align={col.align || 'left'}>{col.label}</TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {records.map((record) => (
                                <TableRow key={record.id}>
                                    <TableCell>{new Date(record.recordedAt).toLocaleDateString()}</TableCell>
                                    <TableCell>{record.diagnosis}</TableCell>
                                    
                                    {/* Conditional Column RENDERING */}
                                    {(role === 'ROLE_DOCTOR' || role === 'ROLE_ADMIN') && <TableCell>{record.patientName}</TableCell>}
                                    {(role === 'ROLE_PATIENT' || role === 'ROLE_ADMIN') && <TableCell>{record.doctorName}</TableCell>}
                                    
                                    <TableCell>{record.consultationNotes.substring(0, 50)}...</TableCell>
                                    
                                    {/* Action Cell (Visible to Doctor/Admin) */}
                                    {(role === 'ROLE_DOCTOR' || role === 'ROLE_ADMIN') && (
                                        <TableCell align="center">
                                            <Button 
                                                variant="outlined" 
                                                size="small" 
                                                color="info"
                                                startIcon={<VisibilityIcon />}
                                                component={Link}
                                                to={`/records/view/${record.id}`} 
                                            >
                                                View/Edit
                                            </Button>
                                        </TableCell>
                                    )}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Layout>
    );
};

export default MyRecords;