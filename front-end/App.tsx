import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import FlowEditor from './pages/FlowEditor';
import Login from './pages/Login';
import SecretManager from './pages/SecretManager';
import { ProtectedRoute } from './components/ProtectedRoute';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />

        {/* Protected Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/flow/:id"
          element={
            <ProtectedRoute>
              <FlowEditor />
            </ProtectedRoute>
          }
        />
        <Route
          path="/flow"
          element={
            <ProtectedRoute>
              <Navigate to="/flow/new" replace />
            </ProtectedRoute>
          }
        />
        <Route
          path="/secrets"
          element={
            <ProtectedRoute>
              <SecretManager />
            </ProtectedRoute>
          }
        />

        {/* Catch all - redirect to home or login */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
