import React, { useState, useEffect } from 'react';
import {
	Pizza,
	ShoppingCart,
	User,
	LogOut,
	CreditCard,
	Smartphone,
	Banknote,
	Edit2,
	Trash2,
	CheckCircle2
} from 'lucide-react';
import Cardapio from '../components/Cardapio';
import { formatCurrency } from '../utils/format';
import { useNavigate } from 'react-router-dom';
import { getUsuarioLogado, salvarUsuarioLogado, logout } from '../utils/auth';

export default function ClienteView() {
	const navigate = useNavigate();
	const [usuario, setUsuario] = useState(getUsuarioLogado());
	const [currentPage, setCurrentPage] = useState('cardapio');
	const [cart, setCart] = useState([]);
	const [modal, setModal] = useState({ isOpen: false, type: null, data: null });

	const [sabores, setSabores] = useState([]);
	const [tamanhos, setTamanhos] = useState([
		{ id: 1, nome: 'Pequena', multiplicador: 1, maxSabores: 1 },
		{ id: 2, nome: 'Média', multiplicador: 1.5, maxSabores: 2 },
		{ id: 3, nome: 'Grande', multiplicador: 2, maxSabores: 3 },
	]);
	const [bordas, setBordas] = useState([]);
	const [historico, setHistorico] = useState([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		if (!usuario || usuario.tipo !== 'cliente') {
			navigate('/login', { replace: true });
		}
	}, [usuario, navigate]);

	useEffect(() => {
		const carregarDadosDaAPI = async () => {
			try {
				// 2. Remova o fetch do tamanho daqui (AQUI)
				const [resSabores, resBordas, resHistorico] = await Promise.all([
					fetch('http://localhost:8080/api/sabores'),
					fetch('http://localhost:8080/api/bordas'),
					fetch('http://localhost:8080/api/pedidos/historico')
				]);

				if (resSabores.ok) setSabores(await resSabores.json());
				if (resBordas.ok) setBordas(await resBordas.json());
				if (resHistorico.ok) setHistorico(await resHistorico.json());

			} catch (erro) {
				console.error("Falha ao buscar dados do Spring Boot:", erro);
			} finally {
				setIsLoading(false);
			}
		};

		carregarDadosDaAPI();
	}, []);

	const [builderSize, setBuilderSize] = useState(null);
	const [builderFlavors, setBuilderFlavors] = useState([]);
	const [builderBorder, setBuilderBorder] = useState(null);

	const [userAddress, setUserAddress] = useState(usuario?.endereco || '');
	const [deliveryOption, setDeliveryOption] = useState('retirada');
	const [currentDeliveryAddress, setCurrentDeliveryAddress] = useState('');




	// Se o usuário veio da Landing Page e escolheu um sabor antes de logar,
	// recuperamos essa seleção aqui, jogamos direto na aba de Pedido e limpamos o registro temporário.
	useEffect(() => {
		const pedidoPendenteRaw = sessionStorage.getItem('pedidoPendente');
		if (pedidoPendenteRaw) {
			try {
				const saborPendente = JSON.parse(pedidoPendenteRaw);
				setBuilderSize(tamanhos[0]);
				setBuilderFlavors([saborPendente]);
				setBuilderBorder(null);
				setCurrentPage('pedido');
			} catch (erro) {
				console.error('Falha ao restaurar pedido pendente:', erro);
			} finally {
				sessionStorage.removeItem('pedidoPendente');
			}
		}
	}, []);

	const openModal = (type, data = null) => setModal({ isOpen: true, type, data });
	const closeModal = () => setModal({ isOpen: false, type: null, data: null });

	const handleAdicionarSabor = (sabor) => {
		setBuilderSize(tamanhos[0]);
		setBuilderFlavors([sabor]);
		setBuilderBorder(null);
		setCurrentPage('pedido');
	};

	const OrderPage = () => {

		const handleFlavorToggle = (sabor) => {
			if (!builderSize) {
				alert('Por favor, selecione o tamanho da pizza primeiro.');
				return;
			}

			const isSelected = builderFlavors.some(f => f.id === sabor.id);
			if (isSelected) {
				setBuilderFlavors(builderFlavors.filter(f => f.id !== sabor.id));
			} else {
				if (builderFlavors.length >= builderSize.maxSabores) {
					alert(`O tamanho ${builderSize.nome} permite no máximo ${builderSize.maxSabores} sabor(es).`);
					return;
				}
				setBuilderFlavors([...builderFlavors, sabor]);
			}
		};

		const handleAddToCart = () => {
			if (!builderSize) return alert('Escolha o tamanho da pizza.');
			if (builderFlavors.length === 0) return alert('Escolha pelo menos um sabor.');

			const somaPrecos = builderFlavors.reduce((acc, sabor) => acc + sabor.preco, 0);
			const precoProporcional = somaPrecos / builderFlavors.length;
			const precoPizza = (precoProporcional * builderSize.multiplicador) + (builderBorder ? builderBorder.preco : 0);

			const newItem = {
				id: Date.now(),
				size: builderSize,
				flavors: builderFlavors,
				border: builderBorder,
				price: parseFloat(precoPizza) // AQUI: Mantido como Double/Float para precisão centesimal
			};

			setCart([...cart, newItem]);

			setBuilderSize(null);
			setBuilderFlavors([]);
			setBuilderBorder(null);
		};

		const removeFromCart = (idToRemove) => {
			setCart(cart.filter(item => item.id !== idToRemove));
		};

		const cartTotal = cart.reduce((sum, item) => sum + item.price, 0);

		return (
			<div className="max-w-6xl mx-auto p-6 animate-fade-in">
				<div className="mb-8">
					<h1 className="text-3xl font-bold text-gray-900 tracking-tight">Fazer Pedido</h1>
					<p className="text-gray-600 mt-2">Monte sua pizza e adicione ao carrinho.</p>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
					<div className="lg:col-span-2 space-y-6">
						<div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
							<h3 className="text-lg font-bold text-gray-900 mb-1">1. Tamanho</h3>
							<p className="text-sm text-gray-500 mb-4">O tamanho define o multiplicador de preço e a quantidade de sabores.</p>
							<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
								{tamanhos.map(t => (
									<div
										key={t.id}
										onClick={() => { setBuilderSize(t); setBuilderFlavors([]); }}
										className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${builderSize?.id === t.id ? 'border-red-600 bg-red-50' : 'border-gray-200 hover:border-red-300'}`}
									>
										<div className="font-bold text-gray-900">{t.nome}</div>
										<div className="text-xs text-gray-500 mt-1">Multiplicador: {t.multiplicador}x</div>
										<div className="text-sm font-semibold text-red-700 mt-3">Até {t.maxSabores} sabores</div>
									</div>
								))}
							</div>
						</div>

						<div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
							<div className="flex justify-between items-baseline mb-4">
								<h3 className="text-lg font-bold text-gray-900 mb-1">2. Sabores</h3>
								<span className="text-sm font-medium text-red-700">
									{builderSize ? `${builderFlavors.length} / ${builderSize.maxSabores} selecionados` : 'Selecione o tamanho primeiro'}
								</span>
							</div>
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
								{sabores.map(s => {
									const isSelected = builderFlavors.some(f => f.id === s.id);
									return (
										<div
											key={s.id}
											onClick={() => handleFlavorToggle(s)}
											className={`p-3 rounded-xl border-2 cursor-pointer flex items-center gap-3 transition-all ${isSelected ? 'border-red-600 bg-red-50' : 'border-gray-200 hover:bg-gray-50'}`}
										>
											<div className={`w-5 h-5 rounded flex items-center justify-center border ${isSelected ? 'bg-red-600 border-red-600' : 'border-gray-300'}`}>
												{isSelected && <CheckCircle2 size={14} className="text-white" />}
											</div>
											<div>
												<div className="font-semibold text-sm text-gray-900">{s.nome}</div>
												<div className="text-xs text-gray-500 font-medium text-red-600">{formatCurrency(s.preco)} base</div>
											</div>
										</div>
									);
								})}
							</div>
						</div>

						<div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
							<h3 className="text-lg font-bold text-gray-900 mb-4">3. Borda (Opcional)</h3>
							<div className="flex flex-wrap gap-3">
								<div
									onClick={() => setBuilderBorder(null)}
									className={`px-4 py-2 rounded-full border-2 cursor-pointer text-sm font-medium transition-all ${!builderBorder ? 'border-red-600 bg-red-600 text-white' : 'border-gray-200 text-gray-700 hover:border-gray-300'}`}
								>
									Tradicional (Sem recheio)
								</div>
								{bordas.map(b => (
									<div
										key={b.id}
										onClick={() => setBuilderBorder(b)}
										className={`px-4 py-2 rounded-full border-2 cursor-pointer text-sm font-medium transition-all ${builderBorder?.id === b.id ? 'border-red-600 bg-red-600 text-white' : 'border-gray-200 text-gray-700 hover:border-gray-300'}`}
									>
										{b.nome} {b.preco > 0 && `(+ ${formatCurrency(b.preco)})`}
									</div>
								))}
							</div>
						</div>

						<button
							onClick={handleAddToCart}
							className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl shadow-md hover:shadow-lg transition-all flex justify-center items-center gap-2"
						>
							<ShoppingCart size={20} />
							Adicionar ao Carrinho
						</button>
					</div>

					<div>
						<div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
							<div className="flex justify-between items-center border-b border-gray-100 pb-4 mb-4">
								<h3 className="text-lg font-bold text-gray-900">Carrinho</h3>
								<span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-bold">
									{cart.length} {cart.length === 1 ? 'item' : 'itens'}
								</span>
							</div>

							{cart.length === 0 ? (
								<div className="text-center py-8 text-gray-500 flex flex-col items-center">
									<Pizza size={48} className="text-gray-200 mb-3" />
									<p>Seu carrinho está vazio.</p>
								</div>
							) : (
								<div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
									{cart.map((item) => (
										<div key={item.id} className="bg-gray-50 border border-gray-100 p-4 rounded-xl relative group">
											<div className="flex justify-between items-start mb-2">
												<span className="font-bold text-sm text-gray-900">Pizza {item.size.nome}</span>
												<span className="font-bold text-sm text-red-700">{formatCurrency(item.price)}</span>
											</div>
											<div className="text-xs text-gray-600 mb-1">
												<span className="font-semibold">Sabores:</span> {item.flavors.map(f => f.nome).join(', ')}
											</div>
											{item.border && item.border.preco > 0 && (
												<div className="text-xs text-gray-600">
													<span className="font-semibold">Borda:</span> {item.border.nome}
												</div>
											)}
											<button
												onClick={() => removeFromCart(item.id)}
												className="text-red-500 text-xs font-medium mt-3 hover:text-red-700 flex items-center gap-1"
											>
												<Trash2 size={12} /> Remover
											</button>
										</div>
									))}
								</div>
							)}

							<div className="border-t border-gray-100 mt-6 pt-4">
								<div className="flex justify-between items-center mb-4">
									<span className="text-gray-600 font-medium">Subtotal</span>
									<span className="text-2xl font-bold text-gray-900">{formatCurrency(cartTotal)}</span>
								</div>

								{cart.length > 0 && (
									<div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-6">
										<h4 className="font-semibold text-gray-900 text-sm mb-3">Opções de Recebimento</h4>
										<div className="flex gap-2 mb-3">
											<button
												onClick={() => setDeliveryOption('retirada')}
												className={`flex-1 py-2 text-xs font-bold rounded-lg border-2 transition-all ${deliveryOption === 'retirada' ? 'border-red-600 bg-red-50 text-red-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}
											>
												Retirada local
											</button>
											<button
												onClick={() => {
													setDeliveryOption('entrega');
													if (userAddress && !currentDeliveryAddress) setCurrentDeliveryAddress(userAddress);
												}}
												className={`flex-1 py-2 text-xs font-bold rounded-lg border-2 transition-all ${deliveryOption === 'entrega' ? 'border-red-600 bg-red-50 text-red-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}
											>
												Com entrega
											</button>
										</div>

										{deliveryOption === 'entrega' && (
											<div className="mt-2">
												{currentDeliveryAddress ? (
													<>
														<p className="text-xs text-gray-700 mb-2 font-medium">{currentDeliveryAddress}</p>
														<button onClick={() => openModal('endereco')} className="text-red-600 text-xs font-bold hover:underline flex items-center gap-1"><Edit2 size={10} /> Trocar endereço</button>
													</>
												) : (
													<button onClick={() => openModal('endereco')} className="text-red-600 text-xs font-bold hover:underline">Inserir endereço de entrega</button>
												)}
											</div>
										)}
									</div>
								)}

								<button
									onClick={() => {
										if (cart.length === 0) return alert('Adicione itens ao carrinho primeiro.');
										if (deliveryOption === 'entrega' && !currentDeliveryAddress) return alert('Por favor, insira o endereço de entrega antes de prosseguir.');
										setCurrentPage('pagamento');
									}}
									disabled={cart.length === 0}
									className="w-full bg-gray-900 hover:bg-black disabled:bg-gray-300 text-white font-bold py-3 rounded-xl shadow-md transition-all"
								>
									Ir para Pagamento
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	};

	const PaymentPage = () => {
		const [payMethod, setPayMethod] = useState('PIX');
		const taxaEntrega = deliveryOption === 'entrega' ? 7.00 : 0.00;
		const subtotal = cart.reduce((sum, item) => sum + item.price, 0);
		const total = subtotal + taxaEntrega;

		const methods = [
			{ id: 'PIX', icon: Smartphone, title: 'PIX', desc: 'Aprovação imediata' },
			{ id: 'Credito', icon: CreditCard, title: 'Cartão de Crédito', desc: 'Em até 3x sem juros' },
			{ id: 'Debito', icon: CreditCard, title: 'Cartão de Débito', desc: 'Pagamento na entrega' },
			{ id: 'Dinheiro', icon: Banknote, title: 'Dinheiro', desc: 'Pagamento na entrega' },
			{ id: 'ValeRefeicao', icon: CreditCard, title: 'Vale Refeição', desc: 'Sodexo, Alelo, VR' }
		];

		return (
			<div className="max-w-5xl mx-auto p-6 animate-fade-in">
				<div className="mb-8">
					<h1 className="text-3xl font-bold text-gray-900 tracking-tight">Pagamento</h1>
					<p className="text-gray-600 mt-2">Revise seu pedido e escolha como pagar.</p>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
					<div>
						<h3 className="text-lg font-bold text-gray-900 mb-4">Forma de pagamento</h3>
						<div className="space-y-3">
							{methods.map(m => (
								<div
									key={m.id}
									onClick={() => setPayMethod(m.id)}
									className={`p-4 rounded-xl border-2 cursor-pointer flex items-center gap-4 transition-all ${payMethod === m.id ? 'border-red-600 bg-red-50' : 'border-gray-200 hover:bg-gray-50'}`}
								>
									<div className={`p-2 rounded-full ${payMethod === m.id ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
										<m.icon size={24} />
									</div>
									<div>
										<div className="font-bold text-gray-900">{m.title}</div>
										<div className="text-sm text-gray-500">{m.desc}</div>
									</div>
								</div>
							))}
						</div>

						<div className="mt-8 flex gap-4">
							<button
								onClick={() => setCurrentPage('pedido')}
								className="flex-1 bg-white border border-gray-300 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-50 transition-all"
							>
								Voltar
							</button>
							<button
								onClick={() => openModal('confirmacao', { payMethod, total })}
								className="flex-1 bg-red-600 text-white font-bold py-3 rounded-xl hover:bg-red-700 shadow-md transition-all"
							>
								Finalizar Pedido
							</button>
						</div>
					</div>

					<div>
						<div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
							<h3 className="text-lg font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4">Resumo do Pedido</h3>

							<div className="space-y-4 mb-6">
								{cart.map(item => (
									<div key={item.id} className="flex justify-between items-start text-sm">
										<div className="pr-4">
											<span className="font-bold text-gray-900">1x Pizza {item.size.nome}</span>
											<p className="text-gray-500 mt-1 line-clamp-2">{item.flavors.map(f => f.nome).join(', ')}</p>
										</div>
										<span className="font-medium text-gray-900 whitespace-nowrap">{formatCurrency(item.price)}</span>
									</div>
								))}
							</div>

							<div className="border-t border-dashed border-gray-200 pt-4 space-y-3">
								<div className="flex justify-between text-sm text-gray-600">
									<span>Subtotal</span>
									<span>{formatCurrency(subtotal)}</span>
								</div>

								{deliveryOption === 'entrega' && (
									<div className="flex justify-between text-sm text-gray-600">
										<span>Taxa de Entrega</span>
										<span>{formatCurrency(taxaEntrega)}</span>
									</div>
								)}

								<div className="flex justify-between items-center pt-4 mt-2 border-t border-gray-100">
									<span className="font-bold text-gray-900 text-lg">Total</span>
									<span className="font-bold text-red-700 text-2xl">{formatCurrency(total)}</span>
								</div>
							</div>

							<div className="mt-6 bg-gray-50 p-4 rounded-xl text-sm text-gray-600 border border-gray-100">
								<span className="font-semibold block mb-1 text-gray-900">
									{deliveryOption === 'entrega' ? 'Endereço de Entrega:' : 'Retirar no Local:'}
								</span>
								{deliveryOption === 'entrega' ? currentDeliveryAddress : 'Avenida da Pizzaria Della Vita, 123 — Centro, Pelotas/RS'}
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	};

	const HistoryPage = () => {
		return (
			<div className="max-w-5xl mx-auto p-6 animate-fade-in">
				<div className="mb-8">
					<h1 className="text-3xl font-bold text-gray-900 tracking-tight">Meus Pedidos</h1>
					<p className="text-gray-600 mt-2">Acompanhe seus pedidos e refaça seus favoritos.</p>
				</div>

				<div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
					<div className="overflow-x-auto">
						<table className="w-full text-left text-sm">
							<thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-200 uppercase tracking-wider text-xs">
								<tr>
									<th className="p-4 px-6">Data</th>
									<th className="p-4 px-6">Itens</th>
									<th className="p-4 px-6">Status</th>
									<th className="p-4 px-6 text-right">Total</th>
									<th className="p-4 px-6"></th>
								</tr>
							</thead>
							<tbody className="divide-y divide-gray-100">
								{historico.length === 0 ? (
									<tr><td colSpan="5" className="p-8 text-center text-gray-500">Nenhum pedido no histórico.</td></tr>
								) : historico.map(hist => (
									<tr key={hist.id} className="hover:bg-gray-50 transition-colors"> {/* AQUI: Vinculado ao campo id (Long) do backend */}
										<td className="p-4 px-6 whitespace-nowrap text-gray-900">{hist.data_hora}</td> {/* AQUI: Ajustado para data_hora */}
										<td className="p-4 px-6 text-gray-600 max-w-xs truncate">
											{hist.pizzas ? hist.pizzas.map(p => `Pizza ${p.tamanho}`).join(', ') : 'Sem itens'} {/* AQUI */}
										</td>
										<td className="p-4 px-6">
											<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
												{hist.estado}
											</span>
										</td>
										<td className="p-4 px-6 text-right font-bold text-gray-900 whitespace-nowrap">
											{formatCurrency(hist.preco_total)} {/* AQUI: Mapeado para preco_total */}
										</td>
										<td className="p-4 px-6 text-right">
											<button
												onClick={() => {
													if (hist.pizzas) {
														const novosItens = hist.pizzas.map((pizza, index) => ({
															...pizza,
															id: Date.now() + index
														}));
														setCart([...cart, ...novosItens]);
														setCurrentPage('pedido');
													}
												}}
												className="text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg font-medium text-xs transition-colors whitespace-nowrap"
											>
												Pedir Novamente
											</button>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
			</div>
		);
	};


	const ProfilePage = () => {
		return (
			<div className="max-w-3xl mx-auto p-6 animate-fade-in">
				<div className="mb-8">
					<h1 className="text-3xl font-bold text-gray-900 tracking-tight">Meu Perfil</h1>
					<p className="text-gray-600 mt-2">Gerencie seus dados e preferências.</p>
				</div>

				<div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
					<div className="flex items-center gap-6 border-b border-gray-100 pb-8 mb-8">
						<div className="w-20 h-20 rounded-full bg-red-100 text-red-700 flex items-center justify-center text-3xl font-bold">
							{usuario?.nome?.charAt(0).toUpperCase()}
						</div>
						<div>
							<h2 className="text-2xl font-bold text-gray-900">{usuario?.nome}</h2>
							<p className="text-gray-500">Cliente</p>
						</div>
					</div>

					<div className="space-y-6">
						{[
							{ label: 'Nome', value: usuario?.nome, edit: true },
							{ label: 'E-mail (Login)', value: usuario?.login, edit: true },
							{ label: 'Senha', value: '••••••••', edit: true },
							{ label: 'CPF', value: usuario?.cpf },
							{ label: 'Gênero', value: usuario?.genero },
							{ label: 'Telefone', value: usuario?.telefone, edit: true },
							{ label: 'Endereço', value: userAddress || 'Nenhum endereço cadastrado', edit: true }
						].map((info, idx) => (
							<div key={idx} className="flex justify-between items-center">
								<div>
									<div className="text-sm font-medium text-gray-500">{info.label}</div>
									<div className="text-base text-gray-900 mt-1">{info.value}</div>
								</div>
								<button
									onClick={() => openModal('editar-perfil')}
									className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
								>
									<Edit2 size={18} />
								</button>
							</div>
						))}
					</div>

					<div className="mt-10 pt-8 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-3 gap-4">
						<button onClick={() => setCurrentPage('pedido')} className="bg-red-600 hover:bg-red-700 text-white font-medium py-2.5 rounded-xl transition-colors">
							Novo Pedido
						</button>
						<button onClick={() => setCurrentPage('pedidos')} className="bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium py-2.5 rounded-xl transition-colors">
							Ver Histórico
						</button>
						<button onClick={() => openModal('excluir')} className="border border-red-200 text-red-600 hover:bg-red-50 font-medium py-2.5 rounded-xl transition-colors">
							Excluir Conta
						</button>
					</div>
				</div>
			</div>
		);
	};

	const Modals = () => {
		const [tempAddress, setTempAddress] = useState('');
		const [saveAsDefault, setSaveAsDefault] = useState(false);
		const [perfilForm, setPerfilForm] = useState({ nome: '', login: '', telefone: '', endereco: '', senha: '', confirmarSenha: '' });
		const [erroPerfil, setErroPerfil] = useState('');
		const [salvandoPerfil, setSalvandoPerfil] = useState(false);

		useEffect(() => {
			if (modal.type === 'endereco') {
				setTempAddress(currentDeliveryAddress || userAddress || '');
				setSaveAsDefault(false);
			}
			if (modal.type === 'editar-perfil') {
				setPerfilForm({
					nome: usuario?.nome || '',
					login: usuario?.login || '',
					telefone: usuario?.telefone || '',
					endereco: userAddress || '',
					senha: '',
					confirmarSenha: ''
				});
				setErroPerfil('');
			}
		}, [modal.isOpen, modal.type]);

		const handleFinalizarPost = async () => {
			const { payMethod, total } = modal.data;

			const novoPedido = {
				forma_pagamento: payMethod,
				endereco_entrega: deliveryOption === 'entrega' ? currentDeliveryAddress : null,
				pizzas: cart.map(item => ({
					tamanho: item.size.nome,
					preco: item.price,
					sabores_ids: item.flavors.map(f => f.id),
					borda_id: item.border ? item.border.id : null
				})),
				preco_total: parseFloat(total) // AQUI: Enviado como Double para o backend
			};

			try {
				const response = await fetch('http://localhost:8080/api/pedidos', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(novoPedido)
				});

				if (response.ok) {
					setCart([]);
					setCurrentPage('pedidos');
					closeModal();
				} else {
					alert("Ocorreu um erro ao processar o seu pedido.");
				}
			} catch (erro) {
				console.error("Falha ao enviar POST:", erro);
				alert("Ocorreu um erro de conexão. Tente novamente.");
			}
		};

		if (!modal.isOpen) return null;

		return (
			<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 animate-fade-in">
				<div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-slide-up">

					{modal.type === 'confirmacao' && (
						<div className="p-8 text-center">
							<h3 className="text-2xl font-bold text-gray-900 mb-2">Confirmar Pedido</h3>
							<p className="text-gray-600 mb-8">O valor total é de <b>{formatCurrency(modal.data.total)}</b>. Deseja finalizar?</p>
							<div className="flex gap-3">
								<button onClick={closeModal} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-3 rounded-xl transition-colors">Cancelar</button>
								<button onClick={handleFinalizarPost} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl transition-colors">Confirmar</button>
							</div>
						</div>
					)}

					{modal.type === 'endereco' && (
						<div className="p-6">
							<h3 className="text-xl font-bold text-gray-900 mb-4">Endereço de Entrega</h3>
							<div className="mb-4">
								<label className="block text-sm font-medium text-gray-700 mb-2">Informe o endereço completo</label>
								<input
									type="text"
									value={tempAddress}
									onChange={(e) => setTempAddress(e.target.value)}
									placeholder="Ex: Rua Assis Brasil, 123 - Centro"
									className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-red-600 focus:ring-4 focus:ring-red-600/10 transition-all"
								/>
							</div>
							<div className="flex items-center gap-2 mb-6">
								<input
									type="checkbox"
									id="saveDefault"
									checked={saveAsDefault}
									onChange={(e) => setSaveAsDefault(e.target.checked)}
									className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-600"
								/>
								<label htmlFor="saveDefault" className="text-sm text-gray-600 cursor-pointer">Salvar como meu endereço padrão</label>
							</div>
							<div className="flex gap-3 justify-end">
								<button onClick={closeModal} className="px-5 py-2.5 text-gray-600 font-medium hover:bg-gray-100 rounded-xl transition-colors">Cancelar</button>
								<button
									onClick={() => {
										if (!tempAddress.trim()) return alert('Preencha o endereço.');
										setCurrentDeliveryAddress(tempAddress);
										if (saveAsDefault) setUserAddress(tempAddress);
										closeModal();
									}}
									className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition-colors"
								>
									Confirmar Endereço
								</button>
							</div>
						</div>
					)}


					{modal.type === 'editar-perfil' && (
						<div className="p-6">
							<h3 className="text-xl font-bold text-gray-900 mb-4">Editar Perfil</h3>
							<div className="space-y-4">
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">Nome</label>
									<input type="text" value={perfilForm.nome} onChange={(e) => setPerfilForm({ ...perfilForm, nome: e.target.value })} className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-red-600 transition-all" />
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">E-mail (login)</label>
									<input type="email" value={perfilForm.login} onChange={(e) => setPerfilForm({ ...perfilForm, login: e.target.value })} className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-red-600 transition-all" />
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">Telefone</label>
									<input type="text" value={perfilForm.telefone} onChange={(e) => setPerfilForm({ ...perfilForm, telefone: e.target.value })} className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-red-600 transition-all" />
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">Endereço</label>
									<input type="text" value={perfilForm.endereco} onChange={(e) => setPerfilForm({ ...perfilForm, endereco: e.target.value })} className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-red-600 transition-all" />
								</div>
								<div className="grid grid-cols-2 gap-4">
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-2">Nova senha</label>
										<input type="password" value={perfilForm.senha} onChange={(e) => setPerfilForm({ ...perfilForm, senha: e.target.value })} placeholder="Deixe em branco p/ não alterar" className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-red-600 transition-all" />
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-2">Confirmar senha</label>
										<input type="password" value={perfilForm.confirmarSenha} onChange={(e) => setPerfilForm({ ...perfilForm, confirmarSenha: e.target.value })} className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-red-600 transition-all" />
									</div>
								</div>
								{erroPerfil && (
									<div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-2.5">{erroPerfil}</div>
								)}
							</div>
							<div className="flex gap-3 justify-end mt-6">
								<button onClick={closeModal} className="px-5 py-2.5 text-gray-600 font-medium hover:bg-gray-100 rounded-xl transition-colors">Cancelar</button>
								<button onClick={handleSalvarPerfil} disabled={salvandoPerfil} className="px-5 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white font-medium rounded-xl transition-colors">
									{salvandoPerfil ? 'Salvando...' : 'Salvar Alterações'}
								</button>
							</div>
						</div>
					)}

					{modal.type === 'excluir' && (
						<div className="p-6">
							<h3 className="text-xl font-bold text-red-600 mb-2">Excluir Conta</h3>
							<p className="text-gray-600 mb-6">Tem certeza que deseja excluir sua conta? Esta ação é permanente e você perderá todo o histórico de pedidos.</p>
							<div className="flex gap-3 justify-end">
								<button onClick={closeModal} className="px-5 py-2.5 text-gray-600 font-medium hover:bg-gray-100 rounded-xl transition-colors">Cancelar</button>
								<button onClick={() => alert('Conta excluída')} className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition-colors">Excluir Definitivamente</button>
							</div>
						</div>
					)}

				</div>
			</div>
		);
	};

	return (
		<div className="min-h-screen bg-gray-50/50 font-sans text-gray-900">

			<header className="sticky top-0 z-40 bg-red-700 text-white shadow-md">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 flex justify-between items-center h-16">

					<div className="flex items-center gap-3 cursor-pointer" onClick={() => setCurrentPage('cardapio')}>
						<div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-red-700 font-serif font-bold italic text-lg shadow-sm">
							DV
						</div>
						<div className="hidden sm:block">
							<div className="font-bold text-lg leading-tight tracking-tight">Pizzaria Della Vita</div>
							<div className="text-[10px] tracking-[0.2em] text-red-200 uppercase">Sabor Artesanal</div>
						</div>
					</div>

					<nav className="hidden md:flex gap-1 h-full">
						{[
							{ id: 'cardapio', label: 'Cardápio' },
							{ id: 'pedido', label: 'Fazer Pedido' },
							{ id: 'pedidos', label: 'Meus Pedidos' }
						].map(tab => (
							<button
								key={tab.id}
								onClick={() => setCurrentPage(tab.id)}
								className={`px-5 h-full flex items-center font-medium text-sm uppercase tracking-wide transition-all border-b-4 ${currentPage === tab.id ? 'border-white text-white' : 'border-transparent text-red-100 hover:bg-white/10'}`}
							>
								{tab.label}
							</button>
						))}
					</nav>

					<div className="flex items-center gap-4">
						<div
							onClick={() => setCurrentPage('perfil')}
							className="flex items-center gap-3 bg-black/10 hover:bg-black/20 px-3 py-1.5 rounded-full cursor-pointer transition-colors"
						>
							<div className="w-8 h-8 bg-white text-red-700 rounded-full flex items-center justify-center font-bold text-sm">
								{usuario?.nome?.charAt(0).toUpperCase()}
							</div>
							<div className="hidden lg:block text-sm">
								<div className="font-semibold leading-none">{usuario?.nome}</div>
								<div className="text-[11px] text-red-100 mt-0.5">Cliente</div>
							</div>
						</div>

						<button onClick={() => logout(navigate)} className="p-2 text-red-100 hover:text-white hover:bg-white/10 rounded-full transition-colors" title="Sair">
							<LogOut size={20} />
						</button>
					</div>
				</div>

				<nav className="md:hidden flex w-full border-t border-red-600/50 bg-red-700 overflow-x-auto">
					{[
						{ id: 'cardapio', label: 'Cardápio' },
						{ id: 'pedido', label: 'Pedido' },
						{ id: 'pedidos', label: 'Histórico' }
					].map(tab => (
						<button
							key={tab.id}
							onClick={() => setCurrentPage(tab.id)}
							className={`flex-1 py-3 text-xs font-medium uppercase tracking-wide transition-all border-b-2 ${currentPage === tab.id ? 'border-white text-white' : 'border-transparent text-red-200'}`}
						>
							{tab.label}
						</button>
					))}
				</nav>
			</header>

			<main className="pb-24">
				{currentPage === 'cardapio' && (
					<Cardapio
						sabores={sabores}
						isLoading={isLoading}
						formatCurrency={formatCurrency}
						onAdicionar={handleAdicionarSabor}
					/>
				)}
				{currentPage === 'pedido' && <OrderPage />}
				{currentPage === 'pagamento' && <PaymentPage />}
				{currentPage === 'pedidos' && <HistoryPage />}
				{currentPage === 'perfil' && <ProfilePage />}
			</main>

			<Modals />

		</div>
	);
}


const handleSalvarPerfil = async () => {
	if (!perfilForm.nome || !perfilForm.login || !perfilForm.telefone) {
		setErroPerfil('Preencha nome, e-mail e telefone.');
		return;
	}
	if (perfilForm.senha && perfilForm.senha.length < 6) {
		setErroPerfil('A nova senha deve ter pelo menos 6 caracteres.');
		return;
	}
	if (perfilForm.senha && perfilForm.senha !== perfilForm.confirmarSenha) {
		setErroPerfil('As senhas não coincidem.');
		return;
	}

	const payload = {
		nome: perfilForm.nome,
		login: perfilForm.login,
		telefone: perfilForm.telefone,
		endereco: perfilForm.endereco,
		genero: usuario?.genero
	};
	if (perfilForm.senha) payload.senha = perfilForm.senha;

	setSalvandoPerfil(true);
	setErroPerfil('');
	try {
		const response = await fetch(`http://localhost:8080/api/clientes/${usuario.cpf}`, {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(payload)
		});

		if (response.ok) {
			const atualizado = await response.json();
			setUsuario(atualizado);
			salvarUsuarioLogado(atualizado);
			setUserAddress(atualizado.endereco || '');
			closeModal();
		} else if (response.status === 409) {
			setErroPerfil('Já existe um cadastro com este e-mail.');
		} else {
			setErroPerfil('Não foi possível salvar as alterações.');
		}
	} catch (erro) {
		console.error(erro);
		setErroPerfil('Erro de conexão com o servidor.');
	} finally {
		setSalvandoPerfil(false);
	}
};