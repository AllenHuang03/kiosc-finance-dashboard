// src/components/dashboard/IncomeExpenseChart.js
import React, { useState, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid
} from '@mui/material';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const IncomeExpenseChart = ({ data = [] }) => {
  const [timeFrame, setTimeFrame] = useState('monthly');
  const [chartType, setChartType] = useState('bar');
  
  // Process data for the chart based on timeframe
  const chartData = useMemo(() => {
    if (!data.length) return [];
    
    // Group transactions by month/quarter/year
    const groupedData = {};
    
    data.forEach(transaction => {
      const date = new Date(transaction.date);
      let period;
      
      if (timeFrame === 'monthly') {
        // Format: 'MMM YYYY'
        period = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      } else if (timeFrame === 'quarterly') {
        // Format: 'Q1 2023', 'Q2 2023', etc.
        const quarter = Math.floor(date.getMonth() / 3) + 1;
        period = `Q${quarter} ${date.getFullYear()}`;
      } else {
        // Yearly - Format: '2023'
        period = date.getFullYear().toString();
      }
      
      if (!groupedData[period]) {
        groupedData[period] = { income: 0, expenses: 0 };
      }
      
      if (transaction.type === 'Income') {
        groupedData[period].income += transaction.amount || 0;
      } else if (transaction.type === 'Expense') {
        groupedData[period].expenses += Math.abs(transaction.amount || 0);
      }
    });
    
    // Convert to array for chart
    let result = Object.entries(groupedData).map(([period, values]) => ({
      period,
      income: values.income,
      expenses: values.expenses,
      net: values.income - values.expenses
    }));
    
    // Sort by period
    result.sort((a, b) => {
      if (timeFrame === 'monthly') {
        const [monthA, yearA] = a.period.split(' ');
        const [monthB, yearB] = b.period.split(' ');
        
        if (yearA !== yearB) return parseInt(yearA) - parseInt(yearB);
        
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return months.indexOf(monthA) - months.indexOf(monthB);
      } else if (timeFrame === 'quarterly') {
        const [quarterA, yearA] = a.period.split(' ');
        const [quarterB, yearB] = b.period.split(' ');
        
        if (yearA !== yearB) return parseInt(yearA) - parseInt(yearB);
        return parseInt(quarterA.substring(1)) - parseInt(quarterB.substring(1));
      } else {
        return parseInt(a.period) - parseInt(b.period);
      }
    });
    
    return result;
  }, [data, timeFrame]);
  
  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' }).format(value);
  };
  
  // Handle time frame change
  const handleTimeFrameChange = (event) => {
    setTimeFrame(event.target.value);
  };
  
  // Handle chart type change
  const handleChartTypeChange = (event) => {
    setChartType(event.target.value);
  };
  
  return (
    <Paper sx={{ p: 2, height: '100%' }}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Income vs Expenses</Typography>
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Time Frame</InputLabel>
                <Select
                  value={timeFrame}
                  label="Time Frame"
                  onChange={handleTimeFrameChange}
                >
                  <MenuItem value="monthly">Monthly</MenuItem>
                  <MenuItem value="quarterly">Quarterly</MenuItem>
                  <MenuItem value="yearly">Yearly</MenuItem>
                </Select>
              </FormControl>
              
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Chart Type</InputLabel>
                <Select
                  value={chartType}
                  label="Chart Type"
                  onChange={handleChartTypeChange}
                >
                  <MenuItem value="bar">Bar Chart</MenuItem>
                  <MenuItem value="line">Line Chart</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>
        </Grid>
        
        <Grid item xs={12}>
          <Box sx={{ height: 300, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'bar' ? (
                <BarChart
                  data={chartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Legend />
                  <Bar dataKey="income" name="Income" fill="#4caf50" />
                  <Bar dataKey="expenses" name="Expenses" fill="#f44336" />
                </BarChart>
              ) : (
                <LineChart
                  data={chartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Legend />
                  <Line type="monotone" dataKey="income" name="Income" stroke="#4caf50" strokeWidth={2} />
                  <Line type="monotone" dataKey="expenses" name="Expenses" stroke="#f44336" strokeWidth={2} />
                  <Line type="monotone" dataKey="net" name="Net" stroke="#2196f3" strokeWidth={2} />
                </LineChart>
              )}
            </ResponsiveContainer>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default IncomeExpenseChart;