import { useState } from "react";
import { toast } from "sonner";
import { Mail, Phone, MapPin, Car, FileCheck, Calendar, Eye, Trash2, Filter } from "lucide-react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { trpc } from "@/providers/trpc";
import Modal from "@/components/admin/Modal";

type Application = {
  id: number;
  name: string;
  email: string;
  phone: string;
  area: string;
  experience: string;
  availability: string;
  hasCnh: boolean;
  hasVehicle: boolean;
  message: string | null;
  read: boolean;
  createdAt: Date;
};

function timeAgo(date: Date) {
  const diff = Date.now() - new Date(date).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}min atrás`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h atrás`;
  return `${Math.floor(h / 24)}d atrás`;
}

export default function JobApplicationsPage() {
  useAdminAuth();
  const utils = trpc.useUtils();
  const { data, isLoading } = trpc.admin.jobApplications.list.useQuery();
  const [selected, setSelected] = useState<Application | null>(null);
  const [filterArea, setFilterArea] = useState("");

  const markReadMutation = trpc.admin.jobApplications.markRead.useMutation({
    onSuccess: () => utils.admin.jobApplications.list.invalidate(),
  });
  const deleteMutation = trpc.admin.jobApplications.delete.useMutation({
    onSuccess: () => { utils.admin.jobApplications.list.invalidate(); setSelected(null); },
    onError: (err) => toast.error(err.message),
  });

  const openDetail = (app: Application) => {
    setSelected(app);
    if (!app.read) markReadMutation.mutate({ id: app.id });
  };

  const handleDelete = (id: number, name: string) => {
    if (confirm(`Excluir candidatura de "${name}"? Esta ação não pode ser desfeita.`))
      deleteMutation.mutate({ id });
  };

  const areas = Array.from(new Set(data?.map((a) => a.area) ?? [])).sort();
  const filtered = filterArea ? data?.filter((a) => a.area === filterArea) : data;
  const unread = data?.filter((a) => !a.read).length ?? 0;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-[#1A1A1A]">Candidaturas</h2>
          <p className="text-sm text-[#6B6B6B] mt-0.5">
            {data?.length ?? 0} candidato{data?.length !== 1 ? 's' : ''} cadastrado{data?.length !== 1 ? 's' : ''}
            {unread > 0 && (
              <span className="ml-2 inline-block bg-[#D4A74B] text-[#1A1A1A] text-xs font-bold px-2 py-0.5 rounded-full">
                {unread} novo{unread !== 1 ? 's' : ''}
              </span>
            )}
          </p>
        </div>

        {/* Filter */}
        {areas.length > 0 && (
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#6B6B6B]" />
            <select
              value={filterArea}
              onChange={(e) => setFilterArea(e.target.value)}
              className="text-sm px-3 py-2 rounded-lg border border-[#E5E2DE] focus:outline-none focus:ring-2 focus:ring-[#D4A74B]/50 bg-white"
            >
              <option value="">Todas as áreas</option>
              {areas.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-[#E5E2DE] p-5 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[#E5E2DE]" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-[#E5E2DE] rounded w-40" />
                  <div className="h-3 bg-[#E5E2DE] rounded w-64" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filtered?.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#E5E2DE] p-12 text-center">
          <p className="text-[#6B6B6B]">Nenhuma candidatura encontrada.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered?.map((app) => (
            <div
              key={app.id}
              className={`bg-white rounded-xl border p-5 flex items-center gap-4 hover:shadow-sm transition-shadow cursor-pointer ${!app.read ? 'border-[#D4A74B]/50 bg-amber-50/30' : 'border-[#E5E2DE]'}`}
              onClick={() => openDetail(app as Application)}
            >
              {/* Avatar */}
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                style={{ backgroundColor: 'rgba(212,167,75,0.15)', color: '#D4A74B' }}
              >
                {app.name.charAt(0).toUpperCase()}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-[#1A1A1A] truncate">{app.name}</p>
                  {!app.read && (
                    <span className="shrink-0 w-2 h-2 rounded-full bg-[#D4A74B]" />
                  )}
                </div>
                <p className="text-xs text-[#6B6B6B] mt-0.5 truncate">
                  {app.area} · {app.experience} · Disponibilidade: {app.availability}
                </p>
              </div>

              {/* Badges */}
              <div className="hidden md:flex items-center gap-2 shrink-0">
                {app.hasCnh && (
                  <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full font-medium">CNH</span>
                )}
                {app.hasVehicle && (
                  <span className="text-xs bg-green-50 text-green-600 px-2 py-1 rounded-full font-medium">Veículo</span>
                )}
                <span className="text-xs text-[#6B6B6B]">{timeAgo(app.createdAt)}</span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={(e) => { e.stopPropagation(); openDetail(app as Application); }}
                  className="p-2 rounded-lg hover:bg-[#F5F3F0] text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors"
                  title="Ver detalhes"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(app.id, app.name); }}
                  className="p-2 rounded-lg hover:bg-red-50 text-[#6B6B6B] hover:text-red-500 transition-colors"
                  title="Excluir"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title="Detalhes da Candidatura">
        {selected && (
          <div className="space-y-5">
            {/* Header */}
            <div className="flex items-center gap-4">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold"
                style={{ backgroundColor: 'rgba(212,167,75,0.15)', color: '#D4A74B' }}
              >
                {selected.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-lg font-semibold text-[#1A1A1A]">{selected.name}</p>
                <p className="text-sm text-[#6B6B6B]">{selected.area}</p>
              </div>
            </div>

            {/* Contato */}
            <div className="grid grid-cols-1 gap-2">
              <a href={`mailto:${selected.email}`} className="flex items-center gap-2.5 text-sm text-[#1A1A1A] hover:text-[#D4A74B] transition-colors">
                <Mail className="w-4 h-4 text-[#D4A74B]" /> {selected.email}
              </a>
              <a href={`https://wa.me/${selected.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 text-sm text-[#1A1A1A] hover:text-[#D4A74B] transition-colors">
                <Phone className="w-4 h-4 text-[#D4A74B]" /> {selected.phone}
              </a>
            </div>

            {/* Detalhes profissionais */}
            <div className="bg-[#F5F3F0] rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm text-[#1A1A1A]">
                <MapPin className="w-4 h-4 text-[#D4A74B]" />
                <span className="font-medium">Experiência:</span> {selected.experience}
              </div>
              <div className="flex items-center gap-2 text-sm text-[#1A1A1A]">
                <Calendar className="w-4 h-4 text-[#D4A74B]" />
                <span className="font-medium">Disponibilidade:</span> {selected.availability}
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2 text-[#1A1A1A]">
                  <FileCheck className={`w-4 h-4 ${selected.hasCnh ? 'text-green-500' : 'text-[#C0B9B2]'}`} />
                  <span className={selected.hasCnh ? 'text-green-700 font-medium' : 'text-[#6B6B6B] line-through'}>CNH</span>
                </div>
                <div className="flex items-center gap-2 text-[#1A1A1A]">
                  <Car className={`w-4 h-4 ${selected.hasVehicle ? 'text-green-500' : 'text-[#C0B9B2]'}`} />
                  <span className={selected.hasVehicle ? 'text-green-700 font-medium' : 'text-[#6B6B6B] line-through'}>Veículo próprio</span>
                </div>
              </div>
            </div>

            {/* Mensagem */}
            {selected.message && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#6B6B6B] mb-2">Mensagem</p>
                <p className="text-sm text-[#1A1A1A] leading-relaxed whitespace-pre-wrap bg-[#F5F3F0] rounded-xl p-4">
                  {selected.message}
                </p>
              </div>
            )}

            <p className="text-xs text-[#6B6B6B]">Enviado {timeAgo(selected.createdAt)}</p>

            {/* Footer */}
            <div className="flex justify-between items-center pt-2 border-t border-[#E5E2DE]">
              <button
                onClick={() => handleDelete(selected.id, selected.name)}
                className="inline-flex items-center gap-2 text-sm font-medium text-red-500 hover:text-red-700 transition-colors"
              >
                <Trash2 className="w-4 h-4" /> Excluir candidatura
              </button>
              <a
                href={`https://wa.me/${selected.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Olá ${selected.name}! Encontrei sua candidatura na ${selected.area} e gostaria de conversar sobre uma oportunidade.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary text-xs py-2.5 px-4"
              >
                Chamar no WhatsApp
              </a>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
