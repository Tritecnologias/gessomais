import { useState } from "react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { trpc } from "@/providers/trpc";
import { toast } from "sonner";
import {
  Plus, Pencil, Trash2, CheckCircle2, Clock, AlertTriangle,
  User, Phone, Flag, ChevronDown, MessageSquare, RotateCcw,
} from "lucide-react";
import { format, formatDistanceToNow, isPast, isToday, isTomorrow } from "date-fns";
import { ptBR } from "date-fns/locale";

type Status = "pendente" | "em_andamento" | "concluida" | "cancelada";
type Priority = "baixa" | "media" | "alta" | "urgente";
type Filter = Status | "atrasada" | "todas";

const PRIORITY_CONFIG: Record<Priority, { label: string; color: string; bg: string; dot: string }> = {
  baixa:   { label: "Baixa",   color: "#6B6B6B", bg: "#F5F3F0", dot: "#9CA3AF" },
  media:   { label: "Média",   color: "#3B82F6", bg: "#EFF6FF", dot: "#3B82F6" },
  alta:    { label: "Alta",    color: "#F59E0B", bg: "#FFFBEB", dot: "#F59E0B" },
  urgente: { label: "Urgente", color: "#EF4444", bg: "#FEF2F2", dot: "#EF4444" },
};

const STATUS_CONFIG: Record<Status, { label: string; color: string; bg: string }> = {
  pendente:    { label: "Pendente",     color: "#6B6B6B", bg: "#F5F3F0" },
  em_andamento:{ label: "Em Andamento", color: "#3B82F6", bg: "#EFF6FF" },
  concluida:   { label: "Concluída",    color: "#22C55E", bg: "#F0FDF4" },
  cancelada:   { label: "Cancelada",    color: "#9CA3AF", bg: "#F9FAFB" },
};

function deadlineLabel(dt: Date | string, isOverdue: boolean) {
  const d = new Date(dt);
  if (isOverdue) return `Atrasada ${formatDistanceToNow(d, { locale: ptBR, addSuffix: true })}`;
  if (isToday(d)) return `Hoje às ${format(d, "HH:mm")}`;
  if (isTomorrow(d)) return `Amanhã às ${format(d, "HH:mm")}`;
  return format(d, "dd/MM/yyyy HH:mm", { locale: ptBR });
}

const emptyForm = {
  title: "",
  description: "",
  assignee: "",
  phone: "",
  deadline: "",
  priority: "media" as Priority,
  notes: "",
};

