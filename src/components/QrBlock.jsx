import QRCode from "react-qr-code";
import { t } from "../i18n/i18n.js";
import cha9a9aQr from "../assets/cha9a9a-qr.png";

export default function QrBlock({ donateUrl, shareUrl }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="card p-4">
        <div className="font-semibold mb-2">{t("scanToSupport")}</div>
        <div className="bg-white p-3 inline-block rounded-xl border">
          <img src={cha9a9aQr} alt="QR Cha9a9a" className="w-44 h-44 object-contain" />
        </div>
        <div className="text-xs opacity-70 mt-2">
          {t("cha9a9aQrHint")}{" "}
          <a className="underline" href={donateUrl} target="_blank" rel="noreferrer">{t("openLink")}</a>
        </div>
      </div>

      <div className="card p-4">
        <div className="font-semibold mb-2">{t("scanToShare")}</div>
        <div className="bg-white p-3 inline-block rounded-xl border">
          <QRCode value={shareUrl} />
        </div>
        <div className="text-xs opacity-70 mt-2">{t("shareQrHint")}</div>
      </div>
    </div>
  );
}
