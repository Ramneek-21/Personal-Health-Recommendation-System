const riskTone = {
  low: "text-pine",
  moderate: "text-ember",
  high: "text-red-600",
};

export default function HealthScoreGauge({ score = 0, riskLevel = "moderate" }) {
  const safeScore = Math.max(0, Math.min(100, score));
  const chartStyle = {
    background: `conic-gradient(#1e6b58 ${safeScore * 3.6}deg, rgba(17, 33, 58, 0.08) 0deg)`,
  };

  return (
    <div className="panel flex flex-col items-center justify-center gap-4 p-6">
      <p className="text-xs uppercase tracking-[0.25em] text-ink/60">Weekly Health Score</p>
      <div className="grid h-44 w-44 place-items-center rounded-full p-4" style={chartStyle}>
        <div className="grid h-full w-full place-items-center rounded-full bg-paper text-center">
          <div>
            <p className="font-display text-5xl text-ink">{safeScore}</p>
            <p className={`text-sm font-semibold uppercase tracking-[0.18em] ${riskTone[riskLevel] || "text-ink"}`}>
              {riskLevel}
            </p>
          </div>
        </div>
      </div>
      <p className="max-w-xs text-center text-sm text-ink/70">
        Generated from BMI, activity, hydration, sleep, stress, and habit consistency.
      </p>
    </div>
  );
}

