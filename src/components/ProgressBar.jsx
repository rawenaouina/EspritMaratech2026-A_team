export default function ProgressBar({ raised = 0, goal = 0 }) {
  if (!goal || goal <= 0) return null;
  const pct = Math.min(100, Math.round((raised / goal) * 100));
  return (
    <div className="space-y-1" aria-label="Progression">
      <div className="flex justify-between text-xs opacity-80">
        <span>{raised} TND</span><span>{goal} TND</span>
      </div>
      <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
        <div className="h-2 bg-slate-900 dark:bg-white" style={{ width: `${pct}%` }} />
      </div>
      <div className="text-xs opacity-70">{pct}%</div>
    </div>
  );
}
