import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";

import {
  useChangeEmail,
  useChangePassword,
  useLogout,
  useMe,
  useUpdateName,
} from "@/lib/queries";

const PASSWORD_RE = /^(?=.*[A-Za-z])(?=.*\d).{8,128}$/;

export default function Profile() {
  const me = useMe();
  const logout = useLogout();
  const navigate = useNavigate();
  const [toast, setToast] = useState("");

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  }

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

      <div className="flex flex-col gap-3">
        <NameSection name={me.data?.name ?? ""} onSaved={() => showToast("Nome atualizado ✓")} />
        <EmailSection
          email={me.data?.email ?? ""}
          onSaved={() => showToast("E-mail atualizado ✓")}
        />
        <PasswordSection onSaved={() => showToast("Senha atualizada ✓")} />
      </div>

      <button onClick={handleLogout} className="btn mt-6 w-full text-rough hover:!border-rough/40">
        <LogOut size={16} /> Sair
      </button>

      <div
        className={[
          "fixed left-1/2 -translate-x-1/2 bottom-24 lg:bottom-8 z-40 bg-border-2 border border-border-2 text-text text-[13px] font-semibold px-4 py-2.5 rounded-full flex items-center gap-2 transition-all duration-300",
          toast ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none",
        ].join(" ")}
      >
        <span className="w-2 h-2 rounded-full bg-good" />
        {toast}
      </div>
    </div>
  );
}

function Field({
  label,
  type,
  value,
  onChange,
  autoComplete,
  helper,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete?: string;
  helper?: string;
}) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      <input
        className="input"
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        required
      />
      {helper && <span className="block text-[11px] text-muted mt-1.5">{helper}</span>}
    </label>
  );
}

function SectionCard({
  label,
  value,
  editing,
  onEdit,
  children,
}: {
  label: string;
  value: string;
  editing: boolean;
  onEdit: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="surface-raised rounded-card p-5">
      <div className="flex items-center justify-between">
        <div className="label !mb-0">{label}</div>
        {!editing && (
          <button onClick={onEdit} className="text-[12px] text-primary font-semibold">
            Editar
          </button>
        )}
      </div>
      {editing ? (
        <div className="mt-3">{children}</div>
      ) : (
        <p className="text-base text-text mt-1.5">{value}</p>
      )}
    </div>
  );
}

function NameSection({ name, onSaved }: { name: string; onSaved: () => void }) {
  const updateName = useUpdateName();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(name);

  function startEdit() {
    setValue(name);
    updateName.reset();
    setEditing(true);
  }

  const canSubmit = value.trim().length >= 2 && value.trim() !== name;

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    await updateName.mutateAsync(value.trim());
    setEditing(false);
    onSaved();
  }

  return (
    <SectionCard label="Nome" value={name} editing={editing} onEdit={startEdit}>
      <form onSubmit={submit} className="flex flex-col gap-3">
        <input
          className="input"
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          autoComplete="name"
          minLength={2}
          maxLength={30}
          autoFocus
          required
        />
        {updateName.isError && (
          <p className="text-sm text-rough">{(updateName.error as Error).message}</p>
        )}
        <div className="flex gap-2">
          <button
            type="submit"
            className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={updateName.isPending || !canSubmit}
          >
            {updateName.isPending ? "Salvando…" : "Salvar"}
          </button>
          <button type="button" onClick={() => setEditing(false)} className="btn">
            Cancelar
          </button>
        </div>
      </form>
    </SectionCard>
  );
}

