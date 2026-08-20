import { useState } from "react";
import { toast } from "sonner";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { trpc } from "@/providers/trpc";
import DataTable from "@/components/admin/DataTable";
import Modal from "@/components/admin/Modal";
import type { Product } from "@db/schema";

const emptyProduct: Product = {
  id: 0,
  name: "",
  description: null,
  image: null,
  price: "",
  oldPrice: null,
  unit: "un",
  badge: null,
  badgeColor: "#D4A74B",
  badgeTextColor: "#1A1A1A",
  quantity: 0,
  minStock: 0,
  sortOrder: 0,
  active: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

export default function ProductsPage() {
  useAdminAuth();
  const utils = trpc.useUtils();
  const { data: products, isLoading } = trpc.admin.products.list.useQuery();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<typeof emptyProduct>(emptyProduct);
  const [isEdit, setIsEdit] = useState(false);

  const createMutation = trpc.admin.products.create.useMutation({
    onSuccess: () => { utils.admin.products.list.invalidate(); setModalOpen(false); },
    onError: (err) => toast.error(err.message),
  });

  const updateMutation = trpc.admin.products.update.useMutation({
    onSuccess: () => { utils.admin.products.list.invalidate(); setModalOpen(false); },
    onError: (err) => toast.error(err.message),
  });

  const deleteMutation = trpc.admin.products.delete.useMutation({
    onSuccess: () => utils.admin.products.list.invalidate(),
    onError: (err) => toast.error(err.message),
  });

  const reorderMutation = trpc.admin.products.reorder.useMutation({
    onSuccess: () => utils.admin.products.list.invalidate(),
    onError: (err) => toast.error(err.message),
  });

  const handleSave = () => {
    if (isEdit) {
      updateMutation.mutate({
        id: editing.id,
        name: editing.name,
        description: editing.description || null,
        image: editing.image || undefined,
        price: editing.price,
        oldPrice: editing.oldPrice || null,
        unit: editing.unit,
        badge: editing.badge || null,
        badgeColor: editing.badgeColor || undefined,
        badgeTextColor: editing.badgeTextColor || undefined,
        sortOrder: editing.sortOrder,
        active: editing.active,
      });
    } else {
      createMutation.mutate({
        name: editing.name,
        description: editing.description || undefined,
        image: editing.image || undefined,
        price: editing.price,
        oldPrice: editing.oldPrice || undefined,
        unit: editing.unit,
        badge: editing.badge || undefined,
        badgeColor: editing.badgeColor || undefined,
        badgeTextColor: editing.badgeTextColor || undefined,
        sortOrder: editing.sortOrder,
        active: editing.active,
      });
    }
  };

  const handleEdit = (item: Product) => {
    setEditing(item);
    setIsEdit(true);
    setModalOpen(true);
  };

  const handleAdd = () => {
    setEditing(emptyProduct);
    setIsEdit(false);
    setModalOpen(true);
  };

  const handleDelete = (id: number) => {
    const name = products?.find((p) => p.id === id)?.name ?? "este produto";
    if (confirm(`Deseja excluir o produto "${name}"? Esta ação não pode ser desfeita.`)) {
      deleteMutation.mutate({ id });
    }
  };

  const columns = [
    {
      key: "name",
      header: "Nome",
      render: (item: Product) => (
        <div className="flex items-center gap-3">
          {item.image && (
            <img
              src={item.image}
              alt={item.name}
              className="w-10 h-10 rounded-lg object-cover"
            />
          )}
          <div>
            <p className="font-medium">{item.name}</p>
            {item.badge && (
              <span
                className="text-[0.65rem] px-2 py-0.5 rounded-full font-medium"
                style={{
                  backgroundColor: item.badgeColor || "#D4A74B",
                  color: item.badgeTextColor || "#1A1A1A",
                }}
              >
                {item.badge}
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "price",
      header: "Preço",
      render: (item: Product) => (
        <div>
          <span className="font-semibold" style={{ color: "#22C55E" }}>
            R$ {item.price}/{item.unit}
          </span>
          {item.oldPrice && (
            <span className="text-xs line-through ml-2 text-[#6B6B6B]">
              R$ {item.oldPrice}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "sortOrder",
      header: "Ordem",
    },
    {
      key: "active",
      header: "Status",
      render: (item: Product) => (
        <span
          className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
            item.active
              ? "bg-green-100 text-green-700"
              : "bg-gray-100 text-gray-600"
          }`}
        >
          {item.active ? "Ativo" : "Inativo"}
        </span>
      ),
    },
  ];

  return (
    <div>
      <DataTable
        data={products || []}
        columns={columns}
        title="Produtos"
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onReorder={(ids) => reorderMutation.mutate({ ids })}
        isLoading={isLoading}
      />

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={isEdit ? "Editar Produto" : "Novo Produto"}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#1A1A1A] mb-1">
              Nome
            </label>
            <input
              type="text"
              value={editing.name}
              onChange={(e) =>
                setEditing({ ...editing, name: e.target.value })
              }
              className="w-full px-3 py-2 text-sm rounded-lg border border-[#E5E2DE] focus:outline-none focus:ring-2 focus:ring-[#D4A74B]/50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1A1A1A] mb-1">
              Descrição
            </label>
            <textarea
              value={editing.description || ""}
              onChange={(e) =>
                setEditing({ ...editing, description: e.target.value })
              }
              rows={3}
              className="w-full px-3 py-2 text-sm rounded-lg border border-[#E5E2DE] focus:outline-none focus:ring-2 focus:ring-[#D4A74B]/50"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#1A1A1A] mb-1">
                Preço
              </label>
              <input
                type="text"
                value={editing.price}
                onChange={(e) =>
                  setEditing({ ...editing, price: e.target.value })
                }
                className="w-full px-3 py-2 text-sm rounded-lg border border-[#E5E2DE] focus:outline-none focus:ring-2 focus:ring-[#D4A74B]/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1A1A1A] mb-1">
                Preço Antigo
              </label>
              <input
                type="text"
                value={editing.oldPrice || ""}
                onChange={(e) =>
                  setEditing({ ...editing, oldPrice: e.target.value })
                }
                className="w-full px-3 py-2 text-sm rounded-lg border border-[#E5E2DE] focus:outline-none focus:ring-2 focus:ring-[#D4A74B]/50"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#1A1A1A] mb-1">
                Unidade
              </label>
              <input
                type="text"
                value={editing.unit}
                onChange={(e) =>
                  setEditing({ ...editing, unit: e.target.value })
                }
                className="w-full px-3 py-2 text-sm rounded-lg border border-[#E5E2DE] focus:outline-none focus:ring-2 focus:ring-[#D4A74B]/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1A1A1A] mb-1">
                Ordem
              </label>
              <input
                type="number"
                value={editing.sortOrder}
                onChange={(e) =>
                  setEditing({ ...editing, sortOrder: Number(e.target.value) })
                }
                className="w-full px-3 py-2 text-sm rounded-lg border border-[#E5E2DE] focus:outline-none focus:ring-2 focus:ring-[#D4A74B]/50"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1A1A1A] mb-1">
              Imagem (URL)
            </label>
            <input
              type="text"
              value={editing.image || ""}
              onChange={(e) =>
                setEditing({ ...editing, image: e.target.value })
              }
              placeholder="/images/nome.jpg"
              className="w-full px-3 py-2 text-sm rounded-lg border border-[#E5E2DE] focus:outline-none focus:ring-2 focus:ring-[#D4A74B]/50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1A1A1A] mb-1">
              Badge
            </label>
            <input
              type="text"
              value={editing.badge || ""}
              onChange={(e) =>
                setEditing({ ...editing, badge: e.target.value })
              }
              className="w-full px-3 py-2 text-sm rounded-lg border border-[#E5E2DE] focus:outline-none focus:ring-2 focus:ring-[#D4A74B]/50"
            />
          </div>
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="active"
              checked={editing.active}
              onChange={(e) =>
                setEditing({ ...editing, active: e.target.checked })
              }
              className="w-4 h-4 rounded border-[#E5E2DE] text-[#D4A74B] focus:ring-[#D4A74B]"
            />
            <label htmlFor="active" className="text-sm text-[#1A1A1A]">
              Ativo
            </label>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="btn-primary text-sm py-2.5 px-5"
            >
              {isEdit ? "Salvar" : "Criar"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
