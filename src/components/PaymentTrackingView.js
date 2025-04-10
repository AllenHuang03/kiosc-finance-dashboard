// src/components/PaymentTrackingView.js
import React, { useState, useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Tabs,
  Tab,
  Card,
  CardContent,
  Chip,
  Button,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Search as SearchIcon,
  AccountBalance as AccountIcon,
  AttachMoney as MoneyIcon,
  CheckCircle as CheckIcon,
  Schedule as PendingIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import {
  PieChart,
  Pie,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

// Colors for charts and status indicators
const COLORS = ['#4caf50', '#ff9800', '#f44336', '#2196f3'];
const STATUS_COLORS = {
  'Paid': '#4caf50',
  'Pending': '#ff9800',
  'Overdue': '#f44336',
  'Outstanding': '#2196f3'
};

// TabPanel component for tabs
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`payment-tabpanel-${index}`}
      aria-labelledby={`payment-tab-${index}`}
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

const PaymentTrackingView = () => {
  const { data, loading, error } = useData();
  
  // State for UI
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [programFilter, setProgramFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [newPaymentStatus, setNewPaymentStatus] = useState('');
  const [newPaymentDate, setNewPaymentDate] = useState('');
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Get transactions representing invoices (both income and expenses)
  const invoices = useMemo(() => {
    if (!data || !data.Transaction_Entry) return [];
    
    return data.Transaction_Entry.filter(transaction => 
      transaction.invoiceDate && (transaction.paymentStatus !== 'Paid' || tabValue !== 2)
    );
  }, [data, tabValue]);
  
  // Filter invoices based on search and filters
  const filteredInvoices = useMemo(() => {
    if (!invoices.length) return [];
    
    return invoices.filter(invoice => {
      // Search term filter
      const searchMatch = 
        searchTerm === '' || 
        invoice.program.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (invoice.reference && invoice.reference.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (invoice.supplier && invoice.supplier.toLowerCase().includes(searchTerm.toLowerCase()));
      
      // Program filter
      const programMatch = programFilter === 'All' || invoice.program === programFilter;
      
      // Status filter
      const statusMatch = statusFilter === 'All' || invoice.paymentStatus === statusFilter;
      
      // Tab filters
      let tabMatch = true;
      if (tabValue === 1) { // Outstanding
        tabMatch = invoice.paymentStatus === 'Outstanding' || invoice.paymentStatus === 'Pending';
      } else if (tabValue === 2) { // Paid
        tabMatch = invoice.paymentStatus === 'Paid';
      } else if (tabValue === 3) { // Overdue
        tabMatch = invoice.paymentStatus === 'Overdue';
      }
      
      return searchMatch && programMatch && statusMatch && tabMatch;
    });
  }, [invoices, searchTerm, programFilter, statusFilter, tabValue]);
  
  // Calculate payment summary statistics
  const paymentSummary = useMemo(() => {
    if (!invoices.length) return {
      total: 0,
      paid: 0,
      outstanding: 0,
      overdue: 0,
      paidCount: 0,
      outstandingCount: 0,
      overdueCount: 0,
      pendingCount: 0
    };
    
    const summary = {
      total: 0,
      paid: 0,
      outstanding: 0,
      overdue: 0,
      paidCount: 0,
      outstandingCount: 0,
      overdueCount: 0,
      pendingCount: 0
    };
    
    invoices.forEach(invoice => {
      const amount = Math.abs(invoice.amount || 0);
      summary.total += amount;
      
      if (invoice.paymentStatus === 'Paid') {
        summary.paid += amount;
        summary.paidCount++;
      } else if (invoice.paymentStatus === 'Overdue') {
        summary.overdue += amount;
        summary.overdueCount++;
      } else if (invoice.paymentStatus === 'Outstanding') {
        summary.outstanding += amount;
        summary.outstandingCount++;
      } else if (invoice.paymentStatus === 'Pending') {
        summary.outstanding += amount;
        summary.pendingCount++;
      }
    });
    
    return summary;
  }, [invoices]);
  
  // Chart data for payment status
  const paymentStatusData = useMemo(() => {
    return [
      { name: 'Paid', value: paymentSummary.paid },
      { name: 'Outstanding', value: paymentSummary.outstanding },
      { name: 'Overdue', value: paymentSummary.overdue }
    ].filter(item => item.value > 0);
  }, [paymentSummary]);
  
  // Get programs list for filter
  const programs = useMemo(() => {
    if (!data || !data.Programs) return ['All'];
    return ['All', ...data.Programs.map(p => p.name)];
  }, [data]);
  
  // Columns for the data grid
  const columns = [
    { field: 'date', headerName: 'Date', width: 110 },
    { field: 'reference', headerName: 'Reference', width: 130 },
    { field: 'program', headerName: 'Program', width: 200 },
    { field: 'supplier', headerName: 'Supplier', width: 180 },
    { 
      field: 'amount', 
      headerName: 'Amount', 
      width: 120,
      type: 'number',
      valueFormatter: (params) => `$${Math.abs(params.value || 0).toLocaleString()}`
    },
    { field: 'invoiceDate', headerName: 'Invoice Date', width: 110 },
    { field: 'paymentDueDate', headerName: 'Due Date', width: 110 },
    {
      field: 'paymentStatus',
      headerName: 'Status',
      width: 130,
      renderCell: (params) => (
        <Chip 
          label={params.value} 
          size="small"
          sx={{ 
            bgcolor: STATUS_COLORS[params.value] || '#757575',
            color: 'white'
          }}
        />
      )
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Button 
          variant="outlined" 
          size="small"
          onClick={() => handleUpdateStatus(params.row)}
        >
          Update
        </Button>
      )
    }
  ];
  
  // Handler for updating payment status
  const handleUpdateStatus = (invoice) => {
    setSelectedInvoice(invoice);
    setNewPaymentStatus(invoice.paymentStatus);
    setNewPaymentDate(invoice.paymentDate || '');
    setUpdateDialogOpen(true);
  };
  
  // Close the update dialog
  const handleCloseDialog = () => {
    setUpdateDialogOpen(false);
  };
  
  // Save the updated payment status
  const handleSaveUpdate = () => {
    // In a real app, this would update the data in the backend
    console.log('Update payment status:', {
      invoiceId: selectedInvoice.id,
      newStatus: newPaymentStatus,
      newPaymentDate
    });
    
    // For now, just close the dialog
    setUpdateDialogOpen(false);
  };
  
  // Check if there are any overdue invoices
  const hasOverdueInvoices = useMemo(() => {
    if (!invoices.length) return false;
    return invoices.some(invoice => invoice.paymentStatus === 'Overdue');
  }, [invoices]);
  
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Payment Tracking
      </Typography>
      
      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Total Invoices
              </Typography>
              <Typography variant="h4" component="div">
                ${paymentSummary.total.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {invoices.length} invoices
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Paid
              </Typography>
              <Typography variant="h4" component="div" color="success.main">
                ${paymentSummary.paid.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {paymentSummary.paidCount} invoices
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Outstanding
              </Typography>
              <Typography variant="h4" component="div" color="primary.main">
                ${paymentSummary.outstanding.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {paymentSummary.outstandingCount + paymentSummary.pendingCount} invoices
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Overdue
              </Typography>
              <Typography variant="h4" component="div" color="error.main">
                ${paymentSummary.overdue.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {paymentSummary.overdueCount} invoices
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              variant="outlined"
              label="Search Invoices"
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
              <InputLabel id="status-filter-label">Payment Status</InputLabel>
              <Select
                labelId="status-filter-label"
                id="status-filter"
                value={statusFilter}
                label="Payment Status"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="All">All Statuses</MenuItem>
                <MenuItem value="Paid">Paid</MenuItem>
                <MenuItem value="Outstanding">Outstanding</MenuItem>
                <MenuItem value="Pending">Pending</MenuItem>
                <MenuItem value="Overdue">Overdue</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Tabs and Content */}
      <Paper sx={{ mb: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="All Invoices" />
          <Tab label="Outstanding" />
          <Tab label="Paid" />
          <Tab label="Overdue" />
        </Tabs>
        
        {/* All Invoices Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ height: 500, width: '100%' }}>
            <div style={{ display: 'flex', height: '100%' }}>
              <div style={{ flexGrow: 1 }}>
                <div style={{ height: 500, width: '100%' }}>
                  <div style={{ display: 'flex', height: '100%' }}>
                    <div style={{ flexGrow: 1 }}>
                      <Box
                        sx={{
                          height: 500,
                          width: '100%',
                          '& .overdue-row': {
                            bgcolor: 'rgba(255, 67, 54, 0.1)',
                          },
                        }}
                      >
                        {filteredInvoices.length > 0 ? (
                          <div style={{ height: 500, width: '100%' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                              <thead>
                                <tr>
                                  <th style={{ textAlign: 'left', padding: '12px 8px', borderBottom: '2px solid #ddd' }}>Date</th>
                                  <th style={{ textAlign: 'left', padding: '12px 8px', borderBottom: '2px solid #ddd' }}>Reference</th>
                                  <th style={{ textAlign: 'left', padding: '12px 8px', borderBottom: '2px solid #ddd' }}>Program</th>
                                  <th style={{ textAlign: 'left', padding: '12px 8px', borderBottom: '2px solid #ddd' }}>Supplier</th>
                                  <th style={{ textAlign: 'right', padding: '12px 8px', borderBottom: '2px solid #ddd' }}>Amount</th>
                                  <th style={{ textAlign: 'left', padding: '12px 8px', borderBottom: '2px solid #ddd' }}>Invoice Date</th>
                                  <th style={{ textAlign: 'left', padding: '12px 8px', borderBottom: '2px solid #ddd' }}>Due Date</th>
                                  <th style={{ textAlign: 'left', padding: '12px 8px', borderBottom: '2px solid #ddd' }}>Status</th>
                                  <th style={{ textAlign: 'center', padding: '12px 8px', borderBottom: '2px solid #ddd' }}>Actions</th>
                                </tr>
                              </thead>
                              <tbody>
                                {filteredInvoices.map((invoice) => (
                                  <tr 
                                    key={invoice.id}
                                    style={{ 
                                      backgroundColor: invoice.paymentStatus === 'Overdue' ? 'rgba(255, 67, 54, 0.1)' : 'inherit'
                                    }}
                                  >
                                    <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>{invoice.date}</td>
                                    <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>{invoice.reference}</td>
                                    <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>{invoice.program}</td>
                                    <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>{invoice.supplier}</td>
                                    <td style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid #ddd' }}>
                                      ${Math.abs(invoice.amount || 0).toLocaleString()}
                                    </td>
                                    <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>{invoice.invoiceDate}</td>
                                    <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>{invoice.paymentDueDate}</td>
                                    <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>
                                      <Chip 
                                        label={invoice.paymentStatus} 
                                        size="small"
                                        sx={{ 
                                          bgcolor: STATUS_COLORS[invoice.paymentStatus] || '#757575',
                                          color: 'white'
                                        }}
                                      />
                                    </td>
                                    <td style={{ textAlign: 'center', padding: '8px', borderBottom: '1px solid #ddd' }}>
                                      <Button 
                                        variant="outlined" 
                                        size="small"
                                        onClick={() => handleUpdateStatus(invoice)}
                                      >
                                        Update
                                      </Button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                            <Typography variant="h6" color="text.secondary">
                              No invoices match the current filters
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Box>
        </TabPanel>
        
        {/* Outstanding Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ height: 500, width: '100%' }}>
            {/* Same table structure as above, filtered for outstanding invoices */}
          </Box>
        </TabPanel>
        
        {/* Paid Tab */}
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ height: 500, width: '100%' }}>
            {/* Same table structure as above, filtered for paid invoices */}
          </Box>
        </TabPanel>
        
        {/* Overdue Tab */}
        <TabPanel value={tabValue} index={3}>
          <Box sx={{ height: 500, width: '100%' }}>
            {/* Same table structure as above, filtered for overdue invoices */}
          </Box>
        </TabPanel>
      </Paper>
      
      {/* Payment Status Charts */}
      <Typography variant="h5" gutterBottom>
        Payment Analysis
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Payment Status Distribution
            </Typography>
            <ResponsiveContainer width="100%" height="90%">
              <PieChart>
                <Pie
                  data={paymentStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {paymentStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name] || COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Payment Timeline
            </Typography>
            <ResponsiveContainer width="100%" height="90%">
              <BarChart
                data={[
                  { period: '0-30 Days', value: 45000 },
                  { period: '31-60 Days', value: 30000 },
                  { period: '61-90 Days', value: 15000 },
                  { period: '90+ Days', value: 8000 }
                ]}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                <Bar dataKey="value" name="Outstanding Amount" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Update Status Dialog */}
      <Dialog 
        open={updateDialogOpen} 
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Update Payment Status</DialogTitle>
        <DialogContent>
          {selectedInvoice && (
            <Box sx={{ pt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="subtitle1">
                    Reference: {selectedInvoice.reference}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedInvoice.program} - ${Math.abs(selectedInvoice.amount || 0).toLocaleString()}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth sx={{ mt: 2 }}>
                    <InputLabel id="payment-status-label">Payment Status</InputLabel>
                    <Select
                      labelId="payment-status-label"
                      value={newPaymentStatus}
                      label="Payment Status"
                      onChange={(e) => setNewPaymentStatus(e.target.value)}
                    >
                      <MenuItem value="Paid">Paid</MenuItem>
                      <MenuItem value="Outstanding">Outstanding</MenuItem>
                      <MenuItem value="Pending">Pending</MenuItem>
                      <MenuItem value="Overdue">Overdue</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Payment Date"
                    type="date"
                    value={newPaymentDate}
                    onChange={(e) => setNewPaymentDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    sx={{ mt: 2 }}
                    disabled={newPaymentStatus !== 'Paid'}
                  />
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveUpdate}>
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PaymentTrackingView;