// src/pages/DataIntegration.js
import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Button,
  Alert,
  AlertTitle,
  Snackbar,
  LinearProgress,
  Divider
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  GitHub as GitHubIcon,
  Save as SaveIcon,
  GetApp as TemplateIcon
} from '@mui/icons-material';

// Import components
import FileUploader from '../components/FileUploader';
import GitHubConnector from '../components/GitHubConnector';
import TemplateGenerator from '../components/TemplateGenerator';

// TabPanel component for different tabs
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`integration-tabpanel-${index}`}
      aria-labelledby={`integration-tab-${index}`}
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

const DataIntegration = () => {
  const { loading: globalLoading } = useData();
  
  // State for the tabs
  const [tabValue, setTabValue] = useState(0);
  
  // State for data loading
  const [dataLoaded, setDataLoaded] = useState(false);
  const [loadedData, setLoadedData] = useState(null);
  const [dataStats, setDataStats] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Handle data loaded from file uploader or GitHub
  const handleDataLoaded = (data) => {
    setLoadedData(data);
    setDataLoaded(true);
    
    // Calculate stats for the loaded data
    const stats = {
      programs: data.Programs?.length || 0,
      budgetTracking: data.Budget_Tracking?.length || 0,
      transactions: data.Transaction_Entry?.length || 0,
      suppliers: data.Suppliers?.length || 0,
      total: (data.Programs?.length || 0) + 
             (data.Budget_Tracking?.length || 0) + 
             (data.Transaction_Entry?.length || 0) + 
             (data.Suppliers?.length || 0)
    };
    
    setDataStats(stats);
    
    // Show success message
    setSnackbarMessage(`Successfully loaded ${stats.total} data items`);
    setSnackbarOpen(true);
  };
  
  // Handle applying the loaded data to the application
  const handleApplyData = () => {
    // In a real app, this would update the global data state
    // or save the data to a backend
    console.log('Applying data to application:', loadedData);
    
    // Show success message
    setSnackbarMessage('Data applied successfully!');
    setSnackbarOpen(true);
    
    // Reset loaded data state
    setDataLoaded(false);
    setLoadedData(null);
    setDataStats(null);
  };
  
  // Close snackbar
  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };
  
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Data Integration
      </Typography>
      
      {globalLoading && <LinearProgress sx={{ mb: 3 }} />}
      
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Upload Excel Files" icon={<UploadIcon />} iconPosition="start" />
          <Tab label="Connect to GitHub" icon={<GitHubIcon />} iconPosition="start" />
          <Tab label="Generate Templates" icon={<TemplateIcon />} iconPosition="start" />
        </Tabs>
        
        <TabPanel value={tabValue} index={0}>
          <FileUploader onDataLoaded={handleDataLoaded} />
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          <GitHubConnector onDataLoaded={handleDataLoaded} />
        </TabPanel>
        
        <TabPanel value={tabValue} index={2}>
          <TemplateGenerator />
        </TabPanel>
      </Paper>
      
      {dataLoaded && dataStats && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h5" gutterBottom>
            Loaded Data Summary
          </Typography>
          
          <Box sx={{ mt: 2 }}>
            <Alert severity="success" sx={{ mb: 3 }}>
              <AlertTitle>Data Loaded Successfully</AlertTitle>
              Review the data summary below before applying it to the application.
            </Alert>
            
            <Typography variant="subtitle1">
              Data Statistics:
            </Typography>
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mt: 2 }}>
              <Box>
                <Typography variant="h6" color="primary">
                  {dataStats.programs}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Programs
                </Typography>
              </Box>
              
              <Box>
                <Typography variant="h6" color="primary">
                  {dataStats.budgetTracking}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Budget Tracking Items
                </Typography>
              </Box>
              
              <Box>
                <Typography variant="h6" color="primary">
                  {dataStats.transactions}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Transactions
                </Typography>
              </Box>
              
              <Box>
                <Typography variant="h6" color="primary">
                  {dataStats.suppliers}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Suppliers
                </Typography>
              </Box>
            </Box>
            
            <Divider sx={{ my: 3 }} />
            
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button 
                variant="contained" 
                color="primary"
                startIcon={<SaveIcon />}
                onClick={handleApplyData}
              >
                Apply Data to Application
              </Button>
            </Box>
          </Box>
        </Paper>
      )}
      
      {/* Success notification */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        message={snackbarMessage}
      />
    </Box>
  );
};

export default DataIntegration;