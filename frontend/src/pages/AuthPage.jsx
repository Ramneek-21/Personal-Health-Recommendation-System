import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

const initialSignup = { full_name: "", email: "", password: "" };
const initialLogin = { email: "", password: "" };

function inputClass(fieldError) {
  return `field ${
    fieldError ? "border-red-300 text-red-900 placeholder:text-red-400 focus:border-red-500" : ""
  }`;
}

export default function AuthPage() {
  const navigate = useNavigate();
  const { login, signup } = useAuth();
  const [mode, setMode] = useState("signup");
  const [signupForm, setSignupForm] = useState(initialSignup);
  const [loginForm, setLoginForm] = useState(initialLogin);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [signupErrors, setSignupErrors] = useState({});
  const [loginErrors, setLoginErrors] = useState({});

  const switchMode = (nextMode) => {
    setMode(nextMode);
    setError("");
    setSignupErrors({});
    setLoginErrors({});
  };

  const updateSignupField = (event) => {
    const { name, value } = event.target;
    setSignupForm((current) => ({ ...current, [name]: value }));
    setSignupErrors((current) => {
      if (!current[name]) {
        return current;
      }
      const nextErrors = { ...current };
      delete nextErrors[name];
      return nextErrors;
    });
  };

  const updateLoginField = (event) => {
    const { name, value } = event.target;
    setLoginForm((current) => ({ ...current, [name]: value }));
    setLoginErrors((current) => {
      if (!current[name]) {
        return current;
      }
      const nextErrors = { ...current };
      delete nextErrors[name];
      return nextErrors;
    });
  };

  const handleSignup = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSignupErrors({});
    try {
      await signup(signupForm);
      navigate("/");
    } catch (requestError) {
      setSignupErrors(requestError.fieldErrors || {});
      setError(Object.keys(requestError.fieldErrors || {}).length ? "" : requestError.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setLoginErrors({});
    try {
      await login(loginForm);
      navigate("/");
    } catch (requestError) {
      setLoginErrors(requestError.fieldErrors || {});
      setError(Object.keys(requestError.fieldErrors || {}).length ? "" : requestError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen overflow-x-clip bg-hero-glow px-4 py-4 sm:py-5">
      <div className="mx-auto grid min-h-[calc(100vh-2rem)] max-w-6xl gap-4 sm:gap-6 lg:min-h-[calc(100vh-2.5rem)] lg:grid-cols-[1.05fr_0.95fr]">
        <section className="panel order-2 flex flex-col justify-between overflow-hidden p-6 sm:p-8 lg:order-1 lg:p-10 xl:p-12">
          <div>
            <p className="font-display text-xs uppercase tracking-[0.35em] text-pine">PulsePilot</p>
            <h1 className="mt-5 max-w-xl font-display text-4xl leading-tight text-ink sm:mt-6 sm:text-5xl">
              Personalized health recommendations that adapt to your life.
            </h1>
            <p className="mt-5 max-w-xl text-base text-ink/75 sm:mt-6 sm:text-lg">
              Get weekly health scoring, risk signals, exercise and nutrition guidance, sleep coaching,
              habit streaks, and a single dashboard for your personal wellness system.
            </p>
          </div>

          <div className="grid gap-3 sm:gap-4 lg:grid-cols-3">
            {[
              ["Daily logs", "Track sleep, hydration, weight, activity, and stress in under a minute."],
              ["Smart guidance", "Rule-based recommendations tuned to your goals and current risk signals."],
              ["Progress over time", "Monitor charts, streaks, and weekly insights without spreadsheet work."],
            ].map(([title, description]) => (
              <div key={title} className="rounded-3xl border border-white/50 bg-white/70 p-4 sm:p-5">
                <h2 className="font-display text-xl text-ink sm:text-2xl">{title}</h2>
                <p className="mt-2 text-sm text-ink/70 sm:mt-3">{description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="panel order-1 flex flex-col justify-center p-6 sm:p-8 lg:order-2 lg:p-10">
          <div className="mb-6 flex rounded-2xl bg-white/70 p-2">
            <button
              className={`flex-1 rounded-2xl px-4 py-3 text-sm font-medium ${
                mode === "signup" ? "bg-ink text-white" : "text-ink/70"
              }`}
              onClick={() => switchMode("signup")}
            >
              Create account
            </button>
            <button
              className={`flex-1 rounded-2xl px-4 py-3 text-sm font-medium ${
                mode === "login" ? "bg-ink text-white" : "text-ink/70"
              }`}
              onClick={() => switchMode("login")}
            >
              Log in
            </button>
          </div>

          {mode === "signup" ? (
            <form className="space-y-4" onSubmit={handleSignup}>
              <div>
                <p className="text-sm text-ink/60">Get started</p>
                <h2 className="font-display text-3xl text-ink sm:text-4xl">Create your health workspace</h2>
              </div>
              <div>
                <input
                  className={inputClass(signupErrors.full_name)}
                  name="full_name"
                  placeholder="Full name"
                  value={signupForm.full_name}
                  onChange={updateSignupField}
                />
                {signupErrors.full_name ? (
                  <p className="mt-2 px-1 text-xs text-red-600">{signupErrors.full_name}</p>
                ) : null}
              </div>
              <div>
                <input
                  className={inputClass(signupErrors.email)}
                  name="email"
                  type="email"
                  placeholder="Email"
                  value={signupForm.email}
                  onChange={updateSignupField}
                />
                {signupErrors.email ? (
                  <p className="mt-2 px-1 text-xs text-red-600">{signupErrors.email}</p>
                ) : null}
              </div>
              <div>
                <input
                  className={inputClass(signupErrors.password)}
                  name="password"
                  type="password"
                  placeholder="Password"
                  value={signupForm.password}
                  onChange={updateSignupField}
                />
                {signupErrors.password ? (
                  <p className="mt-2 px-1 text-xs text-red-600">{signupErrors.password}</p>
                ) : null}
              </div>
              {error ? <p className="text-sm text-red-600">{error}</p> : null}
              <button disabled={loading} className="btn-primary w-full">
                {loading ? "Creating..." : "Create account"}
              </button>
            </form>
          ) : (
            <form className="space-y-4" onSubmit={handleLogin}>
              <div>
                <p className="text-sm text-ink/60">Welcome back</p>
                <h2 className="font-display text-3xl text-ink sm:text-4xl">Continue your routine</h2>
              </div>
              <div>
                <input
                  className={inputClass(loginErrors.email)}
                  name="email"
                  type="email"
                  placeholder="Email"
                  value={loginForm.email}
                  onChange={updateLoginField}
                />
                {loginErrors.email ? (
                  <p className="mt-2 px-1 text-xs text-red-600">{loginErrors.email}</p>
                ) : null}
              </div>
              <div>
                <input
                  className={inputClass(loginErrors.password)}
                  name="password"
                  type="password"
                  placeholder="Password"
                  value={loginForm.password}
                  onChange={updateLoginField}
                />
                {loginErrors.password ? (
                  <p className="mt-2 px-1 text-xs text-red-600">{loginErrors.password}</p>
                ) : null}
              </div>
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
