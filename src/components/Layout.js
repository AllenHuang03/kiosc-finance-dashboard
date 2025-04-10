// src/components/Layout.js (centered content)
import React from 'react';
import { Box, CssBaseline, Container } from '@mui/material';
import { Outlet } from 'react-router-dom';
import NavigationWithAuth from './NavigationWithAuth';

const Layout = () => {
  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      
      {/* Navigation component with authentication */}
      <NavigationWithAuth />
      
      {/* Main content area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          padding: 0,
          mt: '64px', // Height of the AppBar
          minHeight: 'calc(100vh - 64px)',
          display: 'flex',
          justifyContent: 'center',
          width: '100%'
        }}
      >
        {/* Use Container for centered content with maximum width */}
        <Container maxWidth="xl" sx={{ py: 3 }}>
          {/* Outlet renders the current route's component */}
          <Outlet />
        </Container>
      </Box>
    </Box>
  );
};

export default Layout;