import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, LogIn, User, Briefcase } from 'lucide-react';

export default function LoginView() {
	const navigate = useNavigate();
	const [tipo, setTipo] = useState('cliente'); // 'cliente' | 'funcionario'
	const [form, setForm] = useState({ login: '', senha: '' });
	const [showPassword, setShowPassword] = useState(false);
	const [erro, setErro] = useState('');
	const [carregando, setCarregando] = useState(false);

	const handleChange = (campo, valor) => {
		setForm({ ...form, [campo]: valor });
		if (erro) setErro('');
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!form.login || !form.senha) {
			setErro('Preencha e-mail e senha.');
			return;
		}

		setCarregando(true);
		setErro('');

		try {
			const response = await fetch('http://localhost:8080/api/auth/login', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ login: form.login, senha: form.senha, tipo })
			});

			if (response.ok) {
				const usuario = await response.json();
				sessionStorage.setItem('usuarioLogado', JSON.stringify(usuario));
				const destino = tipo === 'cliente'
					? '/cliente'
					: (usuario.funcao === 'GERENTE' ? '/gerente' : '/funcionario');
				navigate(destino);
			} else if (response.status === 401 || response.status === 404) {
				setErro('E-mail ou senha incorretos.');
			} else if (response.status === 403) {
				setErro('Seu cadastro ainda está aguardando aprovação de um gerente (ou foi desativado).');
			} else {
				setErro('Não foi possível entrar. Tente novamente.');
			}
		} catch (erroConexao) {
			console.error('Falha ao conectar com a API:', erroConexao);
			setErro('Erro de conexão com o servidor.');
		} finally {
			setCarregando(false);
		}
	};

	return (
		<div className="min-h-screen bg-gray-50/50 font-sans text-gray-900 flex items-center justify-center p-4">
			<div className="w-full max-w-md animate-fade-in">

				<div className="flex flex-col items-center mb-8">
					<div className="w-16 h-16 bg-red-700 rounded-full flex items-center justify-center text-white font-serif font-bold italic text-2xl shadow-md mb-4">
						DV
					</div>
					<h1 className="text-2xl font-bold text-gray-900 tracking-tight">Pizzaria Della Vita</h1>
					<p className="text-gray-500 text-sm mt-1">Entre na sua conta para continuar</p>
				</div>

				<div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">

					<div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-xl">
						<button
							type="button"
							onClick={() => setTipo('cliente')}
							className={`flex-1 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${tipo === 'cliente' ? 'bg-white text-red-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
						>
							<User size={16} /> Cliente
						</button>
						<button
							type="button"
							onClick={() => setTipo('funcionario')}
							className={`flex-1 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${tipo === 'funcionario' ? 'bg-white text-red-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
						>
							<Briefcase size={16} /> Funcionário
						</button>
					</div>

					<form onSubmit={handleSubmit} className="space-y-4">
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">E-mail</label>
							<div className="relative">
								<Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
								<input
									type="email"
									value={form.login}
									onChange={(e) => handleChange('login', e.target.value)}
									placeholder="seu@email.com"
									className="w-full border-2 border-gray-200 rounded-xl pl-10 pr-4 py-3 outline-none focus:border-red-600 focus:ring-4 focus:ring-red-600/10 transition-all"
								/>
							</div>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">Senha</label>
							<div className="relative">
								<Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
								<input
									type={showPassword ? 'text' : 'password'}
									value={form.senha}
									onChange={(e) => handleChange('senha', e.target.value)}
									placeholder="••••••••"
									className="w-full border-2 border-gray-200 rounded-xl pl-10 pr-10 py-3 outline-none focus:border-red-600 focus:ring-4 focus:ring-red-600/10 transition-all"
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

						{erro && (
							<div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-2.5">
								{erro}
							</div>
						)}

						<button
							type="submit"
							disabled={carregando}
							className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white font-bold py-3 rounded-xl shadow-md hover:shadow-lg transition-all flex justify-center items-center gap-2"
						>
							<LogIn size={20} />
							{carregando ? 'Entrando...' : 'Entrar'}
						</button>
					</form>

					<div className="text-center mt-6 pt-6 border-t border-gray-100">
						<p className="text-sm text-gray-600">
							Não tem uma conta?{' '}
							<Link to="/cadastro" className="text-red-600 font-bold hover:underline">
								Cadastre-se
							</Link>
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}