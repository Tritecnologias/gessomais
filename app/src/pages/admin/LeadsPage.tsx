import { useState } from "react";
import { toast } from "sonner";
import { Phone, Mail, Wrench, Eye, Trash2, Filter, DollarSign, StickyNote } from "lucide-react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { trpc } from "@/providers/trpc";
import Modal from "@/components/admin/Modal";

type Lead = {
  id: number; name: string; phone: string; email: string | null;
  service: string | null; message: string | null; status: string;
  value: string | null; notes: string | null; read: boolean; createdAt: Date; updatedAt: Date;
};

const STATUSES = [
  { key: "novo",               label: "Novo",               color: "bg-blue-100 text-blue-700" },
  { key: "em_contato",         label: "Em Contato",         color: "bg-yellow-100 text-yellow-700" },
  { key: "orcamento_enviado",  label: "Orçamento Enviado",  color: "bg-purple-100 text-purple-700" },
  { key: "fechado",            label: "Fechado ✓",          color: "bg-green-100 text-green-700" },
  { key: "perdido",            label: "Perdido",            color: "bg-red-100 text-red-700" },
];

function timeAgo(date: Date) {
  const diff = Date.now() - new Date(date).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}min atrás`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h atrás`;
  return `${Math.floor(h / 24)}d atrás`;
}

