import { useState } from "react";
import { toast } from "sonner";
import {
  Package, TrendingUp, TrendingDown, AlertTriangle, XCircle,
  CheckCircle, Plus, Minus, Settings2, History, Search,
} from "lucide-react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { trpc } from "@/providers/trpc";
import Modal from "@/components/admin/Modal";

type StockItem = {
  id: number; name: string; unit: string;
  quantity: number; minStock: number; active: boolean;
  status: "ok" | "baixo" | "zerado";
};

type Movement = {
  id: number; productId: number; type: string;
  quantity: number; notes: string | null; createdAt: Date;
};

const MOVE_TYPES = [
  { key: "entrada", label: "Entrada",  icon: TrendingUp,   color: "text-green-600",  bg: "bg-green-50" },
  { key: "saída",   label: "Saída",    icon: TrendingDown, color: "text-red-500",    bg: "bg-red-50" },
  { key: "ajuste",  label: "Ajuste",   icon: Settings2,    color: "text-blue-600",   bg: "bg-blue-50" },
  { key: "perda",   label: "Perda",    icon: XCircle,      color: "text-orange-500", bg: "bg-orange-50" },
] as const;

function timeAgo(date: Date) {
  const diff = Date.now() - new Date(date).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 2) return "agora";
  if (m < 60) return `${m}min atrás`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h atrás`;
  return `${Math.floor(h / 24)}d atrás`;
}

export default function StockPage() {
  useAdminAuth();
  const utils = trpc.useUtils();
  const { data: items, isLoading } = trpc.admin.stock.summary.useQuery();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"" | "zerado" | "baixo" | "ok">("");
  const [selected, setSelected] = useState<StockItem | null>(null);
  const [tab, setTab] = useState<"movimentar" | "historico" | "minimo">("movimentar");

  const [moveType, setMoveType] = useState<"entrada" | "saída" | "ajuste" | "perda">("entrada");
  const [moveQty, setMoveQty] = useState("1");
  const [moveNotes, setMoveNotes] = useState("");
  const [minStockVal, setMinStockVal] = useState("0");

  const { data: movements } = trpc.admin.stock.listMovements.useQuery(
    { productId: selected?.id ?? 0 },
    { enabled: !!selected && tab === "historico" }
  );

  const moveMutation = trpc.admin.stock.addMovement.useMutation({
    onSuccess: (res) => {
      utils.admin.stock.summary.invalidate();
      utils.admin.stock.listMovements.invalidate({ productId: selected!.id });
      toast.success(`Estoque atualizado. Novo saldo: ${res.newQuantity} ${selected?.unit}`);
      setMoveQty("1"); setMoveNotes("");
      setSelected((s) => s ? { ...s, quantity: res.newQuantity } : s);
    },
    onError: (err) => toast.error(err.message),
  });

  const minMutation = trpc.admin.stock.setMinStock.useMutation({
    onSuccess: () => {
      utils.admin.stock.summary.invalidate();
      toast.success("Estoque mínimo atualizado!");
      setSelected((s) => s ? { ...s, minStock: Number(minStockVal) } : s);
    },
    onError: (err) => toast.error(err.message),
  });

  const openProduct = (item: StockItem) => {
    setSelected(item);
    setTab("movimentar");
    setMoveType("entrada"); setMoveQty("1"); setMoveNotes("");
    setMinStockVal(String(item.minStock));
  };

  const filtered = (items ?? []).filter((i) => {
    const matchSearch = i.name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !filterStatus || i.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const counts = {
    ok:     (items ?? []).filter((i) => i.status === "ok").length,
    baixo:  (items ?? []).filter((i) => i.status === "baixo").length,
    zerado: (items ?? []).filter((i) => i.status === "zerado").length,
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-[#1A1A1A]">Controle de Estoque</h2>
        <p className="text-sm text-[#6B6B6B] mt-0.5">Gerencie entradas, saídas e alertas dos seus materiais</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Em Dia",    count: counts.ok,     icon: CheckCircle,  color: "text-green-600", bg: "bg-green-50", key: "ok" },
          { label: "Estoque Baixo", count: counts.baixo, icon: AlertTriangle, color: "text-yellow-600", bg: "bg-yellow-50", key: "baixo" },
          { label: "Zerado",    count: counts.zerado, icon: XCircle,      color: "text-red-500",   bg: "bg-red-50",   key: "zerado" },
        ].map((c) => (
          <button key={c.key} onClick={() => setFilterStatus(filterStatus === c.key ? "" : c.key as any)}
            className={`rounded-xl border p-4 text-left transition-all ${filterStatus === c.key ? 'border-[#D4A74B] shadow-sm' : 'border-[#E5E2DE] bg-white'}`}>
            <div className={`w-9 h-9 rounded-lg ${c.bg} flex items-center justify-center mb-3`}>
              <c.icon className={`w-5 h-5 ${c.color}`} />
            </div>
            <p className="text-2xl font-bold text-[#1A1A1A]">{c.count}</p>
            <p className="text-xs text-[#6B6B6B] mt-0.5">{c.label}</p>
          </button>
        ))}
      </div>

      {/* Search + filter */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B6B6B]" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar produto..."
            className="w-full pl-9 pr-3 py-2.5 text-sm rounded-lg border border-[#E5E2DE] focus:outline-none focus:ring-2 focus:ring-[#D4A74B]/50" />
        </div>
      </div>

      {/* Product list */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-16 bg-white rounded-xl border border-[#E5E2DE] animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#E5E2DE] p-12 text-center">
          <Package className="w-10 h-10 mx-auto mb-3 text-[#E5E2DE]" />
          <p className="text-[#6B6B6B]">Nenhum produto encontrado.</p>
          <p className="text-xs text-[#6B6B6B] mt-1">Cadastre produtos no menu <strong>Produtos</strong> primeiro.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((item) => {
            const pct = item.minStock > 0
              ? Math.min(100, Math.round((item.quantity / (item.minStock * 2)) * 100))
              : item.quantity > 0 ? 100 : 0;
            const barColor = item.status === "zerado" ? "#EF4444" : item.status === "baixo" ? "#F59E0B" : "#22C55E";

            return (
              <div key={item.id}
                onClick={() => openProduct(item)}
                className="bg-white rounded-xl border border-[#E5E2DE] px-5 py-4 flex items-center gap-4 hover:shadow-sm transition-all cursor-pointer group">
                {/* Status dot */}
                <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${item.status === "ok" ? "bg-green-500" : item.status === "baixo" ? "bg-yellow-500" : "bg-red-500"}`} />

                {/* Name */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-[#1A1A1A] truncate">{item.name}</p>
                  {item.minStock > 0 && (
                    <div className="flex items-center gap-2 mt-1.5">
                      <div className="flex-1 h-1.5 bg-[#F5F3F0] rounded-full overflow-hidden max-w-[120px]">
                        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: barColor }} />
                      </div>
                      <span className="text-xs text-[#6B6B6B]">mín: {item.minStock} {item.unit}</span>
                    </div>
                  )}
                </div>

                {/* Quantity */}
                <div className="text-right shrink-0">
                  <p className="text-lg font-bold"
                    style={{ color: item.status === "ok" ? "#1A1A1A" : item.status === "baixo" ? "#D97706" : "#EF4444" }}>
                    {item.quantity}
                  </p>
                  <p className="text-xs text-[#6B6B6B]">{item.unit}</p>
                </div>

                {/* Status badge */}
                <div className="shrink-0 hidden sm:block">
                  {item.status === "ok"     && <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-green-100 text-green-700">Em dia</span>}
                  {item.status === "baixo"  && <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-yellow-100 text-yellow-700">Baixo</span>}
                  {item.status === "zerado" && <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-red-100 text-red-600">Zerado</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail Modal */}
      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title={selected?.name ?? ""}>
        {selected && (
          <div className="space-y-5">
            {/* Current stock */}
            <div className="flex items-center gap-4 bg-[#F5F3F0] rounded-xl p-4">
              <div className="text-center flex-1">
                <p className="text-3xl font-bold" style={{ color: selected.status === "ok" ? "#22C55E" : selected.status === "baixo" ? "#F59E0B" : "#EF4444" }}>
                  {selected.quantity}
                </p>
                <p className="text-xs text-[#6B6B6B] mt-0.5">{selected.unit} em estoque</p>
              </div>
              {selected.minStock > 0 && (
                <>
                  <div className="w-px h-10 bg-[#E5E2DE]" />
                  <div className="text-center flex-1">
                    <p className="text-3xl font-bold text-[#1A1A1A]">{selected.minStock}</p>
                    <p className="text-xs text-[#6B6B6B] mt-0.5">{selected.unit} mínimo</p>
                  </div>
                </>
              )}
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-[#F5F3F0] p-1 rounded-lg">
              {([["movimentar", "Movimentar"], ["historico", "Histórico"], ["minimo", "Estoque Mínimo"]] as const).map(([key, label]) => (
                <button key={key} onClick={() => setTab(key)}
                  className={`flex-1 text-xs font-medium py-2 rounded-md transition-all ${tab === key ? 'bg-white shadow-sm text-[#1A1A1A]' : 'text-[#6B6B6B] hover:text-[#1A1A1A]'}`}>
                  {label}
                </button>
              ))}
            </div>

            {/* Tab: Movimentar */}
            {tab === "movimentar" && (
              <div className="space-y-4">
                {/* Type selector */}
                <div className="grid grid-cols-2 gap-2">
                  {MOVE_TYPES.map((mt) => (
                    <button key={mt.key} onClick={() => setMoveType(mt.key)}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium transition-all ${moveType === mt.key ? mt.bg + ' border-transparent ' + mt.color : 'border-[#E5E2DE] text-[#6B6B6B]'}`}>
                      <mt.icon className="w-4 h-4" /> {mt.label}
                    </button>
                  ))}
                </div>

                {/* Quantity */}
                <div>
                  <label className="block text-sm font-medium text-[#1A1A1A] mb-1">Quantidade ({selected.unit})</label>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setMoveQty((v) => String(Math.max(1, Number(v) - 1)))}
                      className="w-10 h-10 rounded-lg border border-[#E5E2DE] flex items-center justify-center hover:bg-[#F5F3F0]">
                      <Minus className="w-4 h-4" />
                    </button>
                    <input type="number" min="1" value={moveQty} onChange={(e) => setMoveQty(e.target.value)}
                      className="flex-1 text-center text-lg font-bold px-3 py-2 rounded-lg border border-[#E5E2DE] focus:outline-none focus:ring-2 focus:ring-[#D4A74B]/50" />
                    <button onClick={() => setMoveQty((v) => String(Number(v) + 1))}
                      className="w-10 h-10 rounded-lg border border-[#E5E2DE] flex items-center justify-center hover:bg-[#F5F3F0]">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-[#1A1A1A] mb-1">
                    Observação <span className="font-normal text-[#6B6B6B]">(opcional)</span>
                  </label>
                  <input type="text" value={moveNotes} onChange={(e) => setMoveNotes(e.target.value)}
                    placeholder={moveType === "entrada" ? "Ex: Compra NF 1234, Fornecedor X" : moveType === "saída" ? "Ex: Projeto Rua das Flores 45" : moveType === "perda" ? "Ex: Sacos danificados pela chuva" : "Ex: Correção de contagem"}
                    className="w-full px-3 py-2.5 text-sm rounded-lg border border-[#E5E2DE] focus:outline-none focus:ring-2 focus:ring-[#D4A74B]/50" />
                </div>

                <button
                  onClick={() => moveMutation.mutate({ productId: selected.id, type: moveType, quantity: Number(moveQty), notes: moveNotes || undefined })}
                  disabled={moveMutation.isPending || Number(moveQty) < 1}
                  className="w-full text-sm font-semibold py-3 rounded-lg transition-all disabled:opacity-50"
                  style={{ backgroundColor: '#D4A74B', color: '#1A1A1A' }}>
                  {moveMutation.isPending ? "Registrando..." : `Registrar ${MOVE_TYPES.find((t) => t.key === moveType)?.label}`}
                </button>
              </div>
            )}

            {/* Tab: Histórico */}
            {tab === "historico" && (
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {!movements || movements.length === 0 ? (
                  <div className="text-center py-8">
                    <History className="w-8 h-8 mx-auto mb-2 text-[#E5E2DE]" />
                    <p className="text-sm text-[#6B6B6B]">Nenhuma movimentação registrada.</p>
                  </div>
                ) : movements.map((mv) => {
                  const mt = MOVE_TYPES.find((t) => t.key === mv.type);
                  return (
                    <div key={mv.id} className="flex items-start gap-3 p-3 rounded-lg bg-[#F5F3F0]">
                      <div className={`w-7 h-7 rounded-full ${mt?.bg ?? 'bg-gray-100'} flex items-center justify-center shrink-0 mt-0.5`}>
                        {mt && <mt.icon className={`w-3.5 h-3.5 ${mt.color}`} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className={`text-xs font-semibold ${mt?.color ?? 'text-[#6B6B6B]'}`}>{mt?.label ?? mv.type}</span>
                          <span className="text-xs text-[#6B6B6B] shrink-0">{timeAgo(mv.createdAt)}</span>
                        </div>
                        <p className="text-sm font-medium text-[#1A1A1A]">
                          {mv.type === "entrada" ? "+" : "-"}{mv.quantity} {selected.unit}
                        </p>
                        {mv.notes && <p className="text-xs text-[#6B6B6B] truncate mt-0.5">{mv.notes}</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Tab: Estoque Mínimo */}
            {tab === "minimo" && (
              <div className="space-y-4">
                <p className="text-sm text-[#6B6B6B]">
                  O sistema alerta quando o estoque cair abaixo deste valor. Use <strong>0</strong> para desativar o alerta.
                </p>
                <div>
                  <label className="block text-sm font-medium text-[#1A1A1A] mb-1">
                    Quantidade mínima ({selected.unit})
                  </label>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setMinStockVal((v) => String(Math.max(0, Number(v) - 1)))}
                      className="w-10 h-10 rounded-lg border border-[#E5E2DE] flex items-center justify-center hover:bg-[#F5F3F0]">
                      <Minus className="w-4 h-4" />
                    </button>
                    <input type="number" min="0" value={minStockVal} onChange={(e) => setMinStockVal(e.target.value)}
                      className="flex-1 text-center text-lg font-bold px-3 py-2 rounded-lg border border-[#E5E2DE] focus:outline-none focus:ring-2 focus:ring-[#D4A74B]/50" />
                    <button onClick={() => setMinStockVal((v) => String(Number(v) + 1))}
                      className="w-10 h-10 rounded-lg border border-[#E5E2DE] flex items-center justify-center hover:bg-[#F5F3F0]">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <button onClick={() => minMutation.mutate({ productId: selected.id, minStock: Number(minStockVal) })}
                  disabled={minMutation.isPending}
                  className="w-full text-sm font-semibold py-3 rounded-lg transition-all disabled:opacity-50"
                  style={{ backgroundColor: '#D4A74B', color: '#1A1A1A' }}>
                  {minMutation.isPending ? "Salvando..." : "Salvar Estoque Mínimo"}
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
