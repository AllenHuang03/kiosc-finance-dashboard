// src/pages/AdminPanel.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Tabs,
  Tab,
  Button,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Switch,
  FormControlLabel,
  Alert,
  Snackbar
} from '@mui/material';
import {
  Person as PersonIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
  Settings as SettingsIcon,
  Security as SecurityIcon,
  SupervisorAccount as AdminIcon
} from '@mui/icons-material';

// Mock user data for demonstration
const mockUsers = [
  {
    id: 1,
    username: 'admin',
    name: 'Lisa Administrator',
    email: 'admin@kiosc.com',
    role: 'admin',
    permissions: ['read', 'write', 'delete', 'admin'],
    active: true,
    lastLogin: '2023-04-10T14:32:15'
  },
  {
    id: 2,
    username: 'user',
    name: 'Regular User',
    email: 'user@kiosc.com',
    role: 'user',
    permissions: ['read', 'write'],
    active: true,
    lastLogin: '2023-04-08T09:15:30'
  },
  {
    id: 3,
    username: 'readonly',
    name: 'View Only',
    email: 'view@kiosc.com',
    role: 'viewer',
    permissions: ['read'],
    active: true,
    lastLogin: '2023-04-05T11:42:18'
  },
  {
    id: 4,
    username: 'finance',
    name: 'Finance Manager',
    email: 'finance@kiosc.com',
    role: 'user',
    permissions: ['read', 'write'],
    active: false,
    lastLogin: '2023-03-20T16:08:45'
  }
];

// Mock system settings
const mockSettings = {
  appName: 'KIOSC Finance Dashboard',
  defaultCurrency: 'AUD',
  fiscalYearStart: '01-07',
  enableDataIntegration: true,
  enableGitHubSync: true,
  autoBackup: true,
  backupFrequency: 'daily',
  defaultEmailDomain: 'kiosc.com',
  passwordResetTimeLimit: 24,
  sessionTimeout: 30
};

