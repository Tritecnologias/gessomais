import type { Hono } from "hono";
import type { HttpBindings } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import fs from "fs";
import path from "path";

type App = Hono<{ Bindings: HttpBindings }>;

export function serveStaticFiles(app: App) {
  const distPath = path.resolve(import.meta.dirname, "../dist/public");
  const indexPath = path.resolve(distPath, "index.html");

  // Serve assets estáticos (js, css, imagens, etc.)
  app.use("*", serveStatic({ root: "./dist/public" }));

  // Fallback SPA: qualquer rota não resolvida retorna index.html
  app.use("*", (c) => {
    const accept = c.req.header("accept") ?? "";
    if (accept.includes("text/html") || accept.includes("*/*")) {
      const content = fs.readFileSync(indexPath, "utf-8");
      return c.html(content);
    }
    return c.json({ error: "Not Found" }, 404);
  });
}
