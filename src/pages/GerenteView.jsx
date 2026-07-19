
import React from 'react';
import PainelFuncionario from '../components/PainelFuncionario';

export default function GerenteView() {
	return (
		<PainelFuncionario
			isGerente
			perfil={{
				nome: 'Ana Beatriz Souza',
				inicial: 'A',
				tipoLabel: 'Gerente',
				cargo: 'Gerente Geral',
				email: 'gerente@pizzaria.com',
				cpf: '000.000.000-00',
				telefone: '(53) 99900-0000',
				dataNascimento: '01/01/1990',
				rg: '0000000000',
				genero: 'Feminino',
				setor: 'Administração'
			}}
		/>
	);
}