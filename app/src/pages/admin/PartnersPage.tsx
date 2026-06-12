import { useState } from "react";
import { toast } from "sonner";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { trpc } from "@/providers/trpc";
import DataTable from "@/components/admin/DataTable";
import Modal from "@/components/admin/Modal";

const empty = { id: 0, name: "", logo: "", url: "", sortOrder: 0, active: true };
type Form = typeof empty;

export default function PartnersPage() {
  useAdminAuth();
  const utils = trpc.useUtils();
  const { data, isLoading } = trpc.admin.partners.list.useQuery();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Form>(empty);
  const [isEdit, setIsEdit] = useState(false);

  const createMutation = trpc.admin.partners.create.useMutation({
    onSuccess: () => { utils.admin.partners.list.invalidate(); setModalOpen(false); },
    onError: (err) => toast.error(err.message),
  });
  const updateMutation = trpc.admin.partners.update.useMutation({
    onSuccess: () => { utils.admin.partners.list.invalidate(); setModalOpen(false); },
    onError: (err) => toast.error(err.message),
  });
  const deleteMutation = trpc.admin.partners.delete.useMutation({
    onSuccess: () => utils.admin.partners.list.invalidate(),
    onError: (err) => toast.error(err.message),
  });
  const reorderMutation = trpc.admin.partners.reorder.useMutation({
    onSuccess: () => utils.admin.partners.list.invalidate(),
  });

  const handleSave = () => {
    if (!editing.logo.trim()) { toast.error("URL do logo é obrigatória."); return; }
    const payload = { name: editing.name, logo: editing.logo, url: editing.url || undefined, sortOrder: editing.sortOrder, active: editing.active };
    if (isEdit) updateMutation.mutate({ id: editing.id, ...payload });
    else createMutation.mutate(payload);
  };

  const handleEdit = (item: Form) => { setEditing({ ...empty, ...item, url: item.url ?? "" }); setIsEdit(true); setModalOpen(true); };
  const handleAdd = () => { setEditing(empty); setIsEdit(false); setModalOpen(true); };
  const handleDelete = (id: number) => {
    const name = data?.find((p) => p.id === id)?.name ?? "este parceiro";
    if (confirm(`Excluir parceiro "${name}"?`)) deleteMutation.mutate({ id });
  };

  const columns = [
    {
      key: "logo", header: "Logo",
      render: (item: Form) => (
        <img src={item.logo} alt={item.name} className="h-10 max-w-[100px] object-contain grayscale" />
      ),
    },
    { key: "name", header: "Nome" },
    {
      key: "active", header: "Status",
      render: (item: Form) => (
        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${item.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
          {item.active ? "Ativo" : "Inativo"}
        </span>
      ),
    },
  ];

  return (
    <div>
      <DataTable data={data || []} columns={columns} title="Parceiros & Fornecedores" onAdd={handleAdd} onEdit={handleEdit} onDelete={handleDelete} onReorder={(ids) => reorderMutation.mutate({ ids })} isLoading={isLoading} />
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={isEdit ? "Editar Parceiro" : "Novo Parceiro"}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#1A1A1A] mb-1">Nome *</label>
            <input type="text" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })}
              placeholder="Ex: Weber Saint-Gobain"
              className="w-full px-3 py-2 text-sm rounded-lg border border-[#E5E2DE] focus:outline-none focus:ring-2 focus:ring-[#D4A74B]/50" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1A1A1A] mb-1">URL do Logo *</label>
            <input type="url" value={editing.logo} onChange={(e) => setEditing({ ...editing, logo: e.target.value })}
              placeholder="https://..."
              className="w-full px-3 py-2 text-sm rounded-lg border border-[#E5E2DE] focus:outline-none focus:ring-2 focus:ring-[#D4A74B]/50" />
            {editing.logo && <img src={editing.logo} alt="" className="mt-2 h-12 object-contain" onError={(e) => (e.currentTarget.style.display = 'none')} />}
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1A1A1A] mb-1">Link do Site <span className="font-normal text-[#6B6B6B]">(opcional)</span></label>
            <input type="url" value={editing.url} onChange={(e) => setEditing({ ...editing, url: e.target.value })}
              placeholder="https://parceiro.com.br"
              className="w-full px-3 py-2 text-sm rounded-lg border border-[#E5E2DE] focus:outline-none focus:ring-2 focus:ring-[#D4A74B]/50" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1A1A1A] mb-1">Ordem</label>
            <input type="number" value={editing.sortOrder} onChange={(e) => setEditing({ ...editing, sortOrder: Number(e.target.value) })}
              className="w-full px-3 py-2 text-sm rounded-lg border border-[#E5E2DE] focus:outline-none focus:ring-2 focus:ring-[#D4A74B]/50" />
          </div>
          <div className="flex items-center gap-3">
            <input type="checkbox" id="partnerActive" checked={editing.active} onChange={(e) => setEditing({ ...editing, active: e.target.checked })} className="w-4 h-4 rounded accent-[#D4A74B]" />
            <label htmlFor="partnerActive" className="text-sm text-[#1A1A1A]">Visível no site</label>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm font-medium text-[#6B6B6B] hover:text-[#1A1A1A]">Cancelar</button>
            <button onClick={handleSave} className="btn-primary text-sm py-2.5 px-5">{isEdit ? "Salvar" : "Adicionar"}</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
