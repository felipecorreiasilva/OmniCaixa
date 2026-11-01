"use client";

import { useEffect, useState } from "react";
import { saleService, SalePayload } from "@/services/saleService";
import { DollarSign, FileText, Trash2, Search, AlertCircle, CheckCircle2, Clock } from "lucide-react";

export default function SalesPage() {
  const [sales, setSales] = useState<SalePayload[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSale, setSelectedSale] = useState<SalePayload | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // Carregar todas as vendas ao montar o componente
  useEffect(() => {
    loadSales();
  }, []);

  async function loadSales() {
    try {
      setLoading(true);
      const data = await saleService.getAllSales();
      setSales(data);
    } catch (error) {
      console.error("Erro ao carregar vendas:", error);
    } finally {
      setLoading(false);
    }
  }

  // Cancelar uma venda
  async function handleCancelSale(id?: number) {
    if (!id) return;

    const confirmed = window.confirm(`Tem certeza que deseja cancelar a venda #${id}? O stock será reposto.`);
    if (!confirmed) return;

    try {
      const response = await saleService.cancelSale(id);
      alert(response.message || "Venda cancelada com sucesso!");
      loadSales(); // Recarrega a lista
    } catch (error: any) {
      console.error("Erro ao cancelar venda:", error);
      alert(error.response?.data?.error || "Erro ao cancelar a venda.");
    }
  }

  // Visualizar detalhes de uma venda específica
  async function handleViewDetails(id?: number) {
    if (!id) return;

    try {
      const data = await saleService.getSaleById(id);
      setSelectedSale(data);
      setIsDetailsModalOpen(true);
    } catch (error) {
      console.error("Erro ao buscar detalhes da venda:", error);
      alert("Não foi possível carregar os detalhes da venda.");
    }
  }

  // Filtrar vendas pelo ID ou método de pagamento
  const filteredSales = sales.filter((sale) => {
    const term = searchTerm.toLowerCase();
    const matchesId = sale.id?.toString().includes(term);
    const matchesMethod = sale.payment_method.toLowerCase().includes(term);
    const matchesStatus = sale.status?.toLowerCase().includes(term);
    return matchesId || matchesMethod || matchesStatus;
  });

  return (
    <div className="flex-1 bg-zinc-950 p-6 min-h-screen text-white">
      {/* CABEÇALHO */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Histórico de Vendas</h1>
          <p className="text-zinc-400 text-sm">Consulte, analise ou cancele as vendas realizadas no PDV.</p>
        </div>

        {/* CAMPO DE PESQUISA */}
        <div className="relative flex items-center bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 w-full md:w-80">
          <Search size={18} className="text-zinc-400" />
          <input
            type="text"
            placeholder="Pesquisar por ID, método ou status..."
            className="bg-transparent border-none outline-none text-white text-sm ml-2 w-full placeholder-zinc-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* TABELA DE VENDAS */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-12 text-center text-zinc-500">A carregar vendas...</div>
        ) : filteredSales.length === 0 ? (
          <div className="p-12 text-center text-zinc-500">Nenhuma venda encontrada.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-400 text-xs uppercase bg-zinc-950/50">
                  <th className="p-4">ID</th>
                  <th className="p-4">Data</th>
                  <th className="p-4">Método</th>
                  <th className="p-4">Total</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 text-sm">
                {filteredSales.map((sale) => {
                  const isCancelled = sale.status === "CANCELADA";
                  const isPending = sale.status === "PENDENTE";

                  return (
                    <tr key={sale.id} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="p-4 font-mono font-semibold text-cyan-400">#{sale.id}</td>
                      <td className="p-4 text-zinc-300">
                        {sale.created_at ? new Date(sale.created_at).toLocaleString("pt-BR") : "-"}
                      </td>
                      <td className="p-4 capitalize text-zinc-300">{sale.payment_method}</td>
                      <td className="p-4 font-bold text-white">R$ {Number(sale.total_amount).toFixed(2)}</td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                            isCancelled
                              ? "bg-red-500/10 text-red-400 border border-red-500/20"
                              : isPending
                              ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                              : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          }`}
                        >
                          {isCancelled ? <AlertCircle size={12} /> : isPending ? <Clock size={12} /> : <CheckCircle2 size={12} />}
                          {sale.status || "CONCLUIDA"}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => handleViewDetails(sale.id)}
                          className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs font-medium transition-colors"
                        >
                          Detalhes
                        </button>
                        {!isCancelled && (
                          <button
                            onClick={() => handleCancelSale(sale.id)}
                            className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-lg text-xs font-medium transition-colors"
                          >
                            Cancelar
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL DE DETALHES DA VENDA */}
      {isDetailsModalOpen && selectedSale && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-lg p-6 shadow-2xl">
            <div className="flex justify-between items-center pb-4 border-b border-zinc-800">
              <h2 className="text-lg font-bold">Detalhes da Venda #{selectedSale.id}</h2>
              <button
                onClick={() => setIsDetailsModalOpen(false)}
                className="text-zinc-400 hover:text-white text-sm bg-zinc-800 px-2.5 py-1 rounded-lg"
              >
                Fechar
              </button>
            </div>

            <div className="my-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-zinc-400">Status:</span>
                <span className="font-semibold">{selectedSale.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Método de Pagamento:</span>
                <span className="capitalize">{selectedSale.payment_method}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Total Pago / Valor:</span>
                <span className="font-bold text-cyan-400">R$ {Number(selectedSale.total_amount).toFixed(2)}</span>
              </div>
              {selectedSale.txid && (
                <div className="flex justify-between">
                  <span className="text-zinc-400">TXID Pix:</span>
                  <span className="font-mono text-xs text-zinc-300">{selectedSale.txid}</span>
                </div>
              )}

              <div className="pt-3 border-t border-zinc-800">
                <p className="text-zinc-400 text-xs font-semibold uppercase mb-2">Itens da Venda</p>
                <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                  {selectedSale.items?.map((item: any, index: number) => (
                    <div key={index} className="flex justify-between items-center bg-zinc-950 p-2.5 rounded-xl border border-zinc-800/60">
                      <div>
                        <p className="font-medium text-xs text-white">{item.product_name || `Produto ID: ${item.product_id}`}</p>
                        <p className="text-[10px] text-zinc-400">Qtd: {item.quantity} x R$ {Number(item.unit_price).toFixed(2)}</p>
                      </div>
                      <p className="text-xs font-bold text-white">R$ {(item.quantity * item.unit_price).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-800 flex justify-end">
              <button
                onClick={() => setIsDetailsModalOpen(false)}
                className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors"
              >
                Concluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}