import { useState } from "react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { trpc } from "@/providers/trpc";
import { toast } from "sonner";
import {
  CalendarDays, Plus, MapPin, User, Clock, CheckCircle2, XCircle, Pencil, Trash2, Phone,
} from "lucide-react";
import { format, isToday, isTomorrow, isPast, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

type Status = "agendada" | "realizada" | "cancelada";

const STATUS_LABEL: Record<Status, string> = {
  agendada: "Agendada",
  realizada: "Realizada",
  cancelada: "Cancelada",
};
const STATUS_COLOR: Record<Status, string> = {
  agendada: "#3B82F6",
  realizada: "#22C55E",
  cancelada: "#9CA3AF",
};
const STATUS_BG: Record<Status, string> = {
  agendada: "#EFF6FF",
  realizada: "#F0FDF4",
  cancelada: "#F9FAFB",
};

function dateLabel(dt: Date | string) {
  const d = new Date(dt);
  if (isToday(d)) return "Hoje";
  if (isTomorrow(d)) return "Amanhã";
  return format(d, "dd/MM/yyyy", { locale: ptBR });
}

const emptyForm = {
  title: "",
  scheduledAt: "",
  address: "",
  contact: "",
  notes: "",
  status: "agendada" as Status,
};

export default function AgendaPage() {
  useAdminAuth();
  const [filter, setFilter] = useState<Status | "todas">("todas");
  const [modal, setModal] = useState<{ open: boolean; editing?: number }>({ open: false });
  const [form, setForm] = useState(emptyForm);
  const [deleting, setDeleting] = useState<number | null>(null);

  const { data: visitsRaw = [], refetch } = trpc.admin.visits.list.useQuery();
  const { data: leadsData = [] } = trpc.admin.leads.list.useQuery();

  const createMut = trpc.admin.visits.create.useMutation({
    onSuccess: () => { toast.success("Visita agendada!"); refetch(); closeModal(); },
    onError: (e) => toast.error(e.message),
  });
  const updateMut = trpc.admin.visits.update.useMutation({
    onSuccess: () => { toast.success("Visita atualizada!"); refetch(); closeModal(); },
    onError: (e) => toast.error(e.message),
  });
  const deleteMut = trpc.admin.visits.delete.useMutation({
    onSuccess: () => { toast.success("Visita removida."); refetch(); setDeleting(null); },
    onError: (e) => toast.error(e.message),
  });

  const visits = visitsRaw
    .filter((v) => filter === "todas" || v.status === filter)
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());

  const counts = {
    todas: visitsRaw.length,
    agendada: visitsRaw.filter((v) => v.status === "agendada").length,
    realizada: visitsRaw.filter((v) => v.status === "realizada").length,
    cancelada: visitsRaw.filter((v) => v.status === "cancelada").length,
  };

  function openCreate() {
    const now = new Date();
    now.setHours(now.getHours() + 1, 0, 0, 0);
    const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
    setForm({ ...emptyForm, scheduledAt: local });
    setModal({ open: true });
  }

  function openEdit(v: typeof visitsRaw[0]) {
    const dt = new Date(v.scheduledAt);
    const local = new Date(dt.getTime() - dt.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
    setForm({
      title: v.title,
      scheduledAt: local,
      address: v.address ?? "",
      contact: v.contact ?? "",
      notes: v.notes ?? "",
      status: v.status as Status,
    });
    setModal({ open: true, editing: v.id });
  }

  function closeModal() {
    setModal({ open: false });
    setForm(emptyForm);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      title: form.title,
      scheduledAt: new Date(form.scheduledAt).toISOString(),
      address: form.address || undefined,
      contact: form.contact || undefined,
      notes: form.notes || undefined,
      status: form.status,
    };
    if (modal.editing) {
      updateMut.mutate({ id: modal.editing, ...payload });
    } else {
      createMut.mutate(payload);
    }
  }

  function quickStatus(id: number, status: Status) {
    updateMut.mutate({ id, status });
  }

  const filterTabs: { value: Status | "todas"; label: string }[] = [
    { value: "todas", label: "Todas" },
    { value: "agendada", label: "Agendadas" },
    { value: "realizada", label: "Realizadas" },
    { value: "cancelada", label: "Canceladas" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-display font-bold text-[#1A1A1A]">Agenda de Visitas</h2>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-[#D4A74B] text-[#1A1A1A] font-semibold text-sm px-4 py-2 rounded-lg hover:bg-[#c49640] transition-colors"
        >
          <Plus className="w-4 h-4" /> Nova Visita
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {filterTabs.map((t) => (
          <button
            key={t.value}
            onClick={() => setFilter(t.value)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filter === t.value
                ? "bg-[#1A1A1A] text-white"
                : "bg-white border border-[#E5E2DE] text-[#6B6B6B] hover:border-[#1A1A1A]"
            }`}
          >
            {t.label}
            <span className="ml-1.5 text-xs opacity-70">{counts[t.value]}</span>
          </button>
        ))}
      </div>

      {/* Visits list */}
      {visits.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#E5E2DE] p-12 text-center">
          <CalendarDays className="w-10 h-10 text-[#C4B99A] mx-auto mb-3" />
          <p className="text-[#6B6B6B]">Nenhuma visita encontrada.</p>
          <button onClick={openCreate} className="mt-4 text-sm text-[#D4A74B] font-medium hover:underline">
            Agendar primeira visita
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {visits.map((v) => {
            const status = v.status as Status;
            const overdue = status === "agendada" && isPast(new Date(v.scheduledAt));
            const lead = leadsData.find((l) => l.id === v.leadId);
            return (
              <div
                key={v.id}
                className={`bg-white rounded-xl border p-4 flex flex-col sm:flex-row sm:items-center gap-4 ${
                  overdue ? "border-red-300" : "border-[#E5E2DE]"
                }`}
              >
                {/* Status bar */}
                <div
                  className="w-1 self-stretch rounded-full hidden sm:block shrink-0"
                  style={{ backgroundColor: STATUS_COLOR[status] }}
                />

                {/* Date block */}
                <div className="text-center sm:w-20 shrink-0">
                  <p className="text-xs font-semibold" style={{ color: STATUS_COLOR[status] }}>
                    {dateLabel(v.scheduledAt)}
                  </p>
                  <p className="text-lg font-bold text-[#1A1A1A]">
                    {format(new Date(v.scheduledAt), "HH:mm")}
                  </p>
                  {overdue && (
                    <p className="text-[10px] font-semibold text-red-500 uppercase">Atrasada</p>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="text-xs font-medium px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: STATUS_BG[status], color: STATUS_COLOR[status] }}
                    >
                      {STATUS_LABEL[status]}
                    </span>
                    {lead && (
                      <span className="text-xs text-[#6B6B6B] bg-[#F5F3F0] px-2 py-0.5 rounded-full">
                        Lead: {lead.name}
                      </span>
                    )}
                  </div>
                  <p className="font-semibold text-[#1A1A1A] truncate">{v.title}</p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-[#6B6B6B]">
                    {v.address && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {v.address}
                      </span>
                    )}
                    {v.contact && (
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" /> {v.contact}
                      </span>
                    )}
                    {v.notes && (
                      <span className="flex items-center gap-1 italic">
                        <Clock className="w-3 h-3" /> {v.notes}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {status === "agendada" && (
                    <>
                      <button
                        onClick={() => quickStatus(v.id, "realizada")}
                        title="Marcar como realizada"
                        className="p-1.5 rounded-lg text-green-600 hover:bg-green-50 transition-colors"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => quickStatus(v.id, "cancelada")}
                        title="Cancelar visita"
                        className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-50 transition-colors"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </>
                  )}
                  {v.contact && /^\d/.test(v.contact) && (
                    <a
                      href={`https://wa.me/55${v.contact.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Chamar no WhatsApp"
                      className="p-1.5 rounded-lg text-green-500 hover:bg-green-50 transition-colors"
                    >
                      <Phone className="w-4 h-4" />
                    </a>
                  )}
                  <button
                    onClick={() => openEdit(v)}
                    className="p-1.5 rounded-lg text-[#6B6B6B] hover:bg-[#F5F3F0] transition-colors"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleting(v.id)}
                    className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create/Edit Modal */}
      {modal.open && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="p-6 border-b border-[#E5E2DE]">
              <h3 className="text-lg font-bold text-[#1A1A1A]">
                {modal.editing ? "Editar Visita" : "Nova Visita"}
              </h3>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#1A1A1A] mb-1">Título *</label>
                <input
                  required
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="Ex: Visita técnica — Residência Silva"
                  className="w-full border border-[#E5E2DE] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#D4A74B]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1A1A1A] mb-1">Data e Hora *</label>
                <input
                  required
                  type="datetime-local"
                  value={form.scheduledAt}
                  onChange={(e) => setForm((f) => ({ ...f, scheduledAt: e.target.value }))}
                  className="w-full border border-[#E5E2DE] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#D4A74B]"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#1A1A1A] mb-1">Endereço</label>
                  <input
                    value={form.address}
                    onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                    placeholder="Rua, número, bairro"
                    className="w-full border border-[#E5E2DE] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#D4A74B]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1A1A1A] mb-1">Contato / Telefone</label>
                  <input
                    value={form.contact}
                    onChange={(e) => setForm((f) => ({ ...f, contact: e.target.value }))}
                    placeholder="(11) 99999-0000"
                    className="w-full border border-[#E5E2DE] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#D4A74B]"
                  />
                </div>
              </div>
              {modal.editing && (
                <div>
                  <label className="block text-sm font-medium text-[#1A1A1A] mb-1">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as Status }))}
                    className="w-full border border-[#E5E2DE] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#D4A74B]"
                  >
                    <option value="agendada">Agendada</option>
                    <option value="realizada">Realizada</option>
                    <option value="cancelada">Cancelada</option>
                  </select>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-[#1A1A1A] mb-1">Observações</label>
                <textarea
                  rows={3}
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  placeholder="Detalhes adicionais..."
                  className="w-full border border-[#E5E2DE] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#D4A74B] resize-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 border border-[#E5E2DE] text-[#6B6B6B] font-medium text-sm py-2.5 rounded-lg hover:bg-[#F5F3F0] transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={createMut.isPending || updateMut.isPending}
                  className="flex-1 bg-[#D4A74B] text-[#1A1A1A] font-semibold text-sm py-2.5 rounded-lg hover:bg-[#c49640] transition-colors disabled:opacity-50"
                >
                  {createMut.isPending || updateMut.isPending ? "Salvando..." : modal.editing ? "Atualizar" : "Agendar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleting !== null && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-[#1A1A1A] mb-2">Excluir visita?</h3>
            <p className="text-sm text-[#6B6B6B] mb-6">Esta ação não pode ser desfeita.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleting(null)}
                className="flex-1 border border-[#E5E2DE] text-[#6B6B6B] font-medium text-sm py-2.5 rounded-lg hover:bg-[#F5F3F0] transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => deleteMut.mutate({ id: deleting })}
                disabled={deleteMut.isPending}
                className="flex-1 bg-red-500 text-white font-semibold text-sm py-2.5 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                {deleteMut.isPending ? "Excluindo..." : "Excluir"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
