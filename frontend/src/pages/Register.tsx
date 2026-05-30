import { FormEvent, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";

import { useMe, useRegister } from "@/lib/queries";
import { AuthField, AuthLayout } from "./Login";

export default function Register() {
  const me = useMe();
  const register = useRegister();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  if (me.data) return <Navigate to="/app" replace />;

  const passwordsMatch = password.length > 0 && password === confirmPassword;
  const showMismatch = confirmPassword.length > 0 && !passwordsMatch;
  const canSubmit =
    name.trim().length >= 1 && password.length >= 8 && passwordsMatch;

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    await register.mutateAsync({ name: name.trim(), email, password });
    navigate("/app", { replace: true });
  }

  return (
    <AuthLayout
      title={<>Bora <span className="text-primary">subir de elo</span></>}
      subtitle="Crie sua conta em 30 segundos."
    >
      <form onSubmit={submit} className="flex flex-col gap-3.5">
        <AuthField
          label="Nome"
          type="text"
          value={name}
          onChange={setName}
          autoComplete="name"
          minLength={1}
          maxLength={30}
          helper="Como você quer aparecer no app."
        />
        <AuthField
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
          autoComplete="email"
        />
        <AuthField
          label="Senha"
          type="password"
          value={password}
          onChange={setPassword}
          autoComplete="new-password"
          minLength={8}
          helper="Mínimo 8 caracteres."
        />
        <div>
          <AuthField
            label="Confirmar senha"
            type="password"
            value={confirmPassword}
            onChange={setConfirmPassword}
            autoComplete="new-password"
            minLength={8}
          />
          {showMismatch && (
            <p className="text-sm text-rough mt-1.5">As senhas não conferem.</p>
          )}
        </div>
        {register.isError && (
          <p className="text-sm text-rough">{(register.error as Error).message}</p>
        )}
        <button
          type="submit"
          className="btn-primary mt-2 w-full disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={register.isPending || !canSubmit}
        >
          {register.isPending ? "Criando…" : "Criar conta →"}
        </button>
      </form>
      <p className="text-sm text-text-2 mt-6 text-center">
        Já tem conta?{" "}
        <Link to="/login" className="text-primary font-semibold">
          Entrar
        </Link>
      </p>
    </AuthLayout>
  );
}
