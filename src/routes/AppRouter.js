// src/routes/AppRouter.js
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from '../pages/Dashboard';
import Transactions from '../pages/Transactions';
import Reports from '../pages/Reports';
import Budget from '../pages/Budget';
import Programs from '../pages/Programs';
import ProgramDetail from '../pages/ProgramDetail';
import Settings from '../pages/Settings';
import UserProfile from '../pages/UserProfile';
import Login from '../pages/Login';
import Register from '../pages/Register';
import NotFound from '../pages/NotFound';
import Layout from '../components/Layout';
import PrivateRoute from './PrivateRoute';
import InvoiceManagement from '../pages/InvoiceManagement';
import AdminPanel from '../pages/AdminPanel';
import DataIntegration from '../pages/DataIntegration';

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="transactions" element={<Transactions />} />
        <Route path="invoices" element={<InvoiceManagement />} />
        <Route path="payment-tracking" element={<Navigate to="/invoices" replace />} />
        <Route path="reports" element={<Reports />} />
        <Route path="budget" element={<Budget />} />
        <Route path="programs" element={<Programs />} />
        <Route path="programs/:id" element={<ProgramDetail />} />
        <Route path="settings" element={<Settings />} />
        <Route path="profile" element={<UserProfile />} />
        <Route path="admin" element={<AdminPanel />} />
        <Route path="data-integration" element={<DataIntegration />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRouter;