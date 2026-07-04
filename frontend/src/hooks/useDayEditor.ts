import { useEffect, useMemo, useState } from "react";

import { type Goal, type GoalLevel } from "@/lib/types";
import { computeScore, stateLabel, weekdayOf } from "@/lib/day";
import { useDayLog, useDayOff, useFinalizeDay, useGoals, useSaveDay } from "@/lib/queries";

/**
 * Estado e ações de edição de um dia (mood, metas, nota, salvar/finalizar/day off).
 * Compartilhado pela tela "Hoje" e pelo modal de detalhe do dia — não duplicar a lógica.
 *
 * Não cuida de toast/navegação/fechamento: o consumidor reage aos retornos das ações.
 */
export function useDayEditor(date: string) {
  const goals = useGoals();
  const existing = useDayLog(date);
  const saveDay = useSaveDay();
  const finalizeDay = useFinalizeDay();
  const dayOff = useDayOff();

  const weekday = weekdayOf(date);
  const todaysGoals = useMemo<Goal[]>(
    () => (goals.data ?? []).filter((g) => g.days_of_week.includes(weekday)),
    [goals.data, weekday],
  );

  const [levels, setLevels] = useState<Record<string, GoalLevel>>({});
  const [times, setTimes] = useState<Record<string, string>>({});
  const [mood, setMood] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [isFinalized, setIsFinalized] = useState(false);
  const [reopened, setReopened] = useState(false);

  // Hidrata o estado local quando o dia carrega.
  useEffect(() => {
    if (!existing.data) return;
    const nextLevels: Record<string, GoalLevel> = {};
    const nextTimes: Record<string, string> = {};
    for (const e of existing.data.entries) {
      nextLevels[e.goal_id] = e.level as GoalLevel;
      if (e.done_at) nextTimes[e.goal_id] = e.done_at.slice(0, 5);
    }
    setLevels(nextLevels);
    setTimes(nextTimes);
    setMood(existing.data.mood);
    setNote(existing.data.note ?? "");
    setIsFinalized(existing.data.finalized);
    setReopened(false);
  }, [existing.data]);

  const evaluatedCount = todaysGoals.filter((g) => levels[g.id] !== undefined).length;
  const progress = todaysGoals.length
    ? Math.round((evaluatedCount / todaysGoals.length) * 100)
    : 0;
  const score = useMemo(() => computeScore(todaysGoals, levels), [todaysGoals, levels]);
  const label = stateLabel(progress, score);
  const perfectCount = Object.values(levels).filter((v) => v === 1).length;
  const remaining = Math.max(todaysGoals.length - evaluatedCount, 0);

  // Confirmação leve ao editar um dia já finalizado.
  function guardEdit(): boolean {
    if (isFinalized && !reopened) {
      const ok = window.confirm("Esse dia já foi finalizado — quer reabrir para editar?");
      if (!ok) return false;
      setReopened(true);
    }
    return true;
  }

  function pickLevel(goalId: string, value: GoalLevel) {
    if (!guardEdit()) return;
    setLevels((prev) => {
      const next = { ...prev };
      if (next[goalId] === value) delete next[goalId]; // toque de novo desmarca
      else next[goalId] = value;
      return next;
    });
  }

  function setTime(goalId: string, value: string) {
    if (!guardEdit()) return;
    setTimes((prev) => {
      const next = { ...prev };
      if (value) next[goalId] = value;
      else delete next[goalId];
      return next;
    });
  }

  function buildPayload() {
    const entries = todaysGoals
      .filter((g) => levels[g.id] !== undefined)
      .map((g) => ({
        goal_id: g.id,
        level: levels[g.id],
        done_at: times[g.id] ? `${times[g.id]}:00` : null,
      }));
    return { date, mood, note: note.trim() || null, entries };
  }

  async function save() {
    const result = await saveDay.mutateAsync(buildPayload());
    setReopened(false);
    return result;
  }

  async function finalize() {
    await saveDay.mutateAsync(buildPayload());
    const result = await finalizeDay.mutateAsync(date);
    setIsFinalized(result.finalized);
    setReopened(false);
    return result;
  }

  async function markDayOff() {
    return dayOff.mutateAsync(date);
  }

  return {
    date,
    // queries
    goals,
    existing,
    isLoading: goals.isLoading || existing.isLoading,
    // dados
    todaysGoals,
    levels,
    times,
    mood,
    note,
    // setters
    setMood,
    setNote,
    pickLevel,
    setTime,
    // derivados
    evaluatedCount,
    progress,
    score,
    label,
    perfectCount,
    remaining,
    isFinalized,
    isDayOff: existing.data?.status === "day_off",
    // ações
    save,
    finalize,
    markDayOff,
    busy: saveDay.isPending || finalizeDay.isPending,
    dayOffPending: dayOff.isPending,
    error: (saveDay.error || finalizeDay.error) as Error | null,
  };
}
