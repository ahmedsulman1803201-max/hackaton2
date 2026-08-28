import { Link, NavLink, useNavigate, Outlet } from "react-router-dom";
import {
  FiGrid, FiSearch, FiFolder, FiClipboard, FiBell,
  FiAward, FiUser, FiLogOut, FiMenu, FiSun, FiMoon, FiPlus, FiX,
} from "react-icons/fi";
import { useAuth } from "../../context/useAuth";
import { useTheme } from "../../context/useTheme";
import { useNotifications } from "../../context/useNotifications";
import Avatar from "../ui/Avatar";
import { useEffect, useRef, useState } from "react";
import { timeAgo } from "../../data/mockData";

const NAV = {
  student: [
    { to: "/dashboard/student", label: "Dashboard", icon: FiGrid, end: true },
    { to: "/discover", label: "Discover", icon: FiSearch },
    { to: "/my-projects", label: "My Projects", icon: FiFolder },
    { to: "/applications", label: "Applications", icon: FiClipboard },
    { to: "/leaderboard", label: "Leaderboard", icon: FiAward },
    { to: "/notifications", label: "Notifications", icon: FiBell },
    { to: "/profile", label: "Profile", icon: FiUser },
  ],
  manager: [
    { to: "/dashboard/manager", label: "Dashboard", icon: FiGrid, end: true },
    { to: "/discover", label: "Discover", icon: FiSearch },
    { to: "/my-projects", label: "My Projects", icon: FiFolder },
    { to: "/projects/new", label: "Create Project", icon: FiPlus },
    { to: "/applications", label: "Applications", icon: FiClipboard },
    { to: "/leaderboard", label: "Leaderboard", icon: FiAward },
    { to: "/notifications", label: "Notifications", icon: FiBell },
    { to: "/profile", label: "Profile", icon: FiUser },
  ],
  admin: [
    { to: "/dashboard/admin", label: "Dashboard", icon: FiGrid, end: true },
    { to: "/discover", label: "All Projects", icon: FiSearch },
    { to: "/my-projects", label: "Projects", icon: FiFolder },
    { to: "/applications", label: "Applications", icon: FiClipboard },
    { to: "/leaderboard", label: "Leaderboard", icon: FiAward },
    { to: "/notifications", label: "Notifications", icon: FiBell },
    { to: "/profile", label: "Profile", icon: FiUser },
  ],
};

const linkClass = ({ isActive }) =>
  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
    isActive
      ? "bg-amber-400 text-[#101820] shadow-sm"
      : "text-stone-300 hover:bg-white/10 hover:text-amber-100"
  }`;

const SidebarContent = ({ links, user, unreadCount, onNavigate, onLogout }) => (
  <div className="flex flex-col h-full">
    <div className="h-16 flex items-center gap-2.5 px-5 border-b border-white/10">
      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-200 to-amber-500 flex items-center justify-center">
        <span className="text-[#101820] font-bold text-sm">IH</span>
      </div>
      <span className="font-bold text-white">ImpactHub</span>
    </div>
    <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
      {links.map((l) => (
        <NavLink key={l.to} to={l.to} end={l.end} className={linkClass} onClick={onNavigate}>
          <l.icon size={18} />
          {l.label}
          {l.label === "Notifications" && unreadCount > 0 && (
            <span className="ml-auto bg-brand-600 text-white text-[10px] font-bold min-w-5 h-5 px-1 rounded-full flex items-center justify-center">{unreadCount > 9 ? "9+" : unreadCount}</span>
          )}
        </NavLink>
      ))}
    </nav>
    <div className="p-3 border-t border-white/10">
      <div className="flex items-center gap-3 px-3 py-2 mb-1">
        <Avatar src={user?.profilePicture || user?.avatar} name={user?.name} size="sm" />
        <div className="min-w-0">
          <p className="text-sm font-medium text-white truncate">{user?.name}</p>
          <p className="text-xs text-stone-400 capitalize">{user?.role}</p>
        </div>
      </div>
      <button onClick={onLogout} className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10">
        <FiLogOut size={16} /> Sign out
      </button>
    </div>
  </div>
);

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { notifications, unreadCount, markRead } = useNotifications();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [inboxOpen, setInboxOpen] = useState(false);
  const inboxRef = useRef(null);

  const links = NAV[user?.role] || NAV.student;
  const closeSidebar = () => setSidebarOpen(false);
  const handleLogout = () => { logout(); navigate("/"); };

  useEffect(() => {
    const onClick = (event) => {
      if (inboxRef.current && !inboxRef.current.contains(event.target)) setInboxOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div className="min-h-screen app-surface flex">
      <aside className="hidden lg:flex w-64 shrink-0 bg-[#101820] border-r border-white/5 flex-col fixed inset-y-0 left-0 z-40">
        <SidebarContent links={links} user={user} unreadCount={unreadCount} onNavigate={closeSidebar} onLogout={handleLogout} />
      </aside>

      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/50" onClick={closeSidebar} />
          <aside className="relative w-[min(18rem,85vw)] bg-[#101820] h-full shadow-xl animate-slide-up">
          <button className="absolute top-4 right-3 p-2 text-stone-300" onClick={closeSidebar} aria-label="Close menu"><FiX /></button>
            <SidebarContent links={links} user={user} unreadCount={unreadCount} onNavigate={closeSidebar} onLogout={handleLogout} />
          </aside>
        </div>
      )}

      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen min-w-0">
        <header className="sticky top-0 z-30 h-16 bg-[#fbfaf7]/85 dark:bg-slate-900/80 backdrop-blur-xl border-b border-amber-900/10 dark:border-slate-800 flex items-center justify-between gap-3 px-4 sm:px-6">
          <button className="lg:hidden p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
            <FiMenu size={20} />
          </button>
          <p className="hidden sm:block text-sm font-medium text-slate-500 truncate">ImpactHub workspace</p>
          <div className="flex-1" />
          <div className="flex items-center gap-1 sm:gap-2">
            <button onClick={toggleTheme} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500" aria-label="Toggle theme">
              {theme === "dark" ? <FiSun size={18} /> : <FiMoon size={18} />}
            </button>
            <div className="relative" ref={inboxRef}>
              <button onClick={() => setInboxOpen((open) => !open)} className="relative p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500" aria-label="Notifications">
                <FiBell size={18} />
                {unreadCount > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-brand-600 rounded-full" />}
              </button>
              {inboxOpen && (
                <div className="absolute right-0 mt-2 w-[min(22rem,calc(100vw-2rem))] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden">
                  <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <p className="text-sm font-semibold">Notifications</p>
                    <Link to="/notifications" onClick={() => setInboxOpen(false)} className="text-xs font-semibold text-brand-600">View all</Link>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.slice(0, 6).map((item) => (
                      <Link key={item.id} to={item.link} onClick={() => { markRead(item.id); setInboxOpen(false); }} className="block px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 border-b border-slate-50 dark:border-slate-800 last:border-0">
                        <p className={`text-sm ${item.read ? "text-slate-600 dark:text-slate-300" : "font-semibold text-slate-900 dark:text-white"}`}>{item.message}</p>
                        <p className="text-xs text-slate-400 mt-1">{timeAgo(item.createdAt)}</p>
                      </Link>
                    ))}
                    {notifications.length === 0 && <p className="px-4 py-8 text-sm text-slate-400 text-center">No notifications yet.</p>}
                  </div>
                </div>
              )}
            </div>
            <Link to="/profile"><Avatar src={user?.profilePicture || user?.avatar} name={user?.name} size="sm" /></Link>
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8 animate-fade-in w-full max-w-7xl mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
