import type { CookieOptions } from "hono/utils/cookie";

function isSecure(headers: Headers): boolean {
  const proto = headers.get("x-forwarded-proto") ?? "";
  const host = headers.get("host") ?? "";
  // HTTPS via proxy ou localhost via HTTPS direto
  if (proto === "https") return true;
  if (host.startsWith("localhost:") || host.startsWith("127.0.0.1:")) return false;
  return false;
}

export function getSessionCookieOptions(headers: Headers): CookieOptions {
  const secure = isSecure(headers);

  return {
    httpOnly: true,
    path: "/",
    // SameSite=None só é válido com Secure=true (HTTPS)
    // Em HTTP, usa Lax que funciona para same-origin
    sameSite: secure ? "None" : "Lax",
    secure,
  };
}
