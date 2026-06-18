import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import ClienteView from './pages/ClienteView';
import FuncionarioView from './pages/FuncionarioView';

// Este é o NOVO App.jsx. Ele não desenha telas visuais, apenas gerencia as rotas!
export default function App() {
  return (
    <BrowserRouter>
      {}
      <Routes>
        
        {/* Se o usuário acessar a URL raiz "/", por enquanto redirecionamos para o cliente. 
            No futuro, quando tiver autenticação, aqui será a tela de Login: element={<LoginView />} */}
        <Route path="/" element={<Navigate to="/cliente" replace />} />

        {/* Quando a URL for /cliente, o React injeta o ClienteView na tela */}
        <Route path="/cliente" element={<ClienteView />} />

        {/* Quando a URL for /funcionario, o React injeta o FuncionarioView na tela */}
        <Route path="/funcionario" element={<FuncionarioView />} />

        {/* Fallback de segurança: Se o usuário digitar uma URL que não existe 
            (ex: http://localhost:5173/batata), o sistema manda ele de volta pro início */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  );
}