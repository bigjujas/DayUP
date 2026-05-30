import { Navigate, useLocation } from "react-router-dom";
import type { ReactNode } from "react";

import { useMe } from "@/lib/queries";

export default function RequireAuth({ children }: { children: ReactNode }) {
  const me = useMe();
  const location = useLocation();

  if (me.isLoading) {
    return (
      <div className="min-h-dvh grid place-items-center text-cream-300 text-sm">
        Carregando…
      </div>
    );
  }
  if (!me.data) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return <>{children}</>;
}
