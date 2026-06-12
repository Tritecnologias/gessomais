import { z } from "zod";
import * as cookie from "cookie";
import { eq } from "drizzle-orm";
import { Session } from "@contracts/constants";
import { getSessionCookieOptions } from "./lib/cookies";
import { createRouter, authedQuery, publicQuery } from "./middleware";
import { signSessionToken } from "./kimi/session";
import { findUserByEmail } from "./queries/users";
import { verifyPassword } from "./lib/password";
import { env } from "./lib/env";
import { getDb } from "./queries/connection";
import { users } from "@db/schema";

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
      const user = await findUserByEmail(input.email);

      if (!user || !user.passwordHash) {
        throw new Error("Credenciais inválidas.");
      }

      const { verifyPassword: verify } = await import("./lib/password");
      const valid = await verify(input.password, user.passwordHash);
      if (!valid) {
        throw new Error("Credenciais inválidas.");
      }

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
