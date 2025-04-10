// src/components/ProtectedRoute.js
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { CircularProgress, Box, Typography, Alert } from '@mui/material';

/**
 * ProtectedRoute component that checks if user is authenticated before rendering children
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - The components to render if authenticated
 * @param {string[]} [props.requiredPermissions] - Optional array of permissions required to access the route
 * @param {string} [props.requiredRole] - Optional role required to access the route
 */
const ProtectedRoute = ({ 
  children, 
  requiredPermissions = [], 
  requiredRole = null 
}) => {
  const { currentUser, isAuthenticated, loading, hasPermission, hasRole } = useAuth();
  const location = useLocation();
  
  // Show loading spinner while checking auth
  if (loading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center', 
          height: '100vh' 
        }}
      >
        <CircularProgress size={40} />
        <Typography variant="body1" sx={{ mt: 2 }}>
          Verifying authentication...
        </Typography>
      </Box>
    );
  }
  
  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // Check required permissions if specified
  if (requiredPermissions.length > 0) {
    const hasAllPermissions = requiredPermissions.every(permission => 
      hasPermission(permission)
    );
    
    if (!hasAllPermissions) {
      return (
        <Box sx={{ p: 3 }}>
          <Alert severity="error">
            You don't have the required permissions to access this page.
          </Alert>
        </Box>
      );
    }
  }
  
  // Check required role if specified
  if (requiredRole && !hasRole(requiredRole)) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          You don't have the required role to access this page.
        </Alert>
      </Box>
    );
  }
  
  // User is authenticated and has required permissions/role, render children
  return children;
};

export default ProtectedRoute;