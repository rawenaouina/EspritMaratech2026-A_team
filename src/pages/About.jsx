import { t } from "../i18n/i18n.js";
import logo from "../assets/universelle-logo.png";
import OrgCarousel from "../components/OrgCarousel.jsx";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { defaultIcon } from "../utils/leafletIcon.js";

export default function About() {
  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div className="card p-6 flex items-start gap-4">
        <img src={logo} alt="Universelle Ariana" className="h-16 w-16 rounded-2xl border dark:border-slate-800 object-cover" />
        <div>
          <h1 className="text-3xl font-bold">{t("aboutTitle")}</h1>
          <p className="mt-2 text-sm opacity-80">{t("aboutText")}</p>
          <div className="mt-3 flex gap-3 flex-wrap">
            <a className="px-4 py-3 rounded-2xl border font-semibold" href="https://universellecellule.wixsite.com/website-2/" target="_blank" rel="noreferrer">
              {t("assocOfficialSite")}
            </a>
            <a className="px-4 py-3 rounded-2xl border"href="https://facebook.com/UniverselleAriana" target="_blank" rel="noreferrer">
              Facebook
            </a>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="card p-5">
          <div className="font-semibold">🎯 Mission</div>
          <p className="text-sm opacity-80 mt-2">
            Mettre en avant des cas vérifiés, protéger la dignité des bénéficiaires, et simplifier le don (Cha9a9a).
          </p>
        </div>
        <div className="card p-5">
          <div className="font-semibold">🛡️ Éthique</div>
          <p className="text-sm opacity-80 mt-2">
            Détection d'infos sensibles + workflow de validation → confiance des donateurs.
          </p>
        </div>
        <div className="card p-5">
          <div className="font-semibold">♿ Accessibilité</div>
          <p className="text-sm opacity-80 mt-2">
            Mode A11y, contraste/luminosité, navigation clavier. Conforme esprit WCAG.
          </p>
        </div>
      </div>


      <div className="card p-6">
        <div className="font-semibold mb-2">🗺️ Localisation – Universelle Ariana</div>
        <div className="text-sm opacity-80 mb-3">Ariana, Tunisie (repère approximatif pour aider les donateurs).</div>
        <div className="h-72 overflow-hidden rounded-2xl border dark:border-slate-800">
          <MapContainer center={[36.8665, 10.1647]} zoom={12} style={{ height: "100%", width: "100%" }}>
            <TileLayer
              attribution='&copy; OpenStreetMap contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={[36.8665, 10.1647]} icon={defaultIcon}>
              <Popup>
                Universelle Ariana<br />Ariana, Tunisie
              </Popup>
            </Marker>
          </MapContainer>
        </div>
      </div>

      <div className="card p-6">
        <div className="font-semibold mb-2">📸 Galerie Universelle Ariana</div>
        <OrgCarousel height={220} speed={30} />
        <div className="text-xs opacity-70 mt-2">
          {t("associationGalleryHint")} (tu peux remplacer les images dans <b>/public/org</b> par vos vraies photos)
        </div>
      </div>
    </div>
  );
}
