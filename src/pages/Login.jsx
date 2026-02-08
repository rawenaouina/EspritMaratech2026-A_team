import { useState } from "react";
import { apiPost } from "../api/client";
import { setAuth } from "../state/auth";
import { t } from "../i18n/i18n.js";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const nav = useNavigate();
  const [role, setRole] = useState("DONOR");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  async function submit(e) {
    e.preventDefault();
    setMsg("");
    try {
      const res = await apiPost("/api/auth/login", { email, password });
      const payload = res?.token ? res : { token: "demo-token", user: { role, email } };
      setAuth(payload);

      if (payload.user.role === "ADMIN") nav("/admin");
      else if (payload.user.role === "ASSOCIATION") nav("/association/dashboard");
      else nav("/cases");
    } catch {
      setAuth({ token: "demo-token", user: { role, email } });
      if (role === "ADMIN") nav("/admin");
      else if (role === "ASSOCIATION") nav("/association/dashboard");
      else nav("/cases");
      setMsg("Mode démo activé.");
    }
  }

  return (
    <div className="max-w-lg mx-auto p-6 space-y-4">
      <h1 className="text-3xl font-bold">{t("loginTitle")}</h1>
      <p className="text-sm opacity-80">{t("loginHint")}</p>

      <form onSubmit={submit} className="card p-5 space-y-3">
        <label className="text-sm font-semibold" htmlFor="role">{t("loginRole")}</label>
        <select id="role" className="rounded-xl border dark:border-slate-800 bg-transparent px-3 py-2"
          value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="DONOR">DONOR</option>
          <option value="ASSOCIATION">ASSOCIATION</option>
          <option value="ADMIN">ADMIN</option>
        </select>

        <label className="text-sm font-semibold" htmlFor="email">{t("loginEmail")}</label>
        <input id="email" className="rounded-xl border dark:border-slate-800 bg-transparent px-3 py-2"
          value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ex: test@mail.com" />

        <label className="text-sm font-semibold" htmlFor="pass">{t("loginPassword")}</label>
        <input id="pass" type="password" className="rounded-xl border dark:border-slate-800 bg-transparent px-3 py-2"
          value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />

        <button className="px-4 py-3 rounded-2xl border font-semibold" type="submit">{t("loginSubmit")}</button>
        {msg ? <div className="text-sm opacity-80">{msg}</div> : null}
      </form>
    </div>
  );
}
