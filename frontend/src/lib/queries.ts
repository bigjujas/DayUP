import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ApiError, apiFetch } from "./api";
import type { DayLog, Goal, Stats, User } from "./types";

export const qk = {
  me: ["auth", "me"] as const,
  goals: ["goals"] as const,
  dayLogs: ["day-logs"] as const,
  dayLog: (date: string) => ["day-logs", date] as const,
  stats: ["stats"] as const,
};

export function useMe() {
  return useQuery({
    queryKey: qk.me,
    queryFn: async () => {
      try {
        return await apiFetch<User>("/auth/me");
      } catch (e) {
        if (e instanceof ApiError && e.status === 401) return null;
        throw e;
      }
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useLogin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { email: string; password: string }) =>
      apiFetch<User>("/auth/login", { method: "POST", body: payload }),
    onSuccess: (user) => qc.setQueryData(qk.me, user),
  });
}

export function useRegister() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { name: string; email: string; password: string }) =>
      apiFetch<User>("/auth/register", { method: "POST", body: payload }),
    onSuccess: (user) => qc.setQueryData(qk.me, user),
  });
}

export function useLogout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => apiFetch<void>("/auth/logout", { method: "POST" }),
    onSuccess: () => {
      qc.setQueryData(qk.me, null);
      qc.removeQueries();
    },
  });
}

export function useGoals(opts?: { includeArchived?: boolean }) {
  const params = opts?.includeArchived ? "?include_archived=true" : "";
  return useQuery({
    queryKey: [...qk.goals, opts?.includeArchived ?? false],
    queryFn: () => apiFetch<Goal[]>(`/goals${params}`),
  });
}

export function useDayLogs(limit = 14) {
  return useQuery({
    queryKey: [...qk.dayLogs, { limit }],
    queryFn: () => apiFetch<DayLog[]>(`/day-logs?limit=${limit}`),
  });
}

export function useDayLog(date: string) {
  return useQuery({
    queryKey: qk.dayLog(date),
    queryFn: async () => {
      try {
        return await apiFetch<DayLog>(`/day-logs/${date}`);
      } catch (e) {
        if (e instanceof ApiError && e.status === 404) return null;
        throw e;
      }
    },
  });
}

export function useStats() {
  return useQuery({
    queryKey: qk.stats,
    queryFn: () => apiFetch<Stats>("/stats"),
  });
}

export function useCheckIn() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      date: string;
      entries: { goal_id: string; level: number }[];
    }) => apiFetch<DayLog>("/day-logs/check-in", { method: "POST", body: payload }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.dayLogs });
      qc.invalidateQueries({ queryKey: qk.stats });
    },
  });
}

export function useDayOff() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (date: string) =>
      apiFetch<DayLog>("/day-logs/day-off", { method: "POST", body: { date } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.dayLogs });
      qc.invalidateQueries({ queryKey: qk.stats });
    },
  });
}

export function useDeleteDayLog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (date: string) =>
      apiFetch<void>(`/day-logs/${date}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.dayLogs });
      qc.invalidateQueries({ queryKey: qk.stats });
    },
  });
}

export function useCreateGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Omit<Goal, "id" | "archived_at">) =>
      apiFetch<Goal>("/goals", { method: "POST", body: payload }),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.goals }),
  });
}

export function useUpdateGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }: Goal) =>
      apiFetch<Goal>(`/goals/${id}`, { method: "PUT", body: payload }),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.goals }),
  });
}

export function useArchiveGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch<void>(`/goals/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.goals }),
  });
}
