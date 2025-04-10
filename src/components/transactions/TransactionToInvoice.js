// src/components/transactions/TransactionToInvoice.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Divider,
  Alert,
  FormControlLabel,
  Checkbox,
  Grid
} from '@mui/material';
import { Description as InvoiceIcon } from '@mui/icons-material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const TransactionToInvoice = ({ transaction, open, onClose }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  // Initialize form with transaction data
  const [form, setForm] = useState({
    invoiceNumber: `INV-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
    client: transaction?.supplier || '',
    description: transaction?.description || '',
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    notes: `Generated from transaction: ${transaction?.reference || 'N/A'}`,
    includeDetails: true,
    template: 1
  });
  
  // Handle form changes
  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: name === 'includeDetails' ? checked : value
    }));
  };
  
  // Handle date change
  const handleDateChange = (date) => {
    setForm(prev => ({
      ...prev,
      dueDate: date
    }));
  };
  
  // Create invoice from transaction
  const handleCreateInvoice = () => {
    setLoading(true);
    
    // Create invoice object
    const invoice = {
      id: Date.now(), // Use timestamp as temporary ID
      invoiceNumber: form.invoiceNumber,
      program: transaction.program,
      date: transaction.date,
      dueDate: form.dueDate.toISOString().split('T')[0],
      client: form.client,
      items: [
        { 
          description: form.description, 
          quantity: 1, 
          unitPrice: Math.abs(transaction.amount), 
          amount: Math.abs(transaction.amount)
        }
      ],
      subtotal: Math.abs(transaction.amount),
      tax: 0,
      total: Math.abs(transaction.amount),
      notes: form.notes,
      status: 'Pending',
      template: form.template,
      createdAt: new Date().toISOString().split('T')[0],
      transactionId: transaction.id // Reference to original transaction
    };
    
    // Get existing invoices from localStorage
    const existingInvoices = localStorage.getItem('invoices');
    const invoices = existingInvoices ? JSON.parse(existingInvoices) : [];
    
    // Add new invoice
    invoices.push(invoice);
    
    // Save back to localStorage
    localStorage.setItem('invoices', JSON.stringify(invoices));
    
    // Simulate API call delay
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      
      // Reset after success
      setTimeout(() => {
        navigate('/invoices');
      }, 1500);
    }, 1000);
  };
  
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <InvoiceIcon sx={{ mr: 1 }} />
          Create Invoice from Transaction
        </Box>
      </DialogTitle>
      
      <DialogContent dividers>
        {success ? (
          <Alert severity="success" sx={{ mb: 2 }}>
            Invoice created successfully! Redirecting to Invoice Management...
          </Alert>
        ) : (
          <>
            <Alert severity="info" sx={{ mb: 3 }}>
              This will create a new invoice based on this transaction. You can modify the details below.
            </Alert>
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  name="invoiceNumber"
                  label="Invoice Number"
                  value={form.invoiceNumber}
                  onChange={handleChange}
                  fullWidth
                  margin="normal"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Due Date"
                    value={form.dueDate}
                    onChange={handleDateChange}
                    renderInput={(params) => <TextField {...params} fullWidth margin="normal" />}
                  />
                </LocalizationProvider>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  name="client"
                  label="Client/Organization"
                  value={form.client}
                  onChange={handleChange}
                  fullWidth
                  margin="normal"
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  name="description"
                  label="Description"
                  value={form.description}
                  onChange={handleChange}
                  fullWidth
                  margin="normal"
                />
              </Grid>
              
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', my: 2 }}>
                  <Typography variant="subtitle1" sx={{ flexGrow: 1 }}>
                    Transaction Amount
                  </Typography>
                  <Typography variant="h6">
                    {new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' }).format(Math.abs(transaction?.amount || 0))}
                  </Typography>
                </Box>
                <Divider />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  name="notes"
                  label="Notes"
                  value={form.notes}
                  onChange={handleChange}
                  fullWidth
                  multiline
                  rows={3}
                  margin="normal"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Invoice Template</InputLabel>
                  <Select
                    name="template"
                    value={form.template}
                    onChange={handleChange}
                    label="Invoice Template"
                  >
                    <MenuItem value={1}>Standard Invoice</MenuItem>
                    <MenuItem value={2}>Detailed Invoice</MenuItem>
                    <MenuItem value={3}>Simple Receipt</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Box sx={{ mt: 3 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        name="includeDetails"
                        checked={form.includeDetails}
                        onChange={handleChange}
                      />
                    }
                    label="Include transaction details"
                  />
                </Box>
              </Grid>
            </Grid>
          </>
        )}
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose} disabled={loading || success}>
          Cancel
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleCreateInvoice}
          disabled={loading || success}
          startIcon={<InvoiceIcon />}
        >
          {loading ? 'Creating...' : 'Create Invoice'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TransactionToInvoice;