export default function LeadsPage() {
  useAdminAuth();
  const utils = trpc.useUtils();
  const { data, isLoading } = trpc.admin.leads.list.useQuery();
  const [selected, setSelected] = useState<Lead | null>(null);
  const [filterStatus, setFilterStatus] = useState("");
  const [notes, setNotes] = useState("");
  const [value, setValue] = useState("");

  const updateStatusMutation = trpc.admin.leads.updateStatus.useMutation({
    onSuccess: () => utils.admin.leads.list.invalidate(),
    onError: (err) => toast.error(err.message),
  });
  const updateNotesMutation = trpc.admin.leads.updateNotes.useMutation({
    onSuccess: () => { utils.admin.leads.list.invalidate(); toast.success("Notas salvas!"); },
    onError: (err) => toast.error(err.message),
  });
  const markReadMutation = trpc.admin.leads.markRead.useMutation({
    onSuccess: () => utils.admin.leads.list.invalidate(),
  });
  const deleteMutation = trpc.admin.leads.delete.useMutation({
    onSuccess: () => { utils.admin.leads.list.invalidate(); setSelected(null); },
    onError: (err) => toast.error(err.message),
  });

  const openDetail = (lead: Lead) => {
    setSelected(lead);
    setNotes(lead.notes ?? "");
    setValue(lead.value ?? "");
    if (!lead.read) markReadMutation.mutate({ id: lead.id });
  };

  const handleDelete = (id: number, name: string) => {
    if (confirm(`Excluir lead de "${name}"? Esta ação não pode ser desfeita.`))
      deleteMutation.mutate({ id });
  };

  const handleStatusChange = (id: number, status: string) => {
    updateStatusMutation.mutate({ id, status: status as any });
    if (selected?.id === id) setSelected((s) => s ? { ...s, status } : s);
  };

  const filtered = filterStatus ? data?.filter((l) => l.status === filterStatus) : data;
  const unread = data?.filter((l) => !l.read).length ?? 0;

  // Stats por status
  const statusCounts = STATUSES.map((s) => ({
    ...s, count: data?.filter((l) => l.status === s.key).length ?? 0,
  }));

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-semibold text-[#1A1A1A]">Leads & Orçamentos</h2>
          <p className="text-sm text-[#6B6B6B] mt-0.5">
            {data?.length ?? 0} lead{data?.length !== 1 ? "s" : ""} no total
            {unread > 0 && (
              <span className="ml-2 inline-block bg-[#D4A74B] text-[#1A1A1A] text-xs font-bold px-2 py-0.5 rounded-full">
                {unread} novo{unread !== 1 ? "s" : ""}
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[#6B6B6B]" />
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
            className="text-sm px-3 py-2 rounded-lg border border-[#E5E2DE] focus:outline-none focus:ring-2 focus:ring-[#D4A74B]/50 bg-white">
            <option value="">Todos os status</option>
            {STATUSES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
          </select>
        </div>
      </div>

      {/* Status pills */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
        {statusCounts.map((s) => (
          <button key={s.key} onClick={() => setFilterStatus(filterStatus === s.key ? "" : s.key)}
            className={`rounded-xl border p-3 text-center transition-all ${filterStatus === s.key ? 'border-[#D4A74B] shadow-sm' : 'border-[#E5E2DE] bg-white'}`}>
            <p className="text-2xl font-bold text-[#1A1A1A]">{s.count}</p>
            <p className="text-xs mt-1 text-[#6B6B6B]">{s.label}</p>
          </button>
        ))}
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-[#E5E2DE] p-5 animate-pulse h-20" />
          ))}
        </div>
      ) : filtered?.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#E5E2DE] p-12 text-center">
          <p className="text-[#6B6B6B]">Nenhum lead encontrado.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered?.map((lead) => {
            const st = STATUSES.find((s) => s.key === lead.status) ?? STATUSES[0];
            return (
              <div key={lead.id}
                className={`bg-white rounded-xl border p-4 flex items-center gap-4 hover:shadow-sm transition-shadow cursor-pointer ${!lead.read ? 'border-[#D4A74B]/50 bg-amber-50/20' : 'border-[#E5E2DE]'}`}
                onClick={() => openDetail(lead as Lead)}>
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                  style={{ backgroundColor: 'rgba(212,167,75,0.15)', color: '#D4A74B' }}>
                  {lead.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-[#1A1A1A] truncate">{lead.name}</p>
                    {!lead.read && <span className="w-2 h-2 rounded-full bg-[#D4A74B] shrink-0" />}
                  </div>
                  <p className="text-xs text-[#6B6B6B] mt-0.5 truncate">
                    {lead.phone}{lead.service ? ` · ${lead.service}` : ""}
                  </p>
                </div>
                <div className="hidden md:flex items-center gap-3 shrink-0">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${st.color}`}>{st.label}</span>
                  <span className="text-xs text-[#6B6B6B]">{timeAgo(lead.createdAt)}</span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={(e) => { e.stopPropagation(); openDetail(lead as Lead); }}
                    className="p-2 rounded-lg hover:bg-[#F5F3F0] text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); handleDelete(lead.id, lead.name); }}
                    className="p-2 rounded-lg hover:bg-red-50 text-[#6B6B6B] hover:text-red-500 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail Modal */}
      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title="Detalhes do Lead">
        {selected && (
          <div className="space-y-5">
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold"
                  style={{ backgroundColor: 'rgba(212,167,75,0.15)', color: '#D4A74B' }}>
                  {selected.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-[#1A1A1A]">{selected.name}</p>
                  <p className="text-xs text-[#6B6B6B]">{timeAgo(selected.createdAt)}</p>
                </div>
              </div>
            </div>

            {/* Contato */}
            <div className="space-y-2">
              <a href={`https://wa.me/${selected.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2.5 text-sm text-[#1A1A1A] hover:text-[#D4A74B] transition-colors">
                <Phone className="w-4 h-4 text-[#D4A74B]" /> {selected.phone}
              </a>
              {selected.email && (
                <a href={`mailto:${selected.email}`}
                  className="flex items-center gap-2.5 text-sm text-[#1A1A1A] hover:text-[#D4A74B] transition-colors">
                  <Mail className="w-4 h-4 text-[#D4A74B]" /> {selected.email}
                </a>
              )}
              {selected.service && (
                <div className="flex items-center gap-2.5 text-sm text-[#1A1A1A]">
                  <Wrench className="w-4 h-4 text-[#D4A74B]" /> {selected.service}
                </div>
              )}
            </div>

            {/* Mensagem */}
            {selected.message && (
              <div className="bg-[#F5F3F0] rounded-xl p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#6B6B6B] mb-1">Mensagem</p>
                <p className="text-sm text-[#1A1A1A] whitespace-pre-wrap">{selected.message}</p>
              </div>
            )}

            {/* Status */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#6B6B6B] mb-2">Pipeline</p>
              <div className="flex flex-wrap gap-2">
                {STATUSES.map((s) => (
                  <button key={s.key}
                    onClick={() => handleStatusChange(selected.id, s.key)}
                    className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-all ${selected.status === s.key ? s.color + ' border-transparent' : 'border-[#E5E2DE] text-[#6B6B6B] hover:border-[#D4A74B]'}`}>
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Valor + Notas */}
            <div className="space-y-3">
              <div>
                <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#6B6B6B] mb-1">
                  <DollarSign className="w-3.5 h-3.5" /> Valor Estimado (R$)
                </label>
                <input type="number" value={value} onChange={(e) => setValue(e.target.value)}
                  placeholder="0,00"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-[#E5E2DE] focus:outline-none focus:ring-2 focus:ring-[#D4A74B]/50" />
              </div>
              <div>
                <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#6B6B6B] mb-1">
                  <StickyNote className="w-3.5 h-3.5" /> Notas internas
                </label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3}
                  placeholder="Anotações sobre o cliente, visita, combinados..."
                  className="w-full px-3 py-2 text-sm rounded-lg border border-[#E5E2DE] focus:outline-none focus:ring-2 focus:ring-[#D4A74B]/50 resize-none" />
              </div>
              <button onClick={() => updateNotesMutation.mutate({ id: selected.id, notes, value })}
                disabled={updateNotesMutation.isPending}
                className="w-full text-sm font-medium py-2.5 rounded-lg border border-[#D4A74B] text-[#D4A74B] hover:bg-[#D4A74B] hover:text-[#1A1A1A] transition-all disabled:opacity-50">
                {updateNotesMutation.isPending ? "Salvando..." : "Salvar Notas"}
              </button>
            </div>

            {/* Footer */}
            <div className="flex justify-between items-center pt-2 border-t border-[#E5E2DE]">
              <button onClick={() => handleDelete(selected.id, selected.name)}
                className="inline-flex items-center gap-2 text-sm font-medium text-red-500 hover:text-red-700 transition-colors">
                <Trash2 className="w-4 h-4" /> Excluir
              </button>
              <a href={`https://wa.me/${selected.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Olá ${selected.name}! Recebi sua solicitação de orçamento${selected.service ? ` para ${selected.service}` : ''}. Vou te passar mais detalhes.`)}`}
                target="_blank" rel="noopener noreferrer" className="btn-primary text-xs py-2.5 px-4">
                Responder no WhatsApp
              </a>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
