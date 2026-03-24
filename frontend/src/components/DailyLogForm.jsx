import { useState } from "react";

const today = new Date().toISOString().slice(0, 10);

function inputClass(fieldError) {
  return `field ${
    fieldError ? "border-red-300 text-red-900 placeholder:text-red-400 focus:border-red-500" : ""
  }`;
}

export default function DailyLogForm({ fieldErrors = {}, onSubmit, loading, onInteract }) {
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
    onInteract?.();
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
        <div>
          <input
            className={inputClass(fieldErrors.logged_at)}
            name="logged_at"
            type="date"
            value={form.logged_at}
            onChange={updateField}
          />
          {fieldErrors.logged_at ? (
            <p className="mt-2 px-1 text-xs text-red-600">{fieldErrors.logged_at}</p>
          ) : null}
        </div>
        <div>
          <input
            className={inputClass(fieldErrors.weight_kg)}
            name="weight_kg"
            type="number"
            step="0.1"
            value={form.weight_kg}
            onChange={updateField}
            placeholder="Weight (kg)"
          />
          {fieldErrors.weight_kg ? (
            <p className="mt-2 px-1 text-xs text-red-600">{fieldErrors.weight_kg}</p>
          ) : null}
        </div>
        <div>
          <input
            className={inputClass(fieldErrors.sleep_hours)}
            name="sleep_hours"
            type="number"
            step="0.1"
            value={form.sleep_hours}
            onChange={updateField}
            placeholder="Sleep hours"
          />
          {fieldErrors.sleep_hours ? (
            <p className="mt-2 px-1 text-xs text-red-600">{fieldErrors.sleep_hours}</p>
          ) : null}
        </div>
        <div>
          <input
            className={inputClass(fieldErrors.water_intake_liters)}
            name="water_intake_liters"
            type="number"
            step="0.1"
            value={form.water_intake_liters}
            onChange={updateField}
            placeholder="Water intake (L)"
          />
          {fieldErrors.water_intake_liters ? (
            <p className="mt-2 px-1 text-xs text-red-600">{fieldErrors.water_intake_liters}</p>
          ) : null}
        </div>
        <div>
          <input
            className={inputClass(fieldErrors.activity_minutes)}
            name="activity_minutes"
            type="number"
            value={form.activity_minutes}
            onChange={updateField}
            placeholder="Activity minutes"
          />
          {fieldErrors.activity_minutes ? (
            <p className="mt-2 px-1 text-xs text-red-600">{fieldErrors.activity_minutes}</p>
          ) : null}
        </div>
        <div>
          <input
            className={inputClass(fieldErrors.stress_level)}
            name="stress_level"
            type="number"
            value={form.stress_level}
            onChange={updateField}
            placeholder="Stress level"
          />
          {fieldErrors.stress_level ? (
            <p className="mt-2 px-1 text-xs text-red-600">{fieldErrors.stress_level}</p>
          ) : null}
        </div>
        <div>
          <input
            className={inputClass(fieldErrors.steps)}
            name="steps"
            type="number"
            value={form.steps}
            onChange={updateField}
            placeholder="Steps"
          />
          {fieldErrors.steps ? <p className="mt-2 px-1 text-xs text-red-600">{fieldErrors.steps}</p> : null}
        </div>
        <div className="md:col-span-2 xl:col-span-4">
          <input
            className={inputClass(fieldErrors.notes)}
            name="notes"
            value={form.notes}
            onChange={updateField}
            placeholder="Notes"
          />
          {fieldErrors.notes ? <p className="mt-2 px-1 text-xs text-red-600">{fieldErrors.notes}</p> : null}
        </div>
      </div>
      <button disabled={loading} className="btn-secondary mt-5 w-full md:w-auto">
        {loading ? "Saving..." : "Save daily log"}
      </button>
    </form>
  );
}
