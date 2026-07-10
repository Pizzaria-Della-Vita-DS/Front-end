import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Briefcase, Mail, Lock, Phone, MapPin, IdCard, Calendar, Building2, UserPlus, Eye, EyeOff } from 'lucide-react';

export default function CadastroView() {
	const navigate = useNavigate();
	const [tipo, setTipo] = useState('cliente'); // 'cliente' | 'funcionario'
	const [showPassword, setShowPassword] = useState(false);
	const [erro, setErro] = useState('');
	const [sucesso, setSucesso] = useState('');
	const [salvando, setSalvando] = useState(false);

	const [form, setForm] = useState({
		nome: '',
		cpf: '',
		login: '',
		senha: '',
		confirmarSenha: '',
		genero: '',
		telefone: '',
		endereco: '',
		funcao: 'ATENDENTE',
		rg: '',
		data_nascimento: '',
		setor: ''
	});

	const handleChange = (campo, valor) => {
		setForm({ ...form, [campo]: valor });
		if (erro) setErro('');
	};

	const validar = () => {
		if (!form.nome || !form.cpf || !form.login || !form.senha || !form.genero || !form.telefone) {
			return 'Preencha todos os campos obrigatórios.';
		}
		if (tipo === 'cliente' && !form.endereco) {
			return 'Informe o endereço de entrega.';
		}
		if (tipo === 'funcionario' && (!form.funcao || !form.rg || !form.data_nascimento || !form.setor)) {
			return 'Preencha todos os campos do funcionário.';
		}
		if (form.senha !== form.confirmarSenha) {
			return 'As senhas não coincidem.';
		}
		if (form.senha.length < 6) {
			return 'A senha deve ter pelo menos 6 caracteres.';
		}
		return '';
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		const mensagemErro = validar();
		if (mensagemErro) {
			setErro(mensagemErro);
			return;
		}

		const payloadBase = {
			cpf: form.cpf.replace(/\D/g, ''),
			nome: form.nome,
			login: form.login,
			senha: form.senha,
			genero: form.genero,
			telefone: form.telefone
		};

		const payload = tipo === 'cliente'
			? { ...payloadBase, endereco: form.endereco }
			: { ...payloadBase, funcao: form.funcao, status: 'ATIVO', rg: form.rg, data_nascimento: form.data_nascimento, setor: form.setor };

		const endpoint = tipo === 'cliente' ? '/api/clientes' : '/api/funcionarios';

		setSalvando(true);
		setErro('');
		try {
			const response = await fetch(`http://localhost:8080${endpoint}`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload)
			});

			if (response.ok) {
				setSucesso('Cadastro realizado com sucesso! Redirecionando para o login...');
				setTimeout(() => navigate('/login'), 1500);
			} else if (response.status === 409) {
				setErro('Já existe um cadastro com este CPF ou e-mail.');
			} else {
				setErro('Não foi possível concluir o cadastro. Tente novamente.');
			}
		} catch (erroConexao) {
			console.error('Falha ao conectar com a API:', erroConexao);
			setErro('Erro de conexão com o servidor.');
		} finally {
			setSalvando(false);
		}
	};

	return (
		<div className="min-h-screen bg-gray-50/50 font-sans text-gray-900 flex items-center justify-center p-4 py-10">
			<div className="w-full max-w-2xl animate-fade-in">

				<div className="flex flex-col items-center mb-8">
					<div className="w-16 h-16 bg-red-700 rounded-full flex items-center justify-center text-white font-serif font-bold italic text-2xl shadow-md mb-4">
						DV
					</div>
					<h1 className="text-2xl font-bold text-gray-900 tracking-tight">Criar Conta</h1>
					<p className="text-gray-500 text-sm mt-1">Pizzaria Della Vita</p>
				</div>

				<div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">

					<div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-xl">
						<button
							type="button"
							onClick={() => setTipo('cliente')}
							className={`flex-1 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${tipo === 'cliente' ? 'bg-white text-red-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
						>
							<User size={16} /> Sou Cliente
						</button>
						<button
							type="button"
							onClick={() => setTipo('funcionario')}
							className={`flex-1 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${tipo === 'funcionario' ? 'bg-white text-red-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
						>
							<Briefcase size={16} /> Sou Funcionário
						</button>
					</div>

					<form onSubmit={handleSubmit} className="space-y-4">

						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">Nome completo *</label>
								<input
									type="text"
									value={form.nome}
									onChange={(e) => handleChange('nome', e.target.value)}
									placeholder="Ex: Marina Costa"
									className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-red-600 focus:ring-4 focus:ring-red-600/10 transition-all"
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">CPF *</label>
								<div className="relative">
									<IdCard className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
									<input
										type="text"
										value={form.cpf}
										onChange={(e) => handleChange('cpf', e.target.value)}
										placeholder="000.000.000-00"
										className="w-full border-2 border-gray-200 rounded-xl pl-10 pr-4 py-2.5 outline-none focus:border-red-600 focus:ring-4 focus:ring-red-600/10 transition-all"
									/>
								</div>
							</div>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">E-mail (será seu login) *</label>
							<div className="relative">
								<Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
								<input
									type="email"
									value={form.login}
									onChange={(e) => handleChange('login', e.target.value)}
									placeholder="seu@email.com"
									className="w-full border-2 border-gray-200 rounded-xl pl-10 pr-4 py-2.5 outline-none focus:border-red-600 focus:ring-4 focus:ring-red-600/10 transition-all"
								/>
							</div>
						</div>

						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">Senha *</label>
								<div className="relative">
									<Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
									<input
										type={showPassword ? 'text' : 'password'}
										value={form.senha}
										onChange={(e) => handleChange('senha', e.target.value)}
										placeholder="Mínimo 6 caracteres"
										className="w-full border-2 border-gray-200 rounded-xl pl-10 pr-10 py-2.5 outline-none focus:border-red-600 focus:ring-4 focus:ring-red-600/10 transition-all"
									/>
									<button
										type="button"
										onClick={() => setShowPassword(!showPassword)}
										className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
									>
										{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
									</button>
								</div>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">Confirmar senha *</label>
								<input
									type={showPassword ? 'text' : 'password'}
									value={form.confirmarSenha}
									onChange={(e) => handleChange('confirmarSenha', e.target.value)}
									placeholder="Repita a senha"
									className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-red-600 focus:ring-4 focus:ring-red-600/10 transition-all"
								/>
							</div>
						</div>

						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">Gênero *</label>
								<select
									value={form.genero}
									onChange={(e) => handleChange('genero', e.target.value)}
									className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-red-600 bg-white"
								>
									<option value="">Selecione</option>
									<option value="Feminino">Feminino</option>
									<option value="Masculino">Masculino</option>
									<option value="Outro">Outro</option>
									<option value="Prefiro não informar">Prefiro não informar</option>
								</select>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">Telefone *</label>
								<div className="relative">
									<Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
									<input
										type="text"
										value={form.telefone}
										onChange={(e) => handleChange('telefone', e.target.value)}
										placeholder="(53) 99999-9999"
										className="w-full border-2 border-gray-200 rounded-xl pl-10 pr-4 py-2.5 outline-none focus:border-red-600 focus:ring-4 focus:ring-red-600/10 transition-all"
									/>
								</div>
							</div>
						</div>

						{tipo === 'cliente' && (
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">Endereço de entrega *</label>
								<div className="relative">
									<MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
									<input
										type="text"
										value={form.endereco}
										onChange={(e) => handleChange('endereco', e.target.value)}
										placeholder="Rua, número, bairro, cidade/UF"
										className="w-full border-2 border-gray-200 rounded-xl pl-10 pr-4 py-2.5 outline-none focus:border-red-600 focus:ring-4 focus:ring-red-600/10 transition-all"
									/>
								</div>
							</div>
						)}

						{tipo === 'funcionario' && (
							<div className="space-y-4 bg-gray-50 border border-gray-100 rounded-xl p-4">
								<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-2">Função *</label>
										<select
											value={form.funcao}
											onChange={(e) => handleChange('funcao', e.target.value)}
											className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-red-600 bg-white"
										>
											<option value="ATENDENTE">Atendente</option>
											<option value="PIZZAIOLO">Pizzaiolo</option>
											<option value="CAIXA">Caixa</option>
											<option value="ENTREGADOR">Entregador</option>
										</select>
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-2">Setor *</label>
										<div className="relative">
											<Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
											<input
												type="text"
												value={form.setor}
												onChange={(e) => handleChange('setor', e.target.value)}
												placeholder="Ex: Cozinha"
												className="w-full border-2 border-gray-200 rounded-xl pl-10 pr-4 py-2.5 outline-none focus:border-red-600 focus:ring-4 focus:ring-red-600/10 transition-all"
											/>
										</div>
									</div>
								</div>
								<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-2">RG *</label>
										<input
											type="text"
											value={form.rg}
											onChange={(e) => handleChange('rg', e.target.value)}
											placeholder="0000000000"
											className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-red-600 focus:ring-4 focus:ring-red-600/10 transition-all"
										/>
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-2">Data de nascimento *</label>
										<div className="relative">
											<Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
											<input
												type="date"
												value={form.data_nascimento}
												onChange={(e) => handleChange('data_nascimento', e.target.value)}
												className="w-full border-2 border-gray-200 rounded-xl pl-10 pr-4 py-2.5 outline-none focus:border-red-600 focus:ring-4 focus:ring-red-600/10 transition-all"
											/>
										</div>
									</div>
								</div>
							</div>
						)}

						{erro && (
							<div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-2.5">
								{erro}
							</div>
						)}
						{sucesso && (
							<div className="text-sm text-green-700 bg-green-50 border border-green-100 rounded-xl px-4 py-2.5">
								{sucesso}
							</div>
						)}

						<button
							type="submit"
							disabled={salvando}
							className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white font-bold py-3 rounded-xl shadow-md hover:shadow-lg transition-all flex justify-center items-center gap-2"
						>
							<UserPlus size={20} />
							{salvando ? 'Cadastrando...' : 'Criar Conta'}
						</button>
					</form>

					<div className="text-center mt-6 pt-6 border-t border-gray-100">
						<p className="text-sm text-gray-600">
							Já tem uma conta?{' '}
							<Link to="/login" className="text-red-600 font-bold hover:underline">
								Fazer login
							</Link>
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}