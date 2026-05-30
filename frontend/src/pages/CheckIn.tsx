import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Coffee } from "lucide-react";

import {
  CATEGORY_META,
  LEVEL_OPTIONS,
  type Goal,
  type GoalLevel,
} from "@/lib/types";
import { formatDate, todayISO } from "@/lib/format";
import { useCheckIn, useDayLog, useDayOff, useGoals } from "@/lib/queries";

function jsWeekdayToBackend(jsDay: number): number {
  // JS: 0=domingo. Backend: 0=segunda...6=domingo.
  return (jsDay + 6) % 7;
}

export default function CheckIn() {
  const { date } = useParams<{ date?: string }>();
  const targetDate = date ?? todayISO();
  const navigate = useNavigate();

  const goals = useGoals();
  const existing = useDayLog(targetDate);
  const checkIn = useCheckIn();
  const dayOff = useDayOff();

  const weekday = jsWeekdayToBackend(new Date(targetDate + "T00:00:00").getDay());
  const todaysGoals = useMemo<Goal[]>(
    () => (goals.data ?? []).filter((g) => g.days_of_week.includes(weekday)),
    [goals.data, weekday],
  );

  const [levels, setLevels] = useState<Record<string, GoalLevel>>({});

  useEffect(() => {
    if (!existing.data) return;
    const next: Record<string, GoalLevel> = {};
    for (const e of existing.data.entries) next[e.goal_id] = e.level as GoalLevel;
    setLevels(next);
  }, [existing.data]);

  const allMarked = todaysGoals.every((g) => levels[g.id] !== undefined);
  const remaining = todaysGoals.length - Object.keys(levels).length;

  async function submit() {
    if (!allMarked) return;
    await checkIn.mutateAsync({
      date: targetDate,
      entries: todaysGoals.map((g) => ({ goal_id: g.id, level: levels[g.id] })),
    });
    navigate("/app");
  }

  async function markDayOff() {
    await dayOff.mutateAsync(targetDate);
    navigate("/app");
  }

  return (
    <div className="px-4 lg:px-7 py-5 lg:py-8 max-w-3xl mx-auto">
      <Link
        to="/app"
        className="inline-flex items-center gap-1.5 text-text-2 text-sm mb-4 hover:text-text"
      >
        <ArrowLeft size={16} /> Voltar
      </Link>

      <header className="mb-6">
        <div className="text-[12px] uppercase tracking-[0.08em] text-muted">Check-in</div>
        <h1 className="display text-[28px] lg:text-[34px] mt-1 leading-none">
          {formatDate(targetDate, { day: "2-digit", month: "long", weekday: "long" })}
        </h1>
      </header>

      {goals.isLoading && <p className="text-text-2">Carregando metas…</p>}

      {goals.data && todaysGoals.length === 0 && (
        <div className="surface rounded-card p-6 text-center">
          <p className="display text-lg">Nenhuma meta para esse dia da semana.</p>
          <p className="text-text-2 text-sm mt-1">
            Crie metas em{" "}
            <Link to="/app/metas" className="text-primary font-medium">
              Metas
            </Link>{" "}
            ou marque como Day Off.
          </p>
          <button
            onClick={markDayOff}
            disabled={dayOff.isPending}
            className="btn mt-4 mx-auto"
          >
            <Coffee size={16} /> Marcar Day Off
          </button>
        </div>
      )}

      {todaysGoals.length > 0 && (
        <>
          <ul className="flex flex-col gap-3">
            {todaysGoals.map((g) => {
              const cat = CATEGORY_META[g.category];
              return (
                <li
                  key={g.id}
                  className="relative bg-surface border border-border rounded-card p-4 overflow-hidden"
                >
                  <span
                    className="absolute left-0 top-0 bottom-0 w-1"
                    style={{ background: cat.color }}
                  />
                  <div className="flex items-center gap-3 mb-3">
                    <span
                      className="w-10 h-10 rounded-lg grid place-items-center text-[18px]"
                      style={{
                        background: `${cat.color}26`,
                        border: `1px solid ${cat.color}66`,
                        color: cat.color,
                      }}
                      aria-hidden
                    >
                      {cat.emoji}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="display text-[16px] leading-none">{g.name}</div>
                      <div
                        className="text-[10px] uppercase tracking-[0.1em] font-bold mt-1.5"
                        style={{ color: cat.color }}
                      >
                        {cat.label} · peso {g.weight}
                      </div>
                    </div>
                  </div>

                  <div
                    role="radiogroup"
                    aria-label={`Nível para ${g.name}`}
                    className="grid grid-cols-4 gap-1.5"
                  >
                    {LEVEL_OPTIONS.map((opt) => {
                      const active = levels[g.id] === opt.value;
                      return (
                        <button
                          key={opt.value}
                          role="radio"
                          aria-checked={active}
                          onClick={() =>
                            setLevels((s) => ({ ...s, [g.id]: opt.value }))
                          }
                          className="min-h-[56px] rounded-lg px-1 py-2 text-xs font-medium transition-all"
                          style={
                            active
                              ? {
                                  background: "#f5b528",
                                  color: "#1a1408",
                                  boxShadow: "0 8px 24px -10px rgba(245,181,40,0.6)",
                                }
                              : {
                                  background: "#16110a",
                                  border: "1px solid #2a1f12",
                                  color: "#c9bd9f",
                                }
                          }
                        >
                          <div className="leading-tight">{opt.label}</div>
                          <div
                            className="text-[10px] mt-0.5 nums"
                            style={{ color: active ? "rgba(26,20,8,0.7)" : "#8a7a60" }}
                          >
                            {opt.hint}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </li>
              );
            })}
          </ul>

          <div
            className="sticky bottom-20 lg:bottom-6 mt-6 flex flex-col gap-2"
            style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
          >
            <button
              onClick={submit}
              disabled={!allMarked || checkIn.isPending}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {checkIn.isPending
                ? "Salvando…"
                : allMarked
                  ? "Salvar check-in"
                  : `Marque ${remaining} ${remaining === 1 ? "restante" : "restantes"}`}
            </button>
            <button
              onClick={markDayOff}
              disabled={dayOff.isPending}
              className="btn text-sm"
            >
              <Coffee size={16} /> Marcar como Day Off
            </button>
          </div>
        </>
      )}

      {checkIn.isError && (
        <p className="mt-4 text-sm text-rough">{(checkIn.error as Error).message}</p>
      )}
    </div>
  );
}
