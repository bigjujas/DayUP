export function formatDate(iso: string, opts?: Intl.DateTimeFormatOptions): string {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("pt-BR", opts ?? { day: "2-digit", month: "short" });
}

export function weekdayShort(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", "");
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function isoDaysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

export function formatScore(score: number | null): string {
  if (score === null || Number.isNaN(score)) return "—";
  return Math.round(score).toString();
}

export function formatPct(value: number, digits = 0): string {
  return `${value.toFixed(digits)}%`;
}

export function variation(current: number, prev: number): {
  delta: number;
  symbol: "↑" | "↓" | "·";
} {
  if (prev === 0) return { delta: 0, symbol: "·" };
  const delta = current - prev;
  if (delta === 0) return { delta: 0, symbol: "·" };
  return { delta, symbol: delta > 0 ? "↑" : "↓" };
}
