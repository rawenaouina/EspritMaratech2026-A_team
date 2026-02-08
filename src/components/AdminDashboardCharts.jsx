import { useEffect, useState } from "react";
import { apiFetch } from "../lib/apiClient";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

export default function AdminDashboardCharts({ token }) {
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    apiFetch("/api/admin/metrics", {
      headers: { Authorization: `Bearer ${token}` }
    }).then(setData).catch(e => setErr(e.message));
  }, [token]);

  if (err) return <div className="text-red-600">{err}</div>;
  if (!data) return <div>Loading...</div>;

  const status = [
    { name: "Approved", value: data.status.approved },
    { name: "Pending", value: data.status.pending },
    { name: "Rejected", value: data.status.rejected }
  ];

  const cats = Object.entries(data.byCategory).map(([k, v]) => ({ name: k, value: v }));
  const urg = Object.entries(data.byUrgency).map(([k, v]) => ({ name: k, value: v }));

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="rounded-2xl border bg-white p-4">
        <div className="font-semibold">Statuts</div>
        <div className="mt-3 h-64">
          <ResponsiveContainer>
            <BarChart data={status}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-2xl border bg-white p-4">
        <div className="font-semibold">Urgence</div>
        <div className="mt-3 h-64">
          <ResponsiveContainer>
            <BarChart data={urg}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-2xl border bg-white p-4">
        <div className="font-semibold">Catégories</div>
        <div className="mt-3 h-64">
          <ResponsiveContainer>
            <PieChart>
              <Pie data={cats} dataKey="value" nameKey="name" outerRadius={90} />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-2xl border bg-white p-4">
        <div className="font-semibold">Top vues</div>
        <div className="mt-3 space-y-2">
          {data.topViewed.map((x) => (
            <div key={x.id} className="flex items-center justify-between rounded-xl border px-3 py-2">
              <span className="text-sm">{x.title}</span>
              <span className="text-sm text-slate-500">{x.views}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
