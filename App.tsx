import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import FlowEditor from './pages/FlowEditor';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/flow/:id" element={<FlowEditor />} />
        <Route path="/flow" element={<Navigate to="/flow/new" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
