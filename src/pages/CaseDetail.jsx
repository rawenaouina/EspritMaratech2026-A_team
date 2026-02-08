import { useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { apiGet, apiPost } from "../api/client";
import QrBlock from "../components/QrBlock.jsx";
import ProgressBar from "../components/ProgressBar.jsx";
import StatusPill from "../components/StatusPill.jsx";
import ShareBlock from "../components/ShareBlock.jsx";
import { t } from "../i18n/i18n.js";

import "../utils/leafletIcon.js";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

import { getSimilarCases, getNearbyUrgent } from "../utils/reco.js";

const FALLBACK =
  "https://images.unsplash.com/photo-1520975958225-7b07b4a3f1d1?auto=format&fit=crop&w=1200&q=60";

function MiniCaseCard({ item }) {
  const cover = item.photos?.[0] || FALLBACK;
  return (
    <div className="card p-3 flex gap-3 items-start hover:opacity-95 transition">
      <img
        src={cover}
        alt=""
        className="w-20 h-20 rounded-xl object-cover border dark:border-slate-800"
      />
      <div className="min-w-0">
        <div className="font-semibold line-clamp-2">{item.title}</div>
        <div className="text-xs opacity-70 mt-1">
          {item.category} • {item.urgency}
        </div>
        <div className="mt-2">
          <StatusPill status={item.status} />
        </div>
      </div>
    </div>
  );
}

export default function CaseDetail() {
  const { id } = useParams();

  // 1) Cas détail
  const { data: item, isLoading, error } = useQuery({
    queryKey: ["case", id],
    queryFn: () => apiGet(`/api/cases/${id}`),
  });

  // 2) Tous les cas (pour recommandations) — tu peux filtrer côté API si besoin
  const { data: all } = useQuery({
    queryKey: ["casesForReco"],
    queryFn: () => apiGet(`/api/cases?limit=200`),
  });

  useEffect(() => {
    apiPost(`/api/cases/${id}/view`, {}).catch(() => {});
  }, [id]);

  if (isLoading) return <div className="p-6">{t("loading")}</div>;
  if (error) return <div className="p-6">Erreur: {String(error.message || error)}</div>;
  if (!item) return <div className="p-6">Not found</div>;

  const shareUrl = window.location.href;
  const cover = item.photos?.[0] || FALLBACK;
  const hasMap = item.lat != null && item.lng != null;

  const allCases = all?.items || all || []; // selon ton API (parfois {items:[]}, parfois [])
  const recos = useMemo(() => {
    const approved = allCases.filter((x) => x?.status !== "REJECTED");
    return {
      similar: getSimilarCases(item, approved, 3),
      nearbyUrgent: getNearbyUrgent(item, approved, 3),
    };
  }, [allCases, item]);

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      {/* HEADER */}
      <div className="card overflow-hidden">
        <img src={cover} alt="" className="h-64 w-full object-cover" />
        <div className="p-6 space-y-3">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-3xl font-bold">{item.title}</h1>

              <div className="mt-2 flex gap-2 flex-wrap items-center">
                <span className="px-3 py-1 rounded-full border text-sm">
                  {item.category}
                </span>

                {item.urgency !== "NORMAL" ? (
                  <span className="px-3 py-1 rounded-full border text-sm font-semibold">
                    {item.urgency === "TRES_URGENT" ? "TRÈS URGENT" : "URGENT"}
                  </span>
                ) : null}

                <StatusPill status={item.status} />

                {item.status === "APPROVED" ? (
                  <span className="px-3 py-1 rounded-full border text-sm">
                    {t("verified")}
                  </span>
                ) : null}

                <span className="px-3 py-1 rounded-full border text-sm">
                  {t("views")}: {item.views ?? 0}
                </span>
              </div>
            </div>

            <a
              href={item.cha9a9aUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-2xl px-5 py-3 border font-semibold"
            >
              {t("supportNow")}
            </a>
          </div>

          <p className="text-lg leading-relaxed opacity-90">{item.description}</p>

          <ProgressBar
            raised={item.raisedAmount || item.totalAmount || 0}
            goal={item.goalAmount || 0}
          />
        </div>
      </div>

      {/* PHOTOS */}
      {item.photos?.length ? (
        <div className="grid md:grid-cols-3 gap-3">
          {item.photos.map((url) => (
            <img
              key={url}
              src={url}
              alt=""
              className="rounded-2xl w-full h-48 object-cover border dark:border-slate-800"
            />
          ))}
        </div>
      ) : null}

      {/* MAP */}
      {hasMap ? (
        <div className="card p-4">
          <div className="font-semibold mb-2">{t("map")}</div>
          <div className="rounded-2xl overflow-hidden border dark:border-slate-800">
            <MapContainer
              center={[item.lat, item.lng]}
              zoom={12}
              style={{ height: 320, width: "100%" }}
            >
              <TileLayer
                attribution="&copy; OpenStreetMap"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={[item.lat, item.lng]}>
                <Popup>{item.locationText || item.title}</Popup>
              </Marker>
            </MapContainer>
          </div>
          {item.locationText ? (
            <div className="text-sm opacity-70 mt-2">{item.locationText}</div>
          ) : null}
        </div>
      ) : null}

      {/* PARTAGE SOCIAL + QR PARTAGE + CARTE */}
      <ShareBlock item={item} />

      {/* QR DON + QR PARTAGE (TON COMPOSANT EXISTANT) */}
      <QrBlock donateUrl={item.cha9a9aUrl} shareUrl={shareUrl} />

      {/* RECOMMANDATIONS */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="card p-5">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="font-semibold">✨ Cas similaires</div>
            <Link className="text-sm underline opacity-80" to="/cases">
              Tout voir
            </Link>
          </div>

          <div className="grid gap-3">
            {recos.similar.map((c) => (
              <Link key={c.id} to={`/cases/${c.id}`}>
                <MiniCaseCard item={c} />
              </Link>
            ))}
            {!recos.similar.length ? (
              <div className="text-sm opacity-70">Aucun cas similaire.</div>
            ) : null}
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="font-semibold">📍 Urgents près de chez vous</div>
            <Link className="text-sm underline opacity-80" to="/cases?urgent=1">
              Filtrer urgents
            </Link>
          </div>

          <div className="grid gap-3">
            {recos.nearbyUrgent.map((c) => (
              <Link key={c.id} to={`/cases/${c.id}`}>
                <MiniCaseCard item={c} />
              </Link>
            ))}
            {!recos.nearbyUrgent.length ? (
              <div className="text-sm opacity-70">
                Aucun urgent proche (ou localisation manquante).
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
