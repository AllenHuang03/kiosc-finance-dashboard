// src/components/dashboard/BudgetSummary.js (with DataContext)
import React, { useMemo, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  LinearProgress,
  Divider,
  Button,
  List,
  ListItem,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  IconButton,
  Snackbar,
  Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ArrowForward as ArrowForwardIcon, Add as AddIcon, Close as CloseIcon } from '@mui/icons-material';
import { useData } from '../../contexts/DataContext';

const BudgetSummary = () => {
  const navigate = useNavigate();
  const { data, addBudget } = useData();
  
  // Get budget data from context
  const budgetData = data?.Budget_Tracking || [];
  
  // State for budget setup dialog
  const [openDialog, setOpenDialog] = useState(false);
  const [newBudget, setNewBudget] = useState({
    program: '',
    totalBudget: 0,
    notes: ''
  });
  
  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  // Get available programs from context
  const programs = useMemo(() => {
    if (!data?.Programs) return [];
    return data.Programs.map(p => p.name);
  }, [data]);
  
  // Calculate budget utilization
  const budgetSummary = useMemo(() => {
    if (!budgetData.length) return [];
    
    // Sort by utilization percentage (descending)
    return [...budgetData]
      .sort((a, b) => (b.percentUsed || 0) - (a.percentUsed || 0))
      .slice(0, 5); // Take top 5
  }, [budgetData]);
  
  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' }).format(value);
  };
  
  // Get status color based on utilization
  const getStatusColor = (percent) => {
    if (percent > 0.9) return 'error.main'; // > 90%
    if (percent > 0.7) return 'warning.main'; // > 70%
    return 'success.main';
  };
  
  // Handle click to view budget
  const handleViewBudget = () => {
    navigate('/budget');
  };
  
  // Open setup budget dialog
  const handleOpenDialog = () => {
    setOpenDialog(true);
  };
  
  // Close setup budget dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };
  
  // Close snackbar
  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };
  
  // Handle form field changes
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setNewBudget(prev => ({
      ...prev,
      [name]: name === 'totalBudget' ? parseFloat(value) || 0 : value
    }));
  };
  
  // Handle save budget
  const handleSaveBudget = () => {
    // Create budget object
    const budget = {
      program: newBudget.program,
      totalBudget: newBudget.totalBudget,
      ytdExpenses: 0,
      committedExpenses: 0,
      availableBudget: newBudget.totalBudget,
      percentUsed: 0,
      status: 'On Track',
      notes: newBudget.notes,
      ytdIncome: 0
    };
    
    // Add budget using context
    const success = addBudget(budget);
    
    if (success) {
      // Show success message
      setSnackbar({
        open: true,
        message: 'Budget created successfully',
        severity: 'success'
      });
      
      // Close dialog
      setOpenDialog(false);
      
      // Reset form
      setNewBudget({
        program: '',
        totalBudget: 0,
        notes: ''
      });
    } else {
      // Show error message
      setSnackbar({
        open: true,
        message: 'Error creating budget',
        severity: 'error'
      });
    }
  };
  
  return (
    <Paper sx={{ p: 2, height: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          Budget Summary
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            size="small"
            startIcon={<AddIcon />}
            onClick={handleOpenDialog}
          >
            Add Budget
          </Button>
          <Button
            size="small"
            endIcon={<ArrowForwardIcon />}
            onClick={handleViewBudget}
          >
            View All
          </Button>
        </Box>
      </Box>
      
      {budgetSummary.length > 0 ? (
        <List>
          {budgetSummary.map((budget, index) => {
            const percentUsed = (budget.percentUsed || 0) * 100;
            const statusColor = getStatusColor(budget.percentUsed || 0);
            
            return (
              <React.Fragment key={index}>
                <ListItem sx={{ px: 0 }}>
                  <ListItemText
                    primary={budget.program}
                    secondary={
                      <Box sx={{ mt: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="body2" color="text.secondary">
                            {formatCurrency(budget.ytdExpenses || 0)} of {formatCurrency(budget.totalBudget || 0)}
                          </Typography>
                          <Typography variant="body2" sx={{ color: statusColor }}>
                            {percentUsed.toFixed(1)}%
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={Math.min(percentUsed, 100)}
                          sx={{
                            height: 8,
                            borderRadius: 5,
                            '& .MuiLinearProgress-bar': {
                              backgroundColor: statusColor
                            }
                          }}
                        />
                      </Box>
                    }
                  />
                </ListItem>
                {index < budgetSummary.length - 1 && <Divider />}
              </React.Fragment>
            );
          })}
        </List>
      ) : (
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            No budget data available
          </Typography>
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', gap: 2 }}>
            <Button
              variant="contained"
              size="small"
              startIcon={<AddIcon />}
              onClick={handleOpenDialog}
            >
              Create Budget
            </Button>
            <Button
              variant="outlined"
              size="small"
              onClick={handleViewBudget}
            >
              View Budget Page
            </Button>
          </Box>
        </Box>
      )}
      
      {/* Budget Setup Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Create New Budget
          <IconButton onClick={handleCloseDialog} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ p: 1 }}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Program</InputLabel>
              <Select
                name="program"
                value={newBudget.program}
                onChange={handleFormChange}
                label="Program"
              >
                {programs.map((program) => (
                  <MenuItem key={program} value={program}>
                    {program}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <TextField
              label="Total Budget"
              name="totalBudget"
              type="number"
              value={newBudget.totalBudget}
              onChange={handleFormChange}
              fullWidth
              margin="normal"
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
              }}
            />
            
            <TextField
              label="Notes"
              name="notes"
              value={newBudget.notes}
              onChange={handleFormChange}
              fullWidth
              multiline
              rows={2}
              margin="normal"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleSaveBudget}
            disabled={!newBudget.program || newBudget.totalBudget <= 0}
          >
            Create Budget
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
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default BudgetSummary;