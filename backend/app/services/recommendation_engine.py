from __future__ import annotations

from collections.abc import Sequence
from datetime import date, timedelta
from typing import Optional

from app.models.health import DailyLog, HabitCheck, HealthProfile


DEFAULT_CHECKLIST = [
    "Drink at least 2.5L of water",
    "Take a 30 minute brisk walk",
    "Sleep before 11 PM",
]


def calculate_bmi(height_cm: float, weight_kg: float) -> float:
    height_m = height_cm / 100
    return round(weight_kg / (height_m * height_m), 1)


def current_week_start(today: Optional[date] = None) -> date:
    current = today or date.today()
    return current - timedelta(days=current.weekday())


def _average(values: Sequence[float]) -> float:
    valid = [value for value in values if value is not None]
    if not valid:
        return 0.0
    return round(sum(valid) / len(valid), 2)


def _streak_days(habit_checks: Sequence[HabitCheck], today: Optional[date] = None) -> int:
    if not habit_checks:
        return 0
    completed_days = sorted({item.date for item in habit_checks if item.completed}, reverse=True)
    if not completed_days:
        return 0
    cursor = today or date.today()
    streak = 0
    day_set = set(completed_days)
    while cursor in day_set:
        streak += 1
        cursor -= timedelta(days=1)
    return streak


def summarize_logs(logs: Sequence[DailyLog]) -> dict[str, float]:
    recent = list(logs)[-7:]
    avg_sleep = _average([log.sleep_hours or 0 for log in recent])
    avg_water = _average([log.water_intake_liters or 0 for log in recent])
    avg_activity = _average([float(log.activity_minutes or 0) for log in recent])
    avg_stress = _average([float(log.stress_level or 0) for log in recent])
    weights = [log.weight_kg for log in recent if log.weight_kg is not None]
    weight_change = round(weights[-1] - weights[0], 2) if len(weights) >= 2 else 0.0
    return {
        "avg_sleep_hours": avg_sleep,
        "avg_water_intake_liters": avg_water,
        "avg_activity_minutes": avg_activity,
        "avg_stress_level": avg_stress,
        "weight_change_kg": weight_change,
    }


def _score_bmi(bmi: float) -> float:
    if 18.5 <= bmi <= 24.9:
        return 25
    if 25 <= bmi < 30:
        return 16
    if bmi >= 30:
        return 8
    return 14


def _score_activity(avg_activity: float, activity_level: str) -> float:
    base_targets = {
        "sedentary": 20,
        "light": 30,
        "moderate": 40,
        "active": 50,
    }
    target = base_targets.get(activity_level, 30)
    ratio = min(avg_activity / target, 1.25)
    return round(min(ratio * 20 + 5, 25), 1)


def _score_sleep(avg_sleep: float) -> float:
    if 7 <= avg_sleep <= 9:
        return 20
    if 6 <= avg_sleep < 7 or 9 < avg_sleep <= 10:
        return 14
    if 5 <= avg_sleep < 6:
        return 10
    return 6


def _score_hydration(avg_water: float) -> float:
    if avg_water >= 2.5:
        return 10
    if avg_water >= 2:
        return 8
    if avg_water >= 1.5:
        return 5
    return 2


def _score_stress(avg_stress: float) -> float:
    if avg_stress == 0:
        return 6
    score = max(1, 11 - avg_stress)
    return round(min(score, 10), 1)


def _score_streak(streak_days: int) -> float:
    return round(min(streak_days / 7, 1) * 10, 1)


def _risk_warnings(profile: HealthProfile, log_summary: dict[str, float], bmi: float) -> list[str]:
    warnings: list[str] = []
    conditions = {item.lower() for item in profile.medical_conditions}

    if bmi >= 30:
        warnings.append("BMI is in the obesity range. Prioritize weight-management routines and clinical follow-up if symptoms are present.")
    elif bmi >= 25 and profile.activity_level in {"sedentary", "light"}:
        warnings.append("Elevated BMI plus low activity increases cardiometabolic risk. Focus on sustainable movement volume this week.")

    if log_summary["avg_sleep_hours"] < 6.5 and log_summary["avg_stress_level"] >= 7:
        warnings.append("Low sleep combined with high stress can impair recovery. Protect sleep duration before increasing training intensity.")

    if (bmi >= 27 or "diabetes" in conditions or "prediabetes" in conditions) and profile.goal == "fat_loss":
        warnings.append("Your current profile suggests higher metabolic risk. Keep meals high in fiber and use consistent meal timing.")

    if log_summary["avg_water_intake_liters"] < 2 and log_summary["avg_activity_minutes"] >= 45:
        warnings.append("Hydration is low relative to activity volume. Increase fluids and add electrolytes during longer sessions.")

    if not warnings:
        warnings.append("No major risk flags were detected. Continue building consistency and monitor weekly trends.")

    return warnings


def _goal_exercise_plan(goal: str, activity_level: str) -> list[str]:
    plans = {
        "fat_loss": [
            "Accumulate 180 to 220 minutes of moderate cardio across the week.",
            "Add 2 full-body strength sessions to protect lean mass.",
            "Use a 10 minute walk after two meals each day to improve glucose control.",
        ],
        "muscle_gain": [
            "Complete 4 resistance sessions focused on progressive overload.",
            "Keep cardio light and short on non-lifting days for recovery support.",
            "Hit a protein-rich meal within 2 hours after training.",
        ],
        "general_fitness": [
            "Balance 3 mixed workouts: strength, mobility, and moderate cardio.",
            "Add one longer low-intensity activity session on the weekend.",
            "Stretch for 8 to 10 minutes after workouts to improve recovery.",
        ],
    }
    plan = plans.get(goal, plans["general_fitness"]).copy()
    if activity_level == "sedentary":
        plan.insert(0, "Start with 20 minute low-impact movement sessions and progress slowly.")
    return plan


