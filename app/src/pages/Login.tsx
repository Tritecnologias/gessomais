import { useState } from "react";
import { useNavigate } from "react-router";
import { trpc } from "@/providers/trpc";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: () => {
      navigate("/admin");
    },
    onError: (err) => {
      setError(err.message || "Credenciais inválidas.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    loginMutation.mutate({ email, password });
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{
        background: "linear-gradient(135deg, #1A1A1A 0%, #2D2D2D 50%, #1A1A1A 100%)",
      }}
    >
      {/* Background decoration */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage:
            "radial-gradient(circle at 25% 25%, #D4A74B 0%, transparent 50%), radial-gradient(circle at 75% 75%, #D4A74B 0%, transparent 50%)",
        }}
      />

      <div className="relative w-full max-w-md px-6">
        {/* Card */}
        <div
          className="rounded-2xl p-8"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.1)",
            backdropFilter: "blur(20px)",
            boxShadow: "0 32px 64px rgba(0,0,0,0.4)",
          }}
        >
          {/* Logo */}
          <div className="text-center mb-8">
            <h1
              className="font-bold text-white mb-1"
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "1.75rem",
                letterSpacing: "-0.02em",
              }}
            >
              GESSO PREMIUM
            </h1>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.8rem" }}>
              Painel Administrativo
            </p>
            <div
              className="mx-auto mt-4"
              style={{
                width: "40px",
                height: "2px",
                background: "#D4A74B",
              }}
            />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                style={{
                  display: "block",
                  fontSize: "0.75rem",
                  fontWeight: 500,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  color: "rgba(255,255,255,0.5)",
                  marginBottom: "8px",
                }}
              >
                E-mail
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@exemplo.com"
                required
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  borderRadius: "10px",
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  color: "#fff",
                  fontSize: "0.9rem",
                  outline: "none",
                  transition: "border-color 0.2s",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#D4A74B";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "rgba(255,255,255,0.12)";
                }}
              />
            </div>

            <div>
              <label
                htmlFor="password"
                style={{
                  display: "block",
                  fontSize: "0.75rem",
                  fontWeight: 500,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  color: "rgba(255,255,255,0.5)",
                  marginBottom: "8px",
                }}
              >
                Senha
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  borderRadius: "10px",
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  color: "#fff",
                  fontSize: "0.9rem",
                  outline: "none",
                  transition: "border-color 0.2s",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#D4A74B";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "rgba(255,255,255,0.12)";
                }}
              />
            </div>

            {error && (
              <div
                style={{
                  padding: "10px 14px",
                  borderRadius: "8px",
                  background: "rgba(239,68,68,0.1)",
                  border: "1px solid rgba(239,68,68,0.3)",
                  color: "#FCA5A5",
                  fontSize: "0.85rem",
                }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loginMutation.isPending}
              style={{
                width: "100%",
                padding: "13px",
                borderRadius: "10px",
                background: loginMutation.isPending
                  ? "rgba(212,167,75,0.5)"
                  : "#D4A74B",
                color: "#1A1A1A",
                fontWeight: 700,
                fontSize: "0.85rem",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                border: "none",
                cursor: loginMutation.isPending ? "not-allowed" : "pointer",
                transition: "all 0.2s",
                marginTop: "8px",
              }}
              onMouseEnter={(e) => {
                if (!loginMutation.isPending) {
                  (e.target as HTMLButtonElement).style.background = "#C49A3A";
                }
              }}
              onMouseLeave={(e) => {
                if (!loginMutation.isPending) {
                  (e.target as HTMLButtonElement).style.background = "#D4A74B";
                }
              }}
            >
              {loginMutation.isPending ? "Entrando..." : "Entrar"}
            </button>
          </form>
        </div>

        <p
          className="text-center mt-6"
          style={{ color: "rgba(255,255,255,0.2)", fontSize: "0.75rem" }}
        >
          © {new Date().getFullYear()} Gesso Premium
        </p>
      </div>
    </div>
  );
}
