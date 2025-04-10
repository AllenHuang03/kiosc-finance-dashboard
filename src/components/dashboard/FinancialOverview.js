// src/components/dashboard/FinancialOverview.js
import React, { useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
  Grid,
  CircularProgress
} from '@mui/material';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts';

// Colors for pie chart
const COLORS = ['#4caf50', '#f44336', '#2196f3', '#ff9800', '#9c27b0', '#00bcd4'];

const FinancialOverview = ({ data = [] }) => {
  // Calculate financial summary
  const summary = useMemo(() => {
    if (!data.length) {
      return {
        totalIncome: 0,
        totalExpenses: 0,
        netPosition: 0,
        categories: []
      };
    }
    
    // Calculate totals
    const totalIncome = data
      .filter(t => t.type === 'Income')
      .reduce((sum, t) => sum + (t.amount || 0), 0);
    
    const totalExpenses = data
      .filter(t => t.type === 'Expense')
      .reduce((sum, t) => sum + Math.abs(t.amount || 0), 0);
    
    const netPosition = totalIncome - totalExpenses;
    
    // Group expenses by category
    const categories = {};
    
    data.filter(t => t.type === 'Expense').forEach(transaction => {
      const category = transaction.accountCategory || 'Uncategorized';
      if (!categories[category]) {
        categories[category] = 0;
      }
      categories[category] += Math.abs(transaction.amount || 0);
    });
    
    // Convert to array and sort by amount
    const categoryArray = Object.entries(categories).map(([name, value]) => ({
      name,
      value
    })).sort((a, b) => b.value - a.value);
    
    return {
      totalIncome,
      totalExpenses,
      netPosition,
      categories: categoryArray
    };
  }, [data]);
  
  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' }).format(value);
  };
  
  return (
    <Paper sx={{ p: 2, height: '100%' }}>
      <Typography variant="h6" gutterBottom>
        Financial Overview
      </Typography>
      
      {data.length === 0 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <List dense>
              <ListItem>
                <ListItemText 
                  primary="Total Income" 
                  primaryTypographyProps={{ fontWeight: 'medium' }}
                />
                <Typography variant="body1" color="success.main">
                  {formatCurrency(summary.totalIncome)}
                </Typography>
              </ListItem>
              
              <ListItem>
                <ListItemText 
                  primary="Total Expenses" 
                  primaryTypographyProps={{ fontWeight: 'medium' }}
                />
                <Typography variant="body1" color="error.main">
                  {formatCurrency(summary.totalExpenses)}
                </Typography>
              </ListItem>
              
              <Divider sx={{ my: 1 }} />
              
              <ListItem>
                <ListItemText 
                  primary="Net Position" 
                  primaryTypographyProps={{ fontWeight: 'bold' }}
                />
                <Typography 
                  variant="body1" 
                  fontWeight="bold"
                  color={summary.netPosition >= 0 ? 'success.main' : 'error.main'}
                >
                  {formatCurrency(summary.netPosition)}
                </Typography>
              </ListItem>
            </List>
          </Grid>
          
          <Grid item xs={12}>
            <Divider sx={{ my: 1 }} />
            <Typography variant="subtitle1" gutterBottom>
              Expense Breakdown
            </Typography>
            
            <Box sx={{ height: 250, width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={summary.categories}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => 
                      percent > 0.05 ? `${name}: ${(percent * 100).toFixed(0)}%` : ''}
                  >
                    {summary.categories.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Grid>
        </Grid>
      )}
    </Paper>
  );
};

export default FinancialOverview;