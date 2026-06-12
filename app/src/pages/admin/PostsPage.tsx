import { useState } from "react";
import { toast } from "sonner";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { trpc } from "@/providers/trpc";
import DataTable from "@/components/admin/DataTable";
import Modal from "@/components/admin/Modal";

const empty = { id: 0, title: "", slug: "", excerpt: "", content: "", image: "", active: true };
type Form = typeof empty;

function toSlug(text: string) {
  return text.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-");
}

export default function PostsPage() {
  useAdminAuth();
  const utils = trpc.useUtils();
  const { data, isLoading } = trpc.admin.posts.list.useQuery();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Form>(empty);
  const [isEdit, setIsEdit] = useState(false);

  const createMutation = trpc.admin.posts.create.useMutation({
    onSuccess: () => { utils.admin.posts.list.invalidate(); setModalOpen(false); },
    onError: (err) => toast.error(err.message),
  });
  const updateMutation = trpc.admin.posts.update.useMutation({
    onSuccess: () => { utils.admin.posts.list.invalidate(); setModalOpen(false); },
    onError: (err) => toast.error(err.message),
  });
  const deleteMutation = trpc.admin.posts.delete.useMutation({
    onSuccess: () => utils.admin.posts.list.invalidate(),
    onError: (err) => toast.error(err.message),
  });

  const handleSave = () => {
    if (!editing.content.trim()) { toast.error("Conteúdo é obrigatório."); return; }
    const slug = editing.slug || toSlug(editing.title);
    const payload = { title: editing.title, slug, excerpt: editing.excerpt || undefined, content: editing.content, image: editing.image || undefined, active: editing.active };
    if (isEdit) updateMutation.mutate({ id: editing.id, ...payload });
    else createMutation.mutate(payload);
  };

  const handleEdit = (item: Form) => {
    setEditing({ ...empty, ...item, excerpt: item.excerpt ?? "", image: item.image ?? "" });
    setIsEdit(true); setModalOpen(true);
  };
  const handleAdd = () => { setEditing(empty); setIsEdit(false); setModalOpen(true); };
  const handleDelete = (id: number) => {
    const title = data?.find((p) => p.id === id)?.title ?? "este post";
    if (confirm(`Excluir "${title}"?`)) deleteMutation.mutate({ id });
  };

  const columns = [
    {
      key: "title", header: "Artigo",
      render: (item: Form) => (
        <div>
          <p className="font-medium line-clamp-1">{item.title}</p>
          <p className="text-xs text-[#6B6B6B] font-mono mt-0.5">/dicas/{item.slug}</p>
        </div>
      ),
    },
    {
      key: "active", header: "Status",
      render: (item: Form) => (
        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${item.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
          {item.active ? "Publicado" : "Rascunho"}
        </span>
      ),
    },
  ];

  return (
    <div>
      <DataTable data={data || []} columns={columns} title="Blog / Dicas" onAdd={handleAdd} onEdit={handleEdit} onDelete={handleDelete} isLoading={isLoading} />
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={isEdit ? "Editar Artigo" : "Novo Artigo"}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#1A1A1A] mb-1">Título *</label>
            <input type="text" value={editing.title}
              onChange={(e) => setEditing({ ...editing, title: e.target.value, slug: isEdit ? editing.slug : toSlug(e.target.value) })}
              placeholder="Ex: Como escolher o melhor tipo de gesso para sua obra"
              className="w-full px-3 py-2 text-sm rounded-lg border border-[#E5E2DE] focus:outline-none focus:ring-2 focus:ring-[#D4A74B]/50" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1A1A1A] mb-1">
              Slug (URL) <span className="font-normal text-[#6B6B6B] text-xs">/dicas/seu-slug</span>
            </label>
            <input type="text" value={editing.slug} onChange={(e) => setEditing({ ...editing, slug: e.target.value })}
              placeholder="como-escolher-gesso"
              className="w-full px-3 py-2 text-sm rounded-lg border border-[#E5E2DE] focus:outline-none focus:ring-2 focus:ring-[#D4A74B]/50 font-mono" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1A1A1A] mb-1">URL da Imagem de Capa</label>
            <input type="url" value={editing.image} onChange={(e) => setEditing({ ...editing, image: e.target.value })}
              placeholder="https://..."
              className="w-full px-3 py-2 text-sm rounded-lg border border-[#E5E2DE] focus:outline-none focus:ring-2 focus:ring-[#D4A74B]/50" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1A1A1A] mb-1">Resumo</label>
            <textarea value={editing.excerpt} onChange={(e) => setEditing({ ...editing, excerpt: e.target.value })}
              rows={2} placeholder="Breve resumo exibido na listagem..."
              className="w-full px-3 py-2 text-sm rounded-lg border border-[#E5E2DE] focus:outline-none focus:ring-2 focus:ring-[#D4A74B]/50" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1A1A1A] mb-1">Conteúdo *</label>
            <textarea value={editing.content} onChange={(e) => setEditing({ ...editing, content: e.target.value })}
              rows={10} placeholder="Escreva o artigo completo aqui. Use linhas em branco para separar parágrafos."
              className="w-full px-3 py-2 text-sm rounded-lg border border-[#E5E2DE] focus:outline-none focus:ring-2 focus:ring-[#D4A74B]/50 font-mono" />
          </div>
          <div className="flex items-center gap-3">
            <input type="checkbox" id="postActive" checked={editing.active} onChange={(e) => setEditing({ ...editing, active: e.target.checked })} className="w-4 h-4 rounded accent-[#D4A74B]" />
            <label htmlFor="postActive" className="text-sm text-[#1A1A1A]">Publicado (visível no site)</label>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm font-medium text-[#6B6B6B] hover:text-[#1A1A1A]">Cancelar</button>
            <button onClick={handleSave} className="btn-primary text-sm py-2.5 px-5">{isEdit ? "Salvar" : "Publicar"}</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
