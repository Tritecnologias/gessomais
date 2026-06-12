import type { CookieOptions } from "hono/utils/cookie";

// SameSite=Lax funciona para same-site (frontend e API no mesmo domínio).
// Não usamos Secure=true pois o proxy pode terminar TLS antes do app,
// fazendo o browser descartar o cookie silenciosamente em conexões HTTP→app.
export function getSessionCookieOptions(_headers?: Headers): CookieOptions {
  return {
    httpOnly: true,
    path: "/",
    sameSite: "Lax",
    secure: false,
  };
}
