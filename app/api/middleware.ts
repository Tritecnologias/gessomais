import { ErrorMessages } from "@contracts/constants";
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import type { TrpcContext } from "./context";
import { env } from "./lib/env";

const t = initTRPC.context<TrpcContext>().create({
  transformer: superjson,
});

export const createRouter = t.router;

// ── CSRF protection ────────────────────────────────────────────
// tRPC via fetch é naturalmente CSRF-safe (Content-Type: application/json
// não pode ser enviado por forms simples). Em produção, verificamos também
// o header Origin para bloquear requisições cross-origin inesperadas.
const csrfGuard = t.middleware(async ({ ctx, next, type }) => {
  if (type === "mutation" && env.isProduction && env.allowedOrigin) {
    const origin = ctx.req.headers.get("origin") ?? "";
    const allowed = env.allowedOrigin.split(",").map((o) => o.trim());
    if (origin && !allowed.some((a) => origin === a || origin.endsWith(`.${a.replace(/^https?:\/\//, "")}`))) {
      throw new TRPCError({ code: "FORBIDDEN", message: "Origem não permitida." });
    }
  }
  return next();
});

export const publicQuery = t.procedure.use(csrfGuard);

const requireAuth = t.middleware(async (opts) => {
  const { ctx, next } = opts;

  if (!ctx.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: ErrorMessages.unauthenticated,
    });
  }

  return next({ ctx: { ...ctx, user: ctx.user } });
});

function requireRole(...roles: string[]) {
  return t.middleware(async (opts) => {
    const { ctx, next } = opts;

    if (!ctx.user || !roles.includes(ctx.user.role)) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: ErrorMessages.insufficientRole,
      });
    }

    return next({ ctx: { ...ctx, user: ctx.user } });
  });
}

export const authedQuery = t.procedure.use(requireAuth);
export const adminQuery = authedQuery.use(requireRole("admin", "super_admin"));
export const superAdminQuery = authedQuery.use(requireRole("super_admin"));
