// src/components/NavigationWithAuth.js (with toggleable sidebar)
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Divider,
  useTheme,
  useMediaQuery,
  Tooltip,
  Avatar,
  Menu,
  MenuItem,
  ListItemButton,
  Button
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  AccountBalance as ProgramsIcon,
  Receipt as TransactionsIcon,
  Assessment as ReportsIcon,
  Sync as IntegrationIcon,
  Payments as PaymentIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
  VerifiedUser as AdminIcon,
  ChevronRight as ChevronRightIcon,
  Settings as SettingsIcon,
  Description as InvoiceIcon,
  ChevronLeft as ChevronLeftIcon
} from '@mui/icons-material';

// Drawer width
const drawerWidth = 240;
const collapsedWidth = 65;

const NavigationWithAuth = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout, hasPermission, isAuthenticated } = useAuth();
  
  // State for mobile drawer
  const [mobileOpen, setMobileOpen] = useState(false);
  
  // State for collapsed sidebar
  const [collapsed, setCollapsed] = useState(false);
  
  // State for user menu
  const [userMenuAnchor, setUserMenuAnchor] = useState(null);
  
  // Toggle mobile drawer
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Toggle sidebar collapse
  const handleToggleCollapse = () => {
    setCollapsed(!collapsed);
  };
  
  // Open user menu
  const handleUserMenuOpen = (event) => {
    setUserMenuAnchor(event.currentTarget);
  };
  
  // Close user menu
  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };
  
  // Handle logout
  const handleLogout = () => {
    handleUserMenuClose();
    logout();
    navigate('/login');
  };
  
  // Navigate to profile
  const handleProfileClick = () => {
    handleUserMenuClose();
    navigate('/profile');
  };
  
  // Get user initials for avatar
  const getUserInitials = () => {
    if (!currentUser || !currentUser.name) return '?';
    
    return currentUser.name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };
  
  // Menu items (filtered by permissions)
  const getMenuItems = () => {
    const items = [
      { 
        text: 'Dashboard', 
        icon: <DashboardIcon />, 
        path: '/dashboard',
        requiredPermission: 'read'
      },
      { 
        text: 'Programs', 
        icon: <ProgramsIcon />, 
        path: '/programs',
        requiredPermission: 'read'
      },
      { 
        text: 'Transactions', 
        icon: <TransactionsIcon />, 
        path: '/transactions',
        requiredPermission: 'read'
      },
      { 
        text: 'Invoices', 
        icon: <InvoiceIcon />, 
        path: '/invoices',
        requiredPermission: 'read'
      },
      { 
        text: 'Reports', 
        icon: <ReportsIcon />, 
        path: '/reports',
        requiredPermission: 'read'
      },
      { 
        text: 'Budget', 
        icon: <PaymentIcon />, 
        path: '/budget',
        requiredPermission: 'read'
      },
      { 
        text: 'Data Integration', 
        icon: <IntegrationIcon />, 
        path: '/data-integration',
        requiredPermission: 'write'
      },
      { 
        text: 'Settings', 
        icon: <SettingsIcon />, 
        path: '/settings',
        requiredPermission: 'read'
      }
    ];
    
    // If user has admin permission, add admin-only items
    if (hasPermission('admin')) {
      items.push(
        { 
          text: 'Admin Panel', 
          icon: <AdminIcon />, 
          path: '/admin',
          requiredPermission: 'admin'
        }
      );
    }
    
    // Filter items based on user permissions
    return items.filter(item => 
      hasPermission(item.requiredPermission)
    );
  };
  
  // Generate drawer content
  const drawerContent = (
    <>
      <Toolbar sx={{ justifyContent: 'space-between', minHeight: 64, px: 2 }}>
        {!collapsed && (
          <Typography variant="h6" noWrap component="div">
            KIOSC Finance
          </Typography>
        )}
        <IconButton onClick={handleToggleCollapse}>
          {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
        </IconButton>
      </Toolbar>
      <Divider />
      {isAuthenticated ? (
        <>
          <List>
            {getMenuItems().map((item) => (
              <Tooltip title={collapsed ? item.text : ""} placement="right" key={item.text}>
                <ListItem 
                  disablePadding
                  onClick={isMobile ? handleDrawerToggle : undefined}
                >
                  <ListItemButton
                    component={Link}
                    to={item.path}
                    selected={location.pathname === item.path}
                    sx={{
                      minHeight: 48,
                      justifyContent: collapsed ? 'center' : 'initial',
                      px: 2.5,
                      '&.Mui-selected': {
                        backgroundColor: 'primary.light',
                        color: 'primary.contrastText',
                        '& .MuiListItemIcon-root': {
                          color: 'primary.contrastText',
                        },
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 0,
                        mr: collapsed ? 'auto' : 3,
                        justifyContent: 'center',
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    {!collapsed && <ListItemText primary={item.text} />}
                    {!collapsed && location.pathname === item.path && (
                      <ChevronRightIcon />
                    )}
                  </ListItemButton>
                </ListItem>
              </Tooltip>
            ))}
          </List>
          <Divider />
          {/* User section at bottom of drawer */}
          <Box sx={{ p: 2, mt: 'auto' }}>
            {!collapsed ? (
              <>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    p: 1,
                    borderRadius: 1,
                    bgcolor: 'action.hover',
                  }}
                >
                  <Avatar 
                    sx={{ 
                      width: 40, 
                      height: 40, 
                      bgcolor: 'primary.main',
                      mr: 2
                    }}
                  >
                    {getUserInitials()}
                  </Avatar>
                  <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
                    <Typography variant="subtitle2" noWrap>
                      {currentUser?.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {currentUser?.role}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ mt: 1, display: 'flex', justifyContent: 'space-between' }}>
                  <Button
                    size="small"
                    startIcon={<PersonIcon />}
                    onClick={() => {
                      if (isMobile) handleDrawerToggle();
                      navigate('/profile');
                    }}
                  >
                    Profile
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    startIcon={<LogoutIcon />}
                    onClick={handleLogout}
                  >
                    Logout
                  </Button>
                </Box>
              </>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Tooltip title={currentUser?.name || ""} placement="right">
                  <Avatar 
                    sx={{ 
                      width: 40, 
                      height: 40, 
                      bgcolor: 'primary.main',
                      mb: 1
                    }}
                    onClick={() => navigate('/profile')}
                  >
                    {getUserInitials()}
                  </Avatar>
                </Tooltip>
                <Tooltip title="Logout" placement="right">
                  <IconButton size="small" color="error" onClick={handleLogout}>
                    <LogoutIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            )}
          </Box>
        </>
      ) : (
        <Box sx={{ p: 2 }}>
          <Button
            variant="contained"
            fullWidth
            component={Link}
            to="/login"
          >
            Sign In
          </Button>
        </Box>
      )}
    </>
  );
  
  // Skip rendering if on login page
  if (location.pathname === '/login' || location.pathname === '/register') {
    return null;
  }
  
  return (
    <>
      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${collapsed ? collapsedWidth : drawerWidth}px)` },
          ml: { md: `${collapsed ? collapsedWidth : drawerWidth}px` },
          zIndex: (theme) => theme.zIndex.drawer + 1,
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {getMenuItems().find(item => item.path === location.pathname)?.text || 'KIOSC Finance'}
          </Typography>
          
          {isAuthenticated && (
            <>
              <Tooltip title="Account settings">
                <IconButton 
                  onClick={handleUserMenuOpen}
                  size="small"
                  sx={{ ml: 2 }}
                  aria-controls={Boolean(userMenuAnchor) ? 'account-menu' : undefined}
                  aria-haspopup="true"
                  aria-expanded={Boolean(userMenuAnchor) ? 'true' : undefined}
                >
                  <Avatar 
                    sx={{ 
                      width: 32, 
                      height: 32, 
                      bgcolor: 'primary.dark',
                      fontSize: '0.875rem'
                    }}
                  >
                    {getUserInitials()}
                  </Avatar>
                </IconButton>
              </Tooltip>
              
              <Menu
                anchorEl={userMenuAnchor}
                id="account-menu"
                open={Boolean(userMenuAnchor)}
                onClose={handleUserMenuClose}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              >
                <MenuItem onClick={handleProfileClick}>
                  <ListItemIcon>
                    <PersonIcon fontSize="small" />
                  </ListItemIcon>
                  My Profile
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout}>
                  <ListItemIcon>
                    <LogoutIcon fontSize="small" />
                  </ListItemIcon>
                  Logout
                </MenuItem>
              </Menu>
            </>
          )}
        </Toolbar>
      </AppBar>
      
      {/* Navigation Drawer */}
      <Box
        component="nav"
        sx={{
          width: { md: collapsed ? collapsedWidth : drawerWidth },
          flexShrink: { md: 0 },
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        }}
      >
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth 
            },
          }}
        >
          {drawerContent}
        </Drawer>
        
        {/* Desktop drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: collapsed ? collapsedWidth : drawerWidth,
              overflowX: 'hidden',
              transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
            },
          }}
          open
        >
          {drawerContent}
        </Drawer>
      </Box>
      
      {/* Main content spacer for fixed app bar */}
      <Toolbar />
    </>
  );
};

export default NavigationWithAuth;