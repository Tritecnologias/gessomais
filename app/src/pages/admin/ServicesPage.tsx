import { useState } from "react";
import { toast } from "sonner";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { trpc } from "@/providers/trpc";
import DataTable from "@/components/admin/DataTable";
import Modal from "@/components/admin/Modal";
import type { Service } from "@db/schema";

const emptyService: Service = {
  id: 0,
  title: "",
  description: null,
  image: null,
  icon: "Home",
  sortOrder: 0,
  active: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const iconOptions = ["Home", "Layout", "Lightbulb", "Columns", "Wrench", "Paintbrush"];

export default function ServicesPage() {
  useAdminAuth();
  const utils = trpc.useUtils();
  const { data, isLoading } = trpc.admin.services.list.useQuery();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(emptyService);
  const [isEdit, setIsEdit] = useState(false);

  const createMutation = trpc.admin.services.create.useMutation({
    onSuccess: () => { utils.admin.services.list.invalidate(); setModalOpen(false); },
    onError: (err) => toast.error(err.message),
  });
  const updateMutation = trpc.admin.services.update.useMutation({
    onSuccess: () => { utils.admin.services.list.invalidate(); setModalOpen(false); },
    onError: (err) => toast.error(err.message),
  });
  const deleteMutation = trpc.admin.services.delete.useMutation({
    onSuccess: () => utils.admin.services.list.invalidate(),
    onError: (err) => toast.error(err.message),
  });
  const reorderMutation = trpc.admin.services.reorder.useMutation({
    onSuccess: () => utils.admin.services.list.invalidate(),
    onError: (err) => toast.error(err.message),
  });

  const handleSave = () => {
    const data = {
      title: editing.title,
      description: editing.description || undefined,
      image: editing.image || undefined,
      icon: editing.icon,
      sortOrder: editing.sortOrder,
      active: editing.active,
    };
    if (isEdit) updateMutation.mutate({ id: editing.id, ...data });
    else createMutation.mutate(data);
  };

  const handleEdit = (item: Service) => {
    setEditing(item);
    setIsEdit(true);
    setModalOpen(true);
  };

  const handleAdd = () => {
    setEditing(emptyService);
    setIsEdit(false);
    setModalOpen(true);
  };

  const handleDelete = (id: number) => {
    const title = data?.find((s) => s.id === id)?.title ?? "este serviço";
    if (confirm(`Deseja excluir o serviço "${title}"? Esta ação não pode ser desfeita.`)) deleteMutation.mutate({ id });
  };

  const columns = [
    {
      key: "title",
      header: "Título",
      render: (item: Service) => (
        <div className="flex items-center gap-3">
          {item.image && (
            <img src={item.image} alt={item.title} className="w-10 h-10 rounded-lg object-cover" />
          )}
          <span className="font-medium">{item.title}</span>
        </div>
      ),
    },
    { key: "icon", header: "Ícone" },
    { key: "sortOrder", header: "Ordem" },
    {
      key: "active",
      header: "Status",
      render: (item: Service) => (
        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${item.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
          {item.active ? "Ativo" : "Inativo"}
        </span>
      ),
    },
  ];

  return (
    <div>
      <DataTable data={data || []} columns={columns} title="Serviços" onAdd={handleAdd} onEdit={handleEdit} onDelete={handleDelete} onReorder={(ids) => reorderMutation.mutate({ ids })} isLoading={isLoading} />
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={isEdit ? "Editar Serviço" : "Novo Serviço"}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#1A1A1A] mb-1">Título</label>
            <input type="text" value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} className="w-full px-3 py-2 text-sm rounded-lg border border-[#E5E2DE] focus:outline-none focus:ring-2 focus:ring-[#D4A74B]/50" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1A1A1A] mb-1">Descrição</label>
            <textarea value={editing.description || ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} rows={3} className="w-full px-3 py-2 text-sm rounded-lg border border-[#E5E2DE] focus:outline-none focus:ring-2 focus:ring-[#D4A74B]/50" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#1A1A1A] mb-1">Ícone</label>
              <select value={editing.icon} onChange={(e) => setEditing({ ...editing, icon: e.target.value })} className="w-full px-3 py-2 text-sm rounded-lg border border-[#E5E2DE] focus:outline-none focus:ring-2 focus:ring-[#D4A74B]/50">
                {iconOptions.map(i => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1A1A1A] mb-1">Ordem</label>
              <input type="number" value={editing.sortOrder} onChange={(e) => setEditing({ ...editing, sortOrder: Number(e.target.value) })} className="w-full px-3 py-2 text-sm rounded-lg border border-[#E5E2DE] focus:outline-none focus:ring-2 focus:ring-[#D4A74B]/50" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1A1A1A] mb-1">Imagem (URL)</label>
            <input type="text" value={editing.image || ""} onChange={(e) => setEditing({ ...editing, image: e.target.value })} placeholder="/images/nome.jpg" className="w-full px-3 py-2 text-sm rounded-lg border border-[#E5E2DE] focus:outline-none focus:ring-2 focus:ring-[#D4A74B]/50" />
          </div>
          <div className="flex items-center gap-3">
            <input type="checkbox" id="svcActive" checked={editing.active} onChange={(e) => setEditing({ ...editing, active: e.target.checked })} className="w-4 h-4 rounded border-[#E5E2DE] text-[#D4A74B]" />
            <label htmlFor="svcActive" className="text-sm text-[#1A1A1A]">Ativo</label>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm font-medium text-[#6B6B6B] hover:text-[#1A1A1A]">Cancelar</button>
            <button onClick={handleSave} className="btn-primary text-sm py-2.5 px-5">{isEdit ? "Salvar" : "Criar"}</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
