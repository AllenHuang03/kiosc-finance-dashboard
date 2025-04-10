// src/pages/ProgramDetail.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Divider,
  LinearProgress,
  CircularProgress,
  Chip,
  Card,
  CardContent,
  IconButton,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  AttachMoney as MoneyIcon,
  CalendarToday as CalendarIcon,
  Category as CategoryIcon,
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

// Colors for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const ProgramDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { loading, error, data } = useData();
  
  // State for program data
  const [program, setProgram] = useState(null);
  const [budgetTracking, setBudgetTracking] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [budgetBreakdownData, setBudgetBreakdownData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  
  // UI state
  const [usedPercentage, setUsedPercentage] = useState(0);
  const [statusColor, setStatusColor] = useState('#4CAF50'); // Default green
  
  // Load program data when data changes
  useEffect(() => {
    if (!data || !data.Programs) return;
    
    const programData = data.Programs.find(p => p.id === parseInt(id));
    setProgram(programData);
    
    if (programData) {
      // Load budget tracking
      if (data.Budget_Tracking) {
        const budgetData = data.Budget_Tracking.find(bt => bt.program === programData.name);
        setBudgetTracking(budgetData);
        
        if (budgetData) {
          // Calculate used percentage
          const percentage = Math.min(100, ((budgetData.percentUsed || 0) * 100));
          setUsedPercentage(percentage);
          
          // Set status color
          if (budgetData.status === 'Caution') {
            setStatusColor('#FFC107'); // Yellow
          } else if (budgetData.status === 'At Risk') {
            setStatusColor('#F44336'); // Red
          } else {
            setStatusColor('#4CAF50'); // Green
          }
          
          // Create budget breakdown data for pie chart
          setBudgetBreakdownData([
            { name: 'YTD Expenses', value: budgetData.ytdExpenses || 0 },
            { name: 'Committed', value: budgetData.committedExpenses || 0 },
            { name: 'Available', value: budgetData.availableBudget || 0 }
          ]);
        }
      }
      
      // Load transactions
      if (data.Transaction_Entry) {
        const programTransactions = data.Transaction_Entry.filter(t => 
          t.program === programData.name
        );
        setTransactions(programTransactions);
        
        // Create monthly data
        const monthlyGroups = {};
        
        programTransactions.forEach(transaction => {
          const date = new Date(transaction.date);
          const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          
          if (!monthlyGroups[monthYear]) {
            monthlyGroups[monthYear] = {
              month: new Date(date.getFullYear(), date.getMonth(), 1)
                .toLocaleDateString('default', { month: 'short', year: 'numeric' }),
              income: 0,
              expenses: 0
            };
          }
          
          if (transaction.type === 'Income') {
            monthlyGroups[monthYear].income += Math.abs(transaction.amount || 0);
          } else if (transaction.type === 'Expense') {
            monthlyGroups[monthYear].expenses += Math.abs(transaction.amount || 0);
          }
        });
        
        // Convert to array and sort by month
        const sortedMonthlyData = Object.values(monthlyGroups).sort((a, b) => {
          return new Date(a.month) - new Date(b.month);
        });
        
        setMonthlyData(sortedMonthlyData);
      }
    }
  }, [data, id]);
  
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
  
  if (!program) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h5">
          Program not found
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<ArrowBackIcon />} 
          onClick={() => navigate('/programs')}
          sx={{ mt: 2 }}
        >
          Back to Programs
        </Button>
      </Box>
    );
  }
  
  return (
    <Box sx={{ p: 3 }}>
      {/* Header with back button */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton 
          onClick={() => navigate('/programs')}
          sx={{ mr: 2 }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4">
          {program.name}
        </Typography>
      </Box>

      {/* Program details and budget status */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Program Details
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <CategoryIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="body1">
                  Category: {program.category || 'N/A'}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <MoneyIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="body1">
                  Budget: ${(program.budget || 0).toLocaleString()}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <CalendarIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="body1">
                  Duration: {program.startDate ? new Date(program.startDate).toLocaleDateString() : 'N/A'} to {program.endDate ? new Date(program.endDate).toLocaleDateString() : 'N/A'}
                </Typography>
              </Box>

              <Box sx={{ mt: 3 }}>
                <Typography variant="body1" gutterBottom>
                  Status: 
                  <Chip 
                    label={budgetTracking?.status || 'Unknown'} 
                    size="small"
                    sx={{ 
                      ml: 1,
                      bgcolor: statusColor,
                      color: 'white'
                    }} 
                  />
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Budget Status
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={6} md={3}>
                  <Typography variant="body2" color="text.secondary">Total Budget</Typography>
                  <Typography variant="h6">${(program.budget || 0).toLocaleString()}</Typography>
                </Grid>
                
                <Grid item xs={6} md={3}>
                  <Typography variant="body2" color="text.secondary">YTD Income</Typography>
                  <Typography variant="h6">${(budgetTracking?.ytdIncome || 0).toLocaleString()}</Typography>
                </Grid>
                
                <Grid item xs={6} md={3}>
                  <Typography variant="body2" color="text.secondary">YTD Expenses</Typography>
                  <Typography variant="h6">${(budgetTracking?.ytdExpenses || 0).toLocaleString()}</Typography>
                </Grid>
                
                <Grid item xs={6} md={3}>
                  <Typography variant="body2" color="text.secondary">Available</Typography>
                  <Typography variant="h6" sx={{ color: statusColor }}>${(budgetTracking?.availableBudget || 0).toLocaleString()}</Typography>
                </Grid>
              </Grid>
              
              <Box sx={{ mt: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">
                    Budget Utilization
                  </Typography>
                  <Typography variant="body2" sx={{ color: statusColor }}>
                    {usedPercentage.toFixed(1)}%
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={usedPercentage} 
                  sx={{ 
                    height: 8, 
                    borderRadius: 5,
                    backgroundColor: '#e0e0e0',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: statusColor
                    }
                  }} 
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Budget Breakdown and Monthly Charts */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Budget Breakdown
            </Typography>
            <ResponsiveContainer width="100%" height="90%">
              <PieChart>
                <Pie
                  data={budgetBreakdownData}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {budgetBreakdownData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
              Income vs Expenses by Month
            </Typography>
            <ResponsiveContainer width="100%" height="90%">
              <BarChart
                data={monthlyData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                <Legend />
                <Bar dataKey="income" name="Income" fill="#82ca9d" />
                <Bar dataKey="expenses" name="Expenses" fill="#ff8042" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Recent Transactions */}
      <Typography variant="h5" gutterBottom>
        Recent Transactions
      </Typography>
      <Paper sx={{ p: 2 }}>
        <Box sx={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #ddd' }}>Date</th>
                <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #ddd' }}>Type</th>
                <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #ddd' }}>Category</th>
                <th style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid #ddd' }}>Amount</th>
                <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #ddd' }}>Status</th>
                <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #ddd' }}>Reference</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length > 0 ? (
                transactions.map((transaction, index) => (
                  <tr key={index}>
                    <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>{transaction.date}</td>
                    <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>{transaction.type}</td>
                    <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>{transaction.accountCategory}</td>
                    <td style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid #ddd', color: transaction.type === 'Income' ? 'green' : 'red' }}>
                      ${Math.abs(transaction.amount || 0).toLocaleString()}
                    </td>
                    <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>{transaction.status}</td>
                    <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>{transaction.reference || '-'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '16px' }}>
                    No transactions found for this program
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Box>
      </Paper>
    </Box>
  );
};

export default ProgramDetail;