// src/components/dashboard/RecentTransactions.js
import React, { useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Chip,
  List,
  ListItem,
  ListItemText,
  Divider,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  ArrowForward as ArrowForwardIcon,
  Add as AddIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Info as InfoIcon
} from '@mui/icons-material';

const RecentTransactions = ({ transactions = [], onViewAll, onAddNew }) => {
  // Get most recent transactions
  const recentTransactions = useMemo(() => {
    if (!transactions.length) return [];
    
    return [...transactions]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5); // Get 5 most recent
  }, [transactions]);
  
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' }).format(amount);
  };
  
  // Get type icon
  const getTypeIcon = (type) => {
    if (type === 'Income') {
      return <TrendingUpIcon color="success" />;
    } else if (type === 'Expense') {
      return <TrendingDownIcon color="error" />;
    }
    return null;
  };
  
  return (
    <Paper sx={{ p: 2, height: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          Recent Transactions
        </Typography>
        
        <Box>
          <Button
            size="small"
            startIcon={<AddIcon />}
            onClick={onAddNew}
            sx={{ mr: 1 }}
          >
            Add New
          </Button>
          <Button
            size="small"
            endIcon={<ArrowForwardIcon />}
            onClick={onViewAll}
          >
            View All
          </Button>
        </Box>
      </Box>
      
      {recentTransactions.length > 0 ? (
        <List>
          {recentTransactions.map((transaction, index) => (
            <React.Fragment key={transaction.id || index}>
              <ListItem
                sx={{ py: 1.5 }}
                secondaryAction={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 'medium',
                        color: transaction.type === 'Income' ? 'success.main' : 'error.main',
                        mr: 1
                      }}
                    >
                      {transaction.type === 'Income' ? '+' : '-'}
                      {formatCurrency(Math.abs(transaction.amount || 0))}
                    </Typography>
                    
                    <Tooltip title="View Details">
                      <IconButton edge="end" aria-label="info" size="small">
                        <InfoIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                }
              >
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {getTypeIcon(transaction.type)}
                      <Typography variant="body1" sx={{ ml: 1 }}>
                        {transaction.description || transaction.reference || 'Transaction'}
                      </Typography>
                    </Box>
                  }
                  secondary={
                    <Box sx={{ display: 'flex', mt: 0.5 }}>
                      <Typography variant="body2" color="text.secondary">
                        {transaction.date} • {transaction.program}
                      </Typography>
                      
                      {transaction.status && (
                        <Chip
                          label={transaction.status}
                          size="small"
                          sx={{
                            ml: 1,
                            height: 18,
                            fontSize: '0.7rem',
                            '& .MuiChip-label': { px: 1 }
                          }}
                        />
                      )}
                    </Box>
                  }
                />
              </ListItem>
              {index < recentTransactions.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      ) : (
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            No recent transactions
          </Typography>
          <Button
            variant="outlined"
            size="small"
            startIcon={<AddIcon />}
            sx={{ mt: 2 }}
            onClick={onAddNew}
          >
            Add Transaction
          </Button>
        </Box>
      )}
    </Paper>
  );
};

export default RecentTransactions;