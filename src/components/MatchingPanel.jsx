import { useState } from "react";
import { apiFetch } from "../lib/apiClient";
import { useTranslation } from "react-i18next";

export default function MatchingPanel() {
  const { i18n } = useTranslation();
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [recs, setRecs] = useState([]);
  const [note, setNote] = useState("");
  const [err, setErr] = useState("");

  const run = async () => {
    setErr(""); setLoading(true);
    try {
      const data = await apiFetch("/api/ai/match", {
        method: "POST",
        body: JSON.stringify({ query: q })
      });
      setRecs(data.recommendations || []);
      setNote(data.note || "");
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border bg-white p-4">
      <div className="text-lg font-semibold">Assistant – Recommander 3 cas</div>
      <div className="mt-3 flex gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="w-full rounded-xl border px-3 py-2"
          placeholder={i18n.language.startsWith("ar") ? "مثال: أريد مساعدة طبية عاجلة في أريانة" : "Ex: aider à Ariana, urgent, médical"}
        />
        <button onClick={run} className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
          {loading ? "..." : "Go"}
        </button>
      </div>

      {err && <div className="mt-3 text-sm text-red-600">{err}</div>}
      {note && <div className="mt-3 text-sm text-slate-500">{note}</div>}

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {recs.map((c) => (
          <div key={c.id} className="rounded-2xl border p-3">
            <div className="text-sm text-slate-500">{c.address}</div>
            <div className="mt-1 font-semibold">{c.title}</div>
            <p className="mt-2 text-sm text-slate-700">{c.summary}</p>
            <p className="mt-2 text-xs text-slate-500">Pourquoi: {c.reason}</p>
            <a className="mt-3 inline-block text-sm font-semibold underline" href={c.cha9a9aUrl} target="_blank" rel="noreferrer">
              Donner
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
