import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiGet } from "../api/client";
import Filters from "../components/Filters.jsx";
import CaseCard from "../components/CaseCard.jsx";
import Pagination from "../components/Pagination.jsx";
import { t } from "../i18n/i18n.js";

import { getDemoCases, isDemoMode } from "../state/demo.js";

const CATS = ["Santé", "Handicap", "Enfants", "Éducation", "Rénovation", "Autre"];

function urgencyRank(u) {
  if (u === "TRES_URGENT") return 3;
  if (u === "URGENT") return 2;
  return 1; // NORMAL
}

function matchesQuery(item, q) {
  const s = (q || "").trim().toLowerCase();
  if (!s) return true;
  const hay = `${item.title || ""} ${item.description || ""} ${item.summary || ""} ${item.category || ""}`.toLowerCase();
  return hay.includes(s);
}

function applyDemoFilters(all, filters) {
  let arr = [...all];

  // on n'affiche que les cas APPROVED dans le catalogue donateur
  arr = arr.filter((x) => x.status === "APPROVED");

  if (filters.category) arr = arr.filter((x) => x.category === filters.category);
  if (filters.urgency) arr = arr.filter((x) => x.urgency === filters.urgency);
  if (filters.q) arr = arr.filter((x) => matchesQuery(x, filters.q));

  // tri
  if (filters.sort === "urgency") {
    arr.sort((a, b) => urgencyRank(b.urgency) - urgencyRank(a.urgency));
  } else {
    // date (par défaut) : plus récent d'abord
    arr.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  }

  return arr;
}

async function fetchCasesApi(qs) {
  return apiGet(`/api/cases${qs}`);
}

export default function Cases() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ q: "", category: "", sort: "date", urgency: "" });

  const qs = useMemo(() => {
    const p = new URLSearchParams();
    p.set("page", String(page));
    p.set("limit", "12");
    if (filters.q) p.set("q", filters.q);
    if (filters.category) p.set("category", filters.category);
    if (filters.urgency) p.set("urgency", filters.urgency);
    p.set("sort", filters.sort);
    return `?${p.toString()}`;
  }, [page, filters]);

  const { data, isLoading, error } = useQuery({
    queryKey: ["cases", qs, isDemoMode() ? "demo" : "api"],
    queryFn: async () => {
      if (isDemoMode()) {
        const limit = 12;
        const all = getDemoCases();
        const filtered = applyDemoFilters(all, filters);

        const pages = Math.max(1, Math.ceil(filtered.length / limit));
        const safePage = Math.min(page, pages);
        const start = (safePage - 1) * limit;
        const items = filtered.slice(start, start + limit);

        return {
          items,
          meta: { pages, total: filtered.length }
        };
      }

      return fetchCasesApi(qs);
    }
  });

  const items = data?.items || [];
  const pages = data?.meta?.pages || 1;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-4">
      <div className="flex items-end justify-between gap-3 flex-wrap">
        <h1 className="text-3xl font-bold">{t("allCases")}</h1>

        {isDemoMode() ? (
          <span className="px-3 py-2 rounded-2xl border text-sm font-semibold">
            🎬 Mode Démo ON
          </span>
        ) : null}
      </div>

      <Filters
        value={filters}
        onChange={(v) => {
          setFilters(v);
          setPage(1);
        }}
        categories={CATS}
      />

      {isLoading ? <div>{t("loading")}</div> : null}
      {error ? <div className="card p-4 text-sm">Erreur: {String(error.message || error)}</div> : null}

      {(!isLoading && !items.length) ? (
        <div className="card p-5 text-sm opacity-80">
          Aucun cas trouvé avec ces filtres.
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-4">
          {items.map((item) => <CaseCard key={item.id} item={item} />)}
        </div>
      )}

      <Pagination page={page} pages={pages} setPage={setPage} />
    </div>
  );
}
