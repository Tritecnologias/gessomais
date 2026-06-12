import { useAdminAuth } from "@/hooks/useAdminAuth";
import { trpc } from "@/providers/trpc";
import { Package, Briefcase, MessageSquare, HelpCircle, Clock, TrendingUp, AlertTriangle } from "lucide-react";
import { Link } from "react-router";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const statCards = [
  { key: "products" as const, label: "Produtos", icon: Package, color: "#D4A74B", href: "/admin/products" },
  { key: "services" as const, label: "Serviços", icon: Briefcase, color: "#22C55E", href: "/admin/services" },
  { key: "testimonials" as const, label: "Depoimentos", icon: MessageSquare, color: "#3B82F6", href: "/admin/testimonials" },
  { key: "faqs" as const, label: "Perguntas FAQ", icon: HelpCircle, color: "#8B5CF6", href: "/admin/faqs" },
];

const typeColors: Record<string, string> = {
  Produto: "#D4A74B",
  Serviço: "#22C55E",
  Depoimento: "#3B82F6",
  FAQ: "#8B5CF6",
};

const STATUS_COLORS: Record<string, string> = {
  novo: "#3B82F6",
  em_contato: "#F59E0B",
  orcamento_enviado: "#8B5CF6",
  fechado: "#22C55E",
  perdido: "#EF4444",
};
const STATUS_LABELS: Record<string, string> = {
  novo: "Novo",
  em_contato: "Em Contato",
  orcamento_enviado: "Orçamento",
  fechado: "Fechado",
  perdido: "Perdido",
};

