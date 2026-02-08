import { t } from "../i18n/i18n.js";

export default function Filters({ value, onChange, categories }) {
  return (
    <div className="card p-4 grid gap-3 md:grid-cols-4" aria-label="Filtres">
      <label className="sr-only" htmlFor="search">{t("searchPlaceholder")}</label>
      <input
        id="search"
        className="rounded-xl border dark:border-slate-800 bg-transparent px-3 py-2"
        placeholder={t("searchPlaceholder")}
        value={value.q}
        onChange={(e) => onChange({ ...value, q: e.target.value })}
      />

      <label className="sr-only" htmlFor="category">{t("category")}</label>
      <select
        id="category"
        className="rounded-xl border dark:border-slate-800 bg-transparent px-3 py-2"
        value={value.category}
        onChange={(e) => onChange({ ...value, category: e.target.value })}
      >
        <option value="">{t("allCategories")}</option>
        {categories.map((c) => <option key={c} value={c}>{c}</option>)}
      </select>

      <label className="sr-only" htmlFor="sort">{t("sortRecent")}</label>
      <select
        id="sort"
        className="rounded-xl border dark:border-slate-800 bg-transparent px-3 py-2"
        value={value.sort}
        onChange={(e) => onChange({ ...value, sort: e.target.value })}
      >
        <option value="date">{t("sortRecent")}</option>
        <option value="urgency">{t("sortUrgency")}</option>
      </select>

      <label className="sr-only" htmlFor="urgency">{t("urgency")}</label>
      <select
        id="urgency"
        className="rounded-xl border dark:border-slate-800 bg-transparent px-3 py-2"
        value={value.urgency}
        onChange={(e) => onChange({ ...value, urgency: e.target.value })}
      >
        <option value="">{t("urgencyAll")}</option>
        <option value="NORMAL">{t("normal")}</option>
        <option value="URGENT">{t("urgent")}</option>
        <option value="TRES_URGENT">{t("veryUrgent")}</option>
      </select>
    </div>
  );
}
