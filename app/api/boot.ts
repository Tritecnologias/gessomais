import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import { cors } from "hono/cors";
import type { HttpBindings } from "@hono/node-server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "./router";
import { createContext } from "./context";
import { env } from "./lib/env";
import { createOAuthCallbackHandler } from "./kimi/auth";
import { Paths } from "@contracts/constants";

const app = new Hono<{ Bindings: HttpBindings }>();

// ── Security headers ───────────────────────────────────────────
app.use("*", async (c, next) => {
  await next();
  c.header("X-Frame-Options", "SAMEORIGIN");
  c.header("X-Content-Type-Options", "nosniff");
  c.header("X-XSS-Protection", "1; mode=block");
  c.header("Referrer-Policy", "strict-origin-when-cross-origin");
  c.header("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  if (env.isProduction) {
    c.header("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  }
});

// ── CORS ───────────────────────────────────────────────────────
const allowedOrigins = env.allowedOrigin
  ? env.allowedOrigin.split(",").map((o) => o.trim())
  : [];

app.use(
  "/api/*",
  cors({
    origin: env.isProduction
      ? (origin) => (allowedOrigins.includes(origin) ? origin : allowedOrigins[0] ?? origin)
      : "*",
    allowMethods: ["GET", "POST", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
    maxAge: 600,
  })
);

// ── Body limit: 5 MB ─────────────────────────────────────────
app.use(bodyLimit({ maxSize: 5 * 1024 * 1024 }));

app.get(Paths.oauthCallback, createOAuthCallbackHandler());
app.use("/api/trpc/*", async (c) => {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req: c.req.raw,
    router: appRouter,
    createContext,
    onError({ error, path }) {
      console.error(`[tRPC] ${path ?? "unknown"}:`, error.code, error.message);
      if (error.cause) console.error("[tRPC cause]", error.cause);
    },
  });
});
app.all("/api/*", (c) => c.json({ error: "Not Found" }, 404));

export default app;

if (env.isProduction) {
  const { serve } = await import("@hono/node-server");
  const { serveStaticFiles } = await import("./lib/vite");
  serveStaticFiles(app);

  const port = parseInt(process.env.PORT || "3000");
  serve({ fetch: app.fetch, port, hostname: "0.0.0.0" }, () => {
    console.log(`Server running on http://0.0.0.0:${port}/`);
  });
}
