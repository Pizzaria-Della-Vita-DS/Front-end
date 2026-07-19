
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import LandingView from './pages/LandingView';
import LoginView from './pages/LoginView';
import CadastroView from './pages/CadastroView';
import ClienteView from './pages/ClienteView';
import FuncionarioView from './pages/FuncionarioView';
import GerenteView from './pages/GerenteView';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingView />} />
        <Route path="/login" element={<LoginView />} />
        <Route path="/cadastro" element={<CadastroView />} />
        <Route path="/cliente" element={<ClienteView />} />
        <Route path="/funcionario" element={<FuncionarioView />} />
        <Route path="/gerente" element={<GerenteView />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}