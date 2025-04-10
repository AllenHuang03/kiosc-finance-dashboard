// src/components/FileUploader.js
import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  AlertTitle,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Upload as UploadIcon,
  Description as FileIcon,
  Check as CheckIcon,
  Delete as DeleteIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import excelService from '../services/excelService';

const FileUploader = ({ onDataLoaded }) => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [previewData, setPreviewData] = useState(null);

  // Handle file selection
  const handleFileSelect = (event) => {
    const selectedFiles = Array.from(event.target.files);
    setFiles(prevFiles => [...prevFiles, ...selectedFiles]);
    setError(null);
    setSuccess(false);
  };

  // Remove a file from the list
  const handleRemoveFile = (index) => {
    setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
    setError(null);
    setSuccess(false);
  };

  // Process the uploaded files
  const handleUpload = async () => {
    if (files.length === 0) {
      setError('Please select at least one file to upload');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Map the Excel data to our application data model
      const appData = await excelService.mapExistingTemplates(files);
      
      // Preview data before finalizing
      setPreviewData(appData);
      setOpenDialog(true);
      
      setLoading(false);
    } catch (err) {
      console.error('Error processing files:', err);
      setError(`Error processing files: ${err.message}`);
      setLoading(false);
    }
  };

  // Confirm data upload
  const handleConfirmUpload = () => {
    // Pass the data back to the parent component
    if (onDataLoaded && previewData) {
      onDataLoaded(previewData);
      setSuccess(true);
    }
    setOpenDialog(false);
  };

  // Close the preview dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h5" gutterBottom>
        Import Financial Data
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Upload your Excel files to import financial data. The system supports the KIOSC templates:
        Revenue Terms, Expenditure Tracker, Budget Template, and Suppliers list.
      </Typography>
      
      {/* Upload Button */}
      <Box sx={{ display: 'flex', alignItems: 'center', mt: 2, mb: 3 }}>
        <Button
          variant="contained"
          component="label"
          startIcon={<UploadIcon />}
          disabled={loading}
        >
          Select Files
          <input
            type="file"
            multiple
            accept=".xlsx,.xls,.xlsb,.xlsm"
            hidden
            onChange={handleFileSelect}
          />
        </Button>
        
        <Button
          variant="outlined"
          onClick={handleUpload}
          disabled={files.length === 0 || loading}
          sx={{ ml: 2 }}
        >
          Process Files
        </Button>
        
        {loading && <CircularProgress size={24} sx={{ ml: 2 }} />}
      </Box>
      
      {/* File List */}
      {files.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Selected Files ({files.length})
          </Typography>
          <List>
            {files.map((file, index) => (
              <React.Fragment key={index}>
                <ListItem
                  secondaryAction={
                    <IconButton edge="end" onClick={() => handleRemoveFile(index)}>
                      <DeleteIcon />
                    </IconButton>
                  }
                >
                  <ListItemIcon>
                    <FileIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary={file.name} 
                    secondary={`${(file.size / 1024).toFixed(2)} KB`} 
                  />
                </ListItem>
                {index < files.length - 1 && <Divider variant="inset" component="li" />}
              </React.Fragment>
            ))}
          </List>
        </Box>
      )}
      
      {/* Status Messages */}
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert 
          severity="success" 
          icon={<CheckIcon fontSize="inherit" />}
          sx={{ mt: 2 }}
        >
          Files processed successfully! Your financial data has been loaded.
        </Alert>
      )}
      
      {/* Data Preview Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Data Preview</DialogTitle>
        <DialogContent dividers>
          <Alert severity="info" sx={{ mb: 2 }}>
            <AlertTitle>Review the data before importing</AlertTitle>
            This preview shows a summary of the data that will be imported. Please verify that 
            the information looks correct before confirming.
          </Alert>
          
          {previewData && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Programs: {previewData.Programs?.length || 0} items
              </Typography>
              
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Budget Tracking: {previewData.Budget_Tracking?.length || 0} items
              </Typography>
              
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Transactions: {previewData.Transaction_Entry?.length || 0} items
              </Typography>
              
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Suppliers: {previewData.Suppliers?.length || 0} items
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleConfirmUpload}>
            Confirm Import
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default FileUploader;