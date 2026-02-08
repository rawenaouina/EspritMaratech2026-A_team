import { useQuery } from "@tanstack/react-query";
import { apiGet } from "../api/client";
import { getAuth, getToken } from "../state/auth";
import StatusPill from "../components/StatusPill.jsx";
import { t } from "../i18n/i18n.js";
import { toISODate } from "../utils/format.js";
import { Link } from "react-router-dom";

export default function AssociationDashboard() {
  const auth = getAuth();
  const token = getToken();
  const isAssoc = auth?.user?.role === "ASSOCIATION";

  const { data, isLoading, error } = useQuery({
    queryKey: ["assocCases"],
    queryFn: () => apiGet("/api/association/cases", token || undefined),
    enabled: !!token && isAssoc
  });

  if (!isAssoc) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <div className="card p-6">
          <div className="text-lg font-semibold">{t("myCases")}</div>
          <p className="mt-2 text-sm opacity-80">{t("pleaseLoginAsAssoc")}</p>
        </div>
      </div>
    );
  }

  const items = data?.items || [];
  const totalViews = items.reduce((a, x) => a + (x.views || 0), 0);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-4">
      <div className="flex items-end justify-between gap-3 flex-wrap">
        <h1 className="text-3xl font-bold">{t("myCases")}</h1>
        <Link className="px-4 py-3 rounded-2xl border font-semibold" to="/association/new">
          + {t("navAddCase")}
        </Link>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="card p-5">
          <div className="text-sm opacity-70">{t("statsCases")}</div>
          <div className="text-3xl font-bold">{items.length}</div>
        </div>
        <div className="card p-5">
          <div className="text-sm opacity-70">{t("views")}</div>
          <div className="text-3xl font-bold">{totalViews}</div>
        </div>
        <div className="card p-5">
          <div className="text-sm opacity-70">{t("statsVerified")}</div>
          <div className="text-3xl font-bold">{items.filter(x => x.status === "APPROVED").length}</div>
        </div>
      </div>

      {isLoading ? <div>{t("loading")}</div> : null}
      {error ? <div className="card p-4 text-sm">Erreur: {String(error.message || error)}</div> : null}

      <div className="card p-5 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left opacity-70">
            <tr>
              <th className="py-2 pr-3">{t("title")}</th>
              <th className="py-2 pr-3">{t("category")}</th>
              <th className="py-2 pr-3">{t("status")}</th>
              <th className="py-2 pr-3">{t("views")}</th>
              <th className="py-2 pr-3">{t("date")}</th>
              <th className="py-2 pr-3">{t("actions")}</th>
            </tr>
          </thead>
          <tbody>
            {items.map((x) => (
              <tr key={x.id} className="border-t dark:border-slate-800">
                <td className="py-3 pr-3 font-semibold">{x.title}</td>
                <td className="py-3 pr-3">{x.category}</td>
                <td className="py-3 pr-3"><StatusPill status={x.status} /></td>
                <td className="py-3 pr-3">{x.views ?? 0}</td>
                <td className="py-3 pr-3">{toISODate(x.createdAt)}</td>
                <td className="py-3 pr-3">
                  <Link className="underline" to={`/cases/${x.id}`}>Voir</Link>
                </td>
              </tr>
            ))}
            {!items.length ? (
              <tr>
                <td colSpan="6" className="py-6 text-center opacity-70">Aucun cas.</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
