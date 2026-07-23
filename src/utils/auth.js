export function getUsuarioLogado() {
	const raw = sessionStorage.getItem('usuarioLogado');
	if (!raw) return null;
	try {
		return JSON.parse(raw);
	} catch {
		return null;
	}
}

export function salvarUsuarioLogado(usuario) {
	sessionStorage.setItem('usuarioLogado', JSON.stringify(usuario));
}

export function logout(navigate) {
	sessionStorage.removeItem('usuarioLogado');
	navigate('/login', { replace: true });
}

const CARGO_LABELS = {
	ATENDENTE: 'Atendente',
	PIZZAIOLO: 'Pizzaiolo',
	CAIXA: 'Caixa',
	ENTREGADOR: 'Entregador',
	GERENTE: 'Gerente Geral',
};

export function montarPerfilFuncionario(usuario) {
	return {
		nome: usuario.nome,
		inicial: usuario.nome ? usuario.nome.charAt(0).toUpperCase() : '?',
		tipoLabel: usuario.funcao === 'GERENTE' ? 'Gerente' : 'Funcionário',
		cargo: CARGO_LABELS[usuario.funcao] || usuario.funcao || '',
		email: usuario.login,
		cpf: usuario.cpf,
		telefone: usuario.telefone,
		dataNascimento: usuario.dataNascimento || '',
		rg: usuario.rg || '',
		genero: usuario.genero,
		setor: usuario.setor,
	};
}