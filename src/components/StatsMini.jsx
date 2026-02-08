import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";
import { t } from "../i18n/i18n.js";

export default function StatsMini({ stats }) {
  const data = [
    { name: "Approved", value: stats?.approved ?? 0 },
    { name: "Pending", value: stats?.pending ?? 0 },
    { name: "Rejected", value: stats?.rejected ?? 0 }
  ];

  return (
    <div className="card p-4 h-56" aria-label="Stats">
      <div className="font-semibold mb-2">{t("statsTitle")}</div>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis dataKey="name" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="value" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
