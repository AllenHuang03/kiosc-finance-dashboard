// src/contexts/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';

// Mock user data for demonstration
const mockUsers = [
  {
    id: 1,
    username: 'admin',
    password: 'admin123',
    name: 'Lisa Administrator',
    email: 'admin@kiosc.com',
    role: 'admin',
    permissions: ['read', 'write', 'delete', 'admin'],
    active: true,
    lastLogin: '2023-04-10T14:32:15'
  },
  {
    id: 2,
    username: 'user',
    password: 'user123',
    name: 'Regular User',
    email: 'user@kiosc.com',
    role: 'user',
    permissions: ['read', 'write'],
    active: true,
    lastLogin: '2023-04-08T09:15:30'
  },
  {
    id: 3,
    username: 'readonly',
    password: 'view123',
    name: 'View Only',
    email: 'view@kiosc.com',
    role: 'viewer',
    permissions: ['read'],
    active: true,
    lastLogin: '2023-04-05T11:42:18'
  }
];

// Create the authentication context
const AuthContext = createContext();

// Custom hook for using the auth context
export const useAuth = () => {
  return useContext(AuthContext);
};

// Authentication provider component
export const AuthProvider = ({ children }) => {
  // State for current user, authentication status, and loading state
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Check for existing session on component mount
  useEffect(() => {
    // Check if user data exists in localStorage
    const storedUser = localStorage.getItem('currentUser');
    
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setCurrentUser(user);
      setIsAuthenticated(true);
    }
    
    setLoading(false);
  }, []);
  
  // Login function
  const login = async (username, password) => {
    setLoading(true);
    setError('');
    
    try {
      // Find user in mock data (in a real app, this would be an API call)
      const user = mockUsers.find(
        u => u.username === username && u.password === password && u.active
      );
      
      if (user) {
        // Create a safe user object (without password)
        const userSafe = { ...user };
        delete userSafe.password;
        
        // Update login timestamp
        userSafe.lastLogin = new Date().toISOString();
        
        // Store user in state and localStorage
        setCurrentUser(userSafe);
        setIsAuthenticated(true);
        localStorage.setItem('currentUser', JSON.stringify(userSafe));
        
        setLoading(false);
        return true;
      } else {
        setError('Invalid username or password');
        setLoading(false);
        return false;
      }
    } catch (err) {
      setError('An error occurred during login');
      setLoading(false);
      return false;
    }
  };
  
  // Logout function
  const logout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('currentUser');
  };
  
  // Check if user has a specific permission
  const hasPermission = (permission) => {
    if (!currentUser || !currentUser.permissions) return false;
    return currentUser.permissions.includes(permission);
  };
  
  // Check if user has a specific role
  const hasRole = (role) => {
    if (!currentUser) return false;
    return currentUser.role === role;
  };
  
  // Update user profile
  const updateUserProfile = (profileData) => {
    if (!currentUser) return false;
    
    const updatedUser = { ...currentUser, ...profileData };
    setCurrentUser(updatedUser);
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    
    return true;
  };
  
  // Context value
  const value = {
    currentUser,
    isAuthenticated,
    loading,
    error,
    login,
    logout,
    hasPermission,
    hasRole,
    updateUserProfile
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;