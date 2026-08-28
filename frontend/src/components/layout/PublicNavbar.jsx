import { Link, NavLink } from "react-router-dom";
import { FiSun, FiMoon, FiMenu, FiX } from "react-icons/fi";
import { useState } from "react";
import { useTheme } from "../../context/useTheme";
import { useAuth } from "../../context/useAuth";
import { getDashboardPath } from "../../utils/dashboard";

const PublicNavbar = () => {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  const links = [
    { to: "/discover", label: "Discover" },
    { to: "/leaderboard", label: "Leaderboard" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#16130d]/95 text-white backdrop-blur-xl border-b border-amber-300/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-200 to-amber-500 flex items-center justify-center shadow-lg shadow-amber-400/30">
              <span className="text-slate-950 font-black text-sm">IH</span>
            </div>
            <span className="font-bold text-lg">Impact<span className="text-amber-300">Hub</span></span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {links.map((l) => (
              <NavLink key={l.to} to={l.to} className={({ isActive }) =>
                `text-sm font-medium transition-colors ${isActive ? "text-amber-300" : "text-stone-300 hover:text-amber-200"}`
              }>{l.label}</NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button onClick={toggleTheme} className="p-2 rounded-xl hover:bg-white/10 text-amber-100" aria-label="Toggle theme">
              {theme === "dark" ? <FiSun size={18} /> : <FiMoon size={18} />}
            </button>
            {user ? (
              <Link to={getDashboardPath(user.role)} className="hidden sm:inline-flex bg-amber-400 hover:bg-amber-300 text-[#16130d] text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
                Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" className="hidden sm:inline-flex text-sm font-medium text-stone-200 hover:text-amber-200 px-3 py-2">Sign in</Link>
              <Link to="/signup" className="hidden sm:inline-flex bg-gradient-to-r from-amber-300 to-amber-500 text-slate-950 text-sm font-bold px-4 py-2 rounded-xl hover:scale-[1.03] transition-transform">Get Started</Link>
              </>
            )}
            <button className="md:hidden p-2 rounded-xl hover:bg-white/10" onClick={() => setOpen(!open)}>
              {open ? <FiX size={20} /> : <FiMenu size={20} />}
            </button>
          </div>
        </div>

        {open && (
          <div className="md:hidden pb-4 space-y-2 animate-fade-in">
            {links.map((l) => (
              <NavLink key={l.to} to={l.to} onClick={() => setOpen(false)} className="block py-2 text-sm font-medium text-stone-200">{l.label}</NavLink>
            ))}
            {!user && (
              <>
                <Link to="/login" onClick={() => setOpen(false)} className="block py-2 text-sm font-medium text-stone-200">Sign in</Link>
                <Link to="/signup" onClick={() => setOpen(false)} className="block py-2 text-sm font-semibold text-amber-600">Get Started</Link>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default PublicNavbar;
