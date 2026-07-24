import React from 'react';

export default function Cardapio({ sabores, isLoading, formatCurrency, onAdicionar }) {
	return (
		<div className="max-w-5xl mx-auto p-6 animate-fade-in">
			<div className="mb-8">
				<h1 className="text-3xl font-bold text-gray-900 tracking-tight">Nosso Cardápio</h1>
				<p className="text-gray-600 mt-2">Escolha um sabor e adicione ao seu pedido.</p>
			</div>

			{isLoading ? (
				<div className="text-center py-10 text-gray-500">Carregando cardápio...</div>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					{sabores.map((sabor) => (
						<div key={sabor.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex hover:shadow-md transition-shadow">
							<div className="w-32 sm:w-40 bg-gray-200 shrink-0">
								<img src={sabor.img || 'https://via.placeholder.com/150'} alt={sabor.nome} className="w-full h-full object-cover" />
							</div>
							<div className="p-5 flex flex-col justify-between flex-1">
								<div>
									<h4 className="text-lg font-bold text-gray-900">{sabor.nome}</h4>
									<p className="text-sm text-gray-600 mt-1 line-clamp-2">
										{Array.isArray(sabor.ingredientes)
											? sabor.ingredientes.map(i => i.nome).join(', ')
											: sabor.ingredientes}
									</p>
								</div>
								<div className="mt-4 flex justify-between items-center">
									<span className="font-bold text-red-700">{formatCurrency(sabor.preco)}</span>
									<button
										onClick={() => onAdicionar(sabor)}
										className="text-red-700 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-full text-sm font-medium transition-colors"
									>
										+ Adicionar
									</button>
								</div>
							</div>
						</div>
					))}

					{sabores.length === 0 && (
						<div className="col-span-full text-center py-10 text-gray-500">
							Nenhum sabor disponível no momento.
						</div>
					)}
				</div>
			)}
		</div>
	);
}