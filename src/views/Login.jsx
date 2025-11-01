import React, { useState } from "react";
import { useApp } from "../context/AppProvider";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";

export default function Login() {
  const { supa, toast } = useApp();
  const [email, setEmail] = useState("");
  const [pass, setPass]   = useState("");
  const [busy, setBusy]   = useState(false);
  const [err, setErr]     = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    setBusy(true);
    try {
      const { error } = await supa.auth.signInWithPassword({
        email,
        password: pass,
      });
      if (error) {
        setErr(error.message || "Falha ao entrar.");
        toast("Credenciais inválidas", "err");
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="login-wrapper">
      {/* Lado esquerdo: imagem vem do seu CSS (.login-image) */}
      <div className="login-image" />

      {/* Lado direito ocupa 100% da altura */}
      <div className="login-panel">
        {/* A “caixa” passa a ocupar o painel inteiro (sem borda/sombra) */}
        <div className="login-box login-box--full">
          <div className="login-form">
            <h2 className="login-title">Bem-vindo 👋</h2>
            <p className="login-sub">Acesse sua conta para continuar</p>

            <form onSubmit={onSubmit}>
              <label className="label">Email</label>
              <Input
                className="login-input"
                type="email"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <label className="label" style={{ marginTop: 8 }}>
                Senha
              </label>
              <Input
                className="login-input"
                type="password"
                autoComplete="current-password"
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                required
              />

              {err && (
                <div className="readonly" style={{ marginTop: 10 }}>
                  {err}
                </div>
              )}

              <Button
                className="login-btn"
                type="submit"
                disabled={busy}
                style={{ marginTop: 12, width: "100%" }}
              >
                {busy ? "Entrando..." : "Entrar"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
