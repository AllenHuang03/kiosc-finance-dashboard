// src/pages/Settings.js
import React, { useState } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { useAuth } from '../contexts/AuthContext';
import {
  Box,
  Paper,
  Typography,
  Switch,
  FormControlLabel,
  Grid,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider,
  TextField,
  IconButton,
  Card,
  CardContent,
  Snackbar,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
import {
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  Save as SaveIcon,
  Refresh as ResetIcon,
  Notifications as NotificationsIcon,
  ViewModule as CompactViewIcon,
  Dashboard as DashboardIcon,
  AccountCircle as AccountIcon,
  PermIdentity as PermissionsIcon
} from '@mui/icons-material';

const Settings = () => {
  const { settings, updateSetting, updateSettings, resetSettings } = useSettings();
  const { user, updateUserProfile } = useAuth();
  
  // State for snackbar feedback
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  // State for reset confirmation dialog
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  
  // State for user profile form
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    organization: user?.organization || '',
    role: user?.role || ''
  });
  
  // Handle setting toggle change
  const handleToggleChange = (event) => {
    const { name, checked } = event.target;
    updateSetting(name, checked);
    
    setSnackbar({
      open: true,
      message: `${name.charAt(0).toUpperCase() + name.slice(1)} ${checked ? 'enabled' : 'disabled'}`,
      severity: 'success'
    });
  };
  
  // Handle setting select change
  const handleSelectChange = (event) => {
    const { name, value } = event.target;
    updateSetting(name, value);
    
    setSnackbar({
      open: true,
      message: `${name.charAt(0).toUpperCase() + name.slice(1)} updated`,
      severity: 'success'
    });
  };
  
  // Handle profile form change
  const handleProfileChange = (event) => {
    const { name, value } = event.target;
    setProfileForm(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Save profile changes
  const handleSaveProfile = () => {
    updateUserProfile(profileForm);
    
    setSnackbar({
      open: true,
      message: 'Profile updated successfully',
      severity: 'success'
    });
  };
  
  // Reset settings to default
  const handleResetSettings = () => {
    resetSettings();
    setResetDialogOpen(false);
    
    setSnackbar({
      open: true,
      message: 'Settings reset to default',
      severity: 'info'
    });
  };
  
  // Close snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Settings
      </Typography>
      
      <Grid container spacing={3}>
        {/* Application Settings */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <DashboardIcon sx={{ mr: 1 }} color="primary" />
              <Typography variant="h6">Application Settings</Typography>
            </Box>
            <Divider sx={{ mb: 3 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Theme</InputLabel>
                  <Select
                    name="theme"
                    value={settings.theme}
                    onChange={handleSelectChange}
                    label="Theme"
                    startAdornment={
                      settings.theme === 'dark' ? 
                        <DarkModeIcon sx={{ mr: 1 }} /> : 
                        <LightModeIcon sx={{ mr: 1 }} />
                    }
                  >
                    <MenuItem value="light">Light</MenuItem>
                    <MenuItem value="dark">Dark</MenuItem>
                    <MenuItem value="system">System Default</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Currency</InputLabel>
                  <Select
                    name="currency"
                    value={settings.currency}
                    onChange={handleSelectChange}
                    label="Currency"
                  >
                    <MenuItem value="AUD">Australian Dollar (AUD)</MenuItem>
                    <MenuItem value="USD">US Dollar (USD)</MenuItem>
                    <MenuItem value="EUR">Euro (EUR)</MenuItem>
                    <MenuItem value="GBP">British Pound (GBP)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Date Format</InputLabel>
                  <Select
                    name="dateFormat"
                    value={settings.dateFormat}
                    onChange={handleSelectChange}
                    label="Date Format"
                  >
                    <MenuItem value="dd/MM/yyyy">DD/MM/YYYY</MenuItem>
                    <MenuItem value="MM/dd/yyyy">MM/DD/YYYY</MenuItem>
                    <MenuItem value="yyyy-MM-dd">YYYY-MM-DD</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Default View</InputLabel>
                  <Select
                    name="defaultView"
                    value={settings.defaultView}
                    onChange={handleSelectChange}
                    label="Default View"
                  >
                    <MenuItem value="dashboard">Dashboard</MenuItem>
                    <MenuItem value="transactions">Transactions</MenuItem>
                    <MenuItem value="budget">Budget</MenuItem>
                    <MenuItem value="reports">Reports</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <Box sx={{ mt: 2 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.notifications}
                        onChange={handleToggleChange}
                        name="notifications"
                        color="primary"
                      />
                    }
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <NotificationsIcon sx={{ mr: 1 }} />
                        <Typography>Notifications</Typography>
                      </Box>
                    }
                  />
                </Box>
              </Grid>
              
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.compactView}
                      onChange={handleToggleChange}
                      name="compactView"
                      color="primary"
                    />
                  }
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CompactViewIcon sx={{ mr: 1 }} />
                      <Typography>Compact View</Typography>
                    </Box>
                  }
                />
              </Grid>
              
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.autoSave}
                      onChange={handleToggleChange}
                      name="autoSave"
                      color="primary"
                    />
                  }
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <SaveIcon sx={{ mr: 1 }} />
                      <Typography>Auto Save</Typography>
                    </Box>
                  }
                />
              </Grid>
              
              <Grid item xs={12}>
                <Button
                  variant="outlined"
                  color="warning"
                  startIcon={<ResetIcon />}
                  onClick={() => setResetDialogOpen(true)}
                  sx={{ mt: 2 }}
                >
                  Reset to Default
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        
        {/* User Profile */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <AccountIcon sx={{ mr: 1 }} color="primary" />
              <Typography variant="h6">User Profile</Typography>
            </Box>
            <Divider sx={{ mb: 3 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Name"
                  name="name"
                  value={profileForm.name}
                  onChange={handleProfileChange}
                  margin="normal"
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={profileForm.email}
                  onChange={handleProfileChange}
                  margin="normal"
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Organization"
                  name="organization"
                  value={profileForm.organization}
                  onChange={handleProfileChange}
                  margin="normal"
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Role"
                  name="role"
                  value={profileForm.role}
                  onChange={handleProfileChange}
                  margin="normal"
                />
              </Grid>
              
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<SaveIcon />}
                  onClick={handleSaveProfile}
                  sx={{ mt: 2 }}
                >
                  Save Profile
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        
        {/* Permissions Info */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PermissionsIcon sx={{ mr: 1 }} color="primary" />
                <Typography variant="h6">Your Permissions</Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={2}>
                {user?.permissions?.map((permission) => (
                  <Grid item key={permission}>
                    <Chip
                      label={permission.charAt(0).toUpperCase() + permission.slice(1)}
                      color="primary"
                      variant="outlined"
                    />
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Reset Confirmation Dialog */}
      <Dialog
        open={resetDialogOpen}
        onClose={() => setResetDialogOpen(false)}
      >
        <DialogTitle>Reset Settings</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to reset all settings to their default values? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResetDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleResetSettings} color="warning">
            Reset
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Settings;