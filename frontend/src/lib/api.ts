// Cliente HTTP que envia cookies (sessão) e ecoa o CSRF token em métodos não-seguros.
// O backend devolve um cookie CSRF legível (não httpOnly); reenviamos via header.

const SAFE = new Set(["GET", "HEAD", "OPTIONS"]);
const CSRF_COOKIE = "dayup_csrf";
const CSRF_HEADER = "X-CSRF-Token";

function readCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp("(?:^|; )" + name + "=([^;]*)"));
  return match ? decodeURIComponent(match[1]) : null;
}

export class ApiError extends Error {
  status: number;
  detail: unknown;
  constructor(status: number, message: string, detail?: unknown) {
    super(message);
    this.status = status;
    this.detail = detail;
  }
}

type RequestOpts = {
  method?: string;
  body?: unknown;
  signal?: AbortSignal;
};

export async function apiFetch<T>(path: string, opts: RequestOpts = {}): Promise<T> {
  const method = (opts.method ?? "GET").toUpperCase();
  const headers: Record<string, string> = { Accept: "application/json" };
  if (opts.body !== undefined) headers["Content-Type"] = "application/json";
  if (!SAFE.has(method)) {
    const csrf = readCookie(CSRF_COOKIE);
    if (csrf) headers[CSRF_HEADER] = csrf;
  }
  const res = await fetch(`/api${path}`, {
    method,
    headers,
    credentials: "include",
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
    signal: opts.signal,
  });
  if (res.status === 204) return undefined as T;
  const isJson = res.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await res.json() : await res.text();
  if (!res.ok) {
    const message =
      (isJson && (data as { detail?: string })?.detail) || res.statusText || "Erro de rede";
    throw new ApiError(res.status, message, data);
  }
  return data as T;
}
