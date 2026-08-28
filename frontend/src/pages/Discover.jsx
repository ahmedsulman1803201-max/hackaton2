import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { FiSearch, FiFilter, FiSliders } from "react-icons/fi";
import PublicNavbar from "../components/layout/PublicNavbar";
import PublicFooter from "../components/layout/PublicFooter";
import ProjectCard from "../components/projects/ProjectCard";
import EmptyState from "../components/ui/EmptyState";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import { PROJECT_CATEGORIES, SORT_OPTIONS } from "../data/mockData";
import { getProjects } from "../services/projects";

const sortProjects = (list, sort) => {
  const copy = [...list];
  switch (sort) {
    case "popular": return copy.sort((a, b) => b.volunteersJoined - a.volunteersJoined);
    case "rating": return copy.sort((a, b) => b.rating - a.rating);
    case "volunteers": return copy.sort((a, b) => b.volunteersNeeded - b.volunteersJoined - (a.volunteersNeeded - a.volunteersJoined));
    default: return copy.sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
  }
};

const Discover = () => {
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [category, setCategory] = useState("All");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState("newest");
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    getProjects()
      .then((data) => active && setProjects(data))
      .catch((requestError) => active && setError(requestError.response?.data?.message || "Could not load projects."))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  const filtered = useMemo(() => {
    const list = projects.filter((p) => {
      const q = search.toLowerCase();
      const matchSearch = !q || p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.skillsNeeded.some((s) => s.toLowerCase().includes(q));
      const matchCat = category === "All" || p.category === category;
      const normalizedStatus = status === "recruiting" ? "approved" : status;
      const matchStatus = status === "all" || p.status === normalizedStatus;
      return matchSearch && matchCat && matchStatus;
    });
    return sortProjects(list, sort);
  }, [projects, search, category, status, sort]);

  return (
    <div className="min-h-screen app-surface">
      <PublicNavbar />

      <div className="relative overflow-hidden bg-[#101820] text-white border-b border-amber-300/10">
        <div className="absolute right-0 top-0 h-40 w-40 translate-x-10 -translate-y-10 rounded-full bg-amber-400/20 blur-2xl" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <p className="text-xs font-bold tracking-[.18em] text-amber-300">OPPORTUNITIES</p>
          <h1 className="mt-2 text-3xl font-bold">Discover Projects</h1>
          <p className="text-stone-300 mt-1">Find community projects that match your skills and interests</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="professional-card bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-6 mb-7 reveal-up">
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="flex-1 flex items-center bg-amber-50/70 dark:bg-slate-800/50 rounded-2xl px-4 py-3 focus-within:ring-2 focus-within:ring-brand-500">
              <FiSearch className="text-brand-600 shrink-0" size={18} />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by title, skill, or keyword..."
                className="w-full px-3 outline-none text-sm bg-transparent" />
            </div>
            <div className="flex flex-wrap gap-2">
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-amber-900/15 dark:border-slate-700 bg-white dark:bg-slate-900">
                <FiFilter size={14} className="text-slate-400" />
                <select value={status} onChange={(e) => setStatus(e.target.value)}
                  className="text-sm bg-transparent outline-none">
                  <option value="all">All Status</option>
                  <option value="recruiting">Recruiting</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-amber-900/15 dark:border-slate-700 bg-white dark:bg-slate-900">
                <FiSliders size={14} className="text-slate-400" />
                <select value={sort} onChange={(e) => setSort(e.target.value)}
                  className="text-sm bg-transparent outline-none">
                  {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            {PROJECT_CATEGORIES.map((cat) => (
              <button key={cat} onClick={() => setCategory(cat)}
                className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  category === cat ? "bg-[#101820] text-amber-300 shadow-md" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-amber-50 dark:hover:bg-slate-700"
                }`}>{cat}</button>
            ))}
          </div>
          {(search || category !== "All" || status !== "all" || sort !== "newest") && (
            <button type="button" onClick={() => { setSearch(""); setCategory("All"); setStatus("all"); setSort("newest"); }} className="mt-4 text-sm font-semibold text-brand-600 hover:underline">Clear filters</button>
          )}
        </div>

        {error && <p className="text-sm text-red-600 mb-4">{error}</p>}
        <p className="text-sm text-slate-500 mb-5"><span className="font-bold text-brand-700">{filtered.length}</span> project{filtered.length !== 1 ? "s" : ""} found</p>

        {loading ? (
          <LoadingSpinner label="Searching projects..." />
        ) : filtered.length === 0 ? (
          <EmptyState icon={FiSearch} title="No projects found" description="Try adjusting your search, filters, or sort order." />
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 reveal-up-delay">
            {filtered.map((p) => <ProjectCard key={p.id} project={p} />)}
          </div>
        )}
      </div>
      <PublicFooter />
    </div>
  );
};

export default Discover;
