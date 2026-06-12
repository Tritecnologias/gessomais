import { useState } from "react";
import { toast } from "sonner";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { trpc } from "@/providers/trpc";
import DataTable from "@/components/admin/DataTable";
import Modal from "@/components/admin/Modal";
import { Star } from "lucide-react";
import type { Testimonial } from "@db/schema";

const emptyTestimonial: Testimonial = {
  id: 0,
  name: "",
  location: null,
  text: "",
  image: null,
  rating: 5,
  sortOrder: 0,
  active: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

export default function TestimonialsPage() {
  useAdminAuth();
  const utils = trpc.useUtils();
  const { data, isLoading } = trpc.admin.testimonials.list.useQuery();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(emptyTestimonial);
  const [isEdit, setIsEdit] = useState(false);

  const createMutation = trpc.admin.testimonials.create.useMutation({
    onSuccess: () => { utils.admin.testimonials.list.invalidate(); setModalOpen(false); },
    onError: (err) => toast.error(err.message),
  });
  const updateMutation = trpc.admin.testimonials.update.useMutation({
    onSuccess: () => { utils.admin.testimonials.list.invalidate(); setModalOpen(false); },
    onError: (err) => toast.error(err.message),
  });
  const deleteMutation = trpc.admin.testimonials.delete.useMutation({
    onSuccess: () => utils.admin.testimonials.list.invalidate(),
    onError: (err) => toast.error(err.message),
  });
  const reorderMutation = trpc.admin.testimonials.reorder.useMutation({
    onSuccess: () => utils.admin.testimonials.list.invalidate(),
    onError: (err) => toast.error(err.message),
  });

  const handleSave = () => {
    const data = {
      name: editing.name,
      location: editing.location || undefined,
      text: editing.text,
      image: editing.image || undefined,
      rating: editing.rating,
      sortOrder: editing.sortOrder,
      active: editing.active,
    };
    if (isEdit) updateMutation.mutate({ id: editing.id, ...data });
    else createMutation.mutate(data);
  };

  const handleEdit = (item: Testimonial) => {
    setEditing(item);
    setIsEdit(true);
    setModalOpen(true);
  };

  const handleAdd = () => {
    setEditing(emptyTestimonial);
    setIsEdit(false);
    setModalOpen(true);
  };

  const handleDelete = (id: number) => {
    const name = data?.find((t) => t.id === id)?.name ?? "este depoimento";
    if (confirm(`Deseja excluir o depoimento de "${name}"? Esta ação não pode ser desfeita.`)) deleteMutation.mutate({ id });
  };

  const columns = [
    {
      key: "name",
      header: "Cliente",
      render: (item: Testimonial) => (
        <div className="flex items-center gap-3">
          {item.image && (
            <img src={item.image} alt={item.name} className="w-10 h-10 rounded-full object-cover" />
          )}
          <div>
            <p className="font-medium">{item.name}</p>
            <p className="text-xs text-[#6B6B6B]">{item.location}</p>
          </div>
        </div>
      ),
    },
    {
      key: "rating",
      header: "Avaliação",
      render: (item: Testimonial) => (
        <div className="flex gap-0.5">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className={`w-4 h-4 ${i < item.rating ? "text-[#D4A74B]" : "text-[#E5E2DE]"}`} fill={i < item.rating ? "#D4A74B" : "transparent"} />
          ))}
        </div>
      ),
    },
    { key: "sortOrder", header: "Ordem" },
    {
      key: "active",
      header: "Status",
      render: (item: Testimonial) => (
        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${item.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
          {item.active ? "Ativo" : "Inativo"}
        </span>
      ),
    },
  ];

  return (
    <div>
      <DataTable data={data || []} columns={columns} title="Depoimentos" onAdd={handleAdd} onEdit={handleEdit} onDelete={handleDelete} onReorder={(ids) => reorderMutation.mutate({ ids })} isLoading={isLoading} />
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={isEdit ? "Editar Depoimento" : "Novo Depoimento"}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#1A1A1A] mb-1">Nome</label>
            <input type="text" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className="w-full px-3 py-2 text-sm rounded-lg border border-[#E5E2DE] focus:outline-none focus:ring-2 focus:ring-[#D4A74B]/50" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1A1A1A] mb-1">Localização</label>
            <input type="text" value={editing.location || ""} onChange={(e) => setEditing({ ...editing, location: e.target.value })} className="w-full px-3 py-2 text-sm rounded-lg border border-[#E5E2DE] focus:outline-none focus:ring-2 focus:ring-[#D4A74B]/50" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1A1A1A] mb-1">Depoimento</label>
            <textarea value={editing.text} onChange={(e) => setEditing({ ...editing, text: e.target.value })} rows={4} className="w-full px-3 py-2 text-sm rounded-lg border border-[#E5E2DE] focus:outline-none focus:ring-2 focus:ring-[#D4A74B]/50" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#1A1A1A] mb-1">Avaliação (1-5)</label>
              <input type="number" min={1} max={5} value={editing.rating} onChange={(e) => setEditing({ ...editing, rating: Number(e.target.value) })} className="w-full px-3 py-2 text-sm rounded-lg border border-[#E5E2DE] focus:outline-none focus:ring-2 focus:ring-[#D4A74B]/50" />
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
            <input type="checkbox" id="tstActive" checked={editing.active} onChange={(e) => setEditing({ ...editing, active: e.target.checked })} className="w-4 h-4 rounded border-[#E5E2DE] text-[#D4A74B]" />
            <label htmlFor="tstActive" className="text-sm text-[#1A1A1A]">Ativo</label>
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
