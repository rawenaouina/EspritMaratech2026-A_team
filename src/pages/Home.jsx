import { useQuery } from "@tanstack/react-query";
import { apiGet } from "../api/client";
import CaseCard from "../components/CaseCard.jsx";
import { Link } from "react-router-dom";
import { t } from "../i18n/i18n.js";
import MatchingPanel from "../components/MatchingPanel.jsx";
import DonorChatbot from "../components/DonorChatbot.jsx";

import { getDemoCases, isDemoMode } from "../state/demo.js";

function sortByUrgencyThenDate(items) {
  const rank = (u) => (u === "TRES_URGENT" ? 3 : u === "URGENT" ? 2 : 1);
  return [...items].sort((a, b) => {
    const ru = rank(b.urgency) - rank(a.urgency);
    if (ru !== 0) return ru;
    const da = new Date(a.createdAt || 0).getTime();
    const db = new Date(b.createdAt || 0).getTime();
    return db - da;
  });
}

async function fetchHomeCases() {
  if (isDemoMode()) {
    const all = getDemoCases().filter((x) => x.status !== "REJECTED");
    const sorted = sortByUrgencyThenDate(all).slice(0, 12);
    return {
      items: sorted,
      meta: { total: all.length }
    };
  }

  return apiGet("/api/cases?sort=urgency&limit=12&page=1");
}

export default function Home() {
  const { data, isLoading } = useQuery({
    queryKey: ["homeCases", isDemoMode() ? "demo" : "api"],
    queryFn: fetchHomeCases
  });

  const items = data?.items || [];
  const urgences = items
    .filter((x) => x.urgency !== "NORMAL" && x.status === "APPROVED")
    .slice(0, 3);

  const featured = items.filter((x) => x.status === "APPROVED").slice(0, 6);

  const stats = {
    total: data?.meta?.total ?? items.length,
    urgent: items.filter((x) => x.urgency !== "NORMAL").length,
    verified: items.filter((x) => x.status === "APPROVED").length
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* HERO */}
      <section className="rounded-3xl border dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-950">
        <div className="p-6 md:p-10 grid md:grid-cols-2 gap-6 items-center">
          <div>
            <h1 className="text-4xl font-bold leading-tight">{t("homeTitle")}</h1>
            <p className="mt-3 text-lg opacity-80">{t("homeSubtitle")}</p>

            <div className="mt-5 flex gap-3 flex-wrap">
              <Link to="/cases" className="px-5 py-3 rounded-2xl border font-semibold">
                {t("viewCases")}
              </Link>
              <Link to="/about" className="px-5 py-3 rounded-2xl border">
                {t("navAbout")}
              </Link>

              {isDemoMode() ? (
                <span className="px-3 py-2 rounded-2xl border text-sm font-semibold">
                  🎬 Mode Démo ON
                </span>
              ) : null}
            </div>

            {isDemoMode() ? (
              <div className="mt-3 text-sm opacity-70">
                Données simulées activées (stable pour présentation jury).
              </div>
            ) : null}
          </div>

          <img
            className="rounded-3xl border dark:border-slate-800 object-cover w-full h-64"
            src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1600&q=60"
            alt=""
          />
        </div>
      </section>

      {/* STATS */}
      <section className="grid md:grid-cols-3 gap-4">
        <div className="card p-5">
          <div className="text-sm opacity-70">{t("statsCases")}</div>
          <div className="text-3xl font-bold">{stats.total}</div>
        </div>
        <div className="card p-5">
          <div className="text-sm opacity-70">{t("statsUrgent")}</div>
          <div className="text-3xl font-bold">{stats.urgent}</div>
        </div>
        <div className="card p-5">
          <div className="text-sm opacity-70">{t("statsVerified")}</div>
          <div className="text-3xl font-bold">{stats.verified}</div>
        </div>
      </section>

      {/* URGENCES */}
      <section className="space-y-3">
        <div className="flex items-end justify-between gap-3">
          <h2 className="text-2xl font-bold">{t("dailyUrgencies")}</h2>
          <Link to="/cases" className="underline text-sm">{t("seeAll")}</Link>
        </div>

        {isLoading ? (
          <div>{t("loading")}</div>
        ) : urgences.length ? (
          <div className="grid md:grid-cols-3 gap-4">
            {urgences.map((item) => (
              <CaseCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="card p-4 text-sm opacity-80">
            Aucune urgence approuvée pour l’instant.
          </div>
        )}
      </section>

      {/* FEATURED */}
      <section className="space-y-3">
        <h2 className="text-2xl font-bold">{t("featuredCases")}</h2>
        {isLoading ? (
          <div>{t("loading")}</div>
        ) : (
          <div className="grid md:grid-cols-3 gap-4">
            {featured.map((item) => (
              <CaseCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
