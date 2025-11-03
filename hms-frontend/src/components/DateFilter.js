// src/components/DateFilter.js

import React, { useState } from 'react';
import { Box, TextField, Button } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

const DateFilter = ({ onFilter }) => {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const handleSearch = () => {
        // Pass the dates up to the parent component (MyAppointments/MyRecords)
        onFilter(startDate, endDate);
    };

    return (
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 3, p: 2, border: '1px solid #ccc', borderRadius: 1 }}>
            <TextField
                label="Start Date"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                variant="outlined"
                size="small"
            />
            <TextField
                label="End Date"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                variant="outlined"
                size="small"
            />
            <Button 
                variant="contained" 
                startIcon={<SearchIcon />} 
                onClick={handleSearch}
                disabled={!startDate && !endDate}
            >
                Filter
            </Button>
            <Button 
                variant="outlined" 
                onClick={() => { setStartDate(''); setEndDate(''); onFilter('', ''); }}
            >
                Clear
            </Button>
        </Box>
    );
};

export default DateFilter;