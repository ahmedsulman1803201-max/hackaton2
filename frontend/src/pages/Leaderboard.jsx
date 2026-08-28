import { useEffect, useState } from "react";
import PublicNavbar from "../components/layout/PublicNavbar";
import PublicFooter from "../components/layout/PublicFooter";
import Avatar from "../components/ui/Avatar";
import Badge from "../components/ui/Badge";
import EmptyState from "../components/ui/EmptyState";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import api from "../services/api";
import { useAuth } from "../context/useAuth";
import { entityId } from "../utils/ids";
import { FiAward, FiTrendingUp } from "react-icons/fi";

const Leaderboard = () => {
  const { user } = useAuth();
  const [entries, setEntries] = useState([]);
  const [sort, setSort] = useState("totalScore");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    api.get("/scores/leaderboard", { params: { limit: 100, sort } })
      .then(({ data }) => active && setEntries(data.data.leaderboard || []))
      .catch((requestError) => active && setError(requestError.response?.data?.message || "Unable to load the live scoreboard."));
    return () => { active = false; };
  }, [sort]);

  const ownRank = entries.find((entry) => entityId(entry.volunteer) === user?.id);
  const topThree = entries.slice(0, 3);
  const rankStyle = ["bg-[#d5a329] text-[#101820]", "bg-slate-300 text-slate-800", "bg-amber-700 text-white"];
  return <div className="min-h-screen app-surface"><PublicNavbar />
    <section className="relative overflow-hidden bg-[#101820] hero-grid text-white"><div className="absolute -right-12 -top-12 w-64 h-64 rounded-full bg-amber-400/20 blur-3xl" /><div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 text-center reveal-up"><div className="mx-auto w-12 h-12 rounded-2xl bg-amber-400 text-[#101820] flex items-center justify-center shadow-xl shadow-amber-500/20"><FiAward size={24} /></div><p className="mt-5 text-xs font-bold tracking-[.2em] text-amber-300">CONTRIBUTION RANKINGS</p><h1 className="mt-2 text-3xl sm:text-4xl font-bold">Impact Leaderboard</h1><p className="mt-3 text-stone-300">Celebrate the volunteers turning completed work into measurable community impact.</p></div></section>
    <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">{user && <div className="mb-6 flex items-center justify-between gap-4 rounded-2xl bg-gradient-to-r from-[#101820] to-[#263642] p-5 text-white shadow-lg"><div><p className="text-xs font-semibold tracking-wide text-amber-300">YOUR POSITION</p><p className="mt-1 text-lg font-bold">{ownRank ? `You are ranked #${ownRank.rank}` : "Complete a scored task to join the rankings"}</p></div><FiTrendingUp className="text-amber-300" size={28} /></div>}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6"><div><h2 className="text-xl font-bold">Community leaders</h2><p className="text-sm text-slate-500 mt-1">Updated from approved task scores.</p></div><label className="text-sm font-medium text-slate-600 dark:text-slate-300">Rank by <select aria-label="Leaderboard ranking" value={sort} onChange={(event) => setSort(event.target.value)} className="ml-2 rounded-xl border border-amber-900/15 bg-white dark:bg-slate-900 px-3 py-2 outline-none focus:ring-2 focus:ring-brand-500"><option value="totalScore">Total marks</option><option value="completed">Completed tasks</option><option value="average">Average marks</option></select></label></div>
      {error ? <EmptyState title="Scoreboard unavailable" description={error} /> : entries.length === 0 ? <LoadingSpinner label="Loading live scores..." /> : <><div className="grid sm:grid-cols-3 gap-4 mb-8">{topThree.map((entry, index) => { const volunteer = entry.volunteer || {}; return <article key={entry.id} className={`professional-card rounded-2xl bg-white dark:bg-slate-900 p-5 text-center reveal-up ${index === 0 ? "sm:-translate-y-2" : ""}`}><span className={`mx-auto flex w-9 h-9 items-center justify-center rounded-full font-black ${rankStyle[index]}`}>#{entry.rank}</span><div className="mt-4 flex justify-center"><Avatar src={volunteer.profilePicture} name={volunteer.name} size="lg" /></div><p className="mt-3 font-bold truncate">{volunteer.name || "Volunteer"}</p><p className="mt-1 text-2xl font-extrabold text-brand-600">{entry.totalScore}</p><p className="text-xs text-slate-400">impact points</p></article>; })}</div><div className="space-y-3">{entries.slice(3).map((entry) => { const volunteer = entry.volunteer || {}; return <article key={entry.id} className="professional-card flex items-center gap-4 rounded-2xl bg-white dark:bg-slate-900 p-4 transition-transform hover:-translate-y-0.5"><span className="w-8 text-center font-bold text-brand-600">#{entry.rank}</span><Avatar src={volunteer.profilePicture} name={volunteer.name} /><div className="flex-1 min-w-0"><p className="font-semibold truncate">{volunteer.name || "Volunteer"}</p><div className="flex gap-2 mt-1"><Badge className="bg-amber-50 text-amber-800 dark:bg-amber-500/10">{entry.tasksCompleted} completed</Badge><Badge className="bg-slate-100 text-slate-600 dark:bg-slate-800">avg {entry.averageScore}</Badge></div></div><div className="text-right"><p className="text-xl font-extrabold text-brand-600">{entry.totalScore}</p><p className="text-xs text-slate-400">points</p></div></article>; })}</div></>}</main><PublicFooter /></div>;
};

export default Leaderboard;
