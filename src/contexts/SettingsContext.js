// src/contexts/SettingsContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';

// Create context
const SettingsContext = createContext();

// Default settings
const defaultSettings = {
  theme: 'light',
  currency: 'AUD',
  notifications: true,
  compactView: false,
  dateFormat: 'dd/MM/yyyy',
  defaultView: 'dashboard',
  autoSave: true
};

export const SettingsProvider = ({ children }) => {
  // Initialize state with values from localStorage or defaults
  const [settings, setSettings] = useState(() => {
    const savedSettings = localStorage.getItem('userSettings');
    return savedSettings ? JSON.parse(savedSettings) : defaultSettings;
  });

  // Update localStorage whenever settings change
  useEffect(() => {
    localStorage.setItem('userSettings', JSON.stringify(settings));
  }, [settings]);

  // Function to update a single setting
  const updateSetting = (key, value) => {
    setSettings(prevSettings => ({
      ...prevSettings,
      [key]: value
    }));
  };

  // Function to update multiple settings at once
  const updateSettings = (newSettings) => {
    setSettings(prevSettings => ({
      ...prevSettings,
      ...newSettings
    }));
  };

  // Reset settings to default
  const resetSettings = () => {
    setSettings(defaultSettings);
  };

  return (
    <SettingsContext.Provider value={{ 
      settings, 
      updateSetting, 
      updateSettings,
      resetSettings 
    }}>
      {children}
    </SettingsContext.Provider>
  );
};

// Custom hook to use the settings context
export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export default SettingsContext;