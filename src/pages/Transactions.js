// src/pages/Transactions.js
import React, { useState, useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  InputAdornment,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
} from '@mui/icons-material';

// Transaction type chip colors
const typeColors = {
  'Income': '#4CAF50',
  'Expense': '#F44336',
  'Transfer': '#2196F3'
};

// Transaction status chip colors
const statusColors = {
  'Completed': '#4CAF50',
  'Pending': '#FFC107',
  'Committed': '#2196F3'
};

const Transactions = () => {
  const { loading, error, data, getCategories } = useData();
  
  // State for filters
  const [searchTerm, setSearchTerm] = useState('');
  const [programFilter, setProgramFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  
  // State for new transaction dialog
  const [openDialog, setOpenDialog] = useState(false);
  
  // Get transaction data
  const transactions = useMemo(() => {
    if (!data || !data.Transaction_Entry) return [];
    return data.Transaction_Entry;
  }, [data]);
  
  // Get filter options
  const programs = useMemo(() => {
    if (!data || !data.Programs) return [];
    return ['All', ...data.Programs.map(p => p.name)];
  }, [data]);
  
  const categories = useMemo(() => {
    if (!data || !data.Programs) return [];
    return ['All', ...getCategories()];
  }, [data, getCategories]);
  
  const types = ['All', 'Income', 'Expense', 'Transfer'];
  const statuses = ['All', 'Completed', 'Pending', 'Committed'];
  
  // Filter transactions based on all filters
  const filteredTransactions = useMemo(() => {
    if (!transactions.length) return [];
    
    return transactions.filter(transaction => {
      // Search term filter (check program, reference, description)
      const searchMatch = 
        searchTerm === '' || 
        transaction.program.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (transaction.reference && transaction.reference.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (transaction.description && transaction.description.toLowerCase().includes(searchTerm.toLowerCase()));
      
      // Program filter
      const programMatch = programFilter === 'All' || transaction.program === programFilter;
      
      // Type filter
      const typeMatch = typeFilter === 'All' || transaction.type === typeFilter;
      
      // Category filter
      const categoryMatch = categoryFilter === 'All' || transaction.accountCategory === categoryFilter;
      
      // Status filter
      const statusMatch = statusFilter === 'All' || transaction.status === statusFilter;
      
      // Date range filter
      let dateMatch = true;
      if (startDate || endDate) {
        const transactionDate = new Date(transaction.date);
        if (startDate && endDate) {
          dateMatch = transactionDate >= startDate && transactionDate <= endDate;
        } else if (startDate) {
          dateMatch = transactionDate >= startDate;
        } else if (endDate) {
          dateMatch = transactionDate <= endDate;
        }
      }
      
      return searchMatch && programMatch && typeMatch && categoryMatch && statusMatch && dateMatch;
    });
  }, [
    transactions, 
    searchTerm, 
    programFilter, 
    typeFilter, 
    categoryFilter, 
    statusFilter, 
    startDate, 
    endDate
  ]);
  
  const handleAddTransaction = () => {
    setOpenDialog(true);
  };
  
  const handleCloseDialog = () => {
    setOpenDialog(false);
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
        <Typography variant="h5" color="error">
          {error}
        </Typography>
      </Box>
    );
  }
  
  if (!transactions.length) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h5">
          No transaction data available
        </Typography>
      </Box>
    );
  }
  
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Transactions
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddTransaction}
        >
          Add Transaction
        </Button>
      </Box>
      
      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              variant="outlined"
              label="Search Transactions"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel id="program-filter-label">Program</InputLabel>
              <Select
                labelId="program-filter-label"
                id="program-filter"
                value={programFilter}
                label="Program"
                onChange={(e) => setProgramFilter(e.target.value)}
              >
                {programs.map((program) => (
                  <MenuItem key={program} value={program}>
                    {program}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={4}>
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
          
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel id="status-filter-label">Status</InputLabel>
              <Select
                labelId="status-filter-label"
                id="status-filter"
                value={statusFilter}
                label="Status"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                {statuses.map((status) => (
                  <MenuItem key={status} value={status}>
                    {status}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              {/* Simple date inputs instead of MUI DatePicker */}
              <TextField
                label="From Date"
                type="date"
                value={startDate ? new Date(startDate).toISOString().split('T')[0] : ''}
                onChange={(e) => setStartDate(e.target.value ? new Date(e.target.value) : null)}
                InputLabelProps={{ shrink: true }}
                sx={{ width: '50%' }}
              />
              <TextField
                label="To Date"
                type="date"
                value={endDate ? new Date(endDate).toISOString().split('T')[0] : ''}
                onChange={(e) => setEndDate(e.target.value ? new Date(e.target.value) : null)}
                InputLabelProps={{ shrink: true }}
                sx={{ width: '50%' }}
              />
            </Box>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Transactions Table */}
      <Paper sx={{ p: 2 }}>
        <Box sx={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: '12px 8px', borderBottom: '2px solid #ddd' }}>ID</th>
                <th style={{ textAlign: 'left', padding: '12px 8px', borderBottom: '2px solid #ddd' }}>Date</th>
                <th style={{ textAlign: 'left', padding: '12px 8px', borderBottom: '2px solid #ddd' }}>Program</th>
                <th style={{ textAlign: 'left', padding: '12px 8px', borderBottom: '2px solid #ddd' }}>Type</th>
                <th style={{ textAlign: 'left', padding: '12px 8px', borderBottom: '2px solid #ddd' }}>Category</th>
                <th style={{ textAlign: 'right', padding: '12px 8px', borderBottom: '2px solid #ddd' }}>Amount</th>
                <th style={{ textAlign: 'left', padding: '12px 8px', borderBottom: '2px solid #ddd' }}>Status</th>
                <th style={{ textAlign: 'left', padding: '12px 8px', borderBottom: '2px solid #ddd' }}>Reference</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>{transaction.id}</td>
                    <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>{transaction.date}</td>
                    <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>{transaction.program}</td>
                    <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>
                      <Chip 
                        label={transaction.type} 
                        size="small"
                        sx={{ 
                          bgcolor: typeColors[transaction.type] || '#757575',
                          color: 'white'
                        }} 
                      />
                    </td>
                    <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>{transaction.accountCategory}</td>
                    <td style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid #ddd', color: transaction.type === 'Income' ? 'green' : 'red' }}>
                      ${Math.abs(transaction.amount).toLocaleString()}
                    </td>
                    <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>
                      <Chip 
                        label={transaction.status} 
                        size="small"
                        sx={{ 
                          bgcolor: statusColors[transaction.status] || '#757575',
                          color: 'white'
                        }} 
                      />
                    </td>
                    <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>{transaction.reference || '-'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '16px' }}>
                    No transactions found matching the current filters
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Box>
      </Paper>
      
      {/* Add Transaction Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>Add New Transaction</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Date"
                type="date"
                InputLabelProps={{ shrink: true }}
                defaultValue={new Date().toISOString().split('T')[0]}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Program</InputLabel>
                <Select label="Program">
                  {programs.filter(p => p !== 'All').map((program) => (
                    <MenuItem key={program} value={program}>
                      {program}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select label="Type">
                  {types.filter(t => t !== 'All').map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select label="Category">
                  {categories.filter(c => c !== 'All').map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Amount"
                type="number"
                InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select label="Status">
                  {statuses.filter(s => s !== 'All').map((status) => (
                    <MenuItem key={status} value={status}>
                      {status}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Reference"
                placeholder="Invoice or PO number"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Contact"
                placeholder="Related person or organization"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={2}
                placeholder="Additional details about this transaction"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button variant="contained" color="primary" onClick={handleCloseDialog}>
            Save Transaction
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Transactions;
         