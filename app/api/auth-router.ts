import { z } from "zod";
import * as cookie from "cookie";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { Session } from "@contracts/constants";
import { getSessionCookieOptions } from "./lib/cookies";
import { createRouter, authedQuery, publicQuery } from "./middleware";
import { signSessionToken } from "./kimi/session";
import { findUserByEmail } from "./queries/users";
import { verifyPassword } from "./lib/password";
import { env } from "./lib/env";
import { getDb } from "./queries/connection";
import { users } from "@db/schema";
import { checkRateLimit, resetRateLimit } from "./lib/rate-limit";
import { audit } from "./lib/audit";

function getClientIp(req: Request): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}

export const authRouter = createRouter({
  me: authedQuery.query((opts) => opts.ctx.user),

  login: publicQuery
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(1),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      // Rate limiting: 5 tentativas por IP em 15 minutos
      const ip = getClientIp(ctx.req);
      const rl = checkRateLimit(`login:${ip}`);
      if (!rl.allowed) {
        audit({ action: "login.blocked", detail: `IP bloqueado por rate limit`, ip, userEmail: input.email });
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: `Muitas tentativas de login. Tente novamente em ${Math.ceil(rl.resetInSecs / 60)} minuto(s).`,
        });
      }

      const user = await findUserByEmail(input.email);

      if (!user || !user.passwordHash) {
        audit({ action: "login.failed", detail: "Usuário não encontrado", ip, userEmail: input.email });
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Credenciais inválidas." });
      }

      const { verifyPassword: verify } = await import("./lib/password");
      const valid = await verify(input.password, user.passwordHash);
      if (!valid) {
        audit({ action: "login.failed", detail: "Senha incorreta", ip, userId: user.id, userEmail: user.email ?? undefined });
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Credenciais inválidas." });
      }

      // Login bem-sucedido: zera o contador e registra
      resetRateLimit(`login:${ip}`);
      audit({ action: "login.success", ip, userId: user.id, userEmail: user.email ?? undefined });

      // Garante que o super admin sempre mantém seu papel
      if (env.superAdminEmail && user.email === env.superAdminEmail && user.role !== "super_admin") {
        await getDb().update(users).set({ role: "super_admin" }).where(eq(users.id, user.id));
        user.role = "super_admin";
      }

      const token = await signSessionToken({
        unionId: user.unionId,
        clientId: "local",
      });

      const cookieOpts = getSessionCookieOptions(ctx.req.headers);
      ctx.resHeaders.append(
        "set-cookie",
        cookie.serialize(Session.cookieName, token, {
          httpOnly: cookieOpts.httpOnly,
          path: cookieOpts.path,
          sameSite: (cookieOpts.sameSite?.toLowerCase() ?? "lax") as
            | "lax"
            | "none"
            | "strict",
          secure: cookieOpts.secure,
          maxAge: Session.maxAgeMs / 1000,
        }),
      );

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      };
    }),

  logout: authedQuery.mutation(async ({ ctx }) => {
    audit({ action: "logout", userId: ctx.user.id, userEmail: ctx.user.email ?? undefined });
    const opts = getSessionCookieOptions(ctx.req.headers);
    ctx.resHeaders.append(
      "set-cookie",
      cookie.serialize(Session.cookieName, "", {
        httpOnly: opts.httpOnly,
        path: opts.path,
        sameSite: opts.sameSite?.toLowerCase() as "lax" | "none",
        secure: opts.secure,
        maxAge: 0,
      }),
    );
    return { success: true };
  }),
});
