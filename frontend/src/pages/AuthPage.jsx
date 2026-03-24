import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

const initialSignup = { full_name: "", email: "", password: "" };
const initialLogin = { email: "", password: "" };

export default function AuthPage() {
  const navigate = useNavigate();
  const { login, signup } = useAuth();
  const [mode, setMode] = useState("signup");
  const [signupForm, setSignupForm] = useState(initialSignup);
  const [loginForm, setLoginForm] = useState(initialLogin);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignup = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      await signup(signupForm);
      navigate("/");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      await login(loginForm);
      navigate("/");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-hero-glow px-4 py-5">
      <div className="mx-auto grid min-h-[calc(100vh-2.5rem)] max-w-6xl gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="panel flex flex-col justify-between overflow-hidden p-8 lg:p-12">
          <div>
            <p className="font-display text-xs uppercase tracking-[0.35em] text-pine">PulsePilot</p>
            <h1 className="mt-6 max-w-xl font-display text-5xl leading-tight text-ink">
              Personalized health recommendations that adapt to your life.
            </h1>
            <p className="mt-6 max-w-xl text-lg text-ink/75">
              Get weekly health scoring, risk signals, exercise and nutrition guidance, sleep coaching,
              habit streaks, and a single dashboard for your personal wellness system.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {[
              ["Daily logs", "Track sleep, hydration, weight, activity, and stress in under a minute."],
              ["Smart guidance", "Rule-based recommendations tuned to your goals and current risk signals."],
              ["Progress over time", "Monitor charts, streaks, and weekly insights without spreadsheet work."],
            ].map(([title, description]) => (
              <div key={title} className="rounded-3xl border border-white/50 bg-white/70 p-5">
                <h2 className="font-display text-2xl text-ink">{title}</h2>
                <p className="mt-3 text-sm text-ink/70">{description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="panel flex flex-col justify-center p-8 lg:p-10">
          <div className="mb-6 flex rounded-2xl bg-white/70 p-2">
            <button
              className={`flex-1 rounded-2xl px-4 py-3 text-sm font-medium ${
                mode === "signup" ? "bg-ink text-white" : "text-ink/70"
              }`}
              onClick={() => setMode("signup")}
            >
              Create account
            </button>
            <button
              className={`flex-1 rounded-2xl px-4 py-3 text-sm font-medium ${
                mode === "login" ? "bg-ink text-white" : "text-ink/70"
              }`}
              onClick={() => setMode("login")}
            >
              Log in
            </button>
          </div>

          {mode === "signup" ? (
            <form className="space-y-4" onSubmit={handleSignup}>
              <div>
                <p className="text-sm text-ink/60">Get started</p>
                <h2 className="font-display text-4xl text-ink">Create your health workspace</h2>
              </div>
              <input
                className="field"
                placeholder="Full name"
                value={signupForm.full_name}
                onChange={(event) => setSignupForm((current) => ({ ...current, full_name: event.target.value }))}
              />
              <input
                className="field"
                type="email"
                placeholder="Email"
                value={signupForm.email}
                onChange={(event) => setSignupForm((current) => ({ ...current, email: event.target.value }))}
              />
              <input
                className="field"
                type="password"
                placeholder="Password"
                value={signupForm.password}
                onChange={(event) => setSignupForm((current) => ({ ...current, password: event.target.value }))}
              />
              {error ? <p className="text-sm text-red-600">{error}</p> : null}
              <button disabled={loading} className="btn-primary w-full">
                {loading ? "Creating..." : "Create account"}
              </button>
            </form>
          ) : (
            <form className="space-y-4" onSubmit={handleLogin}>
              <div>
                <p className="text-sm text-ink/60">Welcome back</p>
                <h2 className="font-display text-4xl text-ink">Continue your routine</h2>
              </div>
              <input
                className="field"
                type="email"
                placeholder="Email"
                value={loginForm.email}
                onChange={(event) => setLoginForm((current) => ({ ...current, email: event.target.value }))}
              />
              <input
                className="field"
                type="password"
                placeholder="Password"
                value={loginForm.password}
                onChange={(event) => setLoginForm((current) => ({ ...current, password: event.target.value }))}
              />
              {error ? <p className="text-sm text-red-600">{error}</p> : null}
              <button disabled={loading} className="btn-primary w-full">
                {loading ? "Signing in..." : "Log in"}
              </button>
            </form>
          )}
        </section>
      </div>
    </div>
  );
}