// TabPanel component for different tabs
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const AdminPanel = () => {
  // State for users
  const [users, setUsers] = useState(mockUsers);
  const [filteredUsers, setFilteredUsers] = useState(mockUsers);
  const [searchTerm, setSearchTerm] = useState('');
  
  // State for settings
  const [settings, setSettings] = useState(mockSettings);
  const [editedSettings, setEditedSettings] = useState(mockSettings);
  
  // UI state
  const [tabValue, setTabValue] = useState(0);
  const [openUserDialog, setOpenUserDialog] = useState(false);
  const [userDialogMode, setUserDialogMode] = useState('add'); // 'add', 'edit'
  const [selectedUser, setSelectedUser] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [userFormData, setUserFormData] = useState({
    username: '',
    name: '',
    email: '',
    role: 'user',
    permissions: ['read'],
    active: true
  });
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Filter users based on search term
  useEffect(() => {
    const filtered = users.filter(user => 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [users, searchTerm]);
  
  // Handle opening the user dialog
  const handleOpenUserDialog = (mode, user = null) => {
    setUserDialogMode(mode);
    setSelectedUser(user);
    
    if (mode === 'edit' && user) {
      setUserFormData({
        username: user.username,
        name: user.name,
        email: user.email,
        role: user.role,
        permissions: [...user.permissions],
        active: user.active
      });
    } else {
      // Reset form for new user
      setUserFormData({
        username: '',
        name: '',
        email: '',
        role: 'user',
        permissions: ['read'],
        active: true
      });
    }
    
    setOpenUserDialog(true);
  };
  
  // Close user dialog
  const handleCloseUserDialog = () => {
    setOpenUserDialog(false);
  };
  
  // Handle form input changes
  const handleFormChange = (e) => {
    const { name, value, checked } = e.target;
    
    setUserFormData(prev => ({
      ...prev,
      [name]: name === 'active' ? checked : value
    }));
  };
  
  // Handle permissions change
  const handlePermissionChange = (permission) => {
    setUserFormData(prev => {
      if (prev.permissions.includes(permission)) {
        return {
          ...prev,
          permissions: prev.permissions.filter(p => p !== permission)
        };
      } else {
        return {
          ...prev,
          permissions: [...prev.permissions, permission]
        };
      }
    });
  };
  
  // Handle save user
  const handleSaveUser = () => {
    if (userDialogMode === 'add') {
      // Add new user
      const newUser = {
        id: users.length + 1,
        ...userFormData,
        lastLogin: null
      };
      
      setUsers([...users, newUser]);
      setSnackbarMessage('User added successfully');
    } else {
      // Update existing user
      const updatedUsers = users.map(user => 
        user.id === selectedUser.id
          ? { ...user, ...userFormData }
          : user
      );
      
      setUsers(updatedUsers);
      setSnackbarMessage('User updated successfully');
    }
    
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
    setOpenUserDialog(false);
  };
  
  // Handle delete confirmation
  const handleDeleteUser = (user) => {
    setSelectedUser(user);
    setOpenDeleteDialog(true);
  };
  
  // Confirm delete
  const handleConfirmDelete = () => {
    const updatedUsers = users.filter(user => user.id !== selectedUser.id);
    setUsers(updatedUsers);
    
    setSnackbarMessage('User deleted successfully');
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
    
    setOpenDeleteDialog(false);
  };
  
  // Handle settings change
  const handleSettingChange = (e) => {
    const { name, value, checked } = e.target;
    
    setEditedSettings(prev => ({
      ...prev,
      [name]: name.startsWith('enable') || name === 'autoBackup' ? checked : value
    }));
  };
  
  // Save settings
  const handleSaveSettings = () => {
    setSettings(editedSettings);
    
    setSnackbarMessage('Settings saved successfully');
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
  };
  
  // Reset settings
  const handleResetSettings = () => {
    setEditedSettings(settings);
  };
  
  // Close snackbar
  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };
  
  // Get role label
  const getRoleLabel = (role) => {
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
  
  // Get role color
  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return 'error';
      case 'user':
        return 'primary';
      case 'viewer':
        return 'success';
      default:
        return 'default';
    }
  };
  
  // Format date string
  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    
    const date = new Date(dateString);
    return date.toLocaleString();
  };
  
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Admin Panel
      </Typography>
      
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="User Management" icon={<PersonIcon />} iconPosition="start" />
          <Tab label="System Settings" icon={<SettingsIcon />} iconPosition="start" />
        </Tabs>
        
        {/* User Management Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <TextField
              label="Search Users"
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ width: 300 }}
            />
            
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenUserDialog('add')}
            >
              Add User
            </Button>
          </Box>
          
          <List>
            {filteredUsers.map((user) => (
              <React.Fragment key={user.id}>
                <ListItem
                  secondaryAction={
                    <Box>
                      <IconButton
                        edge="end"
                        aria-label="edit"
                        onClick={() => handleOpenUserDialog('edit', user)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        edge="end"
                        aria-label="delete"
                        onClick={() => handleDeleteUser(user)}
                        sx={{ ml: 1 }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  }
                >
                  <ListItemAvatar>
                    <Avatar
                      sx={{
                        bgcolor: user.active ? 'primary.main' : 'text.disabled',
                      }}
                    >
                      {user.name.charAt(0).toUpperCase()}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {user.name}
                        <Chip
                          label={getRoleLabel(user.role)}
                          color={getRoleColor(user.role)}
                          size="small"
                          sx={{ ml: 1 }}
                        />
                        {!user.active && (
                          <Chip
                            label="Inactive"
                            color="default"
                            size="small"
                            sx={{ ml: 1 }}
                          />
                        )}
                      </Box>
                    }
                    secondary={
                      <>
                        <Typography
                          component="span"
                          variant="body2"
                          color="text.primary"
                        >
                          {user.username} - {user.email}
                        </Typography>
                        <Typography
                          component="span"
                          variant="body2"
                          color="text.secondary"
                          sx={{ display: 'block' }}
                        >
                          Last login: {formatDate(user.lastLogin)}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
                <Divider variant="inset" component="li" />
              </React.Fragment>
            ))}
          </List>
          
          {filteredUsers.length === 0 && (
            <Alert severity="info" sx={{ mt: 2 }}>
              No users found matching your search criteria
            </Alert>
          )}
        </TabPanel>
        
        {/* System Settings Tab */}
        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    <SettingsIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    General Settings
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        label="Application Name"
                        name="appName"
                        value={editedSettings.appName}
                        onChange={handleSettingChange}
                        fullWidth
                        margin="normal"
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <TextField
                        label="Default Currency"
                        name="defaultCurrency"
                        value={editedSettings.defaultCurrency}
                        onChange={handleSettingChange}
                        fullWidth
                        margin="normal"
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <TextField
                        label="Fiscal Year Start (MM-DD)"
                        name="fiscalYearStart"
                        value={editedSettings.fiscalYearStart}
                        onChange={handleSettingChange}
                        fullWidth
                        margin="normal"
                        helperText="Format: MM-DD (e.g., 07-01 for July 1st)"
                      />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <TextField
                        label="Default Email Domain"
                        name="defaultEmailDomain"
                        value={editedSettings.defaultEmailDomain}
                        onChange={handleSettingChange}
                        fullWidth
                        margin="normal"
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    <SecurityIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Security Settings
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        label="Password Reset Time Limit (hours)"
                        name="passwordResetTimeLimit"
                        type="number"
                        value={editedSettings.passwordResetTimeLimit}
                        onChange={handleSettingChange}
                        fullWidth
                        margin="normal"
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <TextField
                        label="Session Timeout (minutes)"
                        name="sessionTimeout"
                        type="number"
                        value={editedSettings.sessionTimeout}
                        onChange={handleSettingChange}
                        fullWidth
                        margin="normal"
                      />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <FormControl fullWidth margin="normal">
                        <InputLabel id="backup-frequency-label">Backup Frequency</InputLabel>
                        <Select
                          labelId="backup-frequency-label"
                          name="backupFrequency"
                          value={editedSettings.backupFrequency}
                          onChange={handleSettingChange}
                          label="Backup Frequency"
                        >
                          <MenuItem value="hourly">Hourly</MenuItem>
                          <MenuItem value="daily">Daily</MenuItem>
                          <MenuItem value="weekly">Weekly</MenuItem>
                          <MenuItem value="monthly">Monthly</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                  
                  <Box sx={{ mt: 2 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={editedSettings.autoBackup}
                          onChange={handleSettingChange}
                          name="autoBackup"
                        />
                      }
                      label="Enable Automatic Backups"
                    />
                  </Box>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Typography variant="subtitle2" gutterBottom>
                    Integration Features
                  </Typography>
                  
                  <FormControlLabel
                    control={
                      <Switch
                        checked={editedSettings.enableDataIntegration}
                        onChange={handleSettingChange}
                        name="enableDataIntegration"
                      />
                    }
                    label="Enable Data Integration"
                  />
                  
                  <FormControlLabel
                    control={
                      <Switch
                        checked={editedSettings.enableGitHubSync}
                        onChange={handleSettingChange}
                        name="enableGitHubSync"
                      />
                    }
                    label="Enable GitHub Synchronization"
                  />
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={handleResetSettings}
            >
              Reset Changes
            </Button>
            
            <Button
              variant="contained"
              color="primary"
              onClick={handleSaveSettings}
            >
              Save Settings
            </Button>
          </Box>
        </TabPanel>
      </Paper>
      
      {/* User Dialog */}
      <Dialog
        open={openUserDialog}
        onClose={handleCloseUserDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {userDialogMode === 'add' ? 'Add New User' : 'Edit User'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ pt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                name="username"
                label="Username"
                value={userFormData.username}
                onChange={handleFormChange}
                fullWidth
                required
                disabled={userDialogMode === 'edit'}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select
                  name="role"
                  value={userFormData.role}
                  onChange={handleFormChange}
                  label="Role"
                >
                  <MenuItem value="admin">Administrator</MenuItem>
                  <MenuItem value="user">Standard User</MenuItem>
                  <MenuItem value="viewer">View Only</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                name="name"
                label="Full Name"
                value={userFormData.name}
                onChange={handleFormChange}
                fullWidth
                required
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                name="email"
                label="Email Address"
                type="email"
                value={userFormData.email}
                onChange={handleFormChange}
                fullWidth
                required
              />
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Permissions
              </Typography>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={userFormData.permissions.includes('read')}
                      onChange={() => handlePermissionChange('read')}
                      disabled={true} // Everyone needs read permission
                    />
                  }
                  label="Read"
                />
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={userFormData.permissions.includes('write')}
                      onChange={() => handlePermissionChange('write')}
                    />
                  }
                  label="Write"
                />
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={userFormData.permissions.includes('delete')}
                      onChange={() => handlePermissionChange('delete')}
                    />
                  }
                  label="Delete"
                />
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={userFormData.permissions.includes('admin')}
                      onChange={() => handlePermissionChange('admin')}
                    />
                  }
                  label="Admin"
                />
              </Box>
            </Grid>
            
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    name="active"
                    checked={userFormData.active}
                    onChange={handleFormChange}
                  />
                }
                label="Active Account"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseUserDialog}>Cancel</Button>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleSaveUser}
          >
            {userDialogMode === 'add' ? 'Add User' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the user "{selectedUser?.name}"?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            color="error" 
            onClick={handleConfirmDelete}
          >
            Delete User
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

export default AdminPanel;