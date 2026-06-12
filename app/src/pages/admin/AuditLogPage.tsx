import { useState } from "react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { trpc } from "@/providers/trpc";
import { Shield, LogIn, LogOut, UserX, UserCog, AlertTriangle, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const ACTION_CONFIG: Record<string, { label: string; icon: typeof Shield; color: string; bg: string }> = {
  "login.success":  { label: "Login",          icon: LogIn,    color: "#22C55E", bg: "#F0FDF4" },
  "login.failed":   { label: "Login falhou",    icon: AlertTriangle, color: "#F59E0B", bg: "#FFFBEB" },
  "login.blocked":  { label: "Login bloqueado", icon: AlertTriangle, color: "#EF4444", bg: "#FEF2F2" },
  "logout":         { label: "Logout",          icon: LogOut,   color: "#6B6B6B", bg: "#F5F3F0" },
  "user.setRole":   { label: "Alteração de papel", icon: UserCog, color: "#3B82F6", bg: "#EFF6FF" },
  "user.delete":    { label: "Usuário excluído", icon: UserX,   color: "#EF4444", bg: "#FEF2F2" },
};

function getActionCfg(action: string) {
  return ACTION_CONFIG[action] ?? { label: action, icon: Shield, color: "#9CA3AF", bg: "#F5F3F0" };
}

export default function AuditLogPage() {
  useAdminAuth();
  const [limit, setLimit] = useState(100);
  const { data: logs = [], refetch, isFetching } = trpc.admin.auditLogs.list.useQuery({ limit });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Shield className="w-6 h-6 text-[#D4A74B]" />
          <h2 className="text-2xl font-display font-bold text-[#1A1A1A]">Auditoria de Segurança</h2>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            className="border border-[#E5E2DE] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#D4A74B]"
          >
            <option value={50}>Últimos 50</option>
            <option value={100}>Últimos 100</option>
            <option value={200}>Últimos 200</option>
          </select>
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="flex items-center gap-2 border border-[#E5E2DE] text-[#6B6B6B] text-sm font-medium px-3 py-2 rounded-lg hover:bg-[#F5F3F0] transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`} />
            Atualizar
          </button>
        </div>
      </div>

      <p className="text-sm text-[#6B6B6B] mb-6">
        Registro imutável de ações sensíveis: logins, alterações de papéis e exclusões de usuários.
      </p>

      {logs.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#E5E2DE] p-12 text-center">
          <Shield className="w-10 h-10 text-[#C4B99A] mx-auto mb-3" />
          <p className="text-[#6B6B6B]">Nenhum evento registrado ainda.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-[#E5E2DE] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E5E2DE] bg-[#F5F3F0]">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B6B6B] uppercase tracking-wide">Evento</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B6B6B] uppercase tracking-wide">Usuário</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B6B6B] uppercase tracking-wide hidden md:table-cell">Detalhe</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B6B6B] uppercase tracking-wide hidden lg:table-cell">IP</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B6B6B] uppercase tracking-wide">Data/Hora</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F5F3F0]">
                {logs.map((log) => {
                  const cfg = getActionCfg(log.action);
                  const Icon = cfg.icon;
                  return (
                    <tr key={log.id} className="hover:bg-[#FAFAF9] transition-colors">
                      <td className="px-4 py-3">
                        <span
                          className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full"
                          style={{ backgroundColor: cfg.bg, color: cfg.color }}
                        >
                          <Icon className="w-3 h-3" />
                          {cfg.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[#1A1A1A]">
                        <p className="font-medium truncate max-w-[180px]">{log.userEmail ?? "—"}</p>
                        {log.userId && <p className="text-xs text-[#9CA3AF]">ID {log.userId}</p>}
                      </td>
                      <td className="px-4 py-3 text-[#6B6B6B] hidden md:table-cell max-w-xs">
                        <p className="truncate">{log.detail ?? "—"}</p>
                      </td>
                      <td className="px-4 py-3 text-[#9CA3AF] hidden lg:table-cell font-mono text-xs">
                        {log.ip ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-[#6B6B6B] whitespace-nowrap text-xs">
                        {format(new Date(log.createdAt), "dd/MM/yyyy HH:mm:ss", { locale: ptBR })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
