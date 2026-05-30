import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";

import { useLogout, useMe } from "@/lib/queries";

export default function Profile() {
  const me = useMe();
  const logout = useLogout();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout.mutateAsync();
    navigate("/", { replace: true });
  }

  return (
    <div className="px-4 lg:px-7 py-5 lg:py-8 max-w-2xl mx-auto">
      <header className="mb-6">
        <div className="text-[12px] uppercase tracking-[0.08em] text-muted">Conta</div>
        <h1 className="display text-[28px] lg:text-[34px] mt-1 leading-none">Perfil</h1>
      </header>

      <div className="surface-raised rounded-card p-5">
        <div className="label">Nome</div>
        <p className="text-base text-text">{me.data?.name}</p>
        <div className="label mt-4">Email</div>
        <p className="text-sm text-text-2">{me.data?.email}</p>
      </div>

      <button onClick={handleLogout} className="btn mt-6 w-full text-rough hover:!border-rough/40">
        <LogOut size={16} /> Sair
      </button>
    </div>
  );
}
