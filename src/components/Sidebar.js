// src/components/Sidebar.js
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Box, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Divider, Typography } from '@mui/material';
import {
  Dashboard as DashboardIcon,
  ReceiptLong as TransactionsIcon,
  Assessment as ReportsIcon,
  AccountBalance as BudgetIcon,
  FolderSpecial as ProgramsIcon,
  Settings as SettingsIcon,
  Description as InvoiceIcon, // Add this import
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const Sidebar = ({ open }) => {
  const { user } = useAuth();
  
  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard', permission: 'read' },
    { text: 'Transactions', icon: <TransactionsIcon />, path: '/transactions', permission: 'read' },
    { text: 'Budget', icon: <BudgetIcon />, path: '/budget', permission: 'read' },
    { text: 'Reports', icon: <ReportsIcon />, path: '/reports', permission: 'read' },
    { text: 'Programs', icon: <ProgramsIcon />, path: '/programs', permission: 'read' },
    { text: 'Invoices', icon: <InvoiceIcon />, path: '/invoices', permission: 'read' }, // Add this menu item
    { text: 'Settings', icon: <SettingsIcon />, path: '/settings', permission: 'read' },
  ];

  return (
    <Box 
      sx={{ 
        width: open ? 240 : 60,
        transition: 'width 0.2s',
        overflowX: 'hidden',
        bgcolor: 'background.paper',
        height: '100%',
        boxShadow: 1,
      }}
    >
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: open ? 'flex-start' : 'center' }}>
        {open ? (
          <Typography variant="h6" noWrap component="div">
            FinTrack Pro
          </Typography>
        ) : (
          <Typography variant="h6" noWrap component="div">
            FP
          </Typography>
        )}
      </Box>
      <Divider />
      <List>
        {menuItems.map((item) => {
          // Skip items the user doesn't have permission for
          if (user && !user.permissions.includes(item.permission)) {
            return null;
          }
          
          return (
            <ListItem key={item.text} disablePadding sx={{ display: 'block' }}>
              <ListItemButton
                component={NavLink}
                to={item.path}
                sx={{
                  minHeight: 48,
                  justifyContent: open ? 'initial' : 'center',
                  px: 2.5,
                  '&.active': {
                    bgcolor: 'action.selected',
                    '&:hover': {
                      bgcolor: 'action.selected',
                    },
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: open ? 3 : 'auto',
                    justifyContent: 'center',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text} 
                  sx={{ 
                    opacity: open ? 1 : 0,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }} 
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
      <Divider />
    </Box>
  );
};

export default Sidebar;