function timeAgo(date: Date | string) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "agora mesmo";
  if (mins < 60) return `${mins}min atrás`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h atrás`;
  const days = Math.floor(hours / 24);
  return `${days}d atrás`;
}

function formatMonth(ym: string) {
  const [year, month] = ym.split("-");
  const d = new Date(Number(year), Number(month) - 1, 1);
  return format(d, "MMM", { locale: ptBR });
}

export default function Dashboard() {
  useAdminAuth();
  const { data: stats, isLoading } = trpc.admin.stats.dashboard.useQuery();
  const { data: leadsHistory } = trpc.admin.stats.leadsHistory.useQuery();
  const { data: stockAlerts = [] } = trpc.admin.stock.alerts.useQuery();

  const monthlyData = leadsHistory?.monthly.map((r) => ({
    month: formatMonth(r.month),
    total: Number(r.total),
  })) ?? [];

  const pipelineData = (leadsHistory?.byStatus ?? []).map((r) => ({
    name: STATUS_LABELS[r.status] ?? r.status,
    value: Number(r.total),
    color: STATUS_COLORS[r.status] ?? "#9CA3AF",
  }));

  return (
    <div>
      <h2 className="text-2xl font-display font-bold text-[#1A1A1A] mb-6">Dashboard</h2>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map((card) => {
          const Icon = card.icon;
          const stat = stats?.[card.key];
          const total = stat?.total ?? 0;
          const active = stat?.active ?? 0;
          const inactive = total - active;
          return (
            <Link
              key={card.key}
              to={card.href}
              className="bg-white rounded-xl border border-[#E5E2DE] p-5 hover:border-[#D4A74B]/50 transition-colors block"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${card.color}15` }}>
                  <Icon className="w-5 h-5" style={{ color: card.color }} />
                </div>
                {!isLoading && inactive > 0 && (
                  <span className="text-xs bg-gray-100 text-[#6B6B6B] px-2 py-0.5 rounded-full">
                    {inactive} inativo{inactive > 1 ? "s" : ""}
                  </span>
                )}
              </div>
              <p className="text-3xl font-bold text-[#1A1A1A]">{isLoading ? "..." : total}</p>
              <p className="text-sm text-[#6B6B6B] mt-1">{card.label}</p>
              {!isLoading && total > 0 && (
                <div className="mt-3 h-1.5 rounded-full bg-[#F5F3F0] overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${(active / total) * 100}%`, backgroundColor: card.color }}
                  />
                </div>
              )}
            </Link>
          );
        })}
      </div>

      {/* Leads + Pipeline charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Leads por mês */}
        <div className="bg-white rounded-xl border border-[#E5E2DE] p-5 lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-[#D4A74B]" />
            <h3 className="text-sm font-semibold text-[#1A1A1A]">Leads — últimos 6 meses</h3>
          </div>
          {monthlyData.length === 0 ? (
            <div className="h-36 flex items-center justify-center text-sm text-[#9CA3AF]">
              Nenhum lead registrado ainda.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={monthlyData} barSize={28}>
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#6B6B6B" }} axisLine={false} tickLine={false} />
                <YAxis hide allowDecimals={false} />
                <Tooltip
                  contentStyle={{ borderRadius: 8, border: "1px solid #E5E2DE", fontSize: 12 }}
                  formatter={(v: number) => [v, "Leads"]}
                />
                <Bar dataKey="total" fill="#D4A74B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Pipeline */}
        <div className="bg-white rounded-xl border border-[#E5E2DE] p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-4 h-4 rounded-full bg-[#3B82F6]" />
            <h3 className="text-sm font-semibold text-[#1A1A1A]">Pipeline de Leads</h3>
          </div>
          {pipelineData.length === 0 ? (
            <div className="h-36 flex items-center justify-center text-sm text-[#9CA3AF]">
              Nenhum lead ainda.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie
                  data={pipelineData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={65}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pipelineData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: 8, border: "1px solid #E5E2DE", fontSize: 12 }}
                />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Stock alerts + recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* Stock alerts */}
        {stockAlerts.length > 0 && (
          <div className="bg-white rounded-xl border border-[#E5E2DE] p-5">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-semibold text-[#1A1A1A]">Alertas de Estoque</h3>
              <Link to="/admin/estoque" className="ml-auto text-xs text-[#D4A74B] hover:underline">Ver todos</Link>
            </div>
            <ul className="space-y-2">
              {stockAlerts.slice(0, 5).map((item) => (
                <li key={item.id} className="flex items-center gap-3 text-sm">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${item.status === "zerado" ? "bg-red-500" : "bg-amber-400"}`} />
                  <span className="flex-1 truncate text-[#1A1A1A]">{item.name}</span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    item.status === "zerado" ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-600"
                  }`}>
                    {item.quantity} {item.unit}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Recent Activity */}
        {stats?.recentActivity && stats.recentActivity.length > 0 && (
          <div className="bg-white rounded-xl border border-[#E5E2DE] p-5">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-4 h-4 text-[#6B6B6B]" />
              <h3 className="text-sm font-semibold text-[#1A1A1A]">Atividade Recente</h3>
            </div>
            <ul className="space-y-3">
              {stats.recentActivity.map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-sm">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: typeColors[item.type] ?? "#6B6B6B" }} />
                  <span
                    className="text-xs font-medium px-2 py-0.5 rounded-full shrink-0"
                    style={{ backgroundColor: `${typeColors[item.type] ?? "#6B6B6B"}15`, color: typeColors[item.type] ?? "#6B6B6B" }}
                  >
                    {item.type}
                  </span>
                  <span className="text-[#1A1A1A] truncate flex-1">{item.label}</span>
                  <span className="text-xs text-[#6B6B6B] shrink-0">{timeAgo(item.updatedAt)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Leads + Applications unread */}
      {stats && (stats.leads.unread > 0 || stats.jobApplications.unread > 0) && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-wrap gap-4 mb-6">
          {stats.leads.unread > 0 && (
            <Link to="/admin/leads" className="flex items-center gap-2 text-sm font-medium text-amber-700 hover:underline">
              <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-xs flex items-center justify-center font-bold">
                {stats.leads.unread}
              </span>
              {stats.leads.unread === 1 ? "novo lead" : "novos leads"} não lido{stats.leads.unread > 1 ? "s" : ""}
            </Link>
          )}
          {stats.jobApplications.unread > 0 && (
            <Link to="/admin/candidatos" className="flex items-center gap-2 text-sm font-medium text-amber-700 hover:underline">
              <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-xs flex items-center justify-center font-bold">
                {stats.jobApplications.unread}
              </span>
              {stats.jobApplications.unread === 1 ? "nova candidatura" : "novas candidaturas"} não lida{stats.jobApplications.unread > 1 ? "s" : ""}
            </Link>
          )}
        </div>
      )}

      {/* Help panel */}
      <div className="bg-white rounded-xl border border-[#E5E2DE] p-6">
        <h3 className="text-lg font-semibold text-[#1A1A1A] mb-4">Bem-vindo ao Painel Administrativo</h3>
        <ul className="space-y-2 text-sm text-[#6B6B6B]">
          {statCards.map((card) => (
            <li key={card.key} className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: card.color }} />
              <Link to={card.href} className="font-semibold text-[#1A1A1A] hover:underline">{card.label}</Link>
            </li>
          ))}
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#6B6B6B]" />
            <Link to="/admin/config" className="font-semibold text-[#1A1A1A] hover:underline">Configurações</Link>
            {" "}— textos do hero, vídeo, rodapé e SEO
          </li>
        </ul>
      </div>
    </div>
  );
}
