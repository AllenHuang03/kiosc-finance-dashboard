// src/pages/DataIntegrationRedirect.js
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';

const DataIntegrationRedirect = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to the DataIntegration page after a short delay
    const timer = setTimeout(() => {
      navigate('/data-integration');
    }, 100);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
      <CircularProgress />
      <Typography variant="body1" sx={{ mt: 2 }}>
        Redirecting to Data Integration...
      </Typography>
    </Box>
  );
};

export default DataIntegrationRedirect;