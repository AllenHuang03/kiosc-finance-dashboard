// src/pages/Dashboard.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { useSettings } from '../contexts/SettingsContext';
import { useAuth } from '../contexts/AuthContext';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  CircularProgress,
  Divider,
  Card,
  CardContent,
  CardActions,
  Chip,
  IconButton,
  Tab,
  Tabs
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AccountBalance as AccountBalanceIcon,
  CalendarToday as CalendarIcon,
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Insights as InsightsIcon,
  Refresh as RefreshIcon,
  Sync as SyncIcon
} from '@mui/icons-material';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import IncomeExpenseChart from '../components/dashboard/IncomeExpenseChart';
import FinancialOverview from '../components/dashboard/FinancialOverview';
import BudgetSummary from '../components/dashboard/BudgetSummary';
import RecentTransactions from '../components/dashboard/RecentTransactions';
import ProgramPerformance from '../components/dashboard/ProgramPerformance';
import CalendarWidget from '../components/dashboard/CalendarWidget';
import InvoiceWidget from '../components/dashboard/InvoiceWidget'; // Import the new widget

// Placeholder for quick summary cards
const QuickSummary = ({ data }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' }).format(amount);
  };
  
  return (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6} md={3}>
        <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140, position: 'relative', overflow: 'hidden' }}>
          <Typography variant="subtitle2" color="textSecondary" gutterBottom>
            Total Income
          </Typography>
          <Typography variant="h4" component="div" sx={{ mb: 1 }}>
            {formatCurrency(data.totalIncome)}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Year to date
          </Typography>
          
          <Box sx={{ position: 'absolute', bottom: -15, right: -15, transform: 'rotate(-20deg)' }}>
            <TrendingUpIcon sx={{ fontSize: 80, color: 'success.light', opacity: 0.2 }} />
          </Box>
        </Paper>
      </Grid>
      
      <Grid item xs={12} sm={6} md={3}>
        <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140, position: 'relative', overflow: 'hidden' }}>
          <Typography variant="subtitle2" color="textSecondary" gutterBottom>
            Total Expenses
          </Typography>
          <Typography variant="h4" component="div" sx={{ mb: 1 }}>
            {formatCurrency(data.totalExpenses)}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Year to date
          </Typography>
          
          <Box sx={{ position: 'absolute', bottom: -15, right: -15, transform: 'rotate(-20deg)' }}>
            <TrendingDownIcon sx={{ fontSize: 80, color: 'error.light', opacity: 0.2 }} />
          </Box>
        </Paper>
      </Grid>
      
      <Grid item xs={12} sm={6} md={3}>
        <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140, position: 'relative', overflow: 'hidden' }}>
          <Typography variant="subtitle2" color="textSecondary" gutterBottom>
            Net Balance
          </Typography>
          <Typography 
            variant="h4" 
            component="div" 
            sx={{ mb: 1, color: data.netBalance >= 0 ? 'success.main' : 'error.main' }}
          >
            {formatCurrency(data.netBalance)}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Available funds
          </Typography>
          
          <Box sx={{ position: 'absolute', bottom: -15, right: -15, transform: 'rotate(-20deg)' }}>
            <AccountBalanceIcon sx={{ fontSize: 80, color: 'primary.light', opacity: 0.2 }} />
          </Box>
        </Paper>
      </Grid>
      
      <Grid item xs={12} sm={6} md={3}>
        <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140, position: 'relative', overflow: 'hidden' }}>
          <Typography variant="subtitle2" color="textSecondary" gutterBottom>
            Upcoming Expenses
          </Typography>
          <Typography variant="h4" component="div" sx={{ mb: 1 }}>
            {formatCurrency(data.upcomingExpenses)}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Next 30 days
          </Typography>
          
          <Box sx={{ position: 'absolute', bottom: -15, right: -15, transform: 'rotate(-20deg)' }}>
            <CalendarIcon sx={{ fontSize: 80, color: 'warning.light', opacity: 0.2 }} />
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );
};

const Dashboard = () => {
  const { data, loading, error } = useData();
  const { settings } = useSettings();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [summaryData, setSummaryData] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    netBalance: 0,
    upcomingExpenses: 0
  });
  
  // Extract financial data from the transactions
  useEffect(() => {
    if (data?.Transaction_Entry) {
      const transactions = data.Transaction_Entry;
      
      // Calculate total income and expenses
      const income = transactions
        .filter(t => t.type === 'Income')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const expenses = transactions
        .filter(t => t.type === 'Expense')
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);
      
      // Calculate upcoming expenses (next 30 days)
      const today = new Date();
      const thirtyDaysLater = new Date();
      thirtyDaysLater.setDate(today.getDate() + 30);
      
      const upcoming = transactions
        .filter(t => {
          const transactionDate = new Date(t.date);
          return (
            t.type === 'Expense' && 
            transactionDate >= today && 
            transactionDate <= thirtyDaysLater
          );
        })
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);
      
      setSummaryData({
        totalIncome: income,
        totalExpenses: expenses,
        netBalance: income - expenses,
        upcomingExpenses: upcoming
      });
    }
  }, [data]);
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          Dashboard
        </Typography>
        
        <Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/transactions?action=new')}
            sx={{ mr: 1 }}
          >
            New Transaction
          </Button>
          <IconButton>
            <RefreshIcon />
          </IconButton>
        </Box>
      </Box>
      
      <Grid container spacing={3}>
        {/* Quick Summary */}
        <Grid item xs={12}>
          <QuickSummary data={summaryData} />
        </Grid>
        
        {/* Charts */}
        <Grid item xs={12} md={8}>
          <IncomeExpenseChart data={data?.Transaction_Entry || []} />
        </Grid>
        
        {/* Financial Overview */}
        <Grid item xs={12} md={4}>
          <FinancialOverview data={data?.Transaction_Entry || []} />
        </Grid>
        
        {/* Recent Transactions */}
        <Grid item xs={12} md={6}>
          <RecentTransactions 
            transactions={data?.Transaction_Entry || []} 
            onViewAll={() => navigate('/transactions')}
            onAddNew={() => navigate('/transactions?action=new')}
          />
        </Grid>
        
        {/* Invoice Widget - new addition */}
        <Grid item xs={12} md={6}>
          <InvoiceWidget />
        </Grid>
        
        {/* Budget Summary */}
        <Grid item xs={12} md={6}>
          <BudgetSummary 
            budgetData={data?.Budget || []} 
            transactions={data?.Transaction_Entry || []}
          />
        </Grid>
        
        {/* Programs Performance */}
        <Grid item xs={12} md={6}>
          <ProgramPerformance 
            programs={data?.Programs || []} 
            transactions={data?.Transaction_Entry || []}
          />
        </Grid>
        
        {/* Calendar Widget */}
        <Grid item xs={12}>
          <CalendarWidget 
            transactions={data?.Transaction_Entry || []}
            onDateClick={(date) => navigate(`/transactions?date=${date}`)}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;