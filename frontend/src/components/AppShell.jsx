import { NavLink } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

const navigation = [
  { to: "/", label: "Dashboard" },
  { to: "/progress", label: "Progress" },
  { to: "/notifications", label: "Notifications" },
];

export default function AppShell({ children }) {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-hero-glow">
      <div className="mx-auto grid min-h-screen max-w-7xl gap-6 px-4 py-5 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="panel flex h-fit flex-col gap-8 p-6">
          <div>
            <p className="font-display text-xs uppercase tracking-[0.35em] text-pine">PulsePilot</p>
            <h1 className="mt-3 font-display text-3xl text-ink">Health OS for your routine.</h1>
            <p className="mt-3 text-sm text-ink/70">
              Track weight, sleep, activity, stress, and the next best action.
            </p>
          </div>

          <nav className="flex flex-col gap-2">
            {navigation.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `rounded-2xl px-4 py-3 text-sm font-medium transition ${
                    isActive ? "bg-ink text-white" : "bg-white/70 text-ink hover:bg-white"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="rounded-2xl bg-ink px-4 py-4 text-white">
            <p className="text-xs uppercase tracking-[0.2em] text-white/60">Signed in as</p>
            <p className="mt-2 font-display text-xl">{user?.full_name}</p>
            <button onClick={logout} className="mt-4 text-sm text-white/80 underline">
              Log out
            </button>
          </div>
        </aside>

        <main className="space-y-6">{children}</main>
      </div>
    </div>
  );
}

