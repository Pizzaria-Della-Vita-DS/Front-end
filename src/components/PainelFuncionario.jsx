// src/components/PainelFuncionario.jsx
import { getUsuarioLogado, salvarUsuarioLogado } from '../utils/auth';
import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
	ClipboardList,
	Pizza,
	CircleDashed,
	Box,
	LogOut,
	Search,
	Edit2,
	Trash2,
	RefreshCw,
	CheckCircle2,
	XCircle,
	X,
	Users,
	Clock
} from 'lucide-react';
import { montarPerfilFuncionario, salvarUsuarioLogado } from '../utils/auth';

const Modals = ({
	modal,
	closeModal,
	sabores, setSabores,
	bordas, setBordas,
	ingredientes, setIngredientes,
	pedidos, setPedidos,
	funcionariosAtivos, setFuncionariosAtivos,
	funcionariosPendentes, setFuncionariosPendentes,
	perfilFuncionario, onPerfilAtualizado
}) => {
	const [perfilForm, setPerfilForm] = useState({ nome: '', login: '', telefone: '', senha: '', confirmarSenha: '' });
	const [erroPerfil, setErroPerfil] = useState('');
	const [salvandoPerfil, setSalvandoPerfil] = useState(false);
	const [saborForm, setSaborForm] = useState({ nome: '', ingredientes: [], preco: '' });
	const [estadoForm, setEstadoForm] = useState('');
	const [ingredienteForm, setIngredienteForm] = useState({ nome: '' });

	const nomeInputRef = useRef(null);
	const [mensagemSucesso, setMensagemSucesso] = useState('');
	const [salvando, setSalvando] = useState(false);

	useMemo(() => {
		if (modal.type === 'sabor') {
			setSaborForm(modal.data ? { ...modal.data, preco: modal.data.preco.toString() } : { nome: '', ingredientes: [], preco: '' });
		}
		if (modal.type === 'estado-pedido') {
			setEstadoForm(modal.data?.estado || 'Preparando');
		}
		if (modal.type === 'ingrediente') {
			setIngredienteForm(modal.data ? { ...modal.data } : { nome: '' });
		}
		if (modal.type === 'editar-perfil-funcionario') {
			setPerfilForm({
				nome: perfilFuncionario?.nome || '',
				login: perfilFuncionario?.email || '',
				telefone: perfilFuncionario?.telefone || '',
				senha: '',
				confirmarSenha: ''
			});
			setErroPerfil('');
		}
		setMensagemSucesso(''); // limpa feedback de sucesso ao trocar/reabrir o modal
	}, [modal.isOpen, modal.data, modal.type]);

	useEffect(() => {
		if (modal.isOpen && (modal.type === 'sabor' || modal.type === 'ingrediente')) {
			const timer = setTimeout(() => {
				nomeInputRef.current?.focus();
				nomeInputRef.current?.select();
			}, 50); // pequeno delay para não perder o foco durante a animação de entrada do modal
			return () => clearTimeout(timer);
		}
	}, [modal.isOpen, modal.type]);

	const handleSaveSabor = async () => {
		if (!saborForm.nome || !saborForm.preco) return alert('Preencha os campos obrigatórios.');
		if (salvando) return;

		const payload = {
			nome: saborForm.nome,
			ingredientes_ids: saborForm.ingredientes.map(ing => ing.id || ing),
			preco: parseFloat(saborForm.preco)
		};

		setSalvando(true);
		try {
			const method = modal.data ? 'PUT' : 'POST';
			const url = modal.data ? `http://localhost:8080/api/sabores/${modal.data.id}` : 'http://localhost:8080/api/sabores';

			const response = await fetch(url, {
				method: method,
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload)
			});

			if (response.ok) {
				const saborSalvo = await response.json();
				if (modal.data) {
					setSabores(sabores.map(s => s.id === modal.data.id ? saborSalvo : s));
					closeModal(); // edição: fecha normalmente
				} else {
					setSabores([...sabores, saborSalvo]);
					setSaborForm({ nome: '', ingredientes: [], preco: '' });
					setMensagemSucesso(`"${saborSalvo.nome}" cadastrado!`);
					nomeInputRef.current?.focus();
				}
			} else {



				const handleSaveSabor = async () => {
					if (!saborForm.nome || !saborForm.preco) return alert('Preencha os campos obrigatórios.');
					if (salvando) return;

					const payload = {
						nome: saborForm.nome,
						ingredientes_ids: saborForm.ingredientes.map(ing => ing.id || ing),
						preco: parseFloat(saborForm.preco)
					};

					setSalvando(true);
					try {
						const method = modal.data ? 'PUT' : 'POST';
						const url = modal.data ? `http://localhost:8080/api/sabores/${modal.data.id}` : 'http://localhost:8080/api/sabores';

						const response = await fetch(url, {
							method: method,
							headers: { 'Content-Type': 'application/json' },
							body: JSON.stringify(payload)
						});

						if (response.ok) {
							const saborSalvo = await response.json();
							if (modal.data) {
								setSabores(sabores.map(s => s.id === modal.data.id ? saborSalvo : s));
								closeModal(); // edição: fecha normalmente
							} else {
								setSabores([...sabores, saborSalvo]);
								setSaborForm({ nome: '', ingredientes: [], preco: '' });
								setMensagemSucesso(`"${saborSalvo.nome}" cadastrado!`);
								nomeInputRef.current?.focus();
							}
						} else {
							const erroBody = await response.json().catch(() => null);
							alert(erroBody?.mensagem || "Erro ao salvar o sabor na base de dados.");
						}
					} catch (erro) {
						console.error(erro);
						alert("Falha de conexão com a API.");
					} finally {
						setSalvando(false);
					}
				};

				const handleSaveIngrediente = async () => {
					if (!ingredienteForm.nome) return alert('Preencha o nome do ingrediente.');
					if (salvando) return;

					const payload = {
						nome: ingredienteForm.nome,
						disponivel: modal.data ? modal.data.disponivel : true
					};

					setSalvando(true);
					try {
						const method = modal.data ? 'PUT' : 'POST';
						const url = modal.data ? `http://localhost:8080/api/ingredientes/${modal.data.id}` : 'http://localhost:8080/api/ingredientes';

						const response = await fetch(url, {
							method: method,
							headers: { 'Content-Type': 'application/json' },
							body: JSON.stringify(payload)
						});

						if (response.ok) {
							const ingSalvo = await response.json();
							if (modal.data) {
								setIngredientes(ingredientes.map(i => i.id === modal.data.id ? ingSalvo : i));
								closeModal();
							} else {
								setIngredientes([...ingredientes, ingSalvo]);
								setIngredienteForm({ nome: '' });
								setMensagemSucesso(`"${ingSalvo.nome}" cadastrado! Pode inserir o próximo.`);
								nomeInputRef.current?.focus();
							}
						} else {
							const erroBody = await response.json().catch(() => null);
							alert(erroBody?.mensagem || "Erro ao salvar o ingrediente na base de dados.");
						}
					} catch (erro) {
						console.error(erro);
						alert("Falha de conexão com a API.");
					} finally {
						setSalvando(false);
					}
				};



			}
		} catch (erro) {
			console.error(erro);
			alert("Falha de conexão com a API.");
		} finally {
			setSalvando(false);
		}
	};

	const handleSaveIngrediente = async () => {
		if (!ingredienteForm.nome) return alert('Preencha o nome do ingrediente.');
		if (salvando) return;

		const payload = {
			nome: ingredienteForm.nome,
			disponivel: modal.data ? modal.data.disponivel : true
		};

		setSalvando(true);
		try {
			const method = modal.data ? 'PUT' : 'POST';
			const url = modal.data ? `http://localhost:8080/api/ingredientes/${modal.data.id}` : 'http://localhost:8080/api/ingredientes';

			const response = await fetch(url, {
				method: method,
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload)
			});

			if (response.ok) {
				const ingSalvo = await response.json();
				if (modal.data) {
					setIngredientes(ingredientes.map(i => i.id === modal.data.id ? ingSalvo : i));
					closeModal();
				} else {
					setIngredientes([...ingredientes, ingSalvo]);
					setIngredienteForm({ nome: '' });
					setMensagemSucesso(`"${ingSalvo.nome}" cadastrado! Pode inserir o próximo.`);
					nomeInputRef.current?.focus();
				}
			} else {
				alert("Erro ao salvar o ingrediente na base de dados.");
			}
		} catch (erro) {
			console.error(erro);
			alert("Falha de conexão com a API.");
		} finally {
			setSalvando(false);
		}
	};

	const handleUpdateStatus = async () => {
		try {
			const response = await fetch(`http://localhost:8080/api/pedidos/${modal.data.id}/estado`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ estado: estadoForm })
			});

			if (response.ok) {
				setPedidos(pedidos.map(p => p.id === modal.data.id ? { ...p, estado: estadoForm } : p));
				closeModal();
			} else {
				alert("Erro ao atualizar o estado.");
			}
		} catch (erro) {
			alert("Falha de conexão com a API.");
		}
	};

	const handleDelete = async () => {
		try {
			let endpoint = '';
			if (modal.data.recurso === 'sabor') endpoint = `/api/sabores/${modal.data.id}`;
			if (modal.data.recurso === 'borda') endpoint = `/api/bordas/${modal.data.id}`;
			if (modal.data.recurso === 'ingrediente') endpoint = `/api/ingredientes/${modal.data.id}`;
			if (modal.data.recurso === 'funcionario') endpoint = `/api/funcionarios/${modal.data.cpf}`;

			const response = await fetch(`http://localhost:8080${endpoint}`, { method: 'DELETE' });

			if (response.ok) {
				if (modal.data.recurso === 'sabor') setSabores(sabores.filter(s => s.id !== modal.data.id));
				if (modal.data.recurso === 'borda') setBordas(bordas.filter(b => b.id !== modal.data.id));
				if (modal.data.recurso === 'ingrediente') setIngredientes(ingredientes.filter(i => i.id !== modal.data.id));
				if (modal.data.recurso === 'funcionario') setFuncionariosAtivos(funcionariosAtivos.filter(f => f.cpf !== modal.data.cpf));
				closeModal();
			} else {
				alert("Não foi possível excluir o registo. Pode estar a ser usado noutros locais.");
			}
		} catch (erro) {
			alert("Falha de conexão com a API.");
		}
	};

	const handleAprovarFuncionario = async () => {
		try {
			const response = await fetch(`http://localhost:8080/api/funcionarios/${modal.data.cpf}/aprovar`, {
				method: 'PATCH'
			});

			if (response.ok) {
				const funcionarioAprovado = await response.json();
				setFuncionariosPendentes(funcionariosPendentes.filter(f => f.cpf !== modal.data.cpf));
				setFuncionariosAtivos([...funcionariosAtivos, funcionarioAprovado]);
				closeModal();
			} else {
				alert("Não foi possível aprovar o cadastro.");
			}
		} catch (erro) {
			alert("Falha de conexão com a API.");
		}
	};

	const handleRecusarFuncionario = async () => {
		try {
			const response = await fetch(`http://localhost:8080/api/funcionarios/${modal.data.cpf}/recusar`, {
				method: 'DELETE'
			});

			if (response.ok) {
				setFuncionariosPendentes(funcionariosPendentes.filter(f => f.cpf !== modal.data.cpf));
				closeModal();
			} else {
				alert("Não foi possível recusar a solicitação.");
			}
		} catch (erro) {
			alert("Falha de conexão com a API.");
		}
	};

	const toggleIngredienteNoSabor = (ingredienteId) => {
		const temIngrediente = saborForm.ingredientes.find(i => i.id === ingredienteId || i === ingredienteId);
		if (temIngrediente) {
			setSaborForm({ ...saborForm, ingredientes: saborForm.ingredientes.filter(i => (i.id || i) !== ingredienteId) });
		} else {
			setSaborForm({ ...saborForm, ingredientes: [...saborForm.ingredientes, ingredienteId] });
		}
	};

	const getEstadoColor = (estado) => {
		const colors = {
			'Preparando': 'bg-amber-100 text-amber-800',
			'Confirmando Pedido': 'bg-blue-100 text-blue-800',
			'Em rota': 'bg-blue-100 text-blue-800',
			'Entregue': 'bg-green-100 text-green-800',
			'Finalizado': 'bg-green-100 text-green-800',
			'Cancelado': 'bg-red-100 text-red-800'
		};
		return colors[estado] || 'bg-gray-100 text-gray-800';
	};

	if (!modal.isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 animate-fade-in">
			<div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-slide-up flex flex-col max-h-[90vh]">
				<div className="flex justify-between items-center p-6 border-b border-gray-100">
					<h3 className="text-xl font-bold text-gray-900">
						{modal.type === 'sabor' && (modal.data ? 'Editar Sabor' : 'Novo Sabor')}
						{modal.type === 'estado-pedido' && 'Atualizar Estado do Pedido'}
						{modal.type === 'detalhes-pedido' && 'Detalhes do Pedido'}
						{modal.type === 'excluir' && 'Excluir Registo'}
						{modal.type === 'ingrediente' && (modal.data ? 'Editar Ingrediente' : 'Novo Ingrediente')}
						{modal.type === 'aprovar-funcionario' && 'Aprovar Cadastro de Funcionário'}
						{modal.type === 'recusar-funcionario' && 'Recusar Solicitação'}
						{modal.type === 'editar-perfil-funcionario' && 'Editar Perfil'}
						{['borda'].includes(modal.type) && 'Funcionalidade em construção'}
					</h3>
					<button onClick={closeModal} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
				</div>

				<div className="p-6 overflow-y-auto">
					<div className="p-6 overflow-y-auto">
						{mensagemSucesso && (
							<div className="mb-4 flex items-center gap-2 text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-xl px-4 py-2 animate-fade-in">
								<CheckCircle2 size={16} />
								{mensagemSucesso}
							</div>
						)}
						{modal.type === 'sabor' && (
							<div className="space-y-4">
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">Nome da Pizza *</label>
									<input
										type="text"
										ref={nomeInputRef}
										value={saborForm.nome}
										onChange={e => setSaborForm({ ...saborForm, nome: e.target.value })}
										onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleSaveSabor(); } }}
										className="w-full border-2 border-gray-200 rounded-xl px-4 py-2 outline-none focus:border-red-600 transition-colors"
										placeholder="Ex: Bacon com Cheddar"
									/>
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">Ingredientes (Selecione do Estoque)</label>
									<div className="border-2 border-gray-200 rounded-xl p-3 max-h-40 overflow-y-auto grid grid-cols-2 gap-2">
										{ingredientes.map(ing => {
											const isChecked = saborForm.ingredientes.some(i => (i.id || i) === ing.id);
											return (
												<label key={ing.id} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
													<input type="checkbox" checked={isChecked} onChange={() => toggleIngredienteNoSabor(ing.id)} className="text-red-600 focus:ring-red-600 rounded" />
													{ing.nome}
												</label>
											);
										})}
									</div>
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">Preço Base (R$) *</label>
									<input type="number" step="0.01" value={saborForm.preco} onChange={e => setSaborForm({ ...saborForm, preco: e.target.value })} className="w-full border-2 border-gray-200 rounded-xl px-4 py-2 outline-none focus:border-red-600 transition-colors" placeholder="0.00" />
								</div>
							</div>
						)}

						{modal.type === 'ingrediente' && (
							<div className="space-y-4">
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">Nome do Ingrediente *</label>
									<input
										type="text"
										ref={nomeInputRef}
										value={ingredienteForm.nome}
										onChange={e => setIngredienteForm({ ...ingredienteForm, nome: e.target.value })}
										onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleSaveIngrediente(); } }}
										className="w-full border-2 border-gray-200 rounded-xl px-4 py-2 outline-none focus:border-red-600 transition-colors"
										placeholder="Ex: Queijo Mussarela"
									/>
								</div>
								<div>
								</div>
							</div>
						)}

						{modal.type === 'estado-pedido' && (
							<div className="space-y-4">
								<p className="text-gray-600 text-sm">Atualizando o pedido do cliente <b>{modal.data.cliente}</b>.</p>
								<select value={estadoForm} onChange={(e) => setEstadoForm(e.target.value)} className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-red-600 bg-white">
									<option value="Confirmando Pedido">Confirmando Pedido</option>
									<option value="Preparando">Preparando</option>
									<option value="Em rota">Em rota</option>
									<option value="Entregue">Entregue</option>
									<option value="Finalizado">Finalizado</option>
									<option value="Cancelado">Cancelado</option>
								</select>
							</div>
						)}

						{modal.type === 'detalhes-pedido' && (
							<div className="space-y-3 text-sm text-gray-700">
								<div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
									<div className="mb-2"><span className="font-semibold text-gray-900">Cliente:</span> {modal.data.cliente}</div>
									<div className="mb-2"><span className="font-semibold text-gray-900">Itens:</span> {modal.data.itens}</div>
									<div className="mb-2"><span className="font-semibold text-gray-900">Data/Hora:</span> {modal.data.data_hora}</div>
									<div><span className="font-semibold text-gray-900">Status atual:</span> <span className={`inline-flex px-2 py-0.5 rounded text-xs ${getEstadoColor(modal.data.estado)}`}>{modal.data.estado}</span></div>
								</div>
							</div>
						)}

						{modal.type === 'excluir' && (
							<div>
								<p className="text-gray-600 mb-2">Tem certeza que deseja excluir <b>{modal.data.nome}</b>?</p>
								<p className="text-sm text-red-600 font-medium">Esta ação não poderá ser desfeita.</p>
							</div>
						)}

						{modal.type === 'aprovar-funcionario' && (
							<div>
								<p className="text-gray-600 mb-2">
									Aprovar o cadastro de <b>{modal.data.nome}</b> como <b>{modal.data.funcao}</b>?
								</p>
								<p className="text-sm text-gray-500">
									Após a aprovação, o funcionário poderá acessar o sistema com o e-mail e senha cadastrados.
								</p>
							</div>
						)}

						{modal.type === 'recusar-funcionario' && (
							<div>
								<p className="text-gray-600 mb-2">
									Recusar a solicitação de cadastro de <b>{modal.data.nome}</b>?
								</p>
								<p className="text-sm text-red-600 font-medium">
									A solicitação será excluída. Para tentar novamente, o funcionário precisará se cadastrar do zero.
								</p>
							</div>
						)}

						{modal.type === 'editar-perfil-funcionario' && (
							<div className="space-y-4">
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
									<input type="text" value={perfilForm.nome} onChange={(e) => setPerfilForm({ ...perfilForm, nome: e.target.value })} className="w-full border-2 border-gray-200 rounded-xl px-4 py-2 outline-none focus:border-red-600 transition-colors" />
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">E-mail (login)</label>
									<input type="email" value={perfilForm.login} onChange={(e) => setPerfilForm({ ...perfilForm, login: e.target.value })} className="w-full border-2 border-gray-200 rounded-xl px-4 py-2 outline-none focus:border-red-600 transition-colors" />
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
									<input type="text" value={perfilForm.telefone} onChange={(e) => setPerfilForm({ ...perfilForm, telefone: e.target.value })} className="w-full border-2 border-gray-200 rounded-xl px-4 py-2 outline-none focus:border-red-600 transition-colors" />
								</div>
								<div className="grid grid-cols-2 gap-4">
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-1">Nova senha</label>
										<input type="password" value={perfilForm.senha} onChange={(e) => setPerfilForm({ ...perfilForm, senha: e.target.value })} placeholder="Deixe em branco p/ não alterar" className="w-full border-2 border-gray-200 rounded-xl px-4 py-2 outline-none focus:border-red-600 transition-colors" />
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-1">Confirmar senha</label>
										<input type="password" value={perfilForm.confirmarSenha} onChange={(e) => setPerfilForm({ ...perfilForm, confirmarSenha: e.target.value })} className="w-full border-2 border-gray-200 rounded-xl px-4 py-2 outline-none focus:border-red-600 transition-colors" />
									</div>
								</div>
								{erroPerfil && (
									<div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-2.5">{erroPerfil}</div>
								)}
							</div>
						)}
					</div>

					<div className="p-6 border-t border-gray-100 flex gap-3 justify-end bg-gray-50">
						<button onClick={closeModal} className="px-5 py-2.5 text-gray-600 font-medium hover:bg-gray-200 rounded-xl transition-colors">Cancelar</button>

						{modal.type === 'sabor' && <button onClick={handleSaveSabor} className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition-colors shadow-sm">Salvar Sabor</button>}
						{modal.type === 'ingrediente' && <button onClick={handleSaveIngrediente} className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition-colors shadow-sm">Salvar Ingrediente</button>}
						{modal.type === 'estado-pedido' && <button onClick={handleUpdateStatus} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors shadow-sm">Atualizar Estado</button>}
						{modal.type === 'excluir' && <button onClick={handleDelete} className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition-colors shadow-sm">Sim, excluir</button>}
						{modal.type === 'detalhes-pedido' && <button onClick={closeModal} className="px-5 py-2.5 bg-gray-900 hover:bg-black text-white font-medium rounded-xl transition-colors">Fechar</button>}
						{modal.type === 'aprovar-funcionario' && <button onClick={handleAprovarFuncionario} className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl transition-colors shadow-sm">Sim, aprovar</button>}
						{modal.type === 'recusar-funcionario' && <button onClick={handleRecusarFuncionario} className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition-colors shadow-sm">Sim, recusar</button>}
						{modal.type === 'editar-perfil-funcionario' && <button onClick={handleSalvarPerfilFuncionario} disabled={salvandoPerfil} className="px-5 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white font-medium rounded-xl transition-colors shadow-sm">{salvandoPerfil ? 'Salvando...' : 'Salvar Alterações'}</button>}
					</div>
				</div>
			</div>
		</div>
	);
};

export default function PainelFuncionario({
	isGerente = false,
	perfil = {
		nome: 'João Pereira',
		inicial: 'J',
		tipoLabel: 'Funcionário',
		cargo: 'Pizzaiolo',
		email: 'joao.pereira@pizzaria.com',
		cpf: '111.222.333-44',
		telefone: '(53) 99999-8888',
		dataNascimento: '15/04/1985',
		rg: '3456789012',
		genero: 'Masculino',
		setor: 'Cozinha'
	},
	onLogout = () => { }
} = {}) {
	const [currentPage, setCurrentPage] = useState('pedidos');
	const [modal, setModal] = useState({ isOpen: false, type: null, data: null });

	const [sabores, setSabores] = useState([]);
	const [bordas, setBordas] = useState([]);
	const [ingredientes, setIngredientes] = useState([]);
	const [pedidos, setPedidos] = useState([]);
	const [isLoading, setIsLoading] = useState(true);

	const [searchPedidos, setSearchPedidos] = useState('');
	const [searchSabores, setSearchSabores] = useState('');
	const [searchIngredientes, setSearchIngredientes] = useState('');

	// Só relevante para o Gerente: funcionários já avaliados e fila de aprovação.
	const [funcionariosAtivos, setFuncionariosAtivos] = useState([]);
	const [funcionariosPendentes, setFuncionariosPendentes] = useState([]);
	const [searchFuncionarios, setSearchFuncionarios] = useState('');

	const [perfilOverride, setPerfilOverride] = useState(null);
	const perfilExibido = perfilOverride || perfil;
	const usuarioRaw = getUsuarioLogado();

	const handlePerfilAtualizado = (atualizado) => {
		salvarUsuarioLogado(atualizado);
		setPerfilOverride({
			...perfilExibido,
			nome: atualizado.nome,
			email: atualizado.login,
			telefone: atualizado.telefone,
			inicial: atualizado.nome ? atualizado.nome.charAt(0).toUpperCase() : perfilExibido.inicial
		});
	};

	useEffect(() => {
		const carregarDadosDoPainel = async () => {
			try {
				const fetches = [
					fetch('http://localhost:8080/api/sabores'),
					fetch('http://localhost:8080/api/bordas'),
					fetch('http://localhost:8080/api/ingredientes'),
					fetch('http://localhost:8080/api/pedidos/ativos')
				];

				if (isGerente) {
					fetches.push(fetch('http://localhost:8080/api/funcionarios'));
					fetches.push(fetch('http://localhost:8080/api/funcionarios/pendentes'));
				}

				const [resSabores, resBordas, resIngredientes, resPedidos, resFuncionarios, resFuncionariosPendentes] = await Promise.all(fetches);

				if (resSabores.ok) setSabores(await resSabores.json());
				if (resBordas.ok) setBordas(await resBordas.json());
				if (resIngredientes.ok) setIngredientes(await resIngredientes.json());
				if (resPedidos.ok) setPedidos(await resPedidos.json());

				if (isGerente) {
					if (resFuncionarios?.ok) setFuncionariosAtivos(await resFuncionarios.json());
					if (resFuncionariosPendentes?.ok) setFuncionariosPendentes(await resFuncionariosPendentes.json());
				}

			} catch (erro) {
				console.error("Falha ao buscar dados do Painel:", erro);
			} finally {
				setIsLoading(false);
			}
		};

		carregarDadosDoPainel();
	}, [isGerente]);

	const formatCurrency = (val) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
	const openModal = (type, data = null) => setModal({ isOpen: true, type, data });
	const closeModal = () => setModal({ isOpen: false, type: null, data: null });

	const getEstadoColor = (estado) => {
		const colors = {
			'Preparando': 'bg-amber-100 text-amber-800',
			'Confirmando Pedido': 'bg-blue-100 text-blue-800',
			'Em rota': 'bg-blue-100 text-blue-800',
			'Entregue': 'bg-green-100 text-green-800',
			'Finalizado': 'bg-green-100 text-green-800',
			'Cancelado': 'bg-red-100 text-red-800'
		};
		return colors[estado] || 'bg-gray-100 text-gray-800';
	};

	const handleSalvarPerfilFuncionario = async () => {
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
			genero: perfilFuncionario?.genero,
			funcao: perfilFuncionario?.funcao,
			setor: perfilFuncionario?.setor
		};
		if (perfilForm.senha) payload.senha = perfilForm.senha;

		setSalvandoPerfil(true);
		setErroPerfil('');
		try {
			const response = await fetch(`http://localhost:8080/api/funcionarios/${perfilFuncionario.cpf}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload)
			});

			if (response.ok) {
				const atualizado = await response.json();
				onPerfilAtualizado(atualizado);
				closeModal();
			} else if (response.status === 409) {
				setErroPerfil('Já existe um cadastro com este e-mail.');
			} else {
				setErroPerfil('Não foi possível salvar as alterações.');
			}
		} catch (erro) {
			console.error(erro);
			setErroPerfil('Falha de conexão com a API.');
		} finally {
			setSalvandoPerfil(false);
		}
	};

	const handleToggleEstoque = async (ingrediente) => {
		const novaDisponibilidade = !ingrediente.disponivel;
		try {
			const res = await fetch(`http://localhost:8080/api/ingredientes/${ingrediente.id}/disponibilidade`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ disponivel: novaDisponibilidade })
			});

			if (res.ok) {
				setIngredientes(ingredientes.map(i => i.id === ingrediente.id ? { ...i, disponivel: novaDisponibilidade } : i));
			} else {
				alert("Erro ao alterar o stock no servidor.");
			}
		} catch (erro) {
			alert("Falha de conexão com a API.");
		}
	};

	const pedidosFiltrados = pedidos.filter(p => p.cliente.toLowerCase().includes(searchPedidos.toLowerCase()) || p.itens.toLowerCase().includes(searchPedidos.toLowerCase()));
	const saboresFiltrados = sabores.filter(s => s.nome.toLowerCase().includes(searchSabores.toLowerCase()));
	const ingredientesFiltrados = ingredientes.filter(i => i.nome.toLowerCase().includes(searchIngredientes.toLowerCase()));
	const funcionariosAtivosFiltrados = funcionariosAtivos.filter(f => f.nome.toLowerCase().includes(searchFuncionarios.toLowerCase()));

	return (
		<div className="min-h-screen bg-gray-50/50 font-sans text-gray-900">

			<header className="sticky top-0 z-40 bg-red-700 text-white shadow-md">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 flex justify-between items-center h-16">

					<div className="flex items-center gap-3">
						<div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-red-700 font-serif font-bold italic text-lg shadow-sm">DV</div>
						<div className="hidden sm:block">
							<div className="font-bold text-lg leading-tight tracking-tight">Pizzaria Della Vita</div>
							<div className="text-[10px] tracking-[0.2em] text-red-200 uppercase">Gestão Operacional</div>
						</div>
					</div>

					<nav className="hidden md:flex gap-1 h-full">
						{[
							{ id: 'pedidos', label: 'Pedidos', icon: ClipboardList },
							{ id: 'sabores', label: 'Sabores', icon: Pizza },
							{ id: 'bordas', label: 'Bordas', icon: CircleDashed },
							{ id: 'estoque', label: 'Estoque', icon: Box },
							...(isGerente ? [{ id: 'funcionarios', label: 'Funcionários', icon: Users }] : [])
						].map(tab => (
							<button
								key={tab.id}
								onClick={() => setCurrentPage(tab.id)}
								className={`px-4 h-full flex items-center gap-2 font-medium text-sm uppercase tracking-wide transition-all border-b-4 ${currentPage === tab.id ? 'border-white text-white' : 'border-transparent text-red-100 hover:bg-white/10'}`}
							>
								<tab.icon size={16} /> {tab.label}
							</button>
						))}
					</nav>

					<div className="flex items-center gap-4">
						<div onClick={() => setCurrentPage('perfil')} className="flex items-center gap-3 bg-black/10 hover:bg-black/20 px-3 py-1.5 rounded-full cursor-pointer transition-colors">
							<div className="w-8 h-8 bg-white text-red-700 rounded-full flex items-center justify-center font-bold text-sm">{perfilExibido.inicial}</div>
							<div className="hidden lg:block text-sm">
								<div className="font-semibold leading-none">{perfilExibido.nome}</div>
								<div className="text-[11px] text-red-100 mt-0.5">{perfilExibido.tipoLabel}</div>
							</div>
						</div>
						<button onClick={onLogout} className="p-2 text-red-100 hover:text-white hover:bg-white/10 rounded-full transition-colors" title="Sair">
							<LogOut size={20} />
						</button>
					</div>
				</div>

				<nav className="md:hidden flex w-full border-t border-red-600/50 bg-red-700 overflow-x-auto">
					{['pedidos', 'sabores', 'bordas', 'estoque', ...(isGerente ? ['funcionarios'] : [])].map(tab => (
						<button
							key={tab}
							onClick={() => setCurrentPage(tab)}
							className={`flex-1 py-3 text-xs font-medium uppercase tracking-wide transition-all border-b-2 ${currentPage === tab ? 'border-white text-white' : 'border-transparent text-red-200'}`}
						>
							{tab}
						</button>
					))}
				</nav>
			</header>

			<main className="pb-24">
				{isLoading ? (
					<div className="text-center py-20 text-gray-500 font-medium">A carregar dados operacionais...</div>
				) : (
					<>
						{currentPage === 'pedidos' && (
							<div className="max-w-6xl mx-auto p-6 animate-fade-in">
								<div className="mb-8">
									<h1 className="text-3xl font-bold text-gray-900 tracking-tight">Pedidos em Andamento</h1>
									<p className="text-gray-600 mt-2">Acompanhe e atualize a linha de produção (atualizado em tempo real).</p>
								</div>
								<div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
									<div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center">
										<div className="relative flex-1 max-w-md">
											<Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
											<input
												type="text"
												placeholder="Buscar por cliente ou item..."
												value={searchPedidos}
												onChange={(e) => setSearchPedidos(e.target.value)}
												className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-red-600 focus:ring-4 focus:ring-red-600/10 transition-all text-sm"
											/>
										</div>
									</div>
									<div className="overflow-x-auto">
										<table className="w-full text-left text-sm">
											<thead className="bg-white text-gray-500 font-medium border-b border-gray-200 uppercase tracking-wider text-xs">
												<tr>
													<th className="p-4 px-6">Data e Hora</th>
													<th className="p-4 px-6">Cliente</th>
													<th className="p-4 px-6">Itens</th>
													<th className="p-4 px-6 text-center">Estado (Clique para mudar)</th>
													<th className="p-4 px-6 text-right">Ações</th>
												</tr>
											</thead>
											<tbody className="divide-y divide-gray-100">
												{pedidosFiltrados.map(p => (
													<tr key={p.id} className="hover:bg-gray-50/80 transition-colors">
														<td className="p-4 px-6 font-medium text-gray-900">{p.data_hora}</td>
														<td className="p-4 px-6 font-bold text-gray-900">{p.cliente}</td>
														<td className="p-4 px-6 text-gray-600">{p.itens}</td>
														<td className="p-4 px-6 text-center">
															<button onClick={() => openModal('estado-pedido', p)} className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold hover:shadow-md transition-all cursor-pointer ${getEstadoColor(p.estado)}`}>
																{p.estado}
															</button>
														</td>
														<td className="p-4 px-6 text-right space-x-2">
															<button onClick={() => openModal('detalhes-pedido', p)} className="text-gray-600 hover:bg-gray-100 px-3 py-1.5 rounded-lg font-medium text-xs transition-colors">Detalhes</button>
														</td>
													</tr>
												))}
												{pedidosFiltrados.length === 0 && (
													<tr><td colSpan="5" className="p-8 text-center text-gray-500">Nenhum pedido encontrado.</td></tr>
												)}
											</tbody>
										</table>
									</div>
								</div>
							</div>
						)}

						{currentPage === 'sabores' && (
							<div className="max-w-6xl mx-auto p-6 animate-fade-in">
								<div className="mb-8 flex justify-between items-end">
									<div>
										<h1 className="text-3xl font-bold text-gray-900 tracking-tight">Gestão de Sabores</h1>
										<p className="text-gray-600 mt-2">Cadastre e atualize as pizzas do cardápio.</p>
									</div>
									<button onClick={() => openModal('sabor')} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 px-5 rounded-xl shadow-md transition-all flex items-center gap-2">
										<Pizza size={18} /> Novo Sabor
									</button>
								</div>
								<div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
									<div className="p-4 border-b border-gray-100 bg-gray-50">
										<div className="relative max-w-md">
											<Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
											<input
												type="text" placeholder="Buscar sabor..." value={searchSabores} onChange={(e) => setSearchSabores(e.target.value)}
												className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-red-600 focus:ring-4 focus:ring-red-600/10 transition-all text-sm"
											/>
										</div>
									</div>
									<table className="w-full text-left text-sm">
										<thead className="bg-white text-gray-500 font-medium border-b border-gray-200 uppercase tracking-wider text-xs">
											<tr>
												<th className="p-4 px-6 w-1/4">Sabor</th>
												<th className="p-4 px-6 text-right">Preço Base</th>
												<th className="p-4 px-6 text-right">Ações</th>
											</tr>
										</thead>
										<tbody className="divide-y divide-gray-100">
											{saboresFiltrados.map(s => (
												<tr key={s.id} className="hover:bg-gray-50 transition-colors">
													<td className="p-4 px-6 font-bold text-gray-900">{s.nome}</td>
													<td className="p-4 px-6 text-right font-bold text-gray-900">{formatCurrency(s.preco)}</td>
													<td className="p-4 px-6 text-right space-x-2">
														<button onClick={() => openModal('sabor', s)} className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-colors"><Edit2 size={16} /></button>
														<button onClick={() => openModal('excluir', { id: s.id, nome: s.nome, recurso: 'sabor' })} className="text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors"><Trash2 size={16} /></button>
													</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
							</div>
						)}

						{currentPage === 'bordas' && (
							<div className="max-w-4xl mx-auto p-6 animate-fade-in">
								<div className="mb-8 flex justify-between items-end">
									<div>
										<h1 className="text-3xl font-bold text-gray-900 tracking-tight">Opções de Borda</h1>
										<p className="text-gray-600 mt-2">Gerencie os valores de bordas (instanciadas como Sabores especiais).</p>
									</div>
									<button onClick={() => openModal('borda')} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 px-5 rounded-xl shadow-md transition-all flex items-center gap-2">
										<CircleDashed size={18} /> Nova Borda
									</button>
								</div>
								<div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
									<table className="w-full text-left text-sm">
										<thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200 uppercase tracking-wider text-xs">
											<tr>
												<th className="p-4 px-6">Tipo de Borda</th>
												<th className="p-4 px-6 text-right">Preço</th>
												<th className="p-4 px-6 text-right">Ações</th>
											</tr>
										</thead>
										<tbody className="divide-y divide-gray-100">
											{bordas.map(b => (
												<tr key={b.id} className="hover:bg-gray-50 transition-colors">
													<td className="p-4 px-6 font-bold text-gray-900">{b.nome}</td>
													<td className="p-4 px-6 text-right text-gray-600">{b.preco === 0 ? 'Sem custo' : `+ ${formatCurrency(b.preco)}`}</td>
													<td className="p-4 px-6 text-right space-x-2">
														<button onClick={() => openModal('borda', b)} className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-colors"><Edit2 size={16} /></button>
														<button onClick={() => openModal('excluir', { id: b.id, nome: b.nome, recurso: 'borda' })} className="text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors"><Trash2 size={16} /></button>
													</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
							</div>
						)}

						{currentPage === 'estoque' && (
							<div className="max-w-5xl mx-auto p-6 animate-fade-in">
								<div className="mb-8 flex justify-between items-end">
									<div>
										<h1 className="text-3xl font-bold text-gray-900 tracking-tight">Estoque de Ingredientes</h1>
										<p className="text-gray-600 mt-2">Controle o que está disponível na cozinha para formar as pizzas.</p>
									</div>
									<button onClick={() => openModal('ingrediente')} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 px-5 rounded-xl shadow-md transition-all flex items-center gap-2">
										<Box size={18} /> Novo Ingrediente
									</button>
								</div>
								<div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
									<div className="p-4 border-b border-gray-100 bg-gray-50">
										<div className="relative max-w-md">
											<Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
											<input
												type="text" placeholder="Buscar ingrediente..." value={searchIngredientes} onChange={(e) => setSearchIngredientes(e.target.value)}
												className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-red-600 focus:ring-4 focus:ring-red-600/10 transition-all text-sm"
											/>
										</div>
									</div>
									<table className="w-full text-left text-sm">
										<thead className="bg-white text-gray-500 font-medium border-b border-gray-200 uppercase tracking-wider text-xs">
											<tr>
												<th className="p-4 px-6">Ingrediente</th>
												<th className="p-4 px-6 text-center">Status</th>
												<th className="p-4 px-6 text-right">Ações</th>
											</tr>
										</thead>
										<tbody className="divide-y divide-gray-100">
											{ingredientesFiltrados.map(i => (
												<tr key={i.id} className="hover:bg-gray-50 transition-colors">
													<td className="p-4 px-6 font-bold text-gray-900">{i.nome}</td>
													<td className="p-4 px-6 text-center">
														{i.disponivel
															? <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800"><CheckCircle2 size={12} className="mr-1" /> Disponível</span>
															: <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800"><XCircle size={12} className="mr-1" /> Em falta</span>
														}
													</td>
													<td className="p-4 px-6 text-right space-x-2">
														<button onClick={() => handleToggleEstoque(i)} className={`px-3 py-1.5 rounded-lg font-medium text-xs transition-colors ${i.disponivel ? 'text-red-600 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'}`}>
															{i.disponivel ? 'Marcar falta' : 'Marcar reposto'}
														</button>
														<button onClick={() => openModal('ingrediente', i)} className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-colors"><Edit2 size={16} /></button>
														<button onClick={() => openModal('excluir', { id: i.id, nome: i.nome, recurso: 'ingrediente' })} className="text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors"><Trash2 size={16} /></button>
													</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
							</div>
						)}

						{currentPage === 'funcionarios' && isGerente && (
							<div className="max-w-6xl mx-auto p-6 animate-fade-in space-y-10">
								<div>
									<h1 className="text-3xl font-bold text-gray-900 tracking-tight">Gerenciar Funcionários</h1>
									<p className="text-gray-600 mt-2">Aprove solicitações de cadastro e administre a equipe.</p>
								</div>

								<div>
									<h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
										<Clock size={20} className="text-amber-600" /> Solicitações Pendentes
										{funcionariosPendentes.length > 0 && (
											<span className="bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-1 rounded-full">{funcionariosPendentes.length}</span>
										)}
									</h2>
									<div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
										<table className="w-full text-left text-sm">
											<thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200 uppercase tracking-wider text-xs">
												<tr>
													<th className="p-4 px-6">Nome</th>
													<th className="p-4 px-6">E-mail</th>
													<th className="p-4 px-6">Função</th>
													<th className="p-4 px-6">Setor</th>
													<th className="p-4 px-6 text-right">Ações</th>
												</tr>
											</thead>
											<tbody className="divide-y divide-gray-100">
												{funcionariosPendentes.map(f => (
													<tr key={f.cpf} className="hover:bg-gray-50 transition-colors">
														<td className="p-4 px-6 font-bold text-gray-900">{f.nome}</td>
														<td className="p-4 px-6 text-gray-600">{f.login}</td>
														<td className="p-4 px-6 text-gray-600">{f.funcao}</td>
														<td className="p-4 px-6 text-gray-600">{f.setor}</td>
														<td className="p-4 px-6 text-right space-x-2">
															<button onClick={() => openModal('aprovar-funcionario', f)} className="text-green-700 bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-lg font-medium text-xs transition-colors">Aprovar</button>
															<button onClick={() => openModal('recusar-funcionario', f)} className="text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg font-medium text-xs transition-colors">Recusar</button>
														</td>
													</tr>
												))}
												{funcionariosPendentes.length === 0 && (
													<tr><td colSpan="5" className="p-8 text-center text-gray-500">Nenhuma solicitação pendente.</td></tr>
												)}
											</tbody>
										</table>
									</div>
								</div>

								<div>
									<h2 className="text-xl font-bold text-gray-900 mb-4">Funcionários Cadastrados</h2>
									<div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
										<div className="p-4 border-b border-gray-100 bg-gray-50">
											<div className="relative max-w-md">
												<Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
												<input
													type="text" placeholder="Buscar funcionário..." value={searchFuncionarios} onChange={(e) => setSearchFuncionarios(e.target.value)}
													className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-red-600 focus:ring-4 focus:ring-red-600/10 transition-all text-sm"
												/>
											</div>
										</div>
										<table className="w-full text-left text-sm">
											<thead className="bg-white text-gray-500 font-medium border-b border-gray-200 uppercase tracking-wider text-xs">
												<tr>
													<th className="p-4 px-6">Nome</th>
													<th className="p-4 px-6">Função</th>
													<th className="p-4 px-6">Setor</th>
													<th className="p-4 px-6 text-center">Status</th>
													<th className="p-4 px-6 text-right">Ações</th>
												</tr>
											</thead>
											<tbody className="divide-y divide-gray-100">
												{funcionariosAtivosFiltrados.map(f => (
													<tr key={f.cpf} className="hover:bg-gray-50 transition-colors">
														<td className="p-4 px-6 font-bold text-gray-900">{f.nome}</td>
														<td className="p-4 px-6 text-gray-600">{f.funcao}</td>
														<td className="p-4 px-6 text-gray-600">{f.setor}</td>
														<td className="p-4 px-6 text-center">
															<span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${f.status === 'ATIVO' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
																{f.status}
															</span>
														</td>
														<td className="p-4 px-6 text-right">
															<button onClick={() => openModal('excluir', { cpf: f.cpf, nome: f.nome, recurso: 'funcionario' })} className="text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors"><Trash2 size={16} /></button>
														</td>
													</tr>
												))}
												{funcionariosAtivosFiltrados.length === 0 && (
													<tr><td colSpan="5" className="p-8 text-center text-gray-500">Nenhum funcionário cadastrado.</td></tr>
												)}
											</tbody>
										</table>
									</div>
								</div>
							</div>
						)}

						{currentPage === 'perfil' && (
							<div className="max-w-3xl mx-auto p-6 animate-fade-in">
								<div className="mb-8">
									<h1 className="text-3xl font-bold text-gray-900 tracking-tight">Meu Perfil</h1>
									<p className="text-gray-600 mt-2">Dados do colaborador.</p>
								</div>
								<div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
									<div className="flex items-center gap-6 border-b border-gray-100 pb-8 mb-8">
										<div className="w-20 h-20 rounded-full bg-red-100 text-red-700 flex items-center justify-center text-3xl font-bold">{perfilExibido.inicial}</div>
										<div>
											<h2 className="text-2xl font-bold text-gray-900">{perfilExibido.nome}</h2>
											<p className="text-gray-500 font-medium">{perfilExibido.cargo}</p>
										</div>
									</div>
									<div className="space-y-6">
										{[
											{ label: 'Nome', value: perfilExibido.nome, edit: true },
											{ label: 'E-mail (Login)', value: perfilExibido.email, edit: true },
											{ label: 'Senha', value: '••••••••', edit: true },
											{ label: 'CPF', value: perfilExibido.cpf },
											{ label: 'Telefone', value: perfilExibido.telefone, edit: true },
											{ label: 'Data de Nascimento', value: perfilExibido.dataNascimento },
											{ label: 'RG', value: perfilExibido.rg },
											{ label: 'Gênero', value: perfilExibido.genero },
											{ label: 'Setor', value: perfilExibido.setor }
										].map((info, idx) => (
											<div key={idx} className="flex justify-between items-center">
												<div>
													<div className="text-sm font-medium text-gray-500">{info.label}</div>
													<div className="text-base text-gray-900 mt-1">{info.value}</div>
												</div>
												{info.edit && (
													<button onClick={() => openModal('editar-perfil-funcionario')} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors">
														<Edit2 size={18} />
													</button>
												)}
											</div>
										))}
									</div>
								</div>
							</div>
						)}
					</>
				)}
			</main>

			<Modals
				modal={modal}
				closeModal={closeModal}
				sabores={sabores} setSabores={setSabores}
				bordas={bordas} setBordas={setBordas}
				ingredientes={ingredientes} setIngredientes={setIngredientes}
				pedidos={pedidos} setPedidos={setPedidos}
				funcionariosAtivos={funcionariosAtivos} setFuncionariosAtivos={setFuncionariosAtivos}
				funcionariosPendentes={funcionariosPendentes} setFuncionariosPendentes={setFuncionariosPendentes}
				perfilFuncionario={{ ...perfilExibido, cpf: usuarioRaw?.cpf, funcao: usuarioRaw?.funcao }}
				onPerfilAtualizado={handlePerfilAtualizado}
			/>
		</div>
	);
}