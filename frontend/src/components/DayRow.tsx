import { Link } from "react-router-dom";
import { Coffee, CircleAlert } from "lucide-react";

import { formatDate, formatScore, weekdayShort } from "@/lib/format";
import { CATEGORY_META, TIER_META, tierFromScore, type DayLog, type Goal } from "@/lib/types";

type Props = {
  log: DayLog;
  goalsById: Map<string, Goal>;
  isToday?: boolean;
};

export default function DayRow({ log, goalsById, isToday }: Props) {
  if (log.status === "day_off") return <DayOffRow date={log.date} isToday={isToday} />;
  if (log.status === "missed") return <MissedRow date={log.date} isToday={isToday} />;

  const tier = tierFromScore(log.score);
  const meta = tier ? TIER_META[tier] : null;

  const icons = log.entries.slice(0, 9).map((e, i) => {
    const goal = goalsById.get(e.goal_id);
    const cat = goal ? CATEGORY_META[goal.category] : null;
    const state = e.level >= 0.7 ? "featured" : e.level >= 0.4 ? "done" : "missed";
    return (
      <span
        key={`${e.goal_id}-${i}`}
        title={goal?.name ?? "Meta arquivada"}
        className={[
          "w-9 h-9 rounded-lg grid place-items-center text-base border relative",
          state === "featured"
            ? "border-primary/40 text-primary"
            : state === "done"
              ? "bg-surface-3 border-border-2 text-text"
              : "bg-bg-2 border-border text-muted opacity-40",
        ].join(" ")}
        style={
          state === "featured"
            ? { background: "linear-gradient(180deg, rgba(245,181,40,0.22), rgba(245,181,40,0.06))" }
            : undefined
        }
      >
        <span aria-hidden>{cat?.emoji ?? "•"}</span>
        {state === "featured" && (
          <span
            className="absolute -right-1 -top-1 w-3 h-3 rounded-full grid place-items-center text-[7px] font-bold text-ink border-2 border-surface"
            style={{ background: "#f5b528" }}
          >
            ★
          </span>
        )}
      </span>
    );
  });

  return (
    <Link
      to={`/app/check-in/${log.date}`}
      className="grid grid-cols-[6px_1fr_auto] lg:grid-cols-[6px_168px_1fr_110px] bg-surface border border-border rounded-card overflow-hidden hover:border-border-2 hover:-translate-y-px transition-all"
      style={{
        background: tier
          ? `linear-gradient(90deg, ${meta?.bgSoft}, transparent 50%), #16110a`
          : undefined,
      }}
    >
      <span style={{ background: meta?.color ?? "#5a4d39" }} />

      <div className="p-3.5 flex flex-col gap-1.5 min-w-0">
        <div className="flex items-center gap-2">
          <div
            className="display text-base lg:text-[16px] uppercase leading-none"
            style={{ color: meta?.color }}
          >
            {meta?.label ?? "—"}
          </div>
          {isToday && <span className="chip-today">HOJE</span>}
        </div>
        <div className="text-xs text-text-2">
          {formatDate(log.date)}{" "}
          <span className="text-muted">· {weekdayShort(log.date)}</span>
        </div>
        <div className="text-[11px] text-muted font-mono">
          {log.entries.length} {log.entries.length === 1 ? "meta" : "metas"}
        </div>
      </div>

      <div className="hidden lg:flex items-center gap-1.5 px-4 border-x border-border min-w-0">
        <div className="flex gap-1.5 flex-wrap">{icons}</div>
      </div>

      <div className="flex flex-col items-center justify-center gap-1 px-3 py-3 lg:px-2">
        <span className="text-[9px] uppercase tracking-[0.1em] text-muted font-semibold">
          Score
        </span>
        <span
          className="display text-3xl leading-none px-3 py-1 rounded-md nums"
          style={{
            background: tier === "great" ? "#f5b528" : meta?.bgSoft ?? "transparent",
            color: tier === "great" ? "#1a1408" : meta?.color,
          }}
        >
          {formatScore(log.score)}
        </span>
      </div>
    </Link>
  );
}

function DayOffRow({ date, isToday }: { date: string; isToday?: boolean }) {
  return (
    <div className="grid grid-cols-[6px_1fr_auto] bg-surface border border-border rounded-card overflow-hidden">
      <span style={{ background: "#6aa7e8" }} />
      <div className="p-3.5 flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <div className="display text-base uppercase leading-none" style={{ color: "#6aa7e8" }}>
            Day Off
          </div>
          {isToday && <span className="chip-today">HOJE</span>}
        </div>
        <div className="text-xs text-text-2">
          {formatDate(date)} <span className="text-muted">· {weekdayShort(date)}</span>
        </div>
      </div>
      <div className="grid place-items-center px-5" style={{ color: "#6aa7e8" }}>
        <Coffee size={20} />
      </div>
    </div>
  );
}

function MissedRow({ date, isToday }: { date: string; isToday?: boolean }) {
  return (
    <div className="grid grid-cols-[6px_1fr_auto] bg-surface border border-border rounded-card overflow-hidden opacity-80">
      <span style={{ background: "#e87a6a" }} />
      <div className="p-3.5 flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <div className="display text-base uppercase leading-none" style={{ color: "#e87a6a" }}>
            Não registrado
          </div>
          {isToday && <span className="chip-today">HOJE</span>}
        </div>
        <div className="text-xs text-text-2">
          {formatDate(date)} <span className="text-muted">· {weekdayShort(date)}</span>
        </div>
      </div>
      <div className="grid place-items-center px-5" style={{ color: "#e87a6a" }}>
        <CircleAlert size={20} />
      </div>
    </div>
  );
}
