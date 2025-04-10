// src/App.js
import React, { useMemo } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import AppRouter from './routes/AppRouter';
import { AuthProvider } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import { SettingsProvider, useSettings } from './contexts/SettingsContext';
import DataPersistenceService from './services/DataPersistenceService';

// Theme wrapper component to access settings context
const ThemedApp = () => {
  const { settings } = useSettings();
  
  // Create theme based on user settings
  const theme = useMemo(() => 
    createTheme({
      palette: {
        mode: settings.theme === 'system' 
          ? window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
          : settings.theme,
        primary: {
          main: '#2196f3',
        },
        secondary: {
          main: '#f50057',
        },
      },
    }),
    [settings.theme]
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppRouter />
    </ThemeProvider>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <DataProvider>
          <SettingsProvider>
            <DataPersistenceService>
              <ThemedApp />
            </DataPersistenceService>
          </SettingsProvider>
        </DataProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;