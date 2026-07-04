import { Link } from "react-router-dom";
import {
  CalendarDays,
  ChevronRight,
  Flame,
  Star,
  Trash2,
  TrendingUp,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import DayRow from "@/components/DayRow";
import DayDetailModal from "@/components/DayDetailModal";
import Onboarding from "@/components/Onboarding";
import RemindBanner from "@/components/RemindBanner";
import Sparkline from "@/components/Sparkline";
import { formatDate, formatScore, todayISO, variation, weekdayShort } from "@/lib/format";
import {
  useDayLogs,
  useDeleteDayLog,
  useGoals,
  useMe,
  useStats,
} from "@/lib/queries";
import type { DayLog, Goal } from "@/lib/types";

const REMINDER_KEY = (date: string) => `dayup:reminder-dismissed:${date}`;

export default function Home() {
  const me = useMe();
  const stats = useStats();
  const logs = useDayLogs(14);
  const goals = useGoals({ includeArchived: true });
  const deleteDay = useDeleteDayLog();

  const [selected, setSelected] = useState<DayLog | null>(null);

  const goalsById = useMemo(() => {
    const m = new Map<string, Goal>();
    (goals.data ?? []).forEach((g) => m.set(g.id, g));
    return m;
  }, [goals.data]);

  const today = todayISO();
  const todayLog = logs.data?.find((l) => l.date === today);
  const otherLogs = (logs.data ?? []).filter((l) => l.date !== today);
  const handle = me.data?.name ?? "";

  // Onboarding: aparece enquanto a conta não tiver dispensado (onboarding_seen).
  const [showOnboarding, setShowOnboarding] = useState(false);
  useEffect(() => {
    if (!me.data) return;
    setShowOnboarding(!me.data.onboarding_seen);
  }, [me.data]);

  // Banner de lembrete: após 18h, dia não registrado/não day-off, não dispensado hoje.
  const todayUnclosed = !todayLog || todayLog.status === "missed";
  const [bannerDismissed, setBannerDismissed] = useState(
    () => typeof window !== "undefined" && localStorage.getItem(REMINDER_KEY(today)) === "1",
  );
  const showReminder = new Date().getHours() >= 18 && todayUnclosed && !bannerDismissed;

  function dismissReminder() {
    localStorage.setItem(REMINDER_KEY(today), "1");
    setBannerDismissed(true);
  }

  const sparkSeries = (logs.data ?? [])
    .filter((l) => l.score !== null)
    .map((l) => l.score as number)
    .reverse()
    .slice(-8);

  return (
    <div className="px-4 lg:px-7 py-5 lg:py-8 max-w-[1180px] mx-auto">
      {/* Greet */}
      <header className="px-1 pb-3">
        <div className="text-[12px] uppercase tracking-[0.08em] text-muted">
          Olá, {handle}
        </div>
        <h1 className="display text-[28px] sm:text-[32px] lg:text-[38px] mt-1 leading-tight">
          Como foi seu <span className="text-primary">dia</span>?
        </h1>
      </header>

      {/* Lembrete pós-18h pra fechar o dia */}
      {showReminder && <RemindBanner onDismiss={dismissReminder} />}

      {/* KPIs */}
      <Kpis sparkSeries={sparkSeries} />

      {/* Section heading */}
      <div className="flex items-baseline justify-between px-1 pt-6 pb-2">
        <h2 className="display text-[22px] leading-none">Histórico</h2>
        <span className="text-xs text-muted">
          Últimos {logs.data?.length ?? 14} dias
        </span>
      </div>

      {/* Day list — today always on top */}
      <div className="flex flex-col gap-2">
        {logs.isLoading && <SkeletonRows />}

        {/* Today: prompt if not registered, otherwise top row with HOJE chip */}
        {todayLog ? (
          <DayRowWithDelete
            log={todayLog}
            goalsById={goalsById}
            isToday
            href="/app/check-in"
            onDelete={() => deleteDay.mutate(todayLog.date)}
          />
        ) : (
          <TodayPrompt />
        )}

        {logs.data && logs.data.length === 0 && <Empty />}

        {otherLogs.map((log) => (
          <DayRowWithDelete
            key={log.id}
            log={log}
            goalsById={goalsById}
            onSelect={() => setSelected(log)}
            onDelete={() => deleteDay.mutate(log.date)}
          />
        ))}
      </div>

      {selected && (
        <DayDetailModal
          log={selected}
          goalsById={goalsById}
          onClose={() => setSelected(null)}
        />
      )}

      {showOnboarding && <Onboarding onClose={() => setShowOnboarding(false)} />}
    </div>
  );

  function Kpis({ sparkSeries }: { sparkSeries: number[] }) {
    const s = stats.data;
    const streak = s?.streak ?? { current: 0, record: 0 };
    const v = variation(s?.score_last_14 ?? 0, s?.score_prev_14 ?? 0);
    const isRecordBeaten = streak.current > 0 && streak.current > streak.record;
    const isRecordTied = streak.current > 0 && streak.current === streak.record;

    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Kpi
          featured
          label="Streak"
          glyph={<Flame size={14} />}
          value={
            <>
              {streak.current}
              <span className="display-unit">dias</span>
            </>
          }
          sub={
            isRecordBeaten ? (
              <span className="text-primary font-semibold">Novo recorde</span>
            ) : isRecordTied ? (
              <span className="text-primary font-semibold">Empate de recorde</span>
            ) : (
              <span>Recorde {streak.record}d</span>
            )
          }
          spark={sparkSeries.length >= 2 ? <Sparkline data={sparkSeries} /> : null}
        />
        <Kpi
          label="Consistência"
          glyph={<CalendarDays size={14} />}
          value={
            <>
              {(s?.consistency ?? 0).toFixed(0)}
              <span className="display-unit">%</span>
            </>
          }
          sub={<span>Desde o início</span>}
          spark={
            sparkSeries.length >= 2 ? <Sparkline data={sparkSeries} color="#8ad36b" /> : null
          }
        />
        <Kpi
          label="Score médio"
          glyph={<Star size={14} />}
          value={<>{formatScore(s?.average_score ?? 0)}</>}
          sub={<span>Geral</span>}
          spark={
            sparkSeries.length >= 2 ? <Sparkline data={sparkSeries} color="#6aa7e8" /> : null
          }
        />
        <Kpi
          label="Score 14d"
          glyph={<TrendingUp size={14} />}
          value={<>{formatScore(s?.score_last_14 ?? 0)}</>}
          sub={
            v.symbol === "·" ? (
              <span>—</span>
            ) : (
              <span className={v.delta > 0 ? "text-good" : "text-rough"}>
                {v.symbol} {Math.abs(v.delta).toFixed(1)} vs anterior
              </span>
            )
          }
          spark={
            sparkSeries.length >= 2 ? <Sparkline data={sparkSeries} color="#f0a868" /> : null
          }
        />
      </div>
    );
  }
}

