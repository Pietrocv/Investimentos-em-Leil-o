import { Building2, LayoutDashboard, LogOut, Users } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import logo from "../assets/logo.svg";

const links = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/properties", label: "Imoveis", icon: Building2 },
  { to: "/investors", label: "Investidores", icon: Users }
];

export function Sidebar() {
  const { logout } = useAuth();

  return (
    <aside className="fixed inset-y-0 left-0 z-20 hidden w-72 border-r border-brand-green/20 bg-brand-navy/92 p-5 text-brand-text shadow-gold backdrop-blur-xl lg:block">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-brand-green/15 to-transparent" />
      <div className="relative">
        <img src={logo} className="mb-8 rounded-lg border border-brand-green/20 bg-brand-navy/70 p-2 shadow-gold" />
        <nav className="space-y-2">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-md border px-3 py-2 text-sm transition ${
                  isActive
                    ? "border-brand-green/35 bg-brand-green/15 text-brand-green shadow-[0_0_24px_rgba(211,170,83,0.14)]"
                    : "border-transparent text-brand-text/70 hover:border-brand-green/20 hover:bg-white/5 hover:text-brand-text"
                }`
              }
            >
              <l.icon size={18} />
              {l.label}
            </NavLink>
          ))}
        </nav>
      </div>
      <button onClick={logout} className="absolute bottom-5 flex items-center gap-3 rounded-md border border-transparent px-3 py-2 text-sm text-brand-text/70 hover:border-brand-green/20 hover:bg-white/5 hover:text-brand-text">
        <LogOut size={18} />
        Sair
      </button>
    </aside>
  );
}
