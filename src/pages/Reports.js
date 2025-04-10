// src/pages/Reports.js
import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Tabs,
  Tab,
  Card,
  CardContent,
  IconButton,
  Chip,
} from '@mui/material';
import {
  Download as DownloadIcon,
  Print as PrintIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
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

// TabPanel component for different report tabs
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`report-tabpanel-${index}`}
      aria-labelledby={`report-tab-${index}`}
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

const Reports = () => {
  const { loading, error, data } = useData();
  
  // State for report filters and tabs
  const [tabValue, setTabValue] = useState(0);
  const [month, setMonth] = useState('All');
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [program, setProgram] = useState('All');
  const [category, setCategory] = useState('All');
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Generate mock monthly summary data
  const generateMonthlySummaryData = () => {
    if (!data) return [];
    
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    return months.map((month, index) => {
      // Generate some sample data based on the mock transactions
      let income = 0;
      let expenses = 0;
      
      if (data.Transaction_Entry) {
        data.Transaction_Entry.forEach(transaction => {
          const transDate = new Date(transaction.date);
          if (transDate.getMonth() === index) {
            if (transaction.type === 'Income') {
              income += transaction.amount;
            } else if (transaction.type === 'Expense') {
              expenses += Math.abs(transaction.amount);
            }
          }
        });
      }
      
      return {
        month,
        income: income || 5000 + Math.random() * 30000,
        expenses: expenses || 3000 + Math.random() * 25000,
        net: income - expenses || 1000 + Math.random() * 5000
      };
    });
  };
  
  // Generate mock category expenses data
  const generateCategoryExpensesData = () => {
    if (!data || !data.Transaction_Entry) return [];
    
    const categoryExpenses = {};
    const categories = ['GL', 'VCES', 'GDC', 'Commercial', 'Operations'];
    
    // Initialize categories
    categories.forEach(cat => {
      categoryExpenses[cat] = 0;
    });
    
    // Sum expenses by category
    data.Transaction_Entry.forEach(transaction => {
      if (transaction.type === 'Expense' && categories.includes(transaction.accountCategory)) {
        categoryExpenses[transaction.accountCategory] += Math.abs(transaction.amount);
      }
    });
    
    // Convert to array format for chart
    return Object.entries(categoryExpenses).map(([category, amount]) => ({
      category,
      amount
    }));
  };
  
  // Generate mock program budget utilization data
  const generateProgramBudgetData = () => {
    if (!data || !data.Budget_Tracking) return [];
    
    // Return top 5 programs by budget utilization
    return data.Budget_Tracking
      .sort((a, b) => (b.percentUsed || 0) - (a.percentUsed || 0))
      .slice(0, 5)
      .map(program => ({
        program: program.program.length > 20 ? program.program.substring(0, 20) + '...' : program.program,
        used: ((program.percentUsed || 0) * 100).toFixed(1),
        available: (100 - (program.percentUsed || 0) * 100).toFixed(1)
      }));
  };
  
  // Handler for generating report
  const handleGenerateReport = () => {
    // In a real app, this would fetch updated data from the backend
    console.log('Generating report with filters:', { month, year, program, category });
  };
  
  // Handler for exporting report
  const handleExportReport = () => {
    // In a real app, this would generate a PDF or Excel file
    console.log('Exporting report...');
  };
  
  // Handler for printing report
  const handlePrintReport = () => {
    window.print();
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
  
  // Get monthly data for charts
  const monthlySummaryData = generateMonthlySummaryData();
  const categoryExpensesData = generateCategoryExpensesData();
  const programBudgetData = generateProgramBudgetData();
  
  // Get programs list for filter
  const programs = data?.Programs ? ['All', ...data.Programs.map(p => p.name)] : ['All'];
  
  // Get categories list for filter
  const categories = ['All', 'GL', 'VCES', 'GDC', 'Commercial', 'Operations'];
  
  // Available months for filter
  const months = ['All', 'January', 'February', 'March', 'April', 'May', 'June', 
                 'July', 'August', 'September', 'October', 'November', 'December'];
  
  // Available years for filter
  const years = ['2024', '2025', '2026'];
  
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Financial Reports
      </Typography>
      
      {/* Report Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel id="month-label">Month</InputLabel>
              <Select
                labelId="month-label"
                id="month-select"
                value={month}
                label="Month"
                onChange={(e) => setMonth(e.target.value)}
              >
                {months.map((m) => (
                  <MenuItem key={m} value={m}>{m}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel id="year-label">Year</InputLabel>
              <Select
                labelId="year-label"
                id="year-select"
                value={year}
                label="Year"
                onChange={(e) => setYear(e.target.value)}
              >
                {years.map((y) => (
                  <MenuItem key={y} value={y}>{y}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel id="program-label">Program</InputLabel>
              <Select
                labelId="program-label"
                id="program-select"
                value={program}
                label="Program"
                onChange={(e) => setProgram(e.target.value)}
              >
                {programs.map((p) => (
                  <MenuItem key={p} value={p}>{p}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel id="category-label">Category</InputLabel>
              <Select
                labelId="category-label"
                id="category-select"
                value={category}
                label="Category"
                onChange={(e) => setCategory(e.target.value)}
              >
                {categories.map((c) => (
                  <MenuItem key={c} value={c}>{c}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="contained"
                startIcon={<RefreshIcon />}
                onClick={handleGenerateReport}
                sx={{ flex: 1 }}
              >
                Generate
              </Button>
              
              <IconButton
                color="primary"
                onClick={handleExportReport}
                title="Export to Excel"
              >
                <DownloadIcon />
              </IconButton>
              
              <IconButton
                color="primary"
                onClick={handlePrintReport}
                title="Print Report"
              >
                <PrintIcon />
              </IconButton>
            </Box>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Report Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Monthly Summary" />
          <Tab label="Budget Utilization" />
          <Tab label="Category Analysis" />
          <Tab label="Invoice Status" />
        </Tabs>
        
        {/* Monthly Summary Tab */}
        <TabPanel value={tabValue} index={0}>
          <Typography variant="h5" gutterBottom>
            Monthly Financial Summary {month !== 'All' ? `- ${month} ${year}` : `- ${year}`}
          </Typography>
          
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {/* Monthly Income/Expense Trend Chart */}
            <Grid item xs={12}>
              <Paper sx={{ p: 2, height: 400 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={monthlySummaryData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => `${value.toLocaleString()}`} />
                    <Legend />
                    <Line type="monotone" dataKey="income" name="Income" stroke="#4CAF50" strokeWidth={2} />
                    <Line type="monotone" dataKey="expenses" name="Expenses" stroke="#F44336" strokeWidth={2} />
                    <Line type="monotone" dataKey="net" name="Net" stroke="#2196F3" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
            
            {/* Monthly Summary Table */}
            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Box sx={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr>
                        <th style={{ textAlign: 'left', padding: '12px 8px', borderBottom: '2px solid #ddd' }}>Month</th>
                        <th style={{ textAlign: 'right', padding: '12px 8px', borderBottom: '2px solid #ddd' }}>Income</th>
                        <th style={{ textAlign: 'right', padding: '12px 8px', borderBottom: '2px solid #ddd' }}>Expenses</th>
                        <th style={{ textAlign: 'right', padding: '12px 8px', borderBottom: '2px solid #ddd' }}>Net</th>
                        <th style={{ textAlign: 'right', padding: '12px 8px', borderBottom: '2px solid #ddd' }}>YTD Income</th>
                        <th style={{ textAlign: 'right', padding: '12px 8px', borderBottom: '2px solid #ddd' }}>YTD Expenses</th>
                        <th style={{ textAlign: 'right', padding: '12px 8px', borderBottom: '2px solid #ddd' }}>YTD Net</th>
                      </tr>
                    </thead>
                    <tbody>
                      {monthlySummaryData.map((item, index) => {
                        // Calculate YTD values
                        const ytdIncome = monthlySummaryData
                          .slice(0, index + 1)
                          .reduce((sum, m) => sum + (m.income || 0), 0);
                        
                        const ytdExpenses = monthlySummaryData
                          .slice(0, index + 1)
                          .reduce((sum, m) => sum + (m.expenses || 0), 0);
                        
                        const ytdNet = ytdIncome - ytdExpenses;
                        
                        return (
                          <tr key={item.month}>
                            <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>{item.month}</td>
                            <td style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid #ddd' }}>${(item.income || 0).toLocaleString()}</td>
                            <td style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid #ddd' }}>${(item.expenses || 0).toLocaleString()}</td>
                            <td style={{ 
                              textAlign: 'right', 
                              padding: '8px', 
                              borderBottom: '1px solid #ddd',
                              color: (item.net || 0) >= 0 ? 'green' : 'red'
                            }}>${Math.abs(item.net || 0).toLocaleString()}{(item.net || 0) < 0 ? ' (-)' : ''}</td>
                            <td style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid #ddd' }}>${ytdIncome.toLocaleString()}</td>
                            <td style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid #ddd' }}>${ytdExpenses.toLocaleString()}</td>
                            <td style={{ 
                              textAlign: 'right', 
                              padding: '8px', 
                              borderBottom: '1px solid #ddd',
                              color: ytdNet >= 0 ? 'green' : 'red'
                            }}>${Math.abs(ytdNet).toLocaleString()}{ytdNet < 0 ? ' (-)' : ''}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>
        
        {/* Budget Utilization Tab */}
        <TabPanel value={tabValue} index={1}>
          <Typography variant="h5" gutterBottom>
            Program Budget Utilization {program !== 'All' ? `- ${program}` : '- All Programs'}
          </Typography>
          
          <Grid container spacing={3}>
            {/* Budget Utilization Chart */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, height: 400 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={programBudgetData}
                    layout="vertical"
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                    <YAxis type="category" dataKey="program" width={150} />
                    <Tooltip formatter={(value) => `${value}%`} />
                    <Legend />
                    <Bar dataKey="used" name="Used" stackId="a" fill="#FF8042" />
                    <Bar dataKey="available" name="Available" stackId="a" fill="#82CA9D" />
                  </BarChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
            
            {/* Budget Status Table */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, height: 400, overflowY: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'left', padding: '8px', borderBottom: '2px solid #ddd' }}>Program</th>
                      <th style={{ textAlign: 'right', padding: '8px', borderBottom: '2px solid #ddd' }}>Budget</th>
                      <th style={{ textAlign: 'right', padding: '8px', borderBottom: '2px solid #ddd' }}>Used</th>
                      <th style={{ textAlign: 'right', padding: '8px', borderBottom: '2px solid #ddd' }}>Available</th>
                      <th style={{ textAlign: 'center', padding: '8px', borderBottom: '2px solid #ddd' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.Budget_Tracking && data.Budget_Tracking.map((item) => (
                      <tr key={item.program}>
                        <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>{item.program}</td>
                        <td style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid #ddd' }}>${(item.totalBudget || 0).toLocaleString()}</td>
                        <td style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid #ddd' }}>${((item.ytdExpenses || 0) + (item.committedExpenses || 0)).toLocaleString()}</td>
                        <td style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid #ddd' }}>${(item.availableBudget || 0).toLocaleString()}</td>
                        <td style={{ 
                          textAlign: 'center', 
                          padding: '8px', 
                          borderBottom: '1px solid #ddd',
                        }}>
                          <Chip 
                            label={item.status || 'Unknown'} 
                            size="small"
                            sx={{ 
                              bgcolor: item.status === 'On Track' ? '#4CAF50' : 
                                      item.status === 'Caution' ? '#FFC107' : '#F44336',
                              color: 'white'
                            }} 
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>
        
        {/* Category Analysis Tab */}
        <TabPanel value={tabValue} index={2}>
          <Typography variant="h5" gutterBottom>
            Expense by Category {category !== 'All' ? `- ${category}` : '- All Categories'}
          </Typography>
          
          <Grid container spacing={3}>
            {/* Category Pie Chart */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, height: 400 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryExpensesData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      outerRadius={150}
                      fill="#8884d8"
                      dataKey="amount"
                      nameKey="category"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {categoryExpensesData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value.toLocaleString()}`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
            
            {/* Category Table */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, height: 400 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'left', padding: '8px', borderBottom: '2px solid #ddd' }}>Category</th>
                      <th style={{ textAlign: 'right', padding: '8px', borderBottom: '2px solid #ddd' }}>Total Expenses</th>
                      <th style={{ textAlign: 'right', padding: '8px', borderBottom: '2px solid #ddd' }}>% of Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categoryExpensesData.map((item) => {
                      const totalExpenses = categoryExpensesData.reduce((sum, cat) => sum + (cat.amount || 0), 0);
                      const percentage = totalExpenses > 0 ? ((item.amount || 0) / totalExpenses * 100).toFixed(1) : '0.0';
                      
                      return (
                        <tr key={item.category}>
                          <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>{item.category}</td>
                          <td style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid #ddd' }}>${(item.amount || 0).toLocaleString()}</td>
                          <td style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid #ddd' }}>{percentage}%</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>
        
        {/* Invoice Status Tab */}
        <TabPanel value={tabValue} index={3}>
          <Typography variant="h5" gutterBottom>
            Invoice Status Summary
          </Typography>
          
          <Grid container spacing={3}>
            {/* Invoice Status Summary */}
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Paid Invoices
                  </Typography>
                  <Typography variant="h4" component="div" color="success.main">
                    $120,000
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    45 invoices
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Outstanding Invoices
                  </Typography>
                  <Typography variant="h4" component="div" color="warning.main">
                    $45,000
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    15 invoices
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Overdue Invoices
                  </Typography>
                  <Typography variant="h4" component="div" color="error.main">
                    $15,000
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    5 invoices
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            {/* Invoice Status Pie Chart */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, height: 400 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Paid', value: 120000 },
                        { name: 'Outstanding', value: 45000 },
                        { name: 'Overdue', value: 15000 }
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      outerRadius={150}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      <Cell fill="#4CAF50" />
                      <Cell fill="#FFC107" />
                      <Cell fill="#F44336" />
                    </Pie>
                    <Tooltip formatter={(value) => `${value.toLocaleString()}`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
            
            {/* Invoice Aging Chart */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, height: 400 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      { age: '0-30 Days', value: 45000 },
                      { age: '31-60 Days', value: 30000 },
                      { age: '61-90 Days', value: 10000 },
                      { age: '91+ Days', value: 5000 }
                    ]}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="age" />
                    <YAxis />
                    <Tooltip formatter={(value) => `${value.toLocaleString()}`} />
                    <Bar dataKey="value" name="Amount" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default Reports;