import { useState } from "react";
import { apiFetch } from "../lib/apiClient";

export default function AdminAiReview({ token, caseId }) {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function run() {
    setErr(""); setLoading(true);
    try {
      const r = await apiFetch("/api/ai/admin-review", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ caseId }),
      });
      setData(r);
      setOpen(true);
    } catch (e) {
      setErr(e.message);
      setOpen(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="inline-block">
      <button className="px-3 py-2 rounded-xl border" onClick={run} disabled={loading}>
        {loading ? "..." : "🤖 AI review"}
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="relative w-full max-w-lg rounded-3xl bg-white p-5 shadow-xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-lg font-semibold">Assistant Admin</div>
                <div className="text-xs text-slate-500">Crédibilité • risques • recommandation</div>
              </div>
              <button className="rounded-xl border px-3 py-2 text-sm" onClick={() => setOpen(false)}>Fermer</button>
            </div>

            {err ? <div className="mt-3 text-sm text-red-600">{err}</div> : null}
            {data ? (
              <div className="mt-4 space-y-3">
                <div className="rounded-2xl border p-3">
                  <div className="text-sm text-slate-500">Score de crédibilité</div>
                  <div className="text-2xl font-bold">{data.credibility}</div>
                  <div className="text-sm mt-2"><span className="font-semibold">Recommandation:</span> {data.recommendation}</div>
                </div>

                <div className="rounded-2xl border p-3">
                  <div className="font-semibold">Raisons</div>
                  <ul className="mt-2 list-disc pl-5 text-sm">
                    {(data.reasons || []).map((x) => <li key={x}>{x}</li>)}
                  </ul>
                </div>

                <div className="rounded-2xl border p-3">
                  <div className="font-semibold">Risques</div>
                  <ul className="mt-2 list-disc pl-5 text-sm">
                    {(data.risks || []).map((x) => <li key={x}>{x}</li>)}
                  </ul>
                </div>

                {data.nextSteps?.length ? (
                  <div className="rounded-2xl border p-3">
                    <div className="font-semibold">À demander (si besoin)</div>
                    <ul className="mt-2 list-disc pl-5 text-sm">
                      {data.nextSteps.map((x) => <li key={x}>{x}</li>)}
                    </ul>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
