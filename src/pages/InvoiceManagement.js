// src/pages/InvoiceManagement.js (Updated to not use @mui/x-date-pickers)
import React, { useState, useMemo, useEffect } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  Snackbar,
  Alert,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Print as PrintIcon,
  Email as EmailIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Description as InvoiceIcon,
  AttachMoney as PaymentIcon,
  GetApp as DownloadIcon,
  PictureAsPdf as PdfIcon
} from '@mui/icons-material';

// Sample invoice template data
const invoiceTemplates = [
  { id: 1, name: 'Standard Invoice' },
  { id: 2, name: 'Detailed Invoice' },
  { id: 3, name: 'Simple Receipt' }
];

// Invoice statuses with colors
const invoiceStatuses = {
  'Draft': { color: '#9e9e9e' },
  'Pending': { color: '#2196f3' },
  'Sent': { color: '#ff9800' },
  'Paid': { color: '#4caf50' },
  'Overdue': { color: '#f44336' },
  'Cancelled': { color: '#757575' }
};

// TabPanel component for tabs
function TabPanel(props) {
  const { children, value, index, ...other } = props;
  
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`invoice-tabpanel-${index}`}
      aria-labelledby={`invoice-tab-${index}`}
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

const InvoiceManagement = () => {
  const { data, loading } = useData();
  const { hasPermission } = useAuth();
  
  // State for invoice management
  const [invoices, setInvoices] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState('add'); // 'add', 'edit', 'view', 'payment'
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  // Filter state
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState({ startDate: null, endDate: null });
  const [programFilter, setProgramFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  
  // New invoice form state
  const [invoiceForm, setInvoiceForm] = useState({
    invoiceNumber: '',
    program: '',
    date: new Date(),
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    client: '',
    items: [{ description: '', quantity: 1, unitPrice: 0, amount: 0 }],
    subtotal: 0,
    tax: 0,
    total: 0,
    notes: '',
    status: 'Draft',
    template: 1
  });
  
  // Create initial invoice list from transactions
  useEffect(() => {
    if (data?.Transaction_Entry) {
      // Convert relevant transactions to invoices
      const transactionInvoices = data.Transaction_Entry
        .filter(t => t.type === 'Income' && t.invoiceDate)
        .map((transaction, index) => {
          // Calculate due date (30 days from invoice date) and status
          const invoiceDate = new Date(transaction.invoiceDate);
          const dueDate = new Date(invoiceDate);
          dueDate.setDate(dueDate.getDate() + 30);
          
          let status = 'Pending';
          if (transaction.paymentStatus === 'Paid') {
            status = 'Paid';
          } else if (new Date() > dueDate) {
            status = 'Overdue';
          } else if (transaction.paymentStatus === 'Outstanding') {
            status = 'Sent';
          }
          
          return {
            id: 1000 + index,
            invoiceNumber: transaction.reference || `INV-${1000 + index}`,
            program: transaction.program,
            date: transaction.invoiceDate,
            dueDate: transaction.paymentDueDate || dueDate.toISOString().split('T')[0],
            client: transaction.supplier || 'Client',
            items: [
              { 
                description: transaction.description || 'Services', 
                quantity: 1, 
                unitPrice: Math.abs(transaction.amount), 
                amount: Math.abs(transaction.amount) 
              }
            ],
            subtotal: Math.abs(transaction.amount),
            tax: 0,
            total: Math.abs(transaction.amount),
            notes: transaction.description || '',
            status: status,
            paymentDate: transaction.paymentDate || null,
            template: 1,
            createdAt: transaction.date
          };
        });
      
      // Add a few sample invoices
      const sampleInvoices = [
        {
          id: 1,
          invoiceNumber: 'INV-2023-001',
          program: 'Technology Outreach Program',
          date: '2023-04-01',
          dueDate: '2023-05-01',
          client: 'Swinburne University',
          items: [
            { description: 'Consultation Services', quantity: 40, unitPrice: 150, amount: 6000 },
            { description: 'Workshop Materials', quantity: 1, unitPrice: 500, amount: 500 }
          ],
          subtotal: 6500,
          tax: 650,
          total: 7150,
          notes: 'Payment due within 30 days',
          status: 'Paid',
          paymentDate: '2023-04-25',
          template: 1,
          createdAt: '2023-03-28'
        },
        {
          id: 2,
          invoiceNumber: 'INV-2023-002',
          program: 'STEM Curriculum Development',
          date: '2023-04-15',
          dueDate: '2023-05-15',
          client: 'Education Department',
          items: [
            { description: 'Curriculum Development', quantity: 1, unitPrice: 8500, amount: 8500 }
          ],
          subtotal: 8500,
          tax: 850,
          total: 9350,
          notes: 'First installment for curriculum development',
          status: 'Pending',
          paymentDate: null,
          template: 2,
          createdAt: '2023-04-10'
        },
        {
          id: 3,
          invoiceNumber: 'INV-2023-003',
          program: 'School Partnership Initiative',
          date: '2023-03-20',
          dueDate: '2023-04-19',
          client: 'School District',
          items: [
            { description: 'Partnership Program Fee', quantity: 1, unitPrice: 12000, amount: 12000 },
            { description: 'Setup Fee', quantity: 1, unitPrice: 500, amount: 500 }
          ],
          subtotal: 12500,
          tax: 1250,
          total: 13750,
          notes: '',
          status: 'Overdue',
          paymentDate: null,
          template: 1,
          createdAt: '2023-03-15'
        }
      ];
      
      // Combine and set invoices
      setInvoices([...sampleInvoices, ...transactionInvoices]);
    }
  }, [data]);
  
  // Generate a new invoice number
  const generateInvoiceNumber = () => {
    const prefix = 'INV';
    const year = new Date().getFullYear();
    const lastInvoice = [...invoices].sort((a, b) => b.id - a.id)[0];
    const nextNumber = lastInvoice ? lastInvoice.id + 1 : 1;
    return `${prefix}-${year}-${String(nextNumber).padStart(3, '0')}`;
  };
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Open dialog for adding a new invoice
  const handleAddInvoice = () => {
    // Reset form with new invoice number and current date
    setInvoiceForm({
      invoiceNumber: generateInvoiceNumber(),
      program: programFilter !== 'All' ? programFilter : '',
      date: new Date(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      client: '',
      items: [{ description: '', quantity: 1, unitPrice: 0, amount: 0 }],
      subtotal: 0,
      tax: 0,
      total: 0,
      notes: '',
      status: 'Draft',
      template: 1
    });
    
    setDialogMode('add');
    setDialogOpen(true);
  };
  
  // Open dialog to edit an invoice
  const handleEditInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    
    // Convert string dates to Date objects for the form
    const formData = {
      ...invoice,
      date: new Date(invoice.date),
      dueDate: new Date(invoice.dueDate)
    };
    
    setInvoiceForm(formData);
    setDialogMode('edit');
    setDialogOpen(true);
  };
  
  // Open dialog to view invoice details
  const handleViewInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setDialogMode('view');
    setDialogOpen(true);
  };
  
  // Open dialog to record payment
  const handleRecordPayment = (invoice) => {
    setSelectedInvoice(invoice);
    setDialogMode('payment');
    setDialogOpen(true);
  };
  
  // Close dialog
  const handleCloseDialog = () => {
    setDialogOpen(false);
  };
  
  // Handle form field changes
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setInvoiceForm(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle date changes
  const handleDateChange = (name, value) => {
    setInvoiceForm(prev => ({ ...prev, [name]: new Date(value) }));
  };
  
  // Add a new invoice line item
  const handleAddItem = () => {
    setInvoiceForm(prev => ({
      ...prev,
      items: [...prev.items, { description: '', quantity: 1, unitPrice: 0, amount: 0 }]
    }));
  };
  
  // Update an invoice line item
  const handleItemChange = (index, field, value) => {
    const newItems = [...invoiceForm.items];
    newItems[index][field] = value;
    
    // Recalculate amount if quantity or unitPrice changes
    if (field === 'quantity' || field === 'unitPrice') {
      newItems[index].amount = newItems[index].quantity * newItems[index].unitPrice;
    }
    
    // Recalculate totals
    const subtotal = newItems.reduce((sum, item) => sum + item.amount, 0);
    const tax = subtotal * (invoiceForm.tax / 100);
    const total = subtotal + tax;
    
    setInvoiceForm(prev => ({
      ...prev,
      items: newItems,
      subtotal,
      total
    }));
  };
  
  // Remove an invoice line item
  const handleRemoveItem = (index) => {
    const newItems = invoiceForm.items.filter((_, i) => i !== index);
    
    // Recalculate totals
    const subtotal = newItems.reduce((sum, item) => sum + item.amount, 0);
    const tax = subtotal * (invoiceForm.tax / 100);
    const total = subtotal + tax;
    
    setInvoiceForm(prev => ({
      ...prev,
      items: newItems,
      subtotal,
      total
    }));
  };
  
  // Update tax amount
  const handleTaxChange = (e) => {
    const taxPercentage = parseFloat(e.target.value) || 0;
    const subtotal = invoiceForm.subtotal;
    const tax = subtotal * (taxPercentage / 100);
    const total = subtotal + tax;
    
    setInvoiceForm(prev => ({
      ...prev,
      tax: taxPercentage,
      total
    }));
  };
  
  // Handle invoice save (add/edit)
  const handleSaveInvoice = () => {
    if (dialogMode === 'add') {
      // Add new invoice
      const newInvoice = {
        ...invoiceForm,
        id: invoices.length > 0 ? Math.max(...invoices.map(i => i.id)) + 1 : 1,
        date: invoiceForm.date.toISOString().split('T')[0],
        dueDate: invoiceForm.dueDate.toISOString().split('T')[0],
        createdAt: new Date().toISOString().split('T')[0]
      };
      
      setInvoices([...invoices, newInvoice]);
      setSnackbar({
        open: true,
        message: 'Invoice created successfully',
        severity: 'success'
      });
    } else {
      // Edit existing invoice
      const updatedInvoices = invoices.map(inv => 
        inv.id === selectedInvoice.id 
          ? {
              ...invoiceForm,
              date: invoiceForm.date.toISOString().split('T')[0],
              dueDate: invoiceForm.dueDate.toISOString().split('T')[0]
            }
          : inv
      );
      
      setInvoices(updatedInvoices);
      setSnackbar({
        open: true,
        message: 'Invoice updated successfully',
        severity: 'success'
      });
    }
    
    setDialogOpen(false);
  };
  
  // Handle recording payment
  const handleSavePayment = () => {
    // Update invoice status to Paid
    const updatedInvoices = invoices.map(inv => 
      inv.id === selectedInvoice.id 
        ? {
            ...inv,
            status: 'Paid',
            paymentDate: new Date().toISOString().split('T')[0]
          }
        : inv
    );
    
    setInvoices(updatedInvoices);
    setSnackbar({
      open: true,
      message: 'Payment recorded successfully',
      severity: 'success'
    });
    
    setDialogOpen(false);
  };
  
  // Handle invoice deletion
  const handleDeleteInvoice = (invoice) => {
    if (window.confirm(`Are you sure you want to delete invoice ${invoice.invoiceNumber}?`)) {
      const updatedInvoices = invoices.filter(inv => inv.id !== invoice.id);
      setInvoices(updatedInvoices);
      
      setSnackbar({
        open: true,
        message: 'Invoice deleted successfully',
        severity: 'success'
      });
    }
  };
  
  // Filter invoices based on current tab and filters
  const filteredInvoices = useMemo(() => {
    if (!invoices.length) return [];
    
    return invoices.filter(invoice => {
      // Search filter
      const searchMatch = searchTerm === '' || 
        invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.program.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Program filter
      const programMatch = programFilter === 'All' || invoice.program === programFilter;
      
      // Status filter
      const statusMatch = statusFilter === 'All' || invoice.status === statusFilter;
      
      // Date range filter
      let dateMatch = true;
      if (dateRange.startDate || dateRange.endDate) {
        const invoiceDate = new Date(invoice.date);
        if (dateRange.startDate && dateRange.endDate) {
          dateMatch = invoiceDate >= dateRange.startDate && invoiceDate <= dateRange.endDate;
        } else if (dateRange.startDate) {
          dateMatch = invoiceDate >= dateRange.startDate;
        } else if (dateRange.endDate) {
          dateMatch = invoiceDate <= dateRange.endDate;
        }
      }
      
      // Tab filter
      let tabMatch = true;
      switch (tabValue) {
        case 0: // All
          tabMatch = true;
          break;
        case 1: // Draft
          tabMatch = invoice.status === 'Draft';
          break;
        case 2: // Pending/Sent
          tabMatch = invoice.status === 'Pending' || invoice.status === 'Sent';
          break;
        case 3: // Paid
          tabMatch = invoice.status === 'Paid';
          break;
        case 4: // Overdue
          tabMatch = invoice.status === 'Overdue';
          break;
        default:
          tabMatch = true;
      }
      
      return searchMatch && programMatch && statusMatch && dateMatch && tabMatch;
    });
  }, [invoices, searchTerm, programFilter, statusFilter, dateRange, tabValue]);
  
  // Get programs list for filter
  const programs = useMemo(() => {
    if (!data?.Programs) return ['All'];
    
    const programNames = data.Programs.map(p => p.name);
    return ['All', ...programNames];
  }, [data]);
  
  // Close snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };
  
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' }).format(amount);
  };
  
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Invoice Management
      </Typography>
      
      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Search Invoices"
              variant="outlined"
              size="small"
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
          
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Program</InputLabel>
              <Select
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
          
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="All">All Statuses</MenuItem>
                {Object.keys(invoiceStatuses).map((status) => (
                  <MenuItem key={status} value={status}>
                    {status}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              {hasPermission('write') && (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleAddInvoice}
                >
                  New Invoice
                </Button>
              )}
            </Box>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="All Invoices" />
          <Tab label="Draft" />
          <Tab label="Pending/Sent" />
          <Tab label="Paid" />
          <Tab label="Overdue" />
        </Tabs>
        
        {/* Invoice List */}
        <Box sx={{ p: 2 }}>
          {filteredInvoices.length > 0 ? (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '12px 8px', borderBottom: '2px solid #ddd' }}>Invoice #</th>
                  <th style={{ textAlign: 'left', padding: '12px 8px', borderBottom: '2px solid #ddd' }}>Client</th>
                  <th style={{ textAlign: 'left', padding: '12px 8px', borderBottom: '2px solid #ddd' }}>Program</th>
                  <th style={{ textAlign: 'left', padding: '12px 8px', borderBottom: '2px solid #ddd' }}>Date</th>
                  <th style={{ textAlign: 'left', padding: '12px 8px', borderBottom: '2px solid #ddd' }}>Due Date</th>
                  <th style={{ textAlign: 'right', padding: '12px 8px', borderBottom: '2px solid #ddd' }}>Amount</th>
                  <th style={{ textAlign: 'center', padding: '12px 8px', borderBottom: '2px solid #ddd' }}>Status</th>
                  <th style={{ textAlign: 'center', padding: '12px 8px', borderBottom: '2px solid #ddd' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map((invoice) => (
                  <tr key={invoice.id}>
                    <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>
                      <Box 
                        sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          cursor: 'pointer' 
                        }}
                        onClick={() => handleViewInvoice(invoice)}
                      >
                        <InvoiceIcon fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
                        {invoice.invoiceNumber}
                      </Box>
                    </td>
                    <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>{invoice.client}</td>
                    <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>{invoice.program}</td>
                    <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>{invoice.date}</td>
                    <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>{invoice.dueDate}</td>
                    <td style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid #ddd' }}>
                      {formatCurrency(invoice.total)}
                    </td>
                    <td style={{ textAlign: 'center', padding: '8px', borderBottom: '1px solid #ddd' }}>
                      <Chip
                        label={invoice.status}
                        size="small"
                        sx={{
                          bgcolor: invoiceStatuses[invoice.status]?.color,
                          color: 'white'
                        }}
                      />
                    </td>
                    <td style={{ textAlign: 'center', padding: '8px', borderBottom: '1px solid #ddd' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                        <Tooltip title="View Invoice">
                          <IconButton size="small" onClick={() => handleViewInvoice(invoice)}>
                            <InvoiceIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        
                        {hasPermission('write') && (
                          <>
                            {invoice.status !== 'Paid' && (
                              <Tooltip title="Record Payment">
                                <IconButton 
                                  size="small" 
                                  onClick={() => handleRecordPayment(invoice)}
                                  color="success"
                                >
                                  <PaymentIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                            
                            <Tooltip title="Edit Invoice">
                              <IconButton 
                                size="small" 
                                onClick={() => handleEditInvoice(invoice)}
                                color="primary"
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            
                            <Tooltip title="Delete Invoice">
                              <IconButton 
                                size="small" 
                                onClick={() => handleDeleteInvoice(invoice)}
                                color="error"
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}
                        
                        <Tooltip title="Download PDF">
                          <IconButton size="small">
                            <PdfIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary">
                No invoices found matching your filters.
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Try changing your search criteria or create a new invoice.
              </Typography>
            </Box>
          )}
        </Box>
      </Paper>
      
      {/* Invoice Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {dialogMode === 'add' ? 'Create New Invoice' : 
           dialogMode === 'edit' ? 'Edit Invoice' : 
           dialogMode === 'payment' ? 'Record Payment' : 'View Invoice'}
        </DialogTitle>
        <DialogContent dividers>
          {dialogMode === 'payment' ? (
            // Payment recording form
            <Box sx={{ p: 1 }}>
              <Typography variant="h6" gutterBottom>
                Record Payment for Invoice #{selectedInvoice?.invoiceNumber}
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Invoice Number"
                    value={selectedInvoice?.invoiceNumber || ''}
                    fullWidth
                    disabled
                    margin="normal"
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Amount"
                    value={selectedInvoice ? formatCurrency(selectedInvoice.total) : ''}
                    fullWidth
                    disabled
                    margin="normal"
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Payment Date"
                    type="date"
                    defaultValue={new Date().toISOString().split('T')[0]}
                    fullWidth
                    margin="normal"
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Payment Method</InputLabel>
                    <Select
                      label="Payment Method"
                      defaultValue="bank"
                    >
                      <MenuItem value="bank">Bank Transfer</MenuItem>
                      <MenuItem value="card">Credit Card</MenuItem>
                      <MenuItem value="cash">Cash</MenuItem>
                      <MenuItem value="other">Other</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    label="Payment Reference"
                    placeholder="Bank reference, check number, etc."
                    fullWidth
                    margin="normal"
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    label="Notes"
                    multiline
                    rows={2}
                    fullWidth
                    margin="normal"
                  />
                </Grid>
              </Grid>
            </Box>
          ) : (
            // Invoice form (add/edit/view)
            <Box sx={{ p: 1 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <TextField
                    label="Invoice Number"
                    name="invoiceNumber"
                    value={invoiceForm.invoiceNumber}
                    onChange={handleFormChange}
                    fullWidth
                    required
                    disabled={dialogMode === 'view'}
                    margin="normal"
                  />
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Program</InputLabel>
                    <Select
                      name="program"
                      value={invoiceForm.program}
                      onChange={handleFormChange}
                      label="Program"
                      disabled={dialogMode === 'view'}
                    >
                      {programs.filter(p => p !== 'All').map((program) => (
                        <MenuItem key={program} value={program}>
                          {program}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Status</InputLabel>
                    <Select
                      name="status"
                      value={invoiceForm.status}
                      onChange={handleFormChange}
                      label="Status"
                      disabled={dialogMode === 'view'}
                    >
                      {Object.keys(invoiceStatuses).map((status) => (
                        <MenuItem key={status} value={status}>
                          {status}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Invoice Date"
                    type="date"
                    name="date"
                    value={typeof invoiceForm.date === 'object' 
                      ? invoiceForm.date.toISOString().split('T')[0] 
                      : invoiceForm.date}
                    onChange={(e) => handleDateChange('date', e.target.value)}
                    disabled={dialogMode === 'view'}
                    fullWidth
                    margin="normal"
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Due Date"
                    type="date"
                    name="dueDate"
                    value={typeof invoiceForm.dueDate === 'object' 
                      ? invoiceForm.dueDate.toISOString().split('T')[0] 
                      : invoiceForm.dueDate}
                    onChange={(e) => handleDateChange('dueDate', e.target.value)}
                    disabled={dialogMode === 'view'}
                    fullWidth
                    margin="normal"
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    label="Client/Organization"
                    name="client"
                    value={invoiceForm.client}
                    onChange={handleFormChange}
                    fullWidth
                    required
                    disabled={dialogMode === 'view'}
                    margin="normal"
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">Invoice Items</Typography>
                    {dialogMode !== 'view' && (
                      <Button 
                        startIcon={<AddIcon />} 
                        onClick={handleAddItem}
                        size="small"
                      >
                        Add Item
                      </Button>
                    )}
                  </Box>
                  
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr>
                        <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #ddd' }}>Description</th>
                        <th style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid #ddd', width: '100px' }}>Quantity</th>
                        <th style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid #ddd', width: '150px' }}>Unit Price</th>
                        <th style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid #ddd', width: '150px' }}>Amount</th>
                        {dialogMode !== 'view' && (
                          <th style={{ textAlign: 'center', padding: '8px', borderBottom: '1px solid #ddd', width: '70px' }}>Action</th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {invoiceForm.items.map((item, index) => (
                        <tr key={index}>
                          <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>
                            <TextField
                              fullWidth
                              size="small"
                              value={item.description}
                              onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                              disabled={dialogMode === 'view'}
                              variant="standard"
                            />
                          </td>
                          <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>
                            <TextField
                              type="number"
                              size="small"
                              value={item.quantity}
                              onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                              disabled={dialogMode === 'view'}
                              inputProps={{ min: 1, style: { textAlign: 'right' } }}
                              variant="standard"
                            />
                          </td>
                          <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>
                            <TextField
                              type="number"
                              size="small"
                              value={item.unitPrice}
                              onChange={(e) => handleItemChange(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                              disabled={dialogMode === 'view'}
                              InputProps={{
                                startAdornment: <InputAdornment position="start">$</InputAdornment>,
                                style: { textAlign: 'right' }
                              }}
                              variant="standard"
                            />
                          </td>
                          <td style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid #ddd' }}>
                            {formatCurrency(item.amount)}
                          </td>
                          {dialogMode !== 'view' && (
                            <td style={{ textAlign: 'center', padding: '8px', borderBottom: '1px solid #ddd' }}>
                              {invoiceForm.items.length > 1 && (
                                <IconButton
                                  size="small"
                                  onClick={() => handleRemoveItem(index)}
                                  color="error"
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              )}
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan={dialogMode === 'view' ? 2 : 3} />
                        <td style={{ textAlign: 'right', padding: '8px', fontWeight: 'bold' }}>Subtotal:</td>
                        <td style={{ textAlign: 'right', padding: '8px' }}>{formatCurrency(invoiceForm.subtotal)}</td>
                        {dialogMode !== 'view' && <td />}
                      </tr>
                      <tr>
                        <td colSpan={dialogMode === 'view' ? 2 : 3} />
                        <td style={{ textAlign: 'right', padding: '8px', fontWeight: 'bold' }}>
                          {dialogMode === 'view' ? (
                            `Tax (${invoiceForm.tax}%):`
                          ) : (
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                              <Typography variant="body2" sx={{ mr: 1 }}>Tax:</Typography>
                              <TextField
                                type="number"
                                size="small"
                                value={invoiceForm.tax}
                                onChange={handleTaxChange}
                                InputProps={{
                                  endAdornment: <InputAdornment position="end">%</InputAdornment>,
                                  style: { width: '80px' }
                                }}
                                variant="standard"
                              />
                            </Box>
                          )}
                        </td>
                        <td style={{ textAlign: 'right', padding: '8px' }}>
                          {formatCurrency(invoiceForm.subtotal * (invoiceForm.tax / 100))}
                        </td>
                        {dialogMode !== 'view' && <td />}
                      </tr>
                      <tr>
                        <td colSpan={dialogMode === 'view' ? 2 : 3} />
                        <td style={{ textAlign: 'right', padding: '12px 8px', fontWeight: 'bold', fontSize: '1.1em' }}>Total:</td>
                        <td style={{ textAlign: 'right', padding: '12px 8px', fontWeight: 'bold', fontSize: '1.1em' }}>
                          {formatCurrency(invoiceForm.total)}
                        </td>
                        {dialogMode !== 'view' && <td />}
                      </tr>
                    </tfoot>
                  </table>
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    label="Notes"
                    name="notes"
                    value={invoiceForm.notes}
                    onChange={handleFormChange}
                    multiline
                    rows={3}
                    fullWidth
                    disabled={dialogMode === 'view'}
                    margin="normal"
                  />
                </Grid>
                
                {dialogMode === 'view' && selectedInvoice?.paymentDate && (
                  <Grid item xs={12}>
                    <Alert severity="success" sx={{ mt: 2 }}>
                      <Typography variant="subtitle2">
                        Payment Received: {selectedInvoice.paymentDate}
                      </Typography>
                    </Alert>
                  </Grid>
                )}
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>
            {dialogMode === 'view' ? 'Close' : 'Cancel'}
          </Button>
          
          {dialogMode === 'view' ? (
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<PdfIcon />}
            >
              Download PDF
            </Button>
          ) : dialogMode === 'payment' ? (
            <Button 
              variant="contained" 
              color="success" 
              onClick={handleSavePayment}
              startIcon={<PaymentIcon />}
            >
              Record Payment
            </Button>
          ) : (
            <Button 
              variant="contained" 
              color="primary" 
              onClick={handleSaveInvoice}
            >
              {dialogMode === 'add' ? 'Create Invoice' : 'Save Changes'}
            </Button>
          )}
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

export default InvoiceManagement;