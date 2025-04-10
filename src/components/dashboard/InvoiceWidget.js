// src/components/dashboard/InvoiceWidget.js
import React, { useState, useMemo } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  List, 
  ListItem, 
  ListItemText, 
  Chip, 
  Button,
  Divider,
  IconButton,
  Tooltip,
  CircularProgress
} from '@mui/material';
import {
  Receipt as ReceiptIcon,
  ArrowForward as ArrowForwardIcon,
  AttachMoney as MoneyIcon,
  Schedule as PendingIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';

// Invoice status colors
const statusColors = {
  'Paid': '#4caf50',
  'Pending': '#ff9800',
  'Outstanding': '#2196f3',
  'Overdue': '#f44336'
};

const InvoiceWidget = () => {
  const { data, loading } = useData();
  const navigate = useNavigate();
  
  // Calculate invoice summary
  const invoiceSummary = useMemo(() => {
    if (!data || !data.Transaction_Entry) {
      return {
        total: 0,
        paid: 0,
        pending: 0,
        overdue: 0,
        recent: []
      };
    }
    
    // Get income transactions that have invoice dates
    const invoices = data.Transaction_Entry.filter(t => 
      t.type === 'Income' && t.invoiceDate
    );
    
    const summary = {
      total: invoices.length,
      paid: 0,
      pending: 0,
      overdue: 0,
      recent: []
    };
    
    // Count by status
    invoices.forEach(invoice => {
      if (invoice.paymentStatus === 'Paid') {
        summary.paid++;
      } else if (invoice.paymentStatus === 'Overdue') {
        summary.overdue++;
      } else {
        summary.pending++;
      }
    });
    
    // Get 5 most recent invoices
    summary.recent = [...invoices]
      .sort((a, b) => new Date(b.invoiceDate) - new Date(a.invoiceDate))
      .slice(0, 5);
    
    return summary;
  }, [data]);
  
  // Navigate to invoice management page
  const handleViewAll = () => {
    navigate('/invoices');
  };
  
  if (loading) {
    return (
      <Paper sx={{ p: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <CircularProgress />
      </Paper>
    );
  }
  
  return (
    <Paper sx={{ p: 2, height: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          <ReceiptIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Recent Invoices
        </Typography>
        
        <Button
          size="small"
          endIcon={<ArrowForwardIcon />}
          onClick={handleViewAll}
        >
          View All
        </Button>
      </Box>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-around', mb: 2 }}>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h4" color="primary">
            {invoiceSummary.total}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Total
          </Typography>
        </Box>
        
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h4" color="success.main">
            {invoiceSummary.paid}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Paid
          </Typography>
        </Box>
        
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h4" color="info.main">
            {invoiceSummary.pending}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Pending
          </Typography>
        </Box>
        
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h4" color="error.main">
            {invoiceSummary.overdue}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Overdue
          </Typography>
        </Box>
      </Box>
      
      <Divider sx={{ my: 2 }} />
      
      {invoiceSummary.recent.length > 0 ? (
        <List sx={{ width: '100%' }}>
          {invoiceSummary.recent.map((invoice, index) => (
            <React.Fragment key={invoice.id || index}>
              <ListItem 
                alignItems="flex-start"
                secondaryAction={
                  <Tooltip title={`$${Math.abs(invoice.amount).toLocaleString()}`}>
                    <IconButton edge="end" size="small">
                      <MoneyIcon />
                    </IconButton>
                  </Tooltip>
                }
                sx={{ py: 1 }}
              >
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {invoice.reference || `INV-${invoice.id}`}
                      <Chip 
                        label={invoice.paymentStatus} 
                        size="small"
                        sx={{ 
                          ml: 1,
                          bgcolor: statusColors[invoice.paymentStatus] || '#757575',
                          color: 'white',
                          height: 20,
                          '& .MuiChip-label': { px: 1, py: 0 }
                        }}
                      />
                    </Box>
                  }
                  secondary={
                    <>
                      <Typography
                        component="span"
                        variant="body2"
                        color="text.primary"
                      >
                        {invoice.supplier || 'Client'}
                      </Typography>
                      {" — "}
                      {invoice.invoiceDate}
                      {invoice.paymentDueDate && ` (Due: ${invoice.paymentDueDate})`}
                    </>
                  }
                />
              </ListItem>
              {index < invoiceSummary.recent.length - 1 && (
                <Divider variant="inset" component="li" />
              )}
            </React.Fragment>
          ))}
        </List>
      ) : (
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            No recent invoices found
          </Typography>
          <Button
            variant="outlined"
            size="small"
            sx={{ mt: 2 }}
            onClick={() => navigate('/invoices?action=new')}
          >
            Create New Invoice
          </Button>
        </Box>
      )}
    </Paper>
  );
};

export default InvoiceWidget;