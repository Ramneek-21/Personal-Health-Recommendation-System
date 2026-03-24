import { useEffect, useMemo, useState } from "react";

import { dashboardApi, logsApi } from "../api/client";
import MetricCard from "../components/MetricCard";
import TrendChart from "../components/TrendChart";
import { useAuth } from "../context/AuthContext";

function formatValue(value, suffix = "") {
  return value === null || value === undefined ? "--" : `${value}${suffix}`;
}

function MobileLogCard({ log }) {
  return (
    <article className="rounded-3xl border border-ink/10 bg-white/70 p-4 shadow-soft">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-ink/50">Log entry</p>
          <h3 className="mt-2 font-display text-2xl text-ink">{log.logged_at}</h3>
        </div>
        <div className="rounded-full bg-pine/10 px-3 py-1 text-xs font-medium text-pine">
          {formatValue(log.activity_minutes, "m")} activity
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        {[
          ["Weight", formatValue(log.weight_kg, " kg")],
          ["Sleep", formatValue(log.sleep_hours, " h")],
          ["Water", formatValue(log.water_intake_liters, " L")],
          ["Stress", formatValue(log.stress_level, "/10")],
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl bg-paper/80 px-3 py-3">
            <p className="text-xs uppercase tracking-[0.18em] text-ink/45">{label}</p>
            <p className="mt-2 text-sm font-medium text-ink">{value}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-2xl border border-ink/10 bg-white/80 px-4 py-3">
        <p className="text-xs uppercase tracking-[0.18em] text-ink/45">Notes</p>
        <p className="mt-2 break-words text-sm text-ink/70">{log.notes || "No notes recorded."}</p>
      </div>
    </article>
  );
}

export default function ProgressPage() {
  const { token } = useAuth();
  const [logs, setLogs] = useState([]);
  const [weekly, setWeekly] = useState(null);
  const [trends, setTrends] = useState({ weight: [], sleep: [], activity: [] });
  const [error, setError] = useState("");

  const chartData = useMemo(
    () => ({
      weight: trends.weight.map((point) => ({ ...point, date: point.date.slice(5) })),
      sleep: trends.sleep.map((point) => ({ ...point, date: point.date.slice(5) })),
      activity: trends.activity.map((point) => ({ ...point, date: point.date.slice(5) })),
    }),
    [trends]
  );
  const latestLogDate = useMemo(
    () =>
      logs.reduce(
        (latest, log) => (latest && latest > log.logged_at ? latest : log.logged_at),
        ""
      ) || "--",
    [logs]
  );

  useEffect(() => {
    async function loadProgress() {
      try {
        const [logsResponse, weeklyResponse, trendsResponse] = await Promise.all([
          logsApi.list(token),
          logsApi.weekly(token),
          dashboardApi.trends(token),
        ]);
        setLogs(logsResponse);
        setWeekly(weeklyResponse);
        setTrends(trendsResponse);
      } catch (requestError) {
        setError(requestError.message);
      }
    }
    loadProgress();
  }, [token]);

  return (
    <div className="min-w-0 space-y-6">
      <section className="panel overflow-hidden px-6 py-8 lg:px-8">
        <p className="text-sm uppercase tracking-[0.25em] text-pine">Progress tracking</p>
        <h1 className="mt-3 font-display text-4xl text-ink">See what your week is actually doing.</h1>
        <p className="mt-4 max-w-2xl text-base text-ink/70">
          Weekly insight cards summarize the logs, while the timeline table helps spot where adherence
          is breaking down.
        </p>
        {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}
      </section>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
        <MetricCard label="Avg sleep" value={`${weekly?.avg_sleep_hours || 0}h`} hint="From recent logs" />
        <MetricCard label="Avg water" value={`${weekly?.avg_water_intake_liters || 0}L`} hint="Hydration consistency" />
        <MetricCard label="Avg activity" value={`${weekly?.avg_activity_minutes || 0}m`} hint="Movement volume" />
        <MetricCard label="Weight change" value={`${weekly?.weight_change_kg || 0}kg`} hint="Recent trend" />
        <MetricCard label="Avg stress" value={`${weekly?.avg_stress_level || 0}/10`} hint="Recovery load" />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <TrendChart title="Weight history" data={chartData.weight} color="#1e6b58" />
        <TrendChart title="Sleep history" data={chartData.sleep} color="#5f8ebf" />
      </div>

      <TrendChart title="Activity history" data={chartData.activity} color="#e27d47" mode="bar" />

      <section className="panel relative z-10 p-6 lg:p-7">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-start">
          <div>
            <p className="text-sm text-ink/60">Trend interpretation</p>
            <h2 className="font-display text-3xl text-ink">Read the week without guessing.</h2>
            <p className="mt-4 max-w-xl text-sm text-ink/70">
              Use your log count and most recent entry date to judge whether the charts reflect a real pattern
              or just a thin sample week.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl bg-pine/10 p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-pine">Entries logged</p>
              <p className="mt-3 font-display text-4xl text-ink">{logs.length}</p>
              <p className="mt-2 text-sm text-ink/60">Recent check-ins captured in your timeline.</p>
            </div>
            <div className="rounded-3xl bg-sky/10 p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-sky">Latest entry</p>
              <p className="mt-3 font-display text-2xl text-ink">{latestLogDate}</p>
              <p className="mt-2 text-sm text-ink/60">Most recent logged recovery snapshot.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="panel p-6">
        <div className="mb-4">
          <p className="text-sm text-ink/60">Recent entries</p>
          <h2 className="font-display text-3xl text-ink">Daily log history</h2>
        </div>
        {logs.length ? (
          <>
            <div className="space-y-4 md:hidden">
              {logs.map((log) => (
                <MobileLogCard key={log.id} log={log} />
              ))}
            </div>

            <div className="hidden overflow-x-auto md:block">
              <table className="min-w-[760px] w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-ink/10 text-ink/60">
                    <th className="pb-3 pr-4">Date</th>
                    <th className="pb-3 pr-4">Weight</th>
                    <th className="pb-3 pr-4">Sleep</th>
                    <th className="pb-3 pr-4">Water</th>
                    <th className="pb-3 pr-4">Activity</th>
                    <th className="pb-3 pr-4">Stress</th>
                    <th className="pb-3">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id} className="border-b border-ink/5 align-top">
                      <td className="py-3 pr-4">{log.logged_at}</td>
                      <td className="py-3 pr-4">{log.weight_kg ?? "--"}</td>
                      <td className="py-3 pr-4">{log.sleep_hours ?? "--"}</td>
                      <td className="py-3 pr-4">{log.water_intake_liters ?? "--"}</td>
                      <td className="py-3 pr-4">{log.activity_minutes ?? "--"}</td>
                      <td className="py-3 pr-4">{log.stress_level ?? "--"}</td>
                      <td className="py-3 break-words text-ink/70">{log.notes || "--"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="rounded-3xl border border-dashed border-ink/15 bg-white/60 px-5 py-8 text-center">
            <p className="font-display text-2xl text-ink">No logs yet</p>
            <p className="mt-2 text-sm text-ink/60">
              Add a daily check-in from the dashboard and this history view will fill in automatically.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
