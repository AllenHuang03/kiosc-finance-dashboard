// src/components/dashboard/CalendarWidget.js (with DataContext)
import React, { useState, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Button,
  IconButton,
  Badge,
  Tooltip,
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
  Snackbar,
  Alert
} from '@mui/material';
import {
  CalendarToday as CalendarIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  AttachMoney as MoneyIcon,
  Payment as PaymentIcon,
  Add as AddIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { useData } from '../../contexts/DataContext';

// Helper to get the number of days in a month
const getDaysInMonth = (year, month) => {
  return new Date(year, month + 1, 0).getDate();
};

// Helper to get the day of week for the 1st of the month (0 = Sunday, 6 = Saturday)
const getFirstDayOfMonth = (year, month) => {
  return new Date(year, month, 1).getDay();
};

const CalendarWidget = ({ onDateClick }) => {
  // Get data from context
  const { data, addTransaction } = useData();
  const transactions = data?.Transaction_Entry || [];
  
  // Current date for reference
  const today = new Date();
  
  // Calendar state
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState(null);
  
  // Transaction dialog state
  const [openDialog, setOpenDialog] = useState(false);
  const [newTransaction, setNewTransaction] = useState({
    type: 'Expense',
    amount: 0,
    description: '',
    program: 'Technology Outreach Program',
    date: today.toISOString().split('T')[0]
  });
  
  // Transaction details state
  const [transactionDetailsOpen, setTransactionDetailsOpen] = useState(false);
  const [selectedDateTransactions, setSelectedDateTransactions] = useState([]);
  
  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  // Available programs
  const programs = useMemo(() => {
    if (data?.Programs) {
      return data.Programs.map(p => p.name);
    }
    return [
      'Technology Outreach Program',
      'STEM Curriculum Development',
      'School Partnership Initiative',
      'Innovation Workshop Series',
      'Digital Literacy Program'
    ];
  }, [data]);
  
  // Go to previous month with fixed year handling
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      // If January, go to December of previous year
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      // Otherwise just go to previous month
      setCurrentMonth(currentMonth - 1);
    }
  };
  
  // Go to next month with fixed year handling
  const handleNextMonth = () => {
    if (currentMonth === 11) {
      // If December, go to January of next year
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      // Otherwise just go to next month
      setCurrentMonth(currentMonth + 1);
    }
  };
  
  // Days of the week
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  // Month names
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  // Generate calendar days
  const calendarDays = useMemo(() => {
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDayOfMonth = getFirstDayOfMonth(currentYear, currentMonth);
    
    // Generate array for calendar grid (6 rows x 7 columns)
    const calendarArray = [];
    
    // Add empty cells for days before the 1st of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      calendarArray.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      calendarArray.push(day);
    }
    
    // Add empty cells to complete the grid
    const remainingCells = 42 - calendarArray.length; // 6 rows x 7 columns = 42
    for (let i = 0; i < remainingCells; i++) {
      calendarArray.push(null);
    }
    
    return calendarArray;
  }, [currentMonth, currentYear]);
  
  // Parse transactions for calendar
  const calendarTransactions = useMemo(() => {
    // Map days to transactions
    const transactionsByDay = {};
    
    transactions.forEach(transaction => {
      if (!transaction.date) return;
      
      const date = new Date(transaction.date);
      
      // Only show transactions from current month/year
      if (date.getMonth() === currentMonth && date.getFullYear() === currentYear) {
        const day = date.getDate();
        
        if (!transactionsByDay[day]) {
          transactionsByDay[day] = [];
        }
        
        transactionsByDay[day].push(transaction);
      }
    });
    
    return transactionsByDay;
  }, [transactions, currentMonth, currentYear]);
  
  // Handle date click
  const handleDateClick = (day) => {
    if (!day) return;
    
    const date = new Date(currentYear, currentMonth, day);
    setSelectedDate(date);
    
    // If there are transactions on this day, show them
    const formattedDate = date.toISOString().split('T')[0];
    const dateTransactions = transactions.filter(t => t.date === formattedDate);
    
    if (dateTransactions.length > 0) {
      setSelectedDateTransactions(dateTransactions);
      setTransactionDetailsOpen(true);
    } else {
      // Otherwise, open the add transaction dialog
      setNewTransaction({
        ...newTransaction,
        date: formattedDate
      });
      setOpenDialog(true);
    }
    
    // Also call the parent handler if provided
    if (onDateClick) {
      onDateClick(formattedDate);
    }
  };
  
  // Handle adding a new transaction
  const handleAddTransaction = () => {
    // Set date to today if not already set
    setNewTransaction({
      ...newTransaction,
      date: today.toISOString().split('T')[0]
    });
    setOpenDialog(true);
  };
  
  // Close dialogs
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setTransactionDetailsOpen(false);
  };
  
  // Close snackbar
  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };
  
  // Handle form field changes
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setNewTransaction(prev => ({
      ...prev,
      [name]: name === 'amount' ? parseFloat(value) || 0 : value
    }));
  };
  
  // Handle save transaction
  const handleSaveTransaction = () => {
    // Create transaction object
    const transaction = {
      ...newTransaction,
      amount: newTransaction.type === 'Expense' 
        ? -Math.abs(newTransaction.amount) 
        : Math.abs(newTransaction.amount),
      accountCategory: 'VCES', // Default category
      status: 'Completed', // Default status
      reference: `REF-${Date.now().toString().slice(-6)}` // Generate reference
    };
    
    // Add transaction using context
    const success = addTransaction(transaction);
    
    if (success) {
      // Show success message
      setSnackbar({
        open: true,
        message: 'Transaction added successfully',
        severity: 'success'
      });
      
      // Close dialog
      setOpenDialog(false);
      
      // Reset form
      setNewTransaction({
        type: 'Expense',
        amount: 0,
        description: '',
        program: programs[0] || 'Technology Outreach Program',
        date: today.toISOString().split('T')[0]
      });
    } else {
      // Show error message
      setSnackbar({
        open: true,
        message: 'Error adding transaction',
        severity: 'error'
      });
    }
  };
  
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' }).format(Math.abs(amount));
  };
  
  return (
    <Paper sx={{ p: 2, width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          <CalendarIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Financial Calendar
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton onClick={handlePrevMonth} size="small">
            <ChevronLeftIcon />
          </IconButton>
          
          <Typography variant="subtitle1" sx={{ mx: 2 }}>
            {monthNames[currentMonth]} {currentYear}
          </Typography>
          
          <IconButton onClick={handleNextMonth} size="small">
            <ChevronRightIcon />
          </IconButton>
          
          <Button 
            size="small" 
            sx={{ ml: 2 }}
            onClick={() => {
              setCurrentMonth(today.getMonth());
              setCurrentYear(today.getFullYear());
            }}
          >
            Today
          </Button>
        </Box>
      </Box>
      
      <Grid container spacing={1}>
        {/* Days of week headers */}
        {weekDays.map(day => (
          <Grid item xs={12/7} key={day}>
            <Box sx={{ 
              py: 1, 
              textAlign: 'center',
              fontWeight: 'bold',
              fontSize: '0.875rem'
            }}>
              {day}
            </Box>
          </Grid>
        ))}
        
        {/* Calendar days */}
        {calendarDays.map((day, index) => {
          // Determine if this day has transactions
          const hasTransactions = day && calendarTransactions[day] && calendarTransactions[day].length > 0;
          
          // Count transactions by type
          let incomeCount = 0;
          let expenseCount = 0;
          
          if (hasTransactions) {
            calendarTransactions[day].forEach(transaction => {
              if (transaction.type === 'Income') {
                incomeCount++;
              } else if (transaction.type === 'Expense') {
                expenseCount++;
              }
            });
          }
          
          // Check if this is today
          const isToday = day && 
            today.getDate() === day && 
            today.getMonth() === currentMonth && 
            today.getFullYear() === currentYear;
          
          return (
            <Grid item xs={12/7} key={index}>
              <Box 
                sx={{ 
                  height: 80,
                  border: '1px solid #eee',
                  borderRadius: 1,
                  p: 1,
                  position: 'relative',
                  bgcolor: isToday ? 'primary.light' : (day ? 'background.paper' : '#f9f9f9'),
                  cursor: day ? 'pointer' : 'default',
                  '&:hover': {
                    bgcolor: day ? 'action.hover' : '#f9f9f9'
                  }
                }}
                onClick={() => handleDateClick(day)}
              >
                {day && (
                  <>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontWeight: isToday ? 'bold' : 'regular',
                        color: isToday ? 'primary.contrastText' : 'text.primary'
                      }}
                    >
                      {day}
                    </Typography>
                    
                    {/* Transaction indicators */}
                    {hasTransactions ? (
                      <Box sx={{ position: 'absolute', bottom: 4, right: 4, display: 'flex' }}>
                        {incomeCount > 0 && (
                          <Tooltip title={`${incomeCount} income transaction(s)`}>
                            <Badge badgeContent={incomeCount} color="success" sx={{ mr: 1 }}>
                              <MoneyIcon color="success" fontSize="small" />
                            </Badge>
                          </Tooltip>
                        )}
                        
                        {expenseCount > 0 && (
                          <Tooltip title={`${expenseCount} expense transaction(s)`}>
                            <Badge badgeContent={expenseCount} color="error">
                              <PaymentIcon color="error" fontSize="small" />
                            </Badge>
                          </Tooltip>
                        )}
                      </Box>
                    ) : (
                      <Box sx={{ position: 'absolute', right: 4, bottom: 4, opacity: 0.5 }}>
                        <Tooltip title="Add transaction">
                          <AddIcon fontSize="small" />
                        </Tooltip>
                      </Box>
                    )}
                  </>
                )}
              </Box>
            </Grid>
          );
        })}
      </Grid>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
            <MoneyIcon color="success" fontSize="small" sx={{ mr: 0.5 }} />
            <Typography variant="body2">Income</Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <PaymentIcon color="error" fontSize="small" sx={{ mr: 0.5 }} />
            <Typography variant="body2">Expense</Typography>
          </Box>
        </Box>
        
        <Button
          size="small"
          startIcon={<AddIcon />}
          onClick={handleAddTransaction}
        >
          Add Transaction
        </Button>
      </Box>
      
      {/* Add Transaction Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Add Transaction
          <IconButton onClick={handleCloseDialog} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ p: 1 }}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Transaction Type</InputLabel>
              <Select
                name="type"
                value={newTransaction.type}
                onChange={handleFormChange}
                label="Transaction Type"
              >
                <MenuItem value="Income">Income</MenuItem>
                <MenuItem value="Expense">Expense</MenuItem>
              </Select>
            </FormControl>
            
            <TextField
              label="Amount"
              name="amount"
              type="number"
              value={newTransaction.amount}
              onChange={handleFormChange}
              fullWidth
              margin="normal"
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
              }}
            />
            
            <TextField
              label="Description"
              name="description"
              value={newTransaction.description}
              onChange={handleFormChange}
              fullWidth
              margin="normal"
            />
            
            <FormControl fullWidth margin="normal">
              <InputLabel>Program</InputLabel>
              <Select
                name="program"
                value={newTransaction.program}
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
              label="Date"
              name="date"
              type="date"
              value={newTransaction.date}
              onChange={handleFormChange}
              fullWidth
              margin="normal"
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleSaveTransaction}
            disabled={!newTransaction.description || newTransaction.amount <= 0}
          >
            Save Transaction
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Transaction Details Dialog */}
      <Dialog open={transactionDetailsOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Transactions for {selectedDate ? selectedDate.toLocaleDateString() : ''}
          <IconButton onClick={handleCloseDialog} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {selectedDateTransactions.length > 0 ? (
            <Box>
              {selectedDateTransactions.map((transaction, index) => (
                <Box 
                  key={index} 
                  sx={{ 
                    p: 2, 
                    borderBottom: index < selectedDateTransactions.length - 1 ? '1px solid #eee' : 'none'
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="subtitle1">
                      {transaction.description || 'Transaction'}
                    </Typography>
                    <Typography 
                      variant="subtitle1"
                      sx={{ color: transaction.type === 'Income' ? 'success.main' : 'error.main' }}
                    >
                      {transaction.type === 'Income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {transaction.program}
                  </Typography>
                </Box>
              ))}
              
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  startIcon={<AddIcon />}
                  onClick={() => {
                    setTransactionDetailsOpen(false);
                    setOpenDialog(true);
                  }}
                >
                  Add Another
                </Button>
              </Box>
            </Box>
          ) : (
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="body1">No transactions for this date.</Typography>
            </Box>
          )}
        </DialogContent>
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

export default CalendarWidget;