import { useMemo, useState } from "react";

const initialState = {
  age: 30,
  gender: "female",
  height_cm: 170,
  weight_kg: 70,
  medical_conditions: "",
  diet_type: "balanced",
  activity_level: "light",
  sleep_hours: 7,
  water_intake_liters: 2.2,
  stress_level: 5,
  goal: "general_fitness",
};

export default function HealthProfileForm({ defaultValues, onSubmit, loading }) {
  const [form, setForm] = useState(defaultValues || initialState);
  const bmi = useMemo(() => {
    const meters = Number(form.height_cm) / 100;
    if (!meters || !form.weight_kg) return 0;
    return (Number(form.weight_kg) / (meters * meters)).toFixed(1);
  }, [form.height_cm, form.weight_kg]);

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit({
      ...form,
      age: Number(form.age),
      height_cm: Number(form.height_cm),
      weight_kg: Number(form.weight_kg),
      sleep_hours: Number(form.sleep_hours),
      water_intake_liters: Number(form.water_intake_liters),
      stress_level: Number(form.stress_level),
      medical_conditions: form.medical_conditions
        ? form.medical_conditions.split(",").map((item) => item.trim()).filter(Boolean)
        : [],
    });
  };

  return (
    <form onSubmit={handleSubmit} className="panel p-6">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-ink/60">Baseline assessment</p>
          <h2 className="font-display text-3xl text-ink">Build your health profile</h2>
        </div>
        <div className="rounded-2xl bg-ink px-4 py-3 text-white">
          <p className="text-xs uppercase tracking-[0.2em] text-white/60">Estimated BMI</p>
          <p className="font-display text-3xl">{bmi}</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <input className="field" name="age" type="number" value={form.age} onChange={updateField} placeholder="Age" />
        <select className="field" name="gender" value={form.gender} onChange={updateField}>
          <option value="female">Female</option>
          <option value="male">Male</option>
          <option value="non-binary">Non-binary</option>
        </select>
        <input className="field" name="height_cm" type="number" value={form.height_cm} onChange={updateField} placeholder="Height (cm)" />
        <input className="field" name="weight_kg" type="number" value={form.weight_kg} onChange={updateField} placeholder="Weight (kg)" />
        <select className="field" name="diet_type" value={form.diet_type} onChange={updateField}>
          <option value="balanced">Balanced</option>
          <option value="vegetarian">Vegetarian</option>
          <option value="vegan">Vegan</option>
          <option value="high-protein">High protein</option>
        </select>
        <select className="field" name="activity_level" value={form.activity_level} onChange={updateField}>
          <option value="sedentary">Sedentary</option>
          <option value="light">Lightly active</option>
          <option value="moderate">Moderately active</option>
          <option value="active">Active</option>
        </select>
        <input className="field" name="sleep_hours" type="number" step="0.1" value={form.sleep_hours} onChange={updateField} placeholder="Sleep hours" />
        <input className="field" name="water_intake_liters" type="number" step="0.1" value={form.water_intake_liters} onChange={updateField} placeholder="Water intake (L)" />
        <input className="field" name="stress_level" type="number" value={form.stress_level} onChange={updateField} placeholder="Stress level (1-10)" />
        <select className="field" name="goal" value={form.goal} onChange={updateField}>
          <option value="fat_loss">Fat loss</option>
          <option value="muscle_gain">Muscle gain</option>
          <option value="general_fitness">General fitness</option>
        </select>
        <textarea
          className="field md:col-span-2 xl:col-span-3"
          name="medical_conditions"
          rows="3"
          value={form.medical_conditions}
          onChange={updateField}
          placeholder="Medical conditions, comma separated"
        />
      </div>

      <button disabled={loading} className="btn-primary mt-6 w-full md:w-auto">
        {loading ? "Saving..." : "Save profile and generate plan"}
      </button>
    </form>
  );
}

