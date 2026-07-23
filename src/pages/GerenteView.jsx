// src/pages/GerenteView.jsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PainelFuncionario from '../components/PainelFuncionario';
import { getUsuarioLogado, montarPerfilFuncionario, logout } from '../utils/auth';

export default function GerenteView() {
	const navigate = useNavigate();
	const usuario = getUsuarioLogado();

	useEffect(() => {
		if (!usuario || usuario.tipo !== 'funcionario' || usuario.funcao !== 'GERENTE') {
			navigate('/login', { replace: true });
		}
	}, [usuario, navigate]);

	if (!usuario || usuario.funcao !== 'GERENTE') return null;

	return (
		<PainelFuncionario
			isGerente
			perfil={montarPerfilFuncionario(usuario)}
			onLogout={() => logout(navigate)}
		/>
	);
}