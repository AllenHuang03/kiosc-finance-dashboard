// src/pages/UserProfile.js
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  Box,
  Typography,
  Paper,
  Avatar,
  Grid,
  Button,
  Divider,
  TextField,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Security as SecurityIcon,
  Settings as SettingsIcon,
  VpnKey as KeyIcon,
  Badge as BadgeIcon,
  Logout as LogoutIcon
} from '@mui/icons-material';

const UserProfile = () => {
  const { currentUser, logout } = useAuth();
  
  // UI state
  const [openChangePassword, setOpenChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  
  // Function to handle password change
  const handleChangePassword = () => {
    // Reset errors
    setPasswordError('');
    
    // Validate current password (in a real app this would check against the server)
    if (currentPassword !== 'admin123' && currentPassword !== 'user123' && currentPassword !== 'view123') {
      setPasswordError('Current password is incorrect');
      return;
    }
    
    // Validate new password
    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters');
      return;
    }
    
    // Validate confirmation
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }
    
    // In a real app, this would call an API to change the password
    // For demo purposes, just show success message
    
    // Close dialog
    setOpenChangePassword(false);
    
    // Reset form
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    
    // Show success message
    setSnackbarMessage('Password changed successfully');
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
  };
  
  // Get initials for avatar
  const getInitials = (name) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };
  
  // Get role display name
  const getRoleDisplayName = (role) => {
    switch (role) {
      case 'admin':
        return 'Administrator';
      case 'user':
        return 'Standard User';
      case 'viewer':
        return 'View Only';
      default:
        return role;
    }
  };
  
  // Get permission display name
  const getPermissionDisplayName = (permission) => {
    switch (permission) {
      case 'read':
        return 'Read';
      case 'write':
        return 'Write';
      case 'delete':
        return 'Delete';
      case 'admin':
        return 'Admin';
      default:
        return permission;
    }
  };
  
  // Get color for permission chip
  const getPermissionColor = (permission) => {
    switch (permission) {
      case 'read':
        return 'primary';
      case 'write':
        return 'success';
      case 'delete':
        return 'error';
      case 'admin':
        return 'secondary';
      default:
        return 'default';
    }
  };
  
  // Handle close password dialog
  const handleClosePasswordDialog = () => {
    setOpenChangePassword(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordError('');
  };
  
  // Handle close snackbar
  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };
  
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        User Profile
      </Typography>
      
      <Grid container spacing={3}>
        {/* User Info Card */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
              <Avatar 
                sx={{ 
                  width: 80, 
                  height: 80, 
                  bgcolor: 'primary.main',
                  fontSize: 32,
                  mb: 2
                }}
              >
                {getInitials(currentUser.name)}
              </Avatar>
              
              <Typography variant="h5" gutterBottom>
                {currentUser.name}
              </Typography>
              
              <Chip 
                label={getRoleDisplayName(currentUser.role)}
                color={currentUser.role === 'admin' ? 'secondary' : 'primary'}
                sx={{ mt: 1 }}
              />
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <List>
              <ListItem>
                <ListItemIcon>
                  <PersonIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="Username" 
                  secondary={currentUser.username} 
                />
              </ListItem>
              
              <ListItem>
                <ListItemIcon>
                  <EmailIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="Email" 
                  secondary={currentUser.email} 
                />
              </ListItem>
              
              <ListItem>
                <ListItemIcon>
                  <BadgeIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="Role" 
                  secondary={getRoleDisplayName(currentUser.role)} 
                />
              </ListItem>
            </List>
            
            <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={<KeyIcon />}
                onClick={() => setOpenChangePassword(true)}
                fullWidth
              >
                Change Password
              </Button>
              
              <Button
                variant="outlined"
                color="error"
                startIcon={<LogoutIcon />}
                onClick={logout}
                fullWidth
              >
                Logout
              </Button>
            </Box>
          </Paper>
        </Grid>
        
        {/* Permissions & Settings */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              <SecurityIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Your Permissions
            </Typography>
            
            <Divider sx={{ mb: 2 }} />
            
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 3 }}>
              {currentUser.permissions.map((permission) => (
                <Chip 
                  key={permission}
                  label={getPermissionDisplayName(permission)}
                  color={getPermissionColor(permission)}
                  variant="outlined"
                />
              ))}
            </Box>
            
            <Typography variant="body2" color="text.secondary">
              Your account has {currentUser.permissions.length} permission(s). 
              These determine what actions you can perform in the system.
            </Typography>
          </Paper>
          
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              <SettingsIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Account Settings
            </Typography>
            
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Display Name"
                  defaultValue={currentUser.name}
                  fullWidth
                  margin="normal"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  label="Email Address"
                  defaultValue={currentUser.email}
                  fullWidth
                  margin="normal"
                />
              </Grid>
              
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                  <Button 
                    variant="contained"
                    onClick={() => {
                      setSnackbarMessage('Settings updated successfully');
                      setSnackbarSeverity('success');
                      setSnackbarOpen(true);
                    }}
                  >
                    Save Changes
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Change Password Dialog */}
      <Dialog open={openChangePassword} onClose={handleClosePasswordDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Change Your Password</DialogTitle>
        <DialogContent>
          <Box sx={{ my: 2 }}>
            {passwordError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {passwordError}
              </Alert>
            )}
            
            <TextField
              label="Current Password"
              type="password"
              fullWidth
              margin="normal"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
            
            <TextField
              label="New Password"
              type="password"
              fullWidth
              margin="normal"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              helperText="Password must be at least 6 characters"
            />
            
            <TextField
              label="Confirm New Password"
              type="password"
              fullWidth
              margin="normal"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePasswordDialog}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleChangePassword}
            disabled={!currentPassword || !newPassword || !confirmPassword}
          >
            Update Password
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UserProfile;