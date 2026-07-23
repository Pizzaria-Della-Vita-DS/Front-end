// src/pages/FuncionarioView.jsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PainelFuncionario from '../components/PainelFuncionario';
import { getUsuarioLogado, montarPerfilFuncionario, logout } from '../utils/auth';

export default function FuncionarioView() {
	const navigate = useNavigate();
	const usuario = getUsuarioLogado();

	useEffect(() => {
		if (!usuario || usuario.tipo !== 'funcionario') {
			navigate('/login', { replace: true });
		}
	}, [usuario, navigate]);

	if (!usuario || usuario.tipo !== 'funcionario') return null;

	return (
		<PainelFuncionario
			perfil={montarPerfilFuncionario(usuario)}
			onLogout={() => logout(navigate)}
		/>
	);
}