def _diet_suggestions(goal: str, diet_type: str, medical_conditions: list[str]) -> list[str]:
    conditions = {item.lower() for item in medical_conditions}
    suggestions = {
        "fat_loss": [
            "Build meals around vegetables, lean protein, and high-fiber carbohydrates.",
            "Use consistent portion sizes and avoid liquid calories on most days.",
        ],
        "muscle_gain": [
            "Aim for protein in 3 to 5 meals and add a calorie-dense whole-food snack.",
            "Pair training days with higher carbohydrate intake to support performance.",
        ],
        "general_fitness": [
            "Use the plate method: half vegetables, one quarter protein, one quarter complex carbs.",
            "Keep ultra-processed foods as exceptions rather than defaults.",
        ],
    }.get(goal, [])

    if diet_type == "vegetarian":
        suggestions.append("Prioritize protein from dairy, soy, lentils, beans, and Greek yogurt.")
    if diet_type == "vegan":
        suggestions.append("Combine legumes, tofu, tempeh, and fortified foods to support protein and micronutrient intake.")
    if "hypertension" in conditions:
        suggestions.append("Reduce high-sodium packaged foods and favor potassium-rich produce.")
    if "diabetes" in conditions or "prediabetes" in conditions:
        suggestions.append("Anchor each meal with fiber and protein to improve post-meal glucose stability.")
    return suggestions


def _sleep_guidance(avg_sleep: float, stress_level: int) -> list[str]:
    guidance = [
        "Keep a fixed wake time every day, including weekends.",
        "Reduce screen exposure in the 60 minutes before sleep.",
    ]
    if avg_sleep < 7:
        guidance.append("Move bedtime earlier by 15 to 20 minutes until you consistently reach at least 7 hours.")
    if stress_level >= 7:
        guidance.append("Use a 5 minute breathing or journaling routine to reduce pre-sleep arousal.")
    return guidance


def _lifestyle_guidance(goal: str, streak_days: int, avg_stress: float) -> list[str]:
    guidance = [
        "Schedule workouts and meals on the calendar instead of relying on spare time.",
        "Review one weekly metric every Sunday to keep progress visible.",
    ]
    if streak_days < 3:
        guidance.append("Focus on completing the first small habit for three days in a row before expanding the plan.")
    if avg_stress >= 7:
        guidance.append("Protect recovery by limiting caffeine late in the day and adding one short decompression block.")
    if goal == "fat_loss":
        guidance.append("Increase incidental movement with walking meetings or stair breaks.")
    return guidance


def _daily_checklist(goal: str, avg_sleep: float, avg_water: float) -> list[str]:
    checklist = DEFAULT_CHECKLIST.copy()
    if goal == "muscle_gain":
        checklist[1] = "Complete your planned strength session or recovery walk"
        checklist.append("Hit your daily protein target")
    if avg_sleep < 7:
        checklist.append("Start your bedtime wind-down 45 minutes earlier")
    if avg_water < 2:
        checklist.append("Carry a water bottle and finish two refills before lunch")
    return checklist[:5]


def generate_recommendation(profile: HealthProfile, logs: Sequence[DailyLog], habit_checks: Sequence[HabitCheck]) -> dict:
    log_summary = summarize_logs(logs)
    baseline_sleep = log_summary["avg_sleep_hours"] or profile.sleep_hours
    baseline_water = log_summary["avg_water_intake_liters"] or profile.water_intake_liters
    baseline_activity = log_summary["avg_activity_minutes"]
    baseline_stress = log_summary["avg_stress_level"] or profile.stress_level
    bmi = profile.bmi
    streak_days = _streak_days(habit_checks)

    health_score = round(
        _score_bmi(bmi)
        + _score_activity(baseline_activity, profile.activity_level)
        + _score_sleep(baseline_sleep)
        + _score_hydration(baseline_water)
        + _score_stress(baseline_stress)
        + _score_streak(streak_days),
        1,
    )

    if health_score >= 80:
        risk_level = "low"
    elif health_score >= 60:
        risk_level = "moderate"
    else:
        risk_level = "high"

    risk_warnings = _risk_warnings(profile, log_summary | {"avg_sleep_hours": baseline_sleep, "avg_water_intake_liters": baseline_water, "avg_stress_level": baseline_stress}, bmi)
    exercise_plan = _goal_exercise_plan(profile.goal, profile.activity_level)
    diet_suggestions = _diet_suggestions(profile.goal, profile.diet_type, profile.medical_conditions)
    sleep_guidance = _sleep_guidance(baseline_sleep, int(round(baseline_stress)))
    lifestyle_guidance = _lifestyle_guidance(profile.goal, streak_days, baseline_stress)
    daily_checklist = _daily_checklist(profile.goal, baseline_sleep, baseline_water)

    summary = (
        f"Your current weekly health score is {health_score}/100. "
        f"The strongest opportunity this week is improving consistency around "
        f"{'sleep and stress' if baseline_sleep < 7 or baseline_stress >= 7 else 'movement and recovery'}."
    )

    return {
        "week_start": current_week_start(),
        "health_score": health_score,
        "risk_level": risk_level,
        "exercise_plan": exercise_plan,
        "diet_suggestions": diet_suggestions,
        "sleep_guidance": sleep_guidance,
        "lifestyle_guidance": lifestyle_guidance,
        "risk_warnings": risk_warnings,
        "daily_checklist": daily_checklist,
        "summary": summary,
        "streak_days": streak_days,
        "weekly_insights": summarize_logs(logs),
    }
