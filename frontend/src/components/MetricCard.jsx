export default function MetricCard({ label, value, hint }) {
  return (
    <div className="panel-muted p-5">
      <p className="text-sm text-ink/60">{label}</p>
      <p className="mt-3 font-display text-4xl text-ink">{value}</p>
      <p className="mt-2 text-sm text-ink/60">{hint}</p>
    </div>
  );
}

