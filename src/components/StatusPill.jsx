import { t } from "../i18n/i18n.js";

export default function StatusPill({ status }) {
  const map = {
    PENDING: t("pending"),
    APPROVED: t("approved"),
    REJECTED: t("rejected")
  };
  return <span className="px-3 py-1 rounded-full border text-xs">{map[status] || status}</span>;
}
