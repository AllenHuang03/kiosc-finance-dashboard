// src/index.js
import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import './App.css';
import App from './App';

// React 18+ way of rendering (also used in React 19)
const root = createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);