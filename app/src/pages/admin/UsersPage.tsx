import { useState } from "react";
import { toast } from "sonner";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { trpc } from "@/providers/trpc";
import Modal from "@/components/admin/Modal";
import { UserPlus, Shield, User, Trash2, Crown } from "lucide-react";

interface NewUser {
  name: string;
  email: string;
  password: string;
  role: "user" | "admin";
}

const emptyUser: NewUser = { name: "", email: "", password: "", role: "admin" };

function timeAgo(date: Date | string) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "agora mesmo";
  if (mins < 60) return `${mins}min atrás`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h atrás`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d atrás`;
  return new Date(date).toLocaleDateString("pt-BR");
}

export default function UsersPage() {
  useAdminAuth();
  const utils = trpc.useUtils();
  const { data: users, isLoading } = trpc.admin.users.list.useQuery();
  const { data: me } = trpc.auth.me.useQuery();
  const [modalOpen, setModalOpen] = useState(false);
  const [newUser, setNewUser] = useState<NewUser>(emptyUser);

  const createMutation = trpc.admin.users.create.useMutation({
    onSuccess: () => {
      utils.admin.users.list.invalidate();
      setModalOpen(false);
      setNewUser(emptyUser);
      toast.success("Usuário criado com sucesso.");
    },
    onError: (err) => toast.error(err.message),
  });

  const setRoleMutation = trpc.admin.users.setRole.useMutation({
    onSuccess: () => utils.admin.users.list.invalidate(),
    onError: (err) => toast.error(err.message),
  });

  const deleteMutation = trpc.admin.users.delete.useMutation({
    onSuccess: () => {
      utils.admin.users.list.invalidate();
      toast.success("Usuário removido.");
    },
    onError: (err) => toast.error(err.message),
  });

  const handleDelete = (id: number, name: string | null) => {
    if (confirm(`Deseja excluir o usuário "${name ?? "sem nome"}"? Esta ação não pode ser desfeita.`)) {
      deleteMutation.mutate({ id });
    }
  };

  return (
    <div>
      <div className="bg-white rounded-xl border border-[#E5E2DE] overflow-hidden">
        {/* Header */}
        <div className="p-5 flex items-center justify-between border-b border-[#E5E2DE]">
          <h2 className="text-lg font-semibold text-[#1A1A1A]">Usuários</h2>
          <button
            onClick={() => setModalOpen(true)}
            className="btn-primary text-xs py-2.5 px-4 flex items-center gap-1.5"
          >
            <UserPlus className="w-4 h-4" />
            Novo Usuário
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E5E2DE] bg-[#F5F3F0]">
                <th className="text-left text-xs font-semibold uppercase tracking-wider text-[#6B6B6B] px-4 py-3">Usuário</th>
                <th className="text-left text-xs font-semibold uppercase tracking-wider text-[#6B6B6B] px-4 py-3">Papel</th>
                <th className="text-left text-xs font-semibold uppercase tracking-wider text-[#6B6B6B] px-4 py-3">Último acesso</th>
                <th className="text-right px-4 py-3 w-24">Ações</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-[#6B6B6B]">Carregando...</td>
                </tr>
              ) : !users?.length ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-[#6B6B6B]">Nenhum usuário encontrado</td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="border-b border-[#E5E2DE] hover:bg-[#F5F3F0]/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {user.avatar ? (
                          <img src={user.avatar} alt={user.name || ""} className="w-9 h-9 rounded-full object-cover" />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-[#D4A74B] flex items-center justify-center text-sm font-bold text-[#1A1A1A]">
                            {user.name?.charAt(0) ?? "?"}
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium text-[#1A1A1A]">{user.name ?? "Sem nome"}</p>
                          <p className="text-xs text-[#6B6B6B]">{user.email ?? "—"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {user.role === "super_admin" ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 cursor-default">
                          <Crown className="w-3 h-3" />
                          Super Admin
                        </span>
                      ) : (
                        <span
                          onClick={() => {
                            if (user.id === me?.id) return;
                            setRoleMutation.mutate({
                              id: user.id,
                              role: user.role === "admin" ? "user" : "admin",
                            });
                          }}
                          title={user.id === me?.id ? "Você não pode alterar seu próprio papel" : "Clique para alternar papel"}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                            user.id === me?.id
                              ? "cursor-default opacity-60"
                              : "cursor-pointer hover:opacity-80"
                          } ${
                            user.role === "admin"
                              ? "bg-[#D4A74B]/15 text-[#a07830]"
                              : "bg-gray-100 text-[#6B6B6B]"
                          }`}
                        >
                          {user.role === "admin" ? (
                            <Shield className="w-3 h-3" />
                          ) : (
                            <User className="w-3 h-3" />
                          )}
                          {user.role === "admin" ? "Admin" : "Usuário"}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-[#6B6B6B]">
                      {timeAgo(user.lastSignInAt)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {user.id !== me?.id && user.role !== "super_admin" && (
                        <button
                          onClick={() => handleDelete(user.id, user.name)}
                          className="p-1.5 rounded-lg text-[#6B6B6B] hover:text-red-500 hover:bg-red-50 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Novo Usuário">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#1A1A1A] mb-1">Nome</label>
            <input
              type="text"
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-lg border border-[#E5E2DE] focus:outline-none focus:ring-2 focus:ring-[#D4A74B]/50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1A1A1A] mb-1">E-mail</label>
            <input
              type="email"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-lg border border-[#E5E2DE] focus:outline-none focus:ring-2 focus:ring-[#D4A74B]/50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1A1A1A] mb-1">Senha</label>
            <input
              type="password"
              value={newUser.password}
              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              placeholder="Mínimo 6 caracteres"
              className="w-full px-3 py-2 text-sm rounded-lg border border-[#E5E2DE] focus:outline-none focus:ring-2 focus:ring-[#D4A74B]/50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1A1A1A] mb-1">Papel</label>
            <select
              value={newUser.role}
              onChange={(e) => setNewUser({ ...newUser, role: e.target.value as "user" | "admin" })}
              className="w-full px-3 py-2 text-sm rounded-lg border border-[#E5E2DE] focus:outline-none focus:ring-2 focus:ring-[#D4A74B]/50"
            >
              <option value="admin">Administrador</option>
              <option value="user">Usuário</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm font-medium text-[#6B6B6B] hover:text-[#1A1A1A]">
              Cancelar
            </button>
            <button
              onClick={() => createMutation.mutate(newUser)}
              disabled={createMutation.isPending}
              className="btn-primary text-sm py-2.5 px-5"
            >
              Criar Usuário
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