function DayRowWithDelete({
  log,
  goalsById,
  isToday,
  onSelect,
  href,
  onDelete,
}: {
  log: DayLog;
  goalsById: Map<string, Goal>;
  isToday?: boolean;
  onSelect?: () => void;
  href?: string;
  onDelete: () => void;
}) {
  return (
    <div className="relative group">
      <DayRow log={log} goalsById={goalsById} isToday={isToday} onSelect={onSelect} href={href} />
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          if (confirm("Excluir este registro? Útil só pra testar.")) onDelete();
        }}
        aria-label="Excluir dia (teste)"
        className="absolute top-1/2 -translate-y-1/2 -right-2 lg:-right-12 w-9 h-9 grid place-items-center rounded-lg bg-bg-2 border border-border text-muted hover:text-rough hover:border-rough/40 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}

function TodayPrompt() {
  const today = todayISO();
  return (
    <Link
      to="/app/check-in"
      className="relative grid grid-cols-[6px_1fr_auto] rounded-card overflow-hidden border transition-all hover:-translate-y-px"
      style={{
        background:
          "radial-gradient(120% 200% at 0% 0%, rgba(245,181,40,0.18), transparent 60%), linear-gradient(180deg, #1e170e, #16110a)",
        borderColor: "rgba(245,181,40,0.4)",
        boxShadow: "0 8px 24px -10px rgba(245,181,40,0.4)",
      }}
    >
      <span style={{ background: "#f5b528" }} />
      <div className="p-3.5 flex flex-col gap-1.5 min-w-0">
        <div className="flex items-center gap-2">
          <div className="display text-base lg:text-[16px] uppercase leading-none text-primary">
            Registrar hoje
          </div>
          <span className="chip-today">HOJE</span>
        </div>
        <div className="text-xs text-text-2">
          {formatDate(today)}{" "}
          <span className="text-muted">· {weekdayShort(today)}</span>
        </div>
        <div className="text-[11px] text-muted">
          Marque o nível de cada meta — leva menos de 30s.
        </div>
      </div>
      <div className="flex items-center pr-4">
        <span
          className="grid place-items-center w-11 h-11 rounded-full text-ink"
          style={{
            background: "#f5b528",
            boxShadow: "0 8px 24px -10px rgba(245,181,40,0.6)",
          }}
        >
          <ChevronRight size={20} strokeWidth={2.5} />
        </span>
      </div>
    </Link>
  );
}

type KpiProps = {
  featured?: boolean;
  label: string;
  glyph: React.ReactNode;
  value: React.ReactNode;
  sub: React.ReactNode;
  spark?: React.ReactNode;
};

function Kpi({ featured, label, glyph, value, sub, spark }: KpiProps) {
  return (
    <div
      className="relative overflow-hidden rounded-card border p-4"
      style={{
        background: featured
          ? "radial-gradient(80% 120% at 100% 0%, rgba(245,181,40,0.16), transparent 60%), linear-gradient(180deg, #1e170e, #16110a)"
          : "linear-gradient(180deg, #1e170e, #16110a)",
        borderColor: featured ? "rgba(245,181,40,0.35)" : "#2a1f12",
      }}
    >
      <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.1em] text-muted font-semibold">
        <span>{label}</span>
        <span className="text-muted">{glyph}</span>
      </div>
      <div className="display text-[32px] lg:text-[36px] leading-none mt-2.5 flex items-baseline gap-1.5 nums">
        {value}
      </div>
      <div className="text-[11px] text-text-2 mt-1.5 flex justify-between nums">{sub}</div>
      {spark && <div className="h-7 mt-2">{spark}</div>}
    </div>
  );
}

function SkeletonRows() {
  return (
    <>
      {[0, 1, 2].map((i) => (
        <div key={i} className="surface-raised rounded-card h-20 animate-pulse" />
      ))}
    </>
  );
}

function Empty() {
  return (
    <div className="surface rounded-card p-8 text-center">
      <p className="display text-lg">Nada por aqui ainda.</p>
      <p className="text-text-2 text-sm mt-1">
        Registre seu primeiro dia para começar a construir histórico.
      </p>
    </div>
  );
}
