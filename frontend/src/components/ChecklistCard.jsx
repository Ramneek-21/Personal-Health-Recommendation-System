export default function ChecklistCard({ items, onToggle }) {
  return (
    <div className="panel p-5">
      <div className="mb-4">
        <p className="text-sm text-ink/60">Daily checklist</p>
        <h3 className="font-display text-2xl text-ink">Lock in the basics</h3>
      </div>
      <div className="space-y-3">
        {items.map((item) => (
          <button
            key={item.habit_key}
            onClick={() => onToggle(item)}
            className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-4 text-left transition ${
              item.completed
                ? "border-pine bg-pine/10 text-pine"
                : "border-ink/10 bg-white text-ink hover:border-pine/50"
            }`}
          >
            <span
              className={`grid h-6 w-6 place-items-center rounded-full border text-sm ${
                item.completed ? "border-pine bg-pine text-white" : "border-ink/20"
              }`}
            >
              {item.completed ? "✓" : ""}
            </span>
            <span className="text-sm font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

