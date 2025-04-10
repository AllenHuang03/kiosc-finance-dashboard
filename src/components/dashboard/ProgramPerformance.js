// src/components/dashboard/ProgramPerformance.js
import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  LinearProgress
} from '@mui/material';
import {
  ArrowForward as ArrowForwardIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon
} from '@mui/icons-material';

const ProgramPerformance = ({ programs = [], transactions = [] }) => {
  const navigate = useNavigate();
  
  // Calculate program performance metrics
  const programMetrics = useMemo(() => {
    if (!programs.length || !transactions.length) return [];
    
    // Calculate income/expense for each program
    const metrics = programs.map(program => {
      // Filter transactions for this program
      const programTransactions = transactions.filter(t => t.program === program.name);
      
      // Calculate income
      const income = programTransactions
        .filter(t => t.type === 'Income')
        .reduce((sum, t) => sum + (t.amount || 0), 0);
      
      // Calculate expenses
      const expenses = programTransactions
        .filter(t => t.type === 'Expense')
        .reduce((sum, t) => sum + Math.abs(t.amount || 0), 0);
      
      // Calculate net
      const net = income - expenses;
      
      // Calculate budget utilization
      const budgetUtilization = program.budget ? expenses / program.budget : 0;
      
      return {
        id: program.id,
        name: program.name,
        category: program.category,
        income,
        expenses,
        net,
        budget: program.budget || 0,
        budgetUtilization
      };
    });
    
    // Sort by net amount (descending)
    return metrics.sort((a, b) => b.net - a.net).slice(0, 3); // Top 3
  }, [programs, transactions]);
  
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' }).format(amount);
  };
  
  // Handle view all programs
  const handleViewAll = () => {
    navigate('/programs');
  };
  
  // Get budget status color
  const getBudgetStatusColor = (utilization) => {
    if (utilization > 0.9) return 'error';
    if (utilization > 0.7) return 'warning';
    return 'success';
  };
  
  return (
    <Paper sx={{ p: 2, height: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          Program Performance
        </Typography>
        
        <Button
          size="small"
          endIcon={<ArrowForwardIcon />}
          onClick={handleViewAll}
        >
          View All
        </Button>
      </Box>
      
      {programMetrics.length > 0 ? (
        <Grid container spacing={2}>
          {programMetrics.map(program => {
            const budgetStatus = getBudgetStatusColor(program.budgetUtilization);
            
            return (
              <Grid item xs={12} key={program.id}>
                <Card variant="outlined">
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
                          {program.name}
                        </Typography>
                        <Chip 
                          label={program.category} 
                          size="small" 
                          sx={{ mt: 0.5 }}
                        />
                      </Box>
                      
                      <Typography 
                        variant="subtitle1" 
                        sx={{ 
                          fontWeight: 'bold',
                          color: program.net >= 0 ? 'success.main' : 'error.main',
                          display: 'flex',
                          alignItems: 'center' 
                        }}
                      >
                        {program.net >= 0 ? <TrendingUpIcon sx={{ mr: 0.5 }} /> : <TrendingDownIcon sx={{ mr: 0.5 }} />}
                        {formatCurrency(Math.abs(program.net))}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ mt: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="body2">Budget Utilization</Typography>
                        <Typography variant="body2" color={`${budgetStatus}.main`}>
                          {(program.budgetUtilization * 100).toFixed(1)}%
                        </Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={Math.min(program.budgetUtilization * 100, 100)}
                        color={budgetStatus}
                        sx={{ height: 6, borderRadius: 3 }}
                      />
                    </Box>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">Income</Typography>
                        <Typography variant="body2" color="success.main">{formatCurrency(program.income)}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">Expenses</Typography>
                        <Typography variant="body2" color="error.main">{formatCurrency(program.expenses)}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">Budget</Typography>
                        <Typography variant="body2">{formatCurrency(program.budget)}</Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      ) : (
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            No program data available
          </Typography>
          <Button
            variant="outlined"
            size="small"
            sx={{ mt: 2 }}
            onClick={handleViewAll}
          >
            Setup Programs
          </Button>
        </Box>
      )}
    </Paper>
  );
};

export default ProgramPerformance;