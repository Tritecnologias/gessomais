import { useState } from "react";
import { toast } from "sonner";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { trpc } from "@/providers/trpc";
import DataTable from "@/components/admin/DataTable";
import Modal from "@/components/admin/Modal";

const emptyFaq = {
  id: 0,
  question: "",
  answer: "",
  sortOrder: 0,
  active: true,
};

export default function FaqsPage() {
  useAdminAuth();
  const utils = trpc.useUtils();
  const { data, isLoading } = trpc.admin.faqs.list.useQuery();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(emptyFaq);
  const [isEdit, setIsEdit] = useState(false);

  const createMutation = trpc.admin.faqs.create.useMutation({
    onSuccess: () => { utils.admin.faqs.list.invalidate(); setModalOpen(false); },
    onError: (err) => toast.error(err.message),
  });
  const updateMutation = trpc.admin.faqs.update.useMutation({
    onSuccess: () => { utils.admin.faqs.list.invalidate(); setModalOpen(false); },
    onError: (err) => toast.error(err.message),
  });
  const deleteMutation = trpc.admin.faqs.delete.useMutation({
    onSuccess: () => utils.admin.faqs.list.invalidate(),
    onError: (err) => toast.error(err.message),
  });
  const reorderMutation = trpc.admin.faqs.reorder.useMutation({
    onSuccess: () => utils.admin.faqs.list.invalidate(),
    onError: (err) => toast.error(err.message),
  });

  const handleSave = () => {
    const data = {
      question: editing.question,
      answer: editing.answer,
      sortOrder: editing.sortOrder,
      active: editing.active,
    };
    if (isEdit) updateMutation.mutate({ id: editing.id, ...data });
    else createMutation.mutate(data);
  };

  const handleEdit = (item: typeof emptyFaq) => {
    setEditing(item);
    setIsEdit(true);
    setModalOpen(true);
  };

  const handleAdd = () => {
    setEditing(emptyFaq);
    setIsEdit(false);
    setModalOpen(true);
  };

  const handleDelete = (id: number) => {
    const question = data?.find((f) => f.id === id)?.question ?? "esta pergunta";
    if (confirm(`Deseja excluir a pergunta "${question}"? Esta ação não pode ser desfeita.`)) deleteMutation.mutate({ id });
  };

  const columns = [
    {
      key: "question",
      header: "Pergunta",
      render: (item: typeof emptyFaq) => (
        <div>
          <p className="font-medium line-clamp-1">{item.question}</p>
          <p className="text-xs text-[#6B6B6B] line-clamp-1 mt-0.5">{item.answer}</p>
        </div>
      ),
    },
    { key: "sortOrder", header: "Ordem" },
    {
      key: "active",
      header: "Status",
      render: (item: typeof emptyFaq) => (
        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${item.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
          {item.active ? "Ativo" : "Inativo"}
        </span>
      ),
    },
  ];

  return (
    <div>
      <DataTable data={data || []} columns={columns} title="Perguntas Frequentes" onAdd={handleAdd} onEdit={handleEdit} onDelete={handleDelete} onReorder={(ids) => reorderMutation.mutate({ ids })} isLoading={isLoading} />
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={isEdit ? "Editar Pergunta" : "Nova Pergunta"}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#1A1A1A] mb-1">Pergunta</label>
            <input type="text" value={editing.question} onChange={(e) => setEditing({ ...editing, question: e.target.value })} className="w-full px-3 py-2 text-sm rounded-lg border border-[#E5E2DE] focus:outline-none focus:ring-2 focus:ring-[#D4A74B]/50" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1A1A1A] mb-1">Resposta</label>
            <textarea value={editing.answer} onChange={(e) => setEditing({ ...editing, answer: e.target.value })} rows={5} className="w-full px-3 py-2 text-sm rounded-lg border border-[#E5E2DE] focus:outline-none focus:ring-2 focus:ring-[#D4A74B]/50" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1A1A1A] mb-1">Ordem</label>
            <input type="number" value={editing.sortOrder} onChange={(e) => setEditing({ ...editing, sortOrder: Number(e.target.value) })} className="w-full px-3 py-2 text-sm rounded-lg border border-[#E5E2DE] focus:outline-none focus:ring-2 focus:ring-[#D4A74B]/50" />
          </div>
          <div className="flex items-center gap-3">
            <input type="checkbox" id="faqActive" checked={editing.active} onChange={(e) => setEditing({ ...editing, active: e.target.checked })} className="w-4 h-4 rounded border-[#E5E2DE] text-[#D4A74B]" />
            <label htmlFor="faqActive" className="text-sm text-[#1A1A1A]">Ativo</label>
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
