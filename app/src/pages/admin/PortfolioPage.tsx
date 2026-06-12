import { useState } from "react";
import { toast } from "sonner";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { trpc } from "@/providers/trpc";
import DataTable from "@/components/admin/DataTable";
import Modal from "@/components/admin/Modal";

const CATEGORIES = ["Sanca de Gesso", "Forro de Gesso", "Drywall", "Pintura", "Reforma Completa", "Geral"];

const empty = { id: 0, title: "", description: "", category: "Geral", image: "", sortOrder: 0, active: true };
type Form = typeof empty;

export default function PortfolioPage() {
  useAdminAuth();
  const utils = trpc.useUtils();
  const { data, isLoading } = trpc.admin.portfolio.list.useQuery();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Form>(empty);
  const [isEdit, setIsEdit] = useState(false);

  const createMutation = trpc.admin.portfolio.create.useMutation({
    onSuccess: () => { utils.admin.portfolio.list.invalidate(); setModalOpen(false); },
    onError: (err) => toast.error(err.message),
  });
  const updateMutation = trpc.admin.portfolio.update.useMutation({
    onSuccess: () => { utils.admin.portfolio.list.invalidate(); setModalOpen(false); },
    onError: (err) => toast.error(err.message),
  });
  const deleteMutation = trpc.admin.portfolio.delete.useMutation({
    onSuccess: () => utils.admin.portfolio.list.invalidate(),
    onError: (err) => toast.error(err.message),
  });
  const reorderMutation = trpc.admin.portfolio.reorder.useMutation({
    onSuccess: () => utils.admin.portfolio.list.invalidate(),
  });

  const handleSave = () => {
    if (!editing.image.trim()) { toast.error("URL da imagem é obrigatória."); return; }
    const payload = { title: editing.title, description: editing.description || undefined, category: editing.category, image: editing.image, sortOrder: editing.sortOrder, active: editing.active };
    if (isEdit) updateMutation.mutate({ id: editing.id, ...payload });
    else createMutation.mutate(payload);
  };

  const handleEdit = (item: Form) => { setEditing({ ...empty, ...item, description: item.description ?? "" }); setIsEdit(true); setModalOpen(true); };
  const handleAdd = () => { setEditing(empty); setIsEdit(false); setModalOpen(true); };
  const handleDelete = (id: number) => {
    const title = data?.find((p) => p.id === id)?.title ?? "este item";
    if (confirm(`Excluir "${title}"?`)) deleteMutation.mutate({ id });
  };

  const columns = [
    {
      key: "image", header: "Foto",
      render: (item: Form) => (
        <img src={item.image} alt={item.title} className="w-14 h-14 object-cover rounded-lg border border-[#E5E2DE]" />
      ),
    },
    {
      key: "title", header: "Obra",
      render: (item: Form) => (
        <div>
          <p className="font-medium line-clamp-1">{item.title}</p>
          <p className="text-xs text-[#6B6B6B]">{item.category}</p>
        </div>
      ),
    },
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
      <DataTable data={data || []} columns={columns} title="Portfólio de Obras" onAdd={handleAdd} onEdit={handleEdit} onDelete={handleDelete} onReorder={(ids) => reorderMutation.mutate({ ids })} isLoading={isLoading} />
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={isEdit ? "Editar Obra" : "Nova Obra"}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#1A1A1A] mb-1">Título *</label>
            <input type="text" value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })}
              placeholder="Ex: Sanca LED Sala de Estar" className="w-full px-3 py-2 text-sm rounded-lg border border-[#E5E2DE] focus:outline-none focus:ring-2 focus:ring-[#D4A74B]/50" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1A1A1A] mb-1">URL da Imagem *</label>
            <input type="url" value={editing.image} onChange={(e) => setEditing({ ...editing, image: e.target.value })}
              placeholder="https://..." className="w-full px-3 py-2 text-sm rounded-lg border border-[#E5E2DE] focus:outline-none focus:ring-2 focus:ring-[#D4A74B]/50" />
            {editing.image && <img src={editing.image} alt="" className="mt-2 h-28 w-full object-cover rounded-lg border border-[#E5E2DE]" onError={(e) => (e.currentTarget.style.display = 'none')} />}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-[#1A1A1A] mb-1">Categoria</label>
              <select value={editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-[#E5E2DE] focus:outline-none focus:ring-2 focus:ring-[#D4A74B]/50">
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1A1A1A] mb-1">Ordem</label>
              <input type="number" value={editing.sortOrder} onChange={(e) => setEditing({ ...editing, sortOrder: Number(e.target.value) })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-[#E5E2DE] focus:outline-none focus:ring-2 focus:ring-[#D4A74B]/50" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1A1A1A] mb-1">Descrição</label>
            <textarea value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })}
              rows={2} placeholder="Breve descrição do projeto..."
              className="w-full px-3 py-2 text-sm rounded-lg border border-[#E5E2DE] focus:outline-none focus:ring-2 focus:ring-[#D4A74B]/50" />
          </div>
          <div className="flex items-center gap-3">
            <input type="checkbox" id="portActive" checked={editing.active} onChange={(e) => setEditing({ ...editing, active: e.target.checked })} className="w-4 h-4 rounded accent-[#D4A74B]" />
            <label htmlFor="portActive" className="text-sm text-[#1A1A1A]">Visível no site</label>
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
