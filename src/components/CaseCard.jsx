import { Link } from "react-router-dom";
import ProgressBar from "./ProgressBar.jsx";
import StatusPill from "./StatusPill.jsx";
import { t } from "../i18n/i18n.js";

const FALLBACK = "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1200&q=60";

export default function CaseCard({ item }) {
  const urgent = item.urgency !== "NORMAL";
  const cover = item.photos?.[0] || FALLBACK;
  const verified = item.status === "APPROVED";

  return (
    <article className="card overflow-hidden" aria-label={item.title}>
      <img src={cover} alt="" className="h-40 w-full object-cover" />

      <div className="p-4 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold">{item.title}</h3>
          {urgent && <span className="text-xs px-2 py-1 rounded-full border" aria-label="Urgent">URGENT</span>}
        </div>

        <p className="text-sm opacity-80 line-clamp-3">{item.summary || item.description}</p>

        <div className="flex flex-wrap gap-2 text-xs">
          <span className="px-2 py-1 rounded-full border">{item.category}</span>
          <StatusPill status={item.status} />
          {verified && <span className="px-2 py-1 rounded-full border">{t("verified")}</span>}
        </div>

        <ProgressBar raised={item.raisedAmount || 0} goal={item.goalAmount || 0} />

        <div className="mt-1 flex items-center justify-between gap-3">
          <Link to={`/cases/${item.id}`} className="underline text-sm">Détails</Link>
          <a
            href={item.cha9a9aUrl}
            target="_blank"
            rel="noreferrer"
            className="px-3 py-2 rounded-xl border text-sm font-semibold"
          >
            {t("supportNow")}
          </a>
        </div>
      </div>
    </article>
  );
}