function EmailSection({ email, onSaved }: { email: string; onSaved: () => void }) {
  const changeEmail = useChangeEmail();
  const [editing, setEditing] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [password, setPassword] = useState("");

  function startEdit() {
    setNewEmail("");
    setConfirmEmail("");
    setPassword("");
    changeEmail.reset();
    setEditing(true);
  }

  const emailsMatch = confirmEmail.length > 0 && newEmail.toLowerCase() === confirmEmail.toLowerCase();
  const showMismatch = confirmEmail.length > 0 && !emailsMatch;
  const canSubmit = newEmail.includes("@") && emailsMatch && password.length > 0;

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    await changeEmail.mutateAsync({
      new_email: newEmail.trim(),
      confirm_new_email: confirmEmail.trim(),
      password,
    });
    setEditing(false);
    onSaved();
  }

  return (
    <SectionCard label="E-mail" value={email} editing={editing} onEdit={startEdit}>
      <form onSubmit={submit} className="flex flex-col gap-3">
        <Field label="Novo e-mail" type="email" value={newEmail} onChange={setNewEmail} autoComplete="email" />
        <div>
          <Field
            label="Confirmar novo e-mail"
            type="email"
            value={confirmEmail}
            onChange={setConfirmEmail}
            autoComplete="email"
          />
          {showMismatch && <p className="text-sm text-rough mt-1.5">Os e-mails não conferem.</p>}
        </div>
        <Field
          label="Senha atual"
          type="password"
          value={password}
          onChange={setPassword}
          autoComplete="current-password"
          helper="Confirme sua senha para trocar o e-mail."
        />
        {changeEmail.isError && (
          <p className="text-sm text-rough">{(changeEmail.error as Error).message}</p>
        )}
        <div className="flex gap-2">
          <button
            type="submit"
            className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={changeEmail.isPending || !canSubmit}
          >
            {changeEmail.isPending ? "Salvando…" : "Salvar"}
          </button>
          <button type="button" onClick={() => setEditing(false)} className="btn">
            Cancelar
          </button>
        </div>
      </form>
    </SectionCard>
  );
}

function PasswordSection({ onSaved }: { onSaved: () => void }) {
  const changePassword = useChangePassword();
  const [editing, setEditing] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  function startEdit() {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    changePassword.reset();
    setEditing(true);
  }

  const passwordsMatch = confirmPassword.length > 0 && newPassword === confirmPassword;
  const showMismatch = confirmPassword.length > 0 && !passwordsMatch;
  const passwordOk = PASSWORD_RE.test(newPassword);
  const showWeakPassword = newPassword.length >= 8 && !passwordOk;
  const canSubmit = currentPassword.length > 0 && passwordOk && passwordsMatch;

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    await changePassword.mutateAsync({
      current_password: currentPassword,
      new_password: newPassword,
      confirm_new_password: confirmPassword,
    });
    setEditing(false);
    onSaved();
  }

  return (
    <SectionCard label="Senha" value="••••••••" editing={editing} onEdit={startEdit}>
      <form onSubmit={submit} className="flex flex-col gap-3">
        <Field
          label="Senha atual"
          type="password"
          value={currentPassword}
          onChange={setCurrentPassword}
          autoComplete="current-password"
        />
        <div>
          <Field
            label="Nova senha"
            type="password"
            value={newPassword}
            onChange={setNewPassword}
            autoComplete="new-password"
            helper="Mínimo 8 caracteres, com letras e números."
          />
          {showWeakPassword && (
            <p className="text-sm text-rough mt-1.5">A senha precisa ter letras e números.</p>
          )}
        </div>
        <div>
          <Field
            label="Confirmar nova senha"
            type="password"
            value={confirmPassword}
            onChange={setConfirmPassword}
            autoComplete="new-password"
          />
          {showMismatch && <p className="text-sm text-rough mt-1.5">As senhas não conferem.</p>}
        </div>
        {changePassword.isError && (
          <p className="text-sm text-rough">{(changePassword.error as Error).message}</p>
        )}
        <div className="flex gap-2">
          <button
            type="submit"
            className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={changePassword.isPending || !canSubmit}
          >
            {changePassword.isPending ? "Salvando…" : "Salvar"}
          </button>
          <button type="button" onClick={() => setEditing(false)} className="btn">
            Cancelar
          </button>
        </div>
      </form>
    </SectionCard>
  );
}
