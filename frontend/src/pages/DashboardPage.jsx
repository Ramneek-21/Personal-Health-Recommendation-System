import { useEffect, useMemo, useState } from "react";

import {
  dashboardApi,
  habitsApi,
  profileApi,
  recommendationsApi,
  logsApi,
} from "../api/client";
import ChecklistCard from "../components/ChecklistCard";
import DailyLogForm from "../components/DailyLogForm";
import HealthProfileForm from "../components/HealthProfileForm";
import HealthScoreGauge from "../components/HealthScoreGauge";
import MetricCard from "../components/MetricCard";
import RecommendationSection from "../components/RecommendationSection";
import TrendChart from "../components/TrendChart";
import { useAuth } from "../context/AuthContext";

export default function DashboardPage() {
  const { token } = useAuth();
  const [profile, setProfile] = useState(null);
  const [summary, setSummary] = useState(null);
  const [trends, setTrends] = useState({ weight: [], sleep: [], activity: [] });
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingLog, setSavingLog] = useState(false);
  const [error, setError] = useState("");
  const [profileErrors, setProfileErrors] = useState({});
  const [logErrors, setLogErrors] = useState({});

  const chartData = useMemo(
    () => ({
      weight: trends.weight.map((point) => ({ ...point, date: point.date.slice(5) })),
      sleep: trends.sleep.map((point) => ({ ...point, date: point.date.slice(5) })),
      activity: trends.activity.map((point) => ({ ...point, date: point.date.slice(5) })),
    }),
    [trends]
  );

  const loadDashboard = async () => {
    setLoading(true);
    setError("");
    try {
      const [summaryResponse, trendsResponse] = await Promise.all([
        dashboardApi.summary(token),
        dashboardApi.trends(token),
      ]);
      setSummary(summaryResponse);
      setTrends(trendsResponse);
      try {
        const profileResponse = await profileApi.get(token);
        setProfile({
          ...profileResponse,
          medical_conditions: profileResponse.medical_conditions.join(", "),
        });
      } catch (profileError) {
        if (profileError.status === 404) {
          setProfile(null);
        } else {
          throw profileError;
        }
      }
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, [token]);

  const handleProfileSubmit = async (payload) => {
    setSavingProfile(true);
    setError("");
    setProfileErrors({});
    try {
      await profileApi.upsert(token, payload);
      await recommendationsApi.generate(token);
      await loadDashboard();
    } catch (requestError) {
      setProfileErrors(requestError.fieldErrors || {});
      setError(Object.keys(requestError.fieldErrors || {}).length ? "" : requestError.message);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleDailyLogSubmit = async (payload) => {
    setSavingLog(true);
    setError("");
    setLogErrors({});
    try {
      await logsApi.create(token, payload);
      await recommendationsApi.generate(token);
      await loadDashboard();
    } catch (requestError) {
      setLogErrors(requestError.fieldErrors || {});
      setError(Object.keys(requestError.fieldErrors || {}).length ? "" : requestError.message);
    } finally {
      setSavingLog(false);
    }
  };

  const handleToggleHabit = async (item) => {
    try {
      await habitsApi.check(token, {
        habit_key: item.habit_key,
        label: item.label,
        completed: !item.completed,
        date: new Date().toISOString().slice(0, 10),
      });
      await recommendationsApi.generate(token);
      await loadDashboard();
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  if (loading) {
    return (
      <div className="panel flex min-h-[60vh] items-center justify-center p-10">
        <p className="font-display text-3xl text-ink">Loading your health cockpit...</p>
      </div>
    );
  }

  const recommendation = summary?.latest_recommendation;

  return (
    <div className="min-w-0 space-y-6">
      <section className="panel overflow-hidden px-6 py-8 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-pine">Command center</p>
            <h1 className="mt-3 font-display text-4xl text-ink lg:text-5xl">
              Turn your daily inputs into a healthier weekly system.
            </h1>
            <p className="mt-4 max-w-2xl text-base text-ink/70">
              The recommendation engine recalculates from profile data, recent logs, and checklist
              consistency so you always see the next best move instead of raw numbers alone.
            </p>
            {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <MetricCard
              label="BMI"
              value={summary?.bmi ? summary.bmi.toFixed(1) : "--"}
              hint="Auto-computed from your stored profile."
            />
            <MetricCard
              label="Streak"
              value={`${summary?.streak_days || 0}d`}
              hint="Consecutive days with completed habits."
            />
            <MetricCard
              label="Avg sleep"
              value={`${summary?.weekly_insights.avg_sleep_hours || 0}h`}
              hint="Last 7 logged days."
            />
            <MetricCard
              label="Unread alerts"
              value={summary?.notifications?.filter((item) => !item.is_read).length || 0}
              hint="Reminders and health alerts waiting."
            />
          </div>
        </div>
      </section>

      {!profile ? (
        <HealthProfileForm
          fieldErrors={profileErrors}
          onSubmit={handleProfileSubmit}
          loading={savingProfile}
          onInteract={() => setProfileErrors({})}
        />
      ) : (
        <>
          <div className="grid gap-6 xl:grid-cols-[0.7fr_1.3fr]">
            <HealthScoreGauge score={recommendation?.health_score || 0} riskLevel={recommendation?.risk_level} />

            <div className="panel p-6">
              <p className="text-sm text-ink/60">AI summary</p>
              <h2 className="font-display text-3xl text-ink">This week’s recommendation pulse</h2>
              <p className="mt-4 text-base text-ink/75">
                {recommendation?.summary ||
                  "Save your health profile to generate a personalized recommendation plan."}
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                {(recommendation?.risk_warnings || []).map((warning) => (
                  <div key={warning} className="rounded-2xl border border-ember/20 bg-ember/10 px-4 py-3 text-sm text-ink">
                    {warning}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-6 2xl:grid-cols-[1fr_0.95fr]">
            <div className="space-y-6">
              <DailyLogForm
                fieldErrors={logErrors}
                onSubmit={handleDailyLogSubmit}
                loading={savingLog}
                onInteract={() => setLogErrors({})}
              />
              <div className="grid gap-6 lg:grid-cols-2">
                <TrendChart title="Weight Trend" data={chartData.weight} color="#1e6b58" />
                <TrendChart title="Sleep Trend" data={chartData.sleep} color="#5f8ebf" />
              </div>
            </div>

            <div className="space-y-6">
              <ChecklistCard items={summary?.checklist || []} onToggle={handleToggleHabit} />
              <RecommendationSection
                title="Exercise plan"
                subtitle="Training"
                items={recommendation?.exercise_plan || []}
                accent="border-pine/20 bg-pine/5"
              />
            </div>
          </div>

          <TrendChart title="Activity Minutes" data={chartData.activity} color="#e27d47" mode="bar" />

          <div className="grid gap-6 lg:grid-cols-3">
            <RecommendationSection
              title="Nutrition guidance"
              subtitle="Diet"
              items={recommendation?.diet_suggestions || []}
              accent="border-sky/20 bg-sky/5"
            />
            <RecommendationSection
              title="Sleep optimization"
              subtitle="Recovery"
              items={recommendation?.sleep_guidance || []}
              accent="border-amber-200 bg-amber-50"
            />
            <RecommendationSection
              title="Lifestyle improvements"
              subtitle="Behavior"
              items={recommendation?.lifestyle_guidance || []}
              accent="border-ink/10 bg-white"
            />
          </div>

          <HealthProfileForm
            key={profile.updated_at}
            defaultValues={profile}
            fieldErrors={profileErrors}
            onSubmit={handleProfileSubmit}
            loading={savingProfile}
            onInteract={() => setProfileErrors({})}
          />
        </>
      )}
    </div>
  );
}
