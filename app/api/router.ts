import { adminRouter } from "./admin-router";
import { authRouter } from "./auth-router";
import { createRouter, publicQuery } from "./middleware";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  admin: adminRouter,
});

export type AppRouter = typeof appRouter;
