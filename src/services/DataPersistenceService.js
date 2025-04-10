// src/services/DataPersistenceService.js
import { useEffect } from 'react';
import { useSettings } from '../contexts/SettingsContext';

/**
 * A service component that handles application-wide data persistence
 * This component doesn't render anything but handles side effects for data persistence
 */
const DataPersistenceService = ({ children }) => {
  const { settings } = useSettings();

  // Effect to handle theme preference in localStorage
  useEffect(() => {
    if (settings.theme) {
      localStorage.setItem('theme', settings.theme);
      
      // Apply theme class to the body element for global styling
      document.body.className = settings.theme === 'dark' ? 'dark-theme' : 'light-theme';
    }
  }, [settings.theme]);

  // Effect to handle currency preference in localStorage
  useEffect(() => {
    if (settings.currency) {
      localStorage.setItem('currency', settings.currency);
    }
  }, [settings.currency]);

  // Effect to handle dateFormat preference in localStorage
  useEffect(() => {
    if (settings.dateFormat) {
      localStorage.setItem('dateFormat', settings.dateFormat);
    }
  }, [settings.dateFormat]);

  // Effect to sync settings with localStorage on window focus
  // This helps keep settings in sync across multiple tabs
  useEffect(() => {
    const handleFocus = () => {
      const savedTheme = localStorage.getItem('theme');
      const savedCurrency = localStorage.getItem('currency');
      const savedDateFormat = localStorage.getItem('dateFormat');
      
      // You'd implement the sync logic here if needed
      // This would interact with your settings context to update any changes
      // For now, it's just a placeholder for the real implementation
    };

    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  // This component doesn't render anything itself
  return children;
};

export default DataPersistenceService;