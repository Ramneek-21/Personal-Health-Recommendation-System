export default function RecommendationSection({ title, subtitle, items, accent }) {
  return (
    <div className="panel p-5">
      <div className="mb-4">
        <p className="text-sm text-ink/60">{subtitle}</p>
        <h3 className="font-display text-2xl text-ink">{title}</h3>
      </div>
      <div className="space-y-3">
        {items?.map((item) => (
          <div key={item} className={`rounded-2xl border px-4 py-4 text-sm ${accent}`}>
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

