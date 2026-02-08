import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPatch } from "../api/client";
import { getAuth, getToken } from "../state/auth";
import StatusPill from "../components/StatusPill.jsx";
import StatsMini from "../components/StatsMini.jsx";
import AdminAiReview from "../components/AdminAiReview.jsx";
import AdminDashboardCharts from "../components/AdminDashboardCharts.jsx";
import AssocImageTicker from "../components/AssocImageTicker.jsx";
import { t } from "../i18n/i18n.js";
import { toISODate } from "../utils/format.js";

export default function Admin() {
  const auth = getAuth();
  const token = getToken();
  const isAdmin = auth?.user?.role === "ADMIN";
  const qc = useQueryClient();

  const [status, setStatus] = useState("PENDING");
  const qs = useMemo(() => `?status=${encodeURIComponent(status)}`, [status]);

  const casesQ = useQuery({
    queryKey: ["adminCases", qs],
    queryFn: () => apiGet(`/api/admin/cases${qs}`, token || undefined),
    enabled: !!token && isAdmin
  });

  const statsQ = useQuery({
    queryKey: ["adminStats"],
    queryFn: () => apiGet("/api/admin/stats", token || undefined),
    enabled: !!token && isAdmin
  });

  if (!isAdmin) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="card p-6">
          <div className="text-lg font-semibold">{t("adminModeration")}</div>
          <p className="mt-2 text-sm opacity-80">{t("pleaseLoginAsAdmin")}</p>
        </div>
      </div>
    );
  }

  const items = casesQ.data?.items || [];

  async function setCaseStatus(id, next) {
    await apiPatch(`/api/admin/cases/${id}/status`, { status: next }, token || undefined);
    await qc.invalidateQueries({ queryKey: ["adminCases"] });
    await qc.invalidateQueries({ queryKey: ["adminStats"] });
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-4">
      <div className="flex items-end justify-between gap-3 flex-wrap">
        <h1 className="text-3xl font-bold">{t("adminModeration")}</h1>

        <div className="flex items-center gap-3">
          <label className="text-sm font-semibold" htmlFor="status">{t("filterStatus")}</label>
          <select
            id="status"
            className="rounded-xl border dark:border-slate-800 bg-transparent px-3 py-2"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="PENDING">{t("pending")}</option>
            <option value="APPROVED">{t("approved")}</option>
            <option value="REJECTED">{t("rejected")}</option>
          </select>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <StatsMini stats={statsQ.data} />
        <div className="card p-5">
          <div className="font-semibold mb-2">✅ Workflow “Cas vérifié”</div>
          <ol className="list-decimal pl-5 text-sm opacity-90 space-y-1">
            <li>Association soumet un cas → <b>PENDING</b></li>
            <li>Admin valide → <b>APPROVED</b> (badge vérifié côté donateur)</li>
            <li>Admin refuse → <b>REJECTED</b> (non visible dans catalogue)</li>
          </ol>
          <div className="text-xs opacity-70 mt-2">Hackathon: confiance + transparence.</div>
        </div>
      </div>

      {casesQ.isLoading ? <div>{t("loading")}</div> : null}
      {casesQ.error ? <div className="card p-4 text-sm">Erreur: {String(casesQ.error.message || casesQ.error)}</div> : null}

      <div className="card p-5 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left opacity-70">
            <tr>
              <th className="py-2 pr-3">{t("title")}</th>
              <th className="py-2 pr-3">{t("category")}</th>
              <th className="py-2 pr-3">{t("urgency")}</th>
              <th className="py-2 pr-3">{t("status")}</th>
              <th className="py-2 pr-3">{t("date")}</th>
              <th className="py-2 pr-3">{t("actions")}</th>
            </tr>
          </thead>
          <tbody>
            {items.map((x) => (
              <tr key={x.id} className="border-t dark:border-slate-800">
                <td className="py-3 pr-3 font-semibold">{x.title}</td>
                <td className="py-3 pr-3">{x.category}</td>
                <td className="py-3 pr-3">{x.urgency}</td>
                <td className="py-3 pr-3"><StatusPill status={x.status} /></td>
                <td className="py-3 pr-3">{toISODate(x.createdAt)}</td>
                <td className="py-3 pr-3 flex gap-2">
                  <AdminAiReview token={token} caseId={x.id} />
                  <button
                    className="px-3 py-2 rounded-xl border font-semibold"
                    onClick={() => setCaseStatus(x.id, "APPROVED")}
                    disabled={x.status === "APPROVED"}
                  >
                    {t("approveBtn")}
                  </button>
                  <button
                    className="px-3 py-2 rounded-xl border"
                    onClick={() => setCaseStatus(x.id, "REJECTED")}
                    disabled={x.status === "REJECTED"}
                  >
                    {t("rejectBtn")}
                  </button>
                </td>
              </tr>
            ))}
            {!items.length ? (
              <tr>
                <td colSpan="6" className="py-6 text-center opacity-70">Aucun élément.</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
