import { useState } from "react";

const today = new Date().toISOString().slice(0, 10);

export default function DailyLogForm({ onSubmit, loading }) {
  const [form, setForm] = useState({
    logged_at: today,
    weight_kg: "",
    sleep_hours: "",
    water_intake_liters: "",
    activity_minutes: "",
    stress_level: "",
    steps: "",
    notes: "",
  });

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit({
      ...form,
      weight_kg: form.weight_kg ? Number(form.weight_kg) : null,
      sleep_hours: form.sleep_hours ? Number(form.sleep_hours) : null,
      water_intake_liters: form.water_intake_liters ? Number(form.water_intake_liters) : null,
      activity_minutes: form.activity_minutes ? Number(form.activity_minutes) : null,
      stress_level: form.stress_level ? Number(form.stress_level) : null,
      steps: form.steps ? Number(form.steps) : null,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="panel p-5">
      <div className="mb-4">
        <p className="text-sm text-ink/60">Daily check-in</p>
        <h3 className="font-display text-2xl text-ink">Log today’s recovery inputs</h3>
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <input className="field" name="logged_at" type="date" value={form.logged_at} onChange={updateField} />
        <input className="field" name="weight_kg" type="number" step="0.1" value={form.weight_kg} onChange={updateField} placeholder="Weight (kg)" />
        <input className="field" name="sleep_hours" type="number" step="0.1" value={form.sleep_hours} onChange={updateField} placeholder="Sleep hours" />
        <input className="field" name="water_intake_liters" type="number" step="0.1" value={form.water_intake_liters} onChange={updateField} placeholder="Water intake (L)" />
        <input className="field" name="activity_minutes" type="number" value={form.activity_minutes} onChange={updateField} placeholder="Activity minutes" />
        <input className="field" name="stress_level" type="number" value={form.stress_level} onChange={updateField} placeholder="Stress level" />
        <input className="field" name="steps" type="number" value={form.steps} onChange={updateField} placeholder="Steps" />
        <input className="field md:col-span-2 xl:col-span-4" name="notes" value={form.notes} onChange={updateField} placeholder="Notes" />
      </div>
      <button disabled={loading} className="btn-secondary mt-5 w-full md:w-auto">
        {loading ? "Saving..." : "Save daily log"}
      </button>
    </form>
  );
}
