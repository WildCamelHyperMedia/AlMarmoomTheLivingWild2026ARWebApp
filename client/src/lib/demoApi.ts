// ============================================================================
// STATIC DEMO API SHIM
// ----------------------------------------------------------------------------
// Intercepts window.fetch for any "/api/*" request so the app runs with NO
// backend, NO database, and NO server-side persistence. Every action lives
// only in the visitor's own browser for the session and never leaves the
// device. This is what makes the app publishable as a static site (e.g. on
// GitHub Pages) where no Express server or PostgreSQL exists.
//
// Nothing here is loaded in the normal server build — it is only imported by
// main.tsx, and only matters when the /api endpoints are absent.
//
// DEMO_PERSIST:
//   true  -> demo session (fake login + progress) survives a page refresh via
//            localStorage on the visitor's own device. Still zero server data.
//   false -> pure in-memory. Everything resets on refresh. "Nothing saved"
//            in the strictest sense.
// ============================================================================

const DEMO_PERSIST = true;

type Json = Record<string, any>;
const memory: Json = {};

const store = {
  get(key: string): any {
    if (!DEMO_PERSIST) return memory[key];
    try {
      const v = localStorage.getItem(key);
      return v ? JSON.parse(v) : undefined;
    } catch {
      return memory[key];
    }
  },
  set(key: string, val: any) {
    if (!DEMO_PERSIST) {
      memory[key] = val;
      return;
    }
    try {
      localStorage.setItem(key, JSON.stringify(val));
    } catch {
      memory[key] = val;
    }
  },
};

function json(body: Json, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function uuid(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return "demo-" + Math.random().toString(36).slice(2, 12);
  }
}

function futureIso(hours = 6): string {
  return new Date(Date.now() + hours * 3600 * 1000).toISOString();
}

function makeUser(body: Json, isAdmin = false) {
  const existing = store.get("demoUser");
  return {
    id: existing?.id || uuid(),
    name: body?.name || existing?.name || "Demo Visitor",
    email: body?.email || existing?.email || "demo@example.com",
    phone: body?.phone || existing?.phone || "",
    isAdmin,
    createdAt: existing?.createdAt || new Date().toISOString(),
  };
}

async function readBody(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Json> {
  try {
    if (init?.body && typeof init.body === "string") return JSON.parse(init.body);
    if (input instanceof Request) {
      const text = await input.clone().text();
      return text ? JSON.parse(text) : {};
    }
  } catch {
    /* ignore malformed bodies */
  }
  return {};
}

async function handle(method: string, path: string, body: Json): Promise<Response> {
  // ---- Auth ----------------------------------------------------------------
  if (path === "/api/auth/guest-signup" || path === "/api/auth/user-login") {
    const user = makeUser(body, false);
    store.set("demoUser", user);
    return json({ user, token: "demo-token-" + user.id, expiresAt: futureIso() });
  }
  if (path === "/api/auth/admin-login") {
    // The admin dashboard is back-office only and is not part of the public demo.
    return json({ error: "Admin sign-in is disabled in the demo build." }, 403);
  }
  if (path === "/api/auth/validate") {
    const user = store.get("demoUser");
    return user
      ? json({ valid: true, user, expiresAt: futureIso() })
      : json({ valid: false }, 200);
  }
  if (path === "/api/auth/logout") {
    store.set("demoUser", undefined);
    return json({ success: true });
  }

  // ---- Progress ------------------------------------------------------------
  if (path.startsWith("/api/progress/")) {
    if (method === "PATCH") {
      const prev = store.get("demoProgress") || {};
      const next = { ...prev, ...body };
      store.set("demoProgress", next);
      return json({ success: true, progress: next });
    }
    const p = store.get("demoProgress") || {};
    return json({
      progress: {
        watchedVideos: p.watchedVideos || [],
        unlockedAnimals: p.unlockedAnimals || [],
        points: p.points || 0,
      },
    });
  }

  // ---- QR unlock -----------------------------------------------------------
  if (path === "/api/unlock-animal" || path === "/api/validate-qr") {
    return json({ success: true, valid: true, animalId: body?.animalId });
  }

  // ---- Activity logging (fire-and-forget; nothing recorded) ----------------
  if (path === "/api/activity") {
    return json({ success: true });
  }

  // ---- Lead capture (swallowed; nothing stored anywhere) -------------------
  if (path === "/api/leads") {
    return json({ success: true, id: uuid() });
  }

  // ---- Admin (unreachable: demo users are never admin) ---------------------
  if (path.startsWith("/api/admin/")) {
    return json({ users: [], stats: [], activities: [], leads: [], analytics: {} });
  }

  // Unknown /api route -> succeed benignly so the UI never throws.
  return json({ success: true });
}

if (typeof window !== "undefined" && !(window as any).__DEMO_FETCH_PATCHED__) {
  (window as any).__DEMO_FETCH_PATCHED__ = true;
  const original = window.fetch.bind(window);

  window.fetch = async (
    input: RequestInfo | URL,
    init?: RequestInit,
  ): Promise<Response> => {
    let rawUrl = "";
    let method = (init?.method || "GET").toUpperCase();

    if (typeof input === "string") rawUrl = input;
    else if (input instanceof URL) rawUrl = input.href;
    else if (input instanceof Request) {
      rawUrl = input.url;
      method = (init?.method || input.method || "GET").toUpperCase();
    }

    let path = rawUrl;
    try {
      path = new URL(rawUrl, window.location.origin).pathname;
    } catch {
      /* keep rawUrl as-is */
    }

    if (path.startsWith("/api/")) {
      const body = await readBody(input, init);
      return handle(method, path, body);
    }

    return original(input as any, init);
  };
}

export {};