export default function TasksPage() {
  useAdminAuth();
  const [filter, setFilter] = useState<Filter>("todas");
  const [modal, setModal] = useState<{ open: boolean; editing?: number }>({ open: false });
  const [form, setForm] = useState(emptyForm);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [expanded, setExpanded] = useState<number | null>(null);

  const { data: tasksRaw = [], refetch } = trpc.admin.tasks.list.useQuery(undefined, {
    refetchInterval: 30_000,
  });

  const createMut = trpc.admin.tasks.create.useMutation({
    onSuccess: () => { toast.success("Tarefa criada!"); refetch(); closeModal(); },
    onError: (e) => toast.error(e.message),
  });
  const updateMut = trpc.admin.tasks.update.useMutation({
    onSuccess: () => { toast.success("Tarefa atualizada!"); refetch(); closeModal(); },
    onError: (e) => toast.error(e.message),
  });
  const deleteMut = trpc.admin.tasks.delete.useMutation({
    onSuccess: () => { toast.success("Tarefa removida."); refetch(); setDeleting(null); },
    onError: (e) => toast.error(e.message),
  });

  const counts = {
    todas: tasksRaw.length,
    pendente: tasksRaw.filter((t) => t.status === "pendente").length,
    em_andamento: tasksRaw.filter((t) => t.status === "em_andamento").length,
    concluida: tasksRaw.filter((t) => t.status === "concluida").length,
    cancelada: tasksRaw.filter((t) => t.status === "cancelada").length,
    atrasada: tasksRaw.filter((t) => t.isOverdue).length,
  };

  const filtered = tasksRaw.filter((t) => {
    if (filter === "todas") return true;
    if (filter === "atrasada") return t.isOverdue;
    return t.status === filter;
  }).sort((a, b) => {
    // overdue first, then by priority weight, then deadline
    const priorityWeight = { urgente: 0, alta: 1, media: 2, baixa: 3 };
    if (a.isOverdue !== b.isOverdue) return a.isOverdue ? -1 : 1;
    const pw = (priorityWeight[a.priority as Priority] ?? 2) - (priorityWeight[b.priority as Priority] ?? 2);
    if (pw !== 0) return pw;
    return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
  });

  function openCreate() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(18, 0, 0, 0);
    const local = new Date(tomorrow.getTime() - tomorrow.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    setForm({ ...emptyForm, deadline: local });
    setModal({ open: true });
  }

  function openEdit(t: typeof tasksRaw[0]) {
    const dt = new Date(t.deadline);
    const local = new Date(dt.getTime() - dt.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    setForm({
      title: t.title,
      description: t.description ?? "",
      assignee: t.assignee,
      phone: t.phone ?? "",
      deadline: local,
      priority: t.priority as Priority,
      notes: t.notes ?? "",
    });
    setModal({ open: true, editing: t.id });
  }

  function closeModal() { setModal({ open: false }); setForm(emptyForm); }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      title: form.title,
      description: form.description || undefined,
      assignee: form.assignee,
      phone: form.phone || undefined,
      deadline: new Date(form.deadline).toISOString(),
      priority: form.priority,
      notes: form.notes || undefined,
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

  function whatsappMessage(t: typeof tasksRaw[0]) {
    const deadline = format(new Date(t.deadline), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
    const msg = t.isOverdue
      ? `Olá ${t.assignee}! A tarefa *"${t.title}"* estava com prazo até ${deadline} e ainda não foi concluída. Por favor, entre em contato para atualizar o status.`
      : `Olá ${t.assignee}! Você tem a tarefa *"${t.title}"* com prazo até ${deadline}. ${t.description ? `\n\nDetalhes: ${t.description}` : ""}`;
    return `https://wa.me/55${(t.phone ?? "").replace(/\D/g, "")}?text=${encodeURIComponent(msg)}`;
  }

  const filterTabs: { value: Filter; label: string; danger?: boolean }[] = [
    { value: "todas", label: "Todas" },
    { value: "atrasada", label: "Atrasadas", danger: true },
    { value: "pendente", label: "Pendentes" },
    { value: "em_andamento", label: "Em Andamento" },
    { value: "concluida", label: "Concluídas" },
    { value: "cancelada", label: "Canceladas" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-display font-bold text-[#1A1A1A]">Tarefas</h2>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-[#D4A74B] text-[#1A1A1A] font-semibold text-sm px-4 py-2 rounded-lg hover:bg-[#c49640] transition-colors"
        >
          <Plus className="w-4 h-4" /> Nova Tarefa
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {counts.atrasada > 0 && (
          <button
            onClick={() => setFilter("atrasada")}
            className={`rounded-xl border p-4 text-left transition-all ${filter === "atrasada" ? "border-red-400 bg-red-50" : "border-red-200 bg-red-50 hover:border-red-400"}`}
          >
            <AlertTriangle className="w-5 h-5 text-red-500 mb-1" />
            <p className="text-2xl font-bold text-red-600">{counts.atrasada}</p>
            <p className="text-xs font-medium text-red-500">Atrasada{counts.atrasada > 1 ? "s" : ""}</p>
          </button>
        )}
        <button onClick={() => setFilter("em_andamento")} className={`rounded-xl border p-4 text-left transition-all ${filter === "em_andamento" ? "border-[#3B82F6] bg-blue-50" : "bg-white border-[#E5E2DE] hover:border-[#3B82F6]/50"}`}>
          <Clock className="w-5 h-5 text-[#3B82F6] mb-1" />
          <p className="text-2xl font-bold text-[#1A1A1A]">{counts.em_andamento}</p>
          <p className="text-xs font-medium text-[#6B6B6B]">Em Andamento</p>
        </button>
        <button onClick={() => setFilter("pendente")} className={`rounded-xl border p-4 text-left transition-all ${filter === "pendente" ? "border-[#D4A74B] bg-amber-50" : "bg-white border-[#E5E2DE] hover:border-[#D4A74B]/50"}`}>
          <Flag className="w-5 h-5 text-[#D4A74B] mb-1" />
          <p className="text-2xl font-bold text-[#1A1A1A]">{counts.pendente}</p>
          <p className="text-xs font-medium text-[#6B6B6B]">Pendentes</p>
        </button>
        <button onClick={() => setFilter("concluida")} className={`rounded-xl border p-4 text-left transition-all ${filter === "concluida" ? "border-green-400 bg-green-50" : "bg-white border-[#E5E2DE] hover:border-green-400/50"}`}>
          <CheckCircle2 className="w-5 h-5 text-green-500 mb-1" />
          <p className="text-2xl font-bold text-[#1A1A1A]">{counts.concluida}</p>
          <p className="text-xs font-medium text-[#6B6B6B]">Concluídas</p>
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap mb-4">
        {filterTabs.map((t) => (
          <button
            key={t.value}
            onClick={() => setFilter(t.value)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filter === t.value
                ? t.danger ? "bg-red-500 text-white" : "bg-[#1A1A1A] text-white"
                : t.danger && counts.atrasada > 0
                  ? "bg-red-50 border border-red-200 text-red-600 hover:bg-red-100"
                  : "bg-white border border-[#E5E2DE] text-[#6B6B6B] hover:border-[#1A1A1A]"
            }`}
          >
            {t.label}
            {counts[t.value] > 0 && (
              <span className="ml-1.5 text-xs opacity-70">{counts[t.value as keyof typeof counts]}</span>
            )}
          </button>
        ))}
      </div>

      {/* Task list */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#E5E2DE] p-12 text-center">
          <CheckCircle2 className="w-10 h-10 text-green-400 mx-auto mb-3" />
          <p className="text-[#6B6B6B]">Nenhuma tarefa encontrada.</p>
          <button onClick={openCreate} className="mt-3 text-sm text-[#D4A74B] font-medium hover:underline">
            Criar primeira tarefa
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((t) => {
            const priority = PRIORITY_CONFIG[t.priority as Priority] ?? PRIORITY_CONFIG.media;
            const statusCfg = STATUS_CONFIG[t.status as Status] ?? STATUS_CONFIG.pendente;
            const isExpanded = expanded === t.id;

            return (
              <div
                key={t.id}
                className={`bg-white rounded-xl border transition-all ${
                  t.isOverdue ? "border-red-300 shadow-sm shadow-red-50" : "border-[#E5E2DE]"
                }`}
              >
                {/* Main row */}
                <div className="flex items-center gap-3 p-4">
                  {/* Priority dot */}
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: priority.dot }} />

                  {/* Title + meta */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide"
                        style={{ backgroundColor: priority.bg, color: priority.color }}
                      >
                        {priority.label}
                      </span>
                      <span
                        className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: statusCfg.bg, color: statusCfg.color }}
                      >
                        {statusCfg.label}
                      </span>
                      {t.isOverdue && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-600 flex items-center gap-1">
                          <AlertTriangle className="w-2.5 h-2.5" /> ATRASADA
                        </span>
                      )}
                    </div>
                    <p className={`font-semibold truncate ${t.status === "concluida" ? "line-through text-[#9CA3AF]" : "text-[#1A1A1A]"}`}>
                      {t.title}
                    </p>
                    <div className="flex items-center gap-3 mt-0.5 text-xs text-[#6B6B6B] flex-wrap">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" /> {t.assignee}
                      </span>
                      <span className={`flex items-center gap-1 font-medium ${t.isOverdue ? "text-red-500" : ""}`}>
                        <Clock className="w-3 h-3" /> {deadlineLabel(t.deadline, t.isOverdue)}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    {t.status !== "concluida" && t.status !== "cancelada" && (
                      <button
                        onClick={() => quickStatus(t.id, "concluida")}
                        title="Marcar como concluída"
                        className="p-1.5 rounded-lg text-green-500 hover:bg-green-50 transition-colors"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                    )}
                    {t.status === "pendente" && (
                      <button
                        onClick={() => quickStatus(t.id, "em_andamento")}
                        title="Iniciar tarefa"
                        className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 transition-colors"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    )}
                    {t.phone && (
                      <a
                        href={whatsappMessage(t)}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={t.isOverdue ? "Cobrar via WhatsApp" : "Enviar tarefa via WhatsApp"}
                        className={`p-1.5 rounded-lg transition-colors ${t.isOverdue ? "text-red-500 hover:bg-red-50" : "text-green-500 hover:bg-green-50"}`}
                      >
                        <MessageSquare className="w-4 h-4" />
                      </a>
                    )}
                    <button
                      onClick={() => openEdit(t)}
                      className="p-1.5 rounded-lg text-[#6B6B6B] hover:bg-[#F5F3F0] transition-colors"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleting(t.id)}
                      className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setExpanded(isExpanded ? null : t.id)}
                      className="p-1.5 rounded-lg text-[#9CA3AF] hover:bg-[#F5F3F0] transition-colors"
                    >
                      <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                    </button>
                  </div>
                </div>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="px-5 pb-4 border-t border-[#F5F3F0] pt-3 space-y-3">
                    {t.description && (
                      <div>
                        <p className="text-xs font-semibold text-[#6B6B6B] uppercase tracking-wide mb-1">Descrição</p>
                        <p className="text-sm text-[#1A1A1A] whitespace-pre-line">{t.description}</p>
                      </div>
                    )}
                    {t.notes && (
                      <div>
                        <p className="text-xs font-semibold text-[#6B6B6B] uppercase tracking-wide mb-1">Observações</p>
                        <p className="text-sm text-[#6B6B6B] whitespace-pre-line">{t.notes}</p>
                      </div>
                    )}
                    <div className="flex flex-wrap gap-4 text-xs text-[#9CA3AF]">
                      {t.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3" /> {t.phone}
                        </span>
                      )}
                      {t.completedAt && (
                        <span className="flex items-center gap-1 text-green-600">
                          <CheckCircle2 className="w-3 h-3" />
                          Concluída em {format(new Date(t.completedAt), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                        </span>
                      )}
                      <span>Criada {format(new Date(t.createdAt), "dd/MM/yyyy", { locale: ptBR })}</span>
                    </div>
                    {/* Status change row */}
                    {t.status !== "concluida" && (
                      <div className="flex gap-2 flex-wrap pt-1">
                        {(["pendente", "em_andamento", "cancelada"] as Status[])
                          .filter((s) => s !== t.status)
                          .map((s) => (
                            <button
                              key={s}
                              onClick={() => quickStatus(t.id, s)}
                              className="text-xs px-3 py-1.5 rounded-lg border border-[#E5E2DE] text-[#6B6B6B] hover:bg-[#F5F3F0] transition-colors font-medium"
                            >
                              → {STATUS_CONFIG[s].label}
                            </button>
                          ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Create/Edit Modal */}
      {modal.open && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-[#E5E2DE] sticky top-0 bg-white">
              <h3 className="text-lg font-bold text-[#1A1A1A]">
                {modal.editing ? "Editar Tarefa" : "Nova Tarefa"}
              </h3>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#1A1A1A] mb-1">Título *</label>
                <input
                  required
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="Ex: Pintar parede do depósito"
                  className="w-full border border-[#E5E2DE] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#D4A74B]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1A1A1A] mb-1">Descrição</label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Detalhe o que precisa ser feito..."
                  className="w-full border border-[#E5E2DE] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#D4A74B] resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#1A1A1A] mb-1">Responsável *</label>
                  <input
                    required
                    value={form.assignee}
                    onChange={(e) => setForm((f) => ({ ...f, assignee: e.target.value }))}
                    placeholder="Nome do funcionário"
                    className="w-full border border-[#E5E2DE] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#D4A74B]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1A1A1A] mb-1">WhatsApp</label>
                  <input
                    value={form.phone}
                    onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                    placeholder="(11) 99999-0000"
                    className="w-full border border-[#E5E2DE] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#D4A74B]"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#1A1A1A] mb-1">Prazo *</label>
                  <input
                    required
                    type="datetime-local"
                    value={form.deadline}
                    onChange={(e) => setForm((f) => ({ ...f, deadline: e.target.value }))}
                    className="w-full border border-[#E5E2DE] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#D4A74B]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1A1A1A] mb-1">Prioridade</label>
                  <select
                    value={form.priority}
                    onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value as Priority }))}
                    className="w-full border border-[#E5E2DE] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#D4A74B]"
                  >
                    <option value="baixa">🔵 Baixa</option>
                    <option value="media">🔵 Média</option>
                    <option value="alta">🟡 Alta</option>
                    <option value="urgente">🔴 Urgente</option>
                  </select>
                </div>
              </div>
              {modal.editing && (
                <div>
                  <label className="block text-sm font-medium text-[#1A1A1A] mb-1">Status</label>
                  <select
                    value={form.priority}
                    onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value as Priority }))}
                    className="w-full border border-[#E5E2DE] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#D4A74B]"
                  >
                    <option value="pendente">Pendente</option>
                    <option value="em_andamento">Em Andamento</option>
                    <option value="concluida">Concluída</option>
                    <option value="cancelada">Cancelada</option>
                  </select>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-[#1A1A1A] mb-1">Observações internas</label>
                <textarea
                  rows={2}
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  placeholder="Anotações para o admin..."
                  className="w-full border border-[#E5E2DE] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#D4A74B] resize-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeModal} className="flex-1 border border-[#E5E2DE] text-[#6B6B6B] font-medium text-sm py-2.5 rounded-lg hover:bg-[#F5F3F0] transition-colors">
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={createMut.isPending || updateMut.isPending}
                  className="flex-1 bg-[#D4A74B] text-[#1A1A1A] font-semibold text-sm py-2.5 rounded-lg hover:bg-[#c49640] transition-colors disabled:opacity-50"
                >
                  {createMut.isPending || updateMut.isPending ? "Salvando..." : modal.editing ? "Atualizar" : "Criar Tarefa"}
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
            <h3 className="text-lg font-bold text-[#1A1A1A] mb-2">Excluir tarefa?</h3>
            <p className="text-sm text-[#6B6B6B] mb-6">Esta ação não pode ser desfeita.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleting(null)} className="flex-1 border border-[#E5E2DE] text-[#6B6B6B] font-medium text-sm py-2.5 rounded-lg hover:bg-[#F5F3F0] transition-colors">
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
