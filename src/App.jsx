import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import LoginView from './pages/LoginView';
import CadastroView from './pages/CadastroView';
import ClienteView from './pages/ClienteView';
import FuncionarioView from './pages/FuncionarioView';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginView />} />
        <Route path="/cadastro" element={<CadastroView />} />
        <Route path="/cliente" element={<ClienteView />} />
        <Route path="/funcionario" element={<FuncionarioView />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}