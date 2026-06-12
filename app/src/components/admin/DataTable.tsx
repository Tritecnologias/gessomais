import { useState } from "react";
import { Pencil, Trash2, Plus, Search, ChevronLeft, ChevronRight, GripVertical, ArrowUpDown } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
}

interface DataTableProps<T extends { id: number }> {
  data: T[];
  columns: Column<T>[];
  title: string;
  onAdd: () => void;
  onEdit: (item: T) => void;
  onDelete: (id: number) => void;
  onReorder?: (ids: number[]) => void;
  isLoading?: boolean;
}

function SortableRow<T extends { id: number }>({
  item,
  columns,
  onEdit,
  onDelete,
}: {
  item: T;
  columns: Column<T>[];
  onEdit: (item: T) => void;
  onDelete: (id: number) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : undefined,
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className="border-b border-[#E5E2DE] bg-white hover:bg-[#F5F3F0]/50 transition-colors"
    >
      <td className="px-4 py-3 w-10">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-[#6B6B6B] hover:text-[#1A1A1A] touch-none"
        >
          <GripVertical className="w-4 h-4" />
        </button>
      </td>
      {columns.map((col) => (
        <td key={col.key} className="px-4 py-3 text-sm text-[#1A1A1A]">
          {col.render
            ? col.render(item)
            : (item as Record<string, unknown>)[col.key]?.toString()}
        </td>
      ))}
      <td className="px-4 py-3 text-right">
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => onEdit(item)}
            className="p-1.5 rounded-lg text-[#6B6B6B] hover:text-[#D4A74B] hover:bg-[#D4A74B]/10 transition-all"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(item.id)}
            className="p-1.5 rounded-lg text-[#6B6B6B] hover:text-red-500 hover:bg-red-50 transition-all"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}

export default function DataTable<T extends { id: number }>({
  data,
  columns,
  title,
  onAdd,
  onEdit,
  onDelete,
  onReorder,
  isLoading,
}: DataTableProps<T>) {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [reorderMode, setReorderMode] = useState(false);
  const [localOrder, setLocalOrder] = useState<T[]>([]);
  const itemsPerPage = 10;

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleEnterReorder = () => {
    setLocalOrder([...data]);
    setReorderMode(true);
  };

  const handleCancelReorder = () => {
    setReorderMode(false);
    setLocalOrder([]);
  };

  const handleSaveReorder = () => {
    onReorder?.(localOrder.map((item) => item.id));
    setReorderMode(false);
    setLocalOrder([]);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setLocalOrder((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const filtered = data.filter((item) =>
    JSON.stringify(item).toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (reorderMode && onReorder) {
    return (
      <div className="bg-white rounded-xl border border-[#E5E2DE] overflow-hidden">
        <div className="p-5 flex items-center justify-between border-b border-[#E5E2DE]">
          <div>
            <h2 className="text-lg font-semibold text-[#1A1A1A]">{title}</h2>
            <p className="text-xs text-[#6B6B6B] mt-0.5">Arraste para reordenar, depois salve</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCancelReorder}
              className="px-4 py-2 text-sm font-medium text-[#6B6B6B] border border-[#E5E2DE] rounded-lg hover:bg-[#F5F3F0] transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSaveReorder}
              className="btn-primary text-xs py-2.5 px-4"
            >
              Salvar Ordem
            </button>
          </div>
        </div>

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={localOrder.map((i) => i.id)} strategy={verticalListSortingStrategy}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#E5E2DE] bg-[#F5F3F0]">
                    <th className="w-10 px-4 py-3" />
                    {columns.map((col) => (
                      <th key={col.key} className="text-left text-xs font-semibold uppercase tracking-wider text-[#6B6B6B] px-4 py-3">
                        {col.header}
                      </th>
                    ))}
                    <th className="text-right px-4 py-3 w-24">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {localOrder.map((item) => (
                    <SortableRow
                      key={item.id}
                      item={item}
                      columns={columns}
                      onEdit={onEdit}
                      onDelete={onDelete}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </SortableContext>
        </DndContext>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-[#E5E2DE] overflow-hidden">
      {/* Header */}
      <div className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#E5E2DE]">
        <h2 className="text-lg font-semibold text-[#1A1A1A]">{title}</h2>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B6B6B]" />
            <input
              type="text"
              placeholder="Buscar..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full sm:w-64 pl-9 pr-4 py-2 text-sm rounded-lg border border-[#E5E2DE] focus:outline-none focus:ring-2 focus:ring-[#D4A74B]/50"
            />
          </div>
          {onReorder && (
            <button
              onClick={handleEnterReorder}
              title="Reordenar"
              className="p-2.5 rounded-lg border border-[#E5E2DE] text-[#6B6B6B] hover:text-[#D4A74B] hover:border-[#D4A74B]/50 transition-all"
            >
              <ArrowUpDown className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onAdd}
            className="btn-primary text-xs py-2.5 px-4 whitespace-nowrap"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Novo
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#E5E2DE] bg-[#F5F3F0]">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="text-left text-xs font-semibold uppercase tracking-wider text-[#6B6B6B] px-4 py-3"
                >
                  {col.header}
                </th>
              ))}
              <th className="text-right px-4 py-3 w-24">Ações</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={columns.length + 1} className="px-4 py-8 text-center text-[#6B6B6B]">
                  Carregando...
                </td>
              </tr>
            ) : paginated.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 1} className="px-4 py-8 text-center text-[#6B6B6B]">
                  Nenhum registro encontrado
                </td>
              </tr>
            ) : (
              paginated.map((item, idx) => (
                <tr
                  key={item.id}
                  className={`border-b border-[#E5E2DE] hover:bg-[#F5F3F0]/50 transition-colors ${
                    idx % 2 === 0 ? "bg-white" : "bg-[#F5F3F0]/30"
                  }`}
                >
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3 text-sm text-[#1A1A1A]">
                      {col.render
                        ? col.render(item)
                        : (item as Record<string, unknown>)[col.key]?.toString()}
                    </td>
                  ))}
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onEdit(item)}
                        className="p-1.5 rounded-lg text-[#6B6B6B] hover:text-[#D4A74B] hover:bg-[#D4A74B]/10 transition-all"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(item.id)}
                        className="p-1.5 rounded-lg text-[#6B6B6B] hover:text-red-500 hover:bg-red-50 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="p-4 border-t border-[#E5E2DE] flex items-center justify-between">
          <p className="text-sm text-[#6B6B6B]">
            Mostrando {(currentPage - 1) * itemsPerPage + 1} -{" "}
            {Math.min(currentPage * itemsPerPage, filtered.length)} de{" "}
            {filtered.length}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-[#E5E2DE] text-[#6B6B6B] hover:bg-[#F5F3F0] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm text-[#6B6B6B] px-2">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-[#E5E2DE] text-[#6B6B6B] hover:bg-[#F5F3F0] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
