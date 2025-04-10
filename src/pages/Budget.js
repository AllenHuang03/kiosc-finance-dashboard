// src/pages/Budget.js
import React, { useState, useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardHeader,
  LinearProgress,
  Button,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Divider,
  Alert,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  AttachMoney as MoneyIcon,
  ShowChart as ChartIcon,
  Refresh as RefreshIcon,
  Info as InfoIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const Budget = () => {
  const { data, loading, error } = useData();
  
  // State for filtering
  const [programFilter, setProgramFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  
  // State for editing budget
  const [editMode, setEditMode] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState(null);
  
  // Get budget tracking data
  const budgetData = useMemo(() => {
    if (!data || !data.Budget_Tracking) return [];
    return data.Budget_Tracking;
  }, [data]);
  
  // Get program data
  const programs = useMemo(() => {
    if (!data || !data.Programs) return [];
    return data.Programs;
  }, [data]);
  
  // Get all categories
  const categories = useMemo(() => {
    if (!programs.length) return ['All'];
    
    const uniqueCategories = new Set(programs.map(p => p.category));
    return ['All', ...Array.from(uniqueCategories)];
  }, [programs]);
  
  // Apply filters to budget data
  const filteredBudgetData = useMemo(() => {
    if (!budgetData.length) return [];
    
    return budgetData.filter(item => {
      // Program filter
      if (programFilter !== 'All' && item.program !== programFilter) {
        return false;
      }
      
      // Category filter
      if (categoryFilter !== 'All') {
        // Find the program associated with this budget item
        const program = programs.find(p => p.name === item.program);
        if (!program || program.category !== categoryFilter) {
          return false;
        }
      }
      
      return true;
    });
  }, [budgetData, programFilter, categoryFilter, programs]);
  
  // Calculate totals for summary
  const summary = useMemo(() => {
    if (!filteredBudgetData.length) {
      return {
        totalBudget: 0,
        totalExpenses: 0,
        totalCommitted: 0,
        totalAvailable: 0,
        utilization: 0
      };
    }
    
    const totalBudget = filteredBudgetData.reduce((sum, item) => sum + (item.totalBudget || 0), 0);
    const totalExpenses = filteredBudgetData.reduce((sum, item) => sum + (item.ytdExpenses || 0), 0);
    const totalCommitted = filteredBudgetData.reduce((sum, item) => sum + (item.committedExpenses || 0), 0);
    const totalAvailable = totalBudget - totalExpenses - totalCommitted;
    const utilization = totalBudget > 0 ? ((totalExpenses + totalCommitted) / totalBudget) * 100 : 0;
    
    return {
      totalBudget,
      totalExpenses,
      totalCommitted,
      totalAvailable,
      utilization
    };
  }, [filteredBudgetData]);
  
  // Data for chart
  const chartData = useMemo(() => {
    return filteredBudgetData.map(item => ({
      name: item.program.length > 15 ? item.program.substring(0, 15) + '...' : item.program,
      budget: item.totalBudget || 0,
      expenses: item.ytdExpenses || 0,
      committed: item.committedExpenses || 0,
      available: item.availableBudget || 0
    }));
  }, [filteredBudgetData]);
  
  // Handle edit button click
  const handleEditClick = (budget) => {
    setSelectedBudget({ ...budget });
    setEditMode(true);
  };
  
  // Handle save button click
  const handleSaveClick = () => {
    // In a real app, this would update the data in the backend
    console.log('Save budget changes:', selectedBudget);
    
    // For now, just exit edit mode
    setEditMode(false);
    setSelectedBudget(null);
  };
  
  // Handle cancel button click
  const handleCancelClick = () => {
    setEditMode(false);
    setSelectedBudget(null);
  };
  
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' }).format(amount);
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          {error}
        </Alert>
      </Box>
    );
  }
  
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Budget Management
      </Typography>
      
      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={5}>
            <FormControl fullWidth>
              <InputLabel id="program-filter-label">Program</InputLabel>
              <Select
                labelId="program-filter-label"
                id="program-filter"
                value={programFilter}
                label="Program"
                onChange={(e) => setProgramFilter(e.target.value)}
              >
                <MenuItem value="All">All Programs</MenuItem>
                {programs.map((program) => (
                  <MenuItem key={program.id} value={program.name}>
                    {program.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={5}>
            <FormControl fullWidth>
              <InputLabel id="category-filter-label">Category</InputLabel>
              <Select
                labelId="category-filter-label"
                id="category-filter"
                value={categoryFilter}
                label="Category"
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={2}>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<RefreshIcon />}
              onClick={() => {
                setProgramFilter('All');
                setCategoryFilter('All');
              }}
            >
              Reset
            </Button>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Budget Summary */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                Total Budget
              </Typography>
              <Typography variant="h4" component="div">
                {formatCurrency(summary.totalBudget)}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Across {filteredBudgetData.length} programs
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                YTD Expenses
              </Typography>
              <Typography variant="h4" component="div">
                {formatCurrency(summary.totalExpenses)}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {(summary.totalExpenses / summary.totalBudget * 100).toFixed(1)}% of budget
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                Committed
              </Typography>
              <Typography variant="h4" component="div">
                {formatCurrency(summary.totalCommitted)}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {(summary.totalCommitted / summary.totalBudget * 100).toFixed(1)}% of budget
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                Available
              </Typography>
              <Typography variant="h4" component="div" color={summary.totalAvailable < 0 ? 'error' : 'inherit'}>
                {formatCurrency(summary.totalAvailable)}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {(summary.totalAvailable / summary.totalBudget * 100).toFixed(1)}% remaining
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" gutterBottom>
                Overall Budget Utilization
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{ width: '100%', mr: 1 }}>
                  <LinearProgress 
                    variant="determinate" 
                    value={Math.min(summary.utilization, 100)}
                    sx={{ 
                      height: 10, 
                      borderRadius: 5,
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: summary.utilization > 90 ? 'error.main' : 
                                         summary.utilization > 70 ? 'warning.main' : 
                                         'success.main'
                      }
                    }}
                  />
                </Box>
                <Box sx={{ minWidth: 35 }}>
                  <Typography variant="body2" color="text.secondary">
                    {summary.utilization.toFixed(1)}%
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Budget Chart */}
      <Paper sx={{ p: 2, mb: 3, height: 400 }}>
        <Typography variant="h6" gutterBottom>
          Budget vs. Expenses by Program
        </Typography>
        <ResponsiveContainer width="100%" height="90%">
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <RechartsTooltip formatter={(value) => formatCurrency(value)} />
            <Legend />
            <Bar dataKey="expenses" name="YTD Expenses" stackId="a" fill="#f44336" />
            <Bar dataKey="committed" name="Committed" stackId="a" fill="#ff9800" />
            <Bar dataKey="available" name="Available" stackId="a" fill="#4caf50" />
          </BarChart>
        </ResponsiveContainer>
      </Paper>
      
      {/* Budget Details */}
      <Typography variant="h5" gutterBottom>
        Budget Details
      </Typography>
      <Paper>
        <Box sx={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: '12px 8px', borderBottom: '2px solid #ddd' }}>Program</th>
                <th style={{ textAlign: 'right', padding: '12px 8px', borderBottom: '2px solid #ddd' }}>Total Budget</th>
                <th style={{ textAlign: 'right', padding: '12px 8px', borderBottom: '2px solid #ddd' }}>YTD Expenses</th>
                <th style={{ textAlign: 'right', padding: '12px 8px', borderBottom: '2px solid #ddd' }}>Committed</th>
                <th style={{ textAlign: 'right', padding: '12px 8px', borderBottom: '2px solid #ddd' }}>Available</th>
                <th style={{ textAlign: 'center', padding: '12px 8px', borderBottom: '2px solid #ddd' }}>Utilization</th>
                <th style={{ textAlign: 'center', padding: '12px 8px', borderBottom: '2px solid #ddd' }}>Status</th>
                <th style={{ textAlign: 'center', padding: '12px 8px', borderBottom: '2px solid #ddd' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBudgetData.length > 0 ? (
                filteredBudgetData.map((budget, index) => (
                  <tr key={index}>
                    <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>{budget.program}</td>
                    <td style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid #ddd' }}>
                      {formatCurrency(budget.totalBudget || 0)}
                    </td>
                    <td style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid #ddd' }}>
                      {formatCurrency(budget.ytdExpenses || 0)}
                    </td>
                    <td style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid #ddd' }}>
                      {formatCurrency(budget.committedExpenses || 0)}
                    </td>
                    <td style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid #ddd' }}>
                      {formatCurrency(budget.availableBudget || 0)}
                    </td>
                    <td style={{ textAlign: 'center', padding: '8px', borderBottom: '1px solid #ddd' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box sx={{ width: '100%', mr: 1 }}>
                          <LinearProgress 
                            variant="determinate" 
                            value={Math.min((budget.percentUsed || 0) * 100, 100)}
                            sx={{ 
                              height: 8, 
                              borderRadius: 5,
                              '& .MuiLinearProgress-bar': {
                                backgroundColor: budget.status === 'At Risk' ? 'error.main' : 
                                                 budget.status === 'Caution' ? 'warning.main' : 
                                                 'success.main'
                              }
                            }}
                          />
                        </Box>
                        <Box sx={{ minWidth: 35 }}>
                          <Typography variant="body2" color="text.secondary">
                            {((budget.percentUsed || 0) * 100).toFixed(1)}%
                          </Typography>
                        </Box>
                      </Box>
                    </td>
                    <td style={{ textAlign: 'center', padding: '8px', borderBottom: '1px solid #ddd' }}>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: 'white',
                          bgcolor: budget.status === 'At Risk' ? 'error.main' : 
                                   budget.status === 'Caution' ? 'warning.main' : 
                                   'success.main',
                          borderRadius: 1,
                          px: 1,
                          py: 0.5,
                          display: 'inline-block'
                        }}
                      >
                        {budget.status}
                      </Typography>
                    </td>
                    <td style={{ textAlign: 'center', padding: '8px', borderBottom: '1px solid #ddd' }}>
                      <IconButton 
                        size="small" 
                        color="primary"
                        onClick={() => handleEditClick(budget)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small">
                        <InfoIcon fontSize="small" />
                      </IconButton>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '16px' }}>
                    No budget data found matching your filters
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Box>
      </Paper>
      
      {/* Edit Budget Dialog */}
      {editMode && selectedBudget && (
        <Paper sx={{ p: 3, mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Edit Budget: {selectedBudget.program}
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Total Budget"
                type="number"
                fullWidth
                value={selectedBudget.totalBudget || 0}
                onChange={(e) => setSelectedBudget({ ...selectedBudget, totalBudget: parseFloat(e.target.value) })}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Committed Expenses"
                type="number"
                fullWidth
                value={selectedBudget.committedExpenses || 0}
                onChange={(e) => setSelectedBudget({ ...selectedBudget, committedExpenses: parseFloat(e.target.value) })}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Notes"
                fullWidth
                multiline
                rows={2}
                value={selectedBudget.notes || ''}
                onChange={(e) => setSelectedBudget({ ...selectedBudget, notes: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button 
                  variant="outlined" 
                  startIcon={<CancelIcon />}
                  onClick={handleCancelClick}
                >
                  Cancel
                </Button>
                <Button 
                  variant="contained" 
                  color="primary"
                  startIcon={<SaveIcon />}
                  onClick={handleSaveClick}
                >
                  Save Changes
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      )}
    </Box>
  );
};

export default Budget;