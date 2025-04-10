// src/pages/Programs.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  TextField,
  InputAdornment,
  CircularProgress,
  LinearProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

const ProgramCard = ({ program, budgetTracking }) => {
  // Calculate budget status percentages
  const usedPercentage = budgetTracking ? Math.min(100, (budgetTracking.percentUsed * 100)) : 0;
  
  // Determine status color
  let statusColor = '#4CAF50'; // Green for 'On Track'
  if (budgetTracking) {
    if (budgetTracking.status === 'Caution') {
      statusColor = '#FFC107'; // Yellow for 'Caution'
    } else if (budgetTracking.status === 'At Risk') {
      statusColor = '#F44336'; // Red for 'At Risk'
    }
  }

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="h6" component="div" gutterBottom noWrap title={program.name}>
          {program.name}
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Category: {program.category || 'N/A'}
        </Typography>
        <Typography variant="body2" gutterBottom>
          Budget: ${(program.budget || 0).toLocaleString()}
        </Typography>
        {budgetTracking && (
          <>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2">
                Used: ${((budgetTracking.ytdExpenses || 0) + (budgetTracking.committedExpenses || 0)).toLocaleString()}
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
                  backgroundColor: statusColor,
                }
              }} 
            />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
              <Typography variant="body2" fontWeight="bold">
                Available:
              </Typography>
              <Typography variant="body2" fontWeight="bold" color={statusColor}>
                ${(budgetTracking.availableBudget || 0).toLocaleString()}
              </Typography>
            </Box>
          </>
        )}
      </CardContent>
      <CardActions>
        <Button size="small" component={Link} to={`/programs/${program.id}`}>View Details</Button>
      </CardActions>
    </Card>
  );
};

const Programs = () => {
  const { loading, error, data, getCategories } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

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

  if (!data || !data.Programs || !data.Budget_Tracking) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h5">
          No program data available
        </Typography>
      </Box>
    );
  }

  // Get program and budget data
  const programs = data.Programs;
  const budgetTracking = data.Budget_Tracking;
  const categories = ['All', ...getCategories()];

  // Filter programs based on search term and category
  const filteredPrograms = programs.filter(program => {
    const matchesSearch = program.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || program.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Programs
      </Typography>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              variant="outlined"
              label="Search Programs"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel id="category-filter-label">Category</InputLabel>
              <Select
                labelId="category-filter-label"
                id="category-filter"
                value={categoryFilter}
                label="Category"
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Program Cards */}
      <Grid container spacing={3}>
        {filteredPrograms.map((program) => {
          const programBudget = budgetTracking.find(bt => bt.program === program.name);
          return (
            <Grid item key={program.id} xs={12} sm={6} md={4} lg={3}>
              <ProgramCard program={program} budgetTracking={programBudget} />
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export default Programs;