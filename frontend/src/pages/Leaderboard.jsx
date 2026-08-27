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
  return <div className="min-h-screen bg-slate-50 dark:bg-slate-950"><PublicNavbar /><main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10"><div className="text-center mb-8"><h1 className="text-3xl font-bold">Impact Leaderboard</h1><p className="text-slate-500 mt-1">Live MongoDB-backed contribution rankings.</p></div><div className="flex justify-end mb-5"><label className="text-sm text-slate-500">Rank by <select aria-label="Leaderboard ranking" value={sort} onChange={(event) => setSort(event.target.value)} className="ml-2 rounded-lg border p-2 bg-white dark:bg-slate-900"><option value="totalScore">Total marks</option><option value="completed">Completed tasks</option><option value="average">Average marks</option></select></label></div>{user && <div className="bg-brand-600 text-white rounded-2xl p-4 mb-6">Your current rank: <strong>{ownRank ? `#${ownRank.rank}` : "Not ranked yet"}</strong></div>}{error ? <EmptyState title="Scoreboard unavailable" description={error} /> : entries.length === 0 ? <LoadingSpinner label="Loading live scores..." /> : <div className="space-y-3">{entries.map((entry) => { const volunteer = entry.volunteer || {}; return <article key={entry.id} className="flex items-center gap-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4"><span className="w-8 text-center font-bold text-brand-600">#{entry.rank}</span><Avatar src={volunteer.profilePicture} name={volunteer.name} /><div className="flex-1 min-w-0"><p className="font-semibold truncate">{volunteer.name || "Volunteer"}</p><div className="flex gap-2 mt-1"><Badge className="bg-slate-100 text-slate-600 dark:bg-slate-800">{entry.tasksCompleted} completed</Badge><Badge className="bg-slate-100 text-slate-600 dark:bg-slate-800">avg {entry.averageScore}</Badge></div></div><div className="text-right"><p className="text-xl font-extrabold text-brand-600">{entry.totalScore}</p><p className="text-xs text-slate-400">contribution points</p></div></article>; })}</div>}</main><PublicFooter /></div>;
};

export default Leaderboard;
