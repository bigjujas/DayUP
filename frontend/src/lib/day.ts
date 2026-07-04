// Helpers puros compartilhados pela tela "Hoje" e pelo modal de detalhe do dia.
import { LEVEL_OPTIONS, type Goal, type GoalLevel } from "@/lib/types";

export function jsWeekdayToBackend(jsDay: number): number {
  // JS: 0=domingo. Backend: 0=segunda...6=domingo.
  return (jsDay + 6) % 7;
}

export function weekdayOf(dateISO: string): number {
  return jsWeekdayToBackend(new Date(dateISO + "T00:00:00").getDay());
}

export const levelByValue = (v: GoalLevel) => LEVEL_OPTIONS.find((o) => o.value === v);

export function stateLabel(progress: number, score: number): string {
  if (progress === 0) return "Comece o dia";
  if (progress < 100 && score < 45) return "Em andamento";
  if (score >= 85) return "Excelente";
  if (score >= 65) return "Bom dia";
  if (score >= 45) return "Regular";
  return "Difícil";
}

// Espelha a fórmula do backend: Σ(peso×nível) / Σpeso × 100, arredondado.
export function computeScore(goals: Goal[], levels: Record<string, GoalLevel>): number {
  const totalWeight = goals.reduce((sum, g) => sum + g.weight, 0);
  if (totalWeight === 0) return 0;
  const earned = goals.reduce((sum, g) => {
    const lv = levels[g.id];
    return sum + (lv !== undefined ? g.weight * lv : 0);
  }, 0);
  return Math.round((earned / totalWeight) * 100);
}
