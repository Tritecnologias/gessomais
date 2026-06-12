import { useState, useRef, useEffect } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router";
import {
  LayoutDashboard,
  Package,
  Briefcase,
  MessageSquare,
  HelpCircle,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  Home,
  Users,
  UserPlus,
  ClipboardList,
  TrendingUp,
  Image,
  BookOpen,
  Handshake,
  Warehouse,
  Bell,
  CalendarDays,
  Calculator,
  ListChecks,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";
import { format, isToday, isTomorrow } from "date-fns";
import { ptBR } from "date-fns/locale";

const menuGroups = [
  {
    label: "Geral",
    items: [
      { icon: LayoutDashboard, label: "Dashboard", path: "/admin" },
      { icon: TrendingUp,  label: "Leads",   path: "/admin/leads" },
      { icon: Warehouse,   label: "Estoque", path: "/admin/estoque" },
    ],
  },
  {
    label: "Conteúdo",
    items: [
      { icon: Package,      label: "Produtos",    path: "/admin/products" },
      { icon: Briefcase,    label: "Serviços",    path: "/admin/services" },
      { icon: Image,        label: "Portfólio",   path: "/admin/portfolio" },
      { icon: MessageSquare,label: "Depoimentos", path: "/admin/testimonials" },
      { icon: HelpCircle,   label: "FAQ",         path: "/admin/faqs" },
      { icon: BookOpen,     label: "Blog",        path: "/admin/blog" },
      { icon: Handshake,    label: "Parceiros",   path: "/admin/parceiros" },
      { icon: Calculator,   label: "Calculadora", path: "/admin/calculadora" },
    ],
  },
  {
    label: "RH",
    items: [
      { icon: UserPlus,      label: "Vagas",       path: "/admin/vagas" },
      { icon: ClipboardList, label: "Candidatos",  path: "/admin/candidatos" },
    ],
  },
  {
    label: "Operações",
    items: [
      { icon: ListChecks,   label: "Tarefas", path: "/admin/tarefas" },
      { icon: CalendarDays, label: "Agenda",  path: "/admin/agenda" },
    ],
  },
  {
    label: "Sistema",
    items: [
      { icon: Settings,    label: "Configurações", path: "/admin/config" },
      { icon: Users,       label: "Usuários",      path: "/admin/users" },
      { icon: ShieldCheck, label: "Auditoria",     path: "/admin/auditoria" },
    ],
  },
];

function NotificationBell() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { data, refetch } = trpc.admin.notifications.unread.useQuery(undefined, {
    refetchInterval: 60_000,
  });

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const total = data?.total ?? 0;

  function visitDate(dt: Date | string) {
    const d = new Date(dt);
    if (isToday(d)) return `Hoje ${format(d, "HH:mm")}`;
    if (isTomorrow(d)) return `Amanhã ${format(d, "HH:mm")}`;
    return format(d, "dd/MM HH:mm", { locale: ptBR });
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => { setOpen((o) => !o); if (!open) refetch(); }}
        className="relative p-2 rounded-lg hover:bg-[#F5F3F0] transition-colors"
      >
        <Bell className="w-5 h-5 text-[#1A1A1A]" />
        {total > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {total > 9 ? "9+" : total}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-[#E5E2DE] rounded-xl shadow-xl z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-[#E5E2DE] flex items-center justify-between">
            <span className="text-sm font-semibold text-[#1A1A1A]">Notificações</span>
            {total === 0 && <span className="text-xs text-[#9CA3AF]">Tudo em dia</span>}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {(data?.recentLeads ?? []).map((l) => (
              <button
                key={`lead-${l.id}`}
                onClick={() => { navigate("/admin/leads"); setOpen(false); }}
                className="w-full text-left px-4 py-3 hover:bg-[#F5F3F0] transition-colors border-b border-[#F5F3F0]"
              >
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="w-2 h-2 rounded-full bg-[#3B82F6] shrink-0" />
                  <span className="text-xs font-semibold text-[#3B82F6]">Novo Lead</span>
                </div>
                <p className="text-sm text-[#1A1A1A] font-medium truncate">{l.name}</p>
                {l.service && <p className="text-xs text-[#6B6B6B] truncate">{l.service}</p>}
              </button>
            ))}
            {(data?.recentApps ?? []).map((a) => (
              <button
                key={`app-${a.id}`}
                onClick={() => { navigate("/admin/candidatos"); setOpen(false); }}
                className="w-full text-left px-4 py-3 hover:bg-[#F5F3F0] transition-colors border-b border-[#F5F3F0]"
              >
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="w-2 h-2 rounded-full bg-[#D4A74B] shrink-0" />
                  <span className="text-xs font-semibold text-[#D4A74B]">Candidatura</span>
                </div>
                <p className="text-sm text-[#1A1A1A] font-medium truncate">{a.name}</p>
                <p className="text-xs text-[#6B6B6B] truncate">{a.area}</p>
              </button>
            ))}
            {(data?.upcomingVisits ?? []).map((v) => (
              <button
                key={`visit-${v.id}`}
                onClick={() => { navigate("/admin/agenda"); setOpen(false); }}
                className="w-full text-left px-4 py-3 hover:bg-[#F5F3F0] transition-colors border-b border-[#F5F3F0]"
              >
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
                  <span className="text-xs font-semibold text-green-600">Visita</span>
                  <span className="text-xs text-[#9CA3AF] ml-auto">{visitDate(v.scheduledAt)}</span>
                </div>
                <p className="text-sm text-[#1A1A1A] font-medium truncate">{v.title}</p>
              </button>
            ))}
            {(data?.overdueTasks ?? []).map((t) => (
              <button
                key={`task-${t.id}`}
                onClick={() => { navigate("/admin/tarefas"); setOpen(false); }}
                className="w-full text-left px-4 py-3 hover:bg-red-50 transition-colors border-b border-[#F5F3F0]"
              >
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                  <span className="text-xs font-bold text-red-500">Tarefa Atrasada</span>
                </div>
                <p className="text-sm text-[#1A1A1A] font-medium truncate">{t.title}</p>
                <p className="text-xs text-[#6B6B6B] truncate">{t.assignee}</p>
              </button>
            ))}
            {total === 0 && (data?.upcomingVisits ?? []).length === 0 && (
              <div className="px-4 py-6 text-center text-sm text-[#9CA3AF]">
                Sem notificações pendentes.
              </div>
            )}
          </div>
          <div className="px-4 py-2 border-t border-[#E5E2DE]">
            <button
              onClick={() => { navigate("/admin/leads"); setOpen(false); }}
              className="text-xs text-[#D4A74B] font-medium hover:underline"
            >
              Ver todos os leads →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  return (
    <div className="flex h-screen bg-[#F5F3F0]">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-[#1A1A1A] text-white flex flex-col transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <Link to="/admin" className="font-display text-xl font-bold text-white">
              GESSO PREMIUM
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-white/70 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.5)" }}>
            Painel Administrativo
          </p>
        </div>

        {/* User */}
        <div className="px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.name || ""}
                className="w-9 h-9 rounded-full object-cover"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-[#D4A74B] flex items-center justify-center text-sm font-bold text-[#1A1A1A]">
                {user?.name?.charAt(0) || "A"}
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-white">
                {user?.name || "Admin"}
              </p>
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>
                {user?.role === "admin" ? "Administrador" : "Usuário"}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          <div className="space-y-4 px-3">
            {menuGroups.map((group) => (
              <div key={group.label}>
                <p className="text-[10px] font-semibold uppercase tracking-widest px-3 mb-1" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  {group.label}
                </p>
                <ul className="space-y-0.5">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    return (
                      <li key={item.path}>
                        <Link
                          to={item.path}
                          onClick={() => setSidebarOpen(false)}
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                            isActive
                              ? "bg-[#D4A74B] text-[#1A1A1A]"
                              : "text-white/70 hover:bg-white/10 hover:text-white"
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          {item.label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 space-y-2">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white transition-all w-full"
          >
            <Home className="w-4 h-4" />
            Ver Site
          </button>
          <button
            onClick={logout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/70 hover:bg-red-500/20 hover:text-red-400 transition-all w-full"
          >
            <LogOut className="w-4 h-4" />
            Sair
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white border-b border-[#E5E2DE] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-[#F5F3F0]"
            >
              <Menu className="w-5 h-5 text-[#1A1A1A]" />
            </button>
            <button
              onClick={() => navigate(-1)}
              className="hidden md:flex items-center gap-2 text-sm text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Voltar
            </button>
          </div>
          <h1 className="text-lg font-semibold text-[#1A1A1A]">
            {menuGroups.flatMap((g) => g.items).find((item) => item.path === location.pathname)?.label || "Admin"}
          </h1>
          <div className="flex items-center gap-2">
            <NotificationBell />
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
