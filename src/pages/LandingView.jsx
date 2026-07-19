import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Pizza, Clock, Truck, ShieldCheck, LogIn, UserPlus } from 'lucide-react';
import Cardapio from '../components/Cardapio';
import { formatCurrency } from '../utils/format';

export default function LandingView() {
	const navigate = useNavigate();
	const [sabores, setSabores] = useState([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const carregarCardapio = async () => {
			try {
				const res = await fetch('http://localhost:8080/api/sabores');
				if (res.ok) setSabores(await res.json());
			} catch (erro) {
				console.error('Falha ao buscar cardápio:', erro);
			} finally {
				setIsLoading(false);
			}
		};

		carregarCardapio();
	}, []);

	// Usuário ainda não está logado: guardamos o sabor escolhido temporariamente
	// e mandamos para o login. Depois de autenticado, a ClienteView recupera
	// esse registro e joga o usuário direto na aba de Pedido com o sabor já selecionado.
	const handleAdicionar = (sabor) => {
		sessionStorage.setItem('pedidoPendente', JSON.stringify(sabor));
		navigate('/login');
	};

	return (
		<div className="min-h-screen bg-gray-50/50 font-sans text-gray-900">

			<header className="sticky top-0 z-40 bg-red-700 text-white shadow-md">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 flex justify-between items-center h-16">
					<div className="flex items-center gap-3">
						<div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-red-700 font-serif font-bold italic text-lg shadow-sm">
							DV
						</div>
						<div className="hidden sm:block">
							<div className="font-bold text-lg leading-tight tracking-tight">Pizzaria Della Vita</div>
							<div className="text-[10px] tracking-[0.2em] text-red-200 uppercase">Sabor Artesanal</div>
						</div>
					</div>

					<div className="flex items-center gap-3">
						<Link
							to="/login"
							className="px-4 py-2 text-sm font-bold text-white hover:bg-white/10 rounded-xl transition-colors flex items-center gap-2"
						>
							<LogIn size={16} /> Entrar
						</Link>
						<Link
							to="/cadastro"
							className="px-4 py-2 text-sm font-bold bg-white text-red-700 hover:bg-red-50 rounded-xl shadow-sm transition-colors flex items-center gap-2"
						>
							<UserPlus size={16} /> Cadastrar
						</Link>
					</div>
				</div>
			</header>

			<section className="bg-red-700 text-white">
				<div className="max-w-6xl mx-auto px-6 py-16 sm:py-24 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
					<div className="animate-fade-in">
						<span className="inline-block bg-white/10 text-red-100 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4">
							Pizzaria Della Vita
						</span>
						<h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight mb-4">
							Pizza artesanal, direto no seu endereço.
						</h1>
						<p className="text-red-100 text-lg mb-8">
							Massa fermentada lentamente, ingredientes selecionados e o sabor de sempre.
							Peça em minutos e acompanhe seu pedido em tempo real.
						</p>
						<div className="flex flex-wrap gap-4">
							<Link
								to="/cadastro"
								className="bg-white text-red-700 font-bold py-3 px-6 rounded-xl shadow-md hover:shadow-lg hover:bg-red-50 transition-all flex items-center gap-2"
							>
								<UserPlus size={20} /> Criar minha conta
							</Link>
							<Link
								to="/login"
								className="border-2 border-white/40 text-white font-bold py-3 px-6 rounded-xl hover:bg-white/10 transition-all flex items-center gap-2"
							>
								<LogIn size={20} /> Já tenho conta
							</Link>
						</div>
					</div>
					<div className="hidden md:flex justify-center">
						<div className="w-64 h-64 bg-white/10 rounded-full flex items-center justify-center">
							<Pizza size={140} className="text-white" />
						</div>
					</div>
				</div>
			</section>

			<section className="max-w-6xl mx-auto px-6 py-12">
				<div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
					<div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center">
						<div className="w-12 h-12 bg-red-50 text-red-700 rounded-full flex items-center justify-center mx-auto mb-4">
							<Clock size={22} />
						</div>
						<h3 className="font-bold text-gray-900 mb-1">Entrega rápida</h3>
						<p className="text-sm text-gray-600">Pedido preparado e enviado no menor tempo possível.</p>
					</div>
					<div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center">
						<div className="w-12 h-12 bg-red-50 text-red-700 rounded-full flex items-center justify-center mx-auto mb-4">
							<Truck size={22} />
						</div>
						<h3 className="font-bold text-gray-900 mb-1">Retirada ou entrega</h3>
						<p className="text-sm text-gray-600">Escolha como prefere receber sua pizza.</p>
					</div>
					<div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center">
						<div className="w-12 h-12 bg-red-50 text-red-700 rounded-full flex items-center justify-center mx-auto mb-4">
							<ShieldCheck size={22} />
						</div>
						<h3 className="font-bold text-gray-900 mb-1">Ingredientes frescos</h3>
						<p className="text-sm text-gray-600">Estoque controlado para garantir qualidade sempre.</p>
					</div>
				</div>
			</section>

			<section className="border-t border-gray-100 bg-white/50">
				<Cardapio
					sabores={sabores}
					isLoading={isLoading}
					formatCurrency={formatCurrency}
					onAdicionar={handleAdicionar}
				/>
				<div className="max-w-5xl mx-auto px-6 pb-16 -mt-4 text-center">
					<p className="text-sm text-gray-500">
						Ao adicionar um sabor, você será direcionado para entrar ou criar sua conta antes de finalizar o pedido.
					</p>
				</div>
			</section>

			<footer className="bg-gray-900 text-gray-400 text-center py-8 text-sm">
				© {new Date().getFullYear()} Pizzaria Della Vita. Todos os direitos reservados.
			</footer>
		</div>
	);
}