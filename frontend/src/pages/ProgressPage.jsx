import { useEffect, useState } from "react";

import { dashboardApi, logsApi } from "../api/client";
import MetricCard from "../components/MetricCard";
import TrendChart from "../components/TrendChart";
import { useAuth } from "../context/AuthContext";

export default function ProgressPage() {
  const { token } = useAuth();
  const [logs, setLogs] = useState([]);
  const [weekly, setWeekly] = useState(null);
  const [trends, setTrends] = useState({ weight: [], sleep: [], activity: [] });
  const [error, setError] = useState("");

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
    <div className="space-y-6">
      <section className="panel px-6 py-8">
        <p className="text-sm uppercase tracking-[0.25em] text-pine">Progress tracking</p>
        <h1 className="mt-3 font-display text-4xl text-ink">See what your week is actually doing.</h1>
        <p className="mt-4 max-w-2xl text-base text-ink/70">
          Weekly insight cards summarize the logs, while the timeline table helps spot where adherence
          is breaking down.
        </p>
        {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <MetricCard label="Avg sleep" value={`${weekly?.avg_sleep_hours || 0}h`} hint="From recent logs" />
        <MetricCard label="Avg water" value={`${weekly?.avg_water_intake_liters || 0}L`} hint="Hydration consistency" />
        <MetricCard label="Avg activity" value={`${weekly?.avg_activity_minutes || 0}m`} hint="Movement volume" />
        <MetricCard label="Weight change" value={`${weekly?.weight_change_kg || 0}kg`} hint="Recent trend" />
        <MetricCard label="Avg stress" value={`${weekly?.avg_stress_level || 0}/10`} hint="Recovery load" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <TrendChart
          title="Weight history"
          data={trends.weight.map((point) => ({ ...point, date: point.date.slice(5) }))}
          color="#1e6b58"
        />
        <TrendChart
          title="Sleep history"
          data={trends.sleep.map((point) => ({ ...point, date: point.date.slice(5) }))}
          color="#5f8ebf"
        />
      </div>

      <section className="panel p-6">
        <div className="mb-4">
          <p className="text-sm text-ink/60">Recent entries</p>
          <h2 className="font-display text-3xl text-ink">Daily log history</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
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
                <tr key={log.id} className="border-b border-ink/5">
                  <td className="py-3 pr-4">{log.logged_at}</td>
                  <td className="py-3 pr-4">{log.weight_kg ?? "--"}</td>
                  <td className="py-3 pr-4">{log.sleep_hours ?? "--"}</td>
                  <td className="py-3 pr-4">{log.water_intake_liters ?? "--"}</td>
                  <td className="py-3 pr-4">{log.activity_minutes ?? "--"}</td>
                  <td className="py-3 pr-4">{log.stress_level ?? "--"}</td>
                  <td className="py-3">{log.notes || "--"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

