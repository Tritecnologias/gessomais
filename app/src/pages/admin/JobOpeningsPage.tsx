import { useState } from "react";
import { toast } from "sonner";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { trpc } from "@/providers/trpc";
import DataTable from "@/components/admin/DataTable";
import Modal from "@/components/admin/Modal";

const JOB_TYPES = ["CLT", "PJ", "Freelance", "Estágio"] as const;

const emptyJob = {
  id: 0,
  title: "",
  description: "",
  requirements: "",
  location: "São Paulo, SP",
  type: "CLT",
  sortOrder: 0,
  active: true,
};

type JobForm = typeof emptyJob;

export default function JobOpeningsPage() {
  useAdminAuth();
  const utils = trpc.useUtils();
  const { data, isLoading } = trpc.admin.jobOpenings.list.useQuery();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<JobForm>(emptyJob);
  const [isEdit, setIsEdit] = useState(false);

  const createMutation = trpc.admin.jobOpenings.create.useMutation({
    onSuccess: () => { utils.admin.jobOpenings.list.invalidate(); setModalOpen(false); },
    onError: (err) => toast.error(err.message),
  });
  const updateMutation = trpc.admin.jobOpenings.update.useMutation({
    onSuccess: () => { utils.admin.jobOpenings.list.invalidate(); setModalOpen(false); },
    onError: (err) => toast.error(err.message),
  });
  const deleteMutation = trpc.admin.jobOpenings.delete.useMutation({
    onSuccess: () => utils.admin.jobOpenings.list.invalidate(),
    onError: (err) => toast.error(err.message),
  });
  const reorderMutation = trpc.admin.jobOpenings.reorder.useMutation({
    onSuccess: () => utils.admin.jobOpenings.list.invalidate(),
    onError: (err) => toast.error(err.message),
  });

  const handleSave = () => {
    const payload = {
      title: editing.title,
      description: editing.description || undefined,
      requirements: editing.requirements || undefined,
      location: editing.location || undefined,
      type: editing.type,
      sortOrder: editing.sortOrder,
      active: editing.active,
    };
    if (isEdit) updateMutation.mutate({ id: editing.id, ...payload });
    else createMutation.mutate(payload);
  };

  const handleEdit = (item: JobForm) => {
    setEditing({ ...emptyJob, ...item, description: item.description ?? "", requirements: item.requirements ?? "", location: item.location ?? "" });
    setIsEdit(true);
    setModalOpen(true);
  };

  const handleAdd = () => {
    setEditing(emptyJob);
    setIsEdit(false);
    setModalOpen(true);
  };

  const handleDelete = (id: number) => {
    const title = data?.find((j) => j.id === id)?.title ?? "esta vaga";
    if (confirm(`Deseja excluir a vaga "${title}"? Esta ação não pode ser desfeita.`)) deleteMutation.mutate({ id });
  };

  const TYPE_COLORS: Record<string, string> = {
    CLT: "bg-blue-100 text-blue-700",
    PJ: "bg-green-100 text-green-700",
    Freelance: "bg-orange-100 text-orange-700",
    Estágio: "bg-purple-100 text-purple-700",
  };

  const columns = [
    {
      key: "title",
      header: "Vaga",
      render: (item: JobForm) => (
        <div>
          <p className="font-medium line-clamp-1">{item.title}</p>
          {item.location && <p className="text-xs text-[#6B6B6B] mt-0.5">{item.location}</p>}
        </div>
      ),
    },
    {
      key: "type",
      header: "Tipo",
      render: (item: JobForm) => (
        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${TYPE_COLORS[item.type] ?? "bg-gray-100 text-gray-600"}`}>
          {item.type}
        </span>
      ),
    },
    {
      key: "active",
      header: "Status",
      render: (item: JobForm) => (
        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${item.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
          {item.active ? "Ativa" : "Inativa"}
        </span>
      ),
    },
  ];

  return (
    <div>
      <DataTable
        data={data || []}
        columns={columns}
        title="Vagas de Emprego"
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onReorder={(ids) => reorderMutation.mutate({ ids })}
        isLoading={isLoading}
      />

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={isEdit ? "Editar Vaga" : "Nova Vaga"}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#1A1A1A] mb-1">Título da Vaga *</label>
            <input
              type="text"
              value={editing.title}
              onChange={(e) => setEditing({ ...editing, title: e.target.value })}
              placeholder="Ex: Gesseiro Especializado"
              className="w-full px-3 py-2 text-sm rounded-lg border border-[#E5E2DE] focus:outline-none focus:ring-2 focus:ring-[#D4A74B]/50"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-[#1A1A1A] mb-1">Tipo de Contrato</label>
              <select
                value={editing.type}
                onChange={(e) => setEditing({ ...editing, type: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-[#E5E2DE] focus:outline-none focus:ring-2 focus:ring-[#D4A74B]/50"
              >
                {JOB_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1A1A1A] mb-1">Localização</label>
              <input
                type="text"
                value={editing.location}
                onChange={(e) => setEditing({ ...editing, location: e.target.value })}
                placeholder="São Paulo, SP"
                className="w-full px-3 py-2 text-sm rounded-lg border border-[#E5E2DE] focus:outline-none focus:ring-2 focus:ring-[#D4A74B]/50"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1A1A1A] mb-1">Descrição</label>
            <textarea
              value={editing.description}
              onChange={(e) => setEditing({ ...editing, description: e.target.value })}
              rows={3}
              placeholder="Descreva as responsabilidades e o dia a dia na vaga..."
              className="w-full px-3 py-2 text-sm rounded-lg border border-[#E5E2DE] focus:outline-none focus:ring-2 focus:ring-[#D4A74B]/50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1A1A1A] mb-1">
              Requisitos <span className="text-xs font-normal text-[#6B6B6B]">(um por linha)</span>
            </label>
            <textarea
              value={editing.requirements}
              onChange={(e) => setEditing({ ...editing, requirements: e.target.value })}
              rows={4}
              placeholder={"Experiência com gesso\nCNH categoria B\nDisponibilidade imediata"}
              className="w-full px-3 py-2 text-sm rounded-lg border border-[#E5E2DE] focus:outline-none focus:ring-2 focus:ring-[#D4A74B]/50 font-mono"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1A1A1A] mb-1">Ordem</label>
            <input
              type="number"
              value={editing.sortOrder}
              onChange={(e) => setEditing({ ...editing, sortOrder: Number(e.target.value) })}
              className="w-full px-3 py-2 text-sm rounded-lg border border-[#E5E2DE] focus:outline-none focus:ring-2 focus:ring-[#D4A74B]/50"
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="jobActive"
              checked={editing.active}
              onChange={(e) => setEditing({ ...editing, active: e.target.checked })}
              className="w-4 h-4 rounded border-[#E5E2DE] text-[#D4A74B]"
            />
            <label htmlFor="jobActive" className="text-sm text-[#1A1A1A]">Vaga ativa (visível no site)</label>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm font-medium text-[#6B6B6B] hover:text-[#1A1A1A]">
              Cancelar
            </button>
            <button onClick={handleSave} className="btn-primary text-sm py-2.5 px-5">
              {isEdit ? "Salvar" : "Criar Vaga"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
