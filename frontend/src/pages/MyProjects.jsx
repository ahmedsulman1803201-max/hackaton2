import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiFolder } from "react-icons/fi";
import ProjectCard from "../components/projects/ProjectCard";
import Badge from "../components/ui/Badge";
import EmptyState from "../components/ui/EmptyState";
import { getStatusBadge } from "../data/mockData";
import { getMyApplications, getProjects } from "../services/projects";
import { useAuth } from "../context/useAuth";

const MyProjects = () => {
  const { user } = useAuth();
  const [tab, setTab] = useState("joined");
  const [projects, setProjects] = useState([]);
  const [applications, setApplications] = useState([]);
  const [error, setError] = useState("");
  useEffect(() => {
    getProjects().then(setProjects).catch((requestError) => setError(requestError.response?.data?.message || "Could not load projects."));
    if (user.role === "student") {
      getMyApplications().then(setApplications).catch(() => setApplications([]));
    }
  }, [user.role]);
  const managed = projects.filter((p) => p.managerId === user.id);
  const joined = projects.filter((p) => p.memberIds.includes(user.id));
  const appliedProjects = applications
    .map((application) => ({
      ...(application.project || {}),
      id: application.project?.id || application.project?._id || application.project,
      application,
    }))
    .filter((project) => project.id);

  const tabs = user.role === "manager" || user.role === "admin"
    ? [
        { id: "managed", label: "Managing", count: managed.length },
        { id: "joined", label: "Joined", count: joined.length },
        { id: "applied", label: "Applied", count: appliedProjects.length },
      ]
    : [
        { id: "joined", label: "Joined", count: joined.length },
        { id: "applied", label: "Applied", count: appliedProjects.length },
      ];

  const list = tab === "managed" ? managed : tab === "joined" ? joined : appliedProjects;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Projects</h1>
          <p className="text-slate-500 text-sm mt-1">Projects you're managing, joined, or applied to</p>
        </div>
        {(user.role === "manager" || user.role === "admin") && (
          <Link to="/projects/new" className="inline-flex bg-brand-600 text-white font-semibold px-4 py-2 rounded-xl text-sm hover:bg-brand-700">Create Project</Link>
        )}
      </div>

      <div className="flex gap-2 overflow-x-auto">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
              tab === t.id ? "bg-brand-600 text-white" : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600"
            }`}>
            {t.label} ({t.count})
          </button>
        ))}
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}

      {list.length === 0 ? (
        <EmptyState icon={FiFolder} title="No projects here" description="Explore projects and start making an impact."
          action={<Link to="/discover" className="text-brand-600 font-semibold text-sm">Discover Projects</Link>} />
      ) : tab === "applied" ? (
        <div className="space-y-3">
          {appliedProjects.map((p) => {
            const st = getStatusBadge(p.application.status);
            return (
              <div key={p.id} className="flex items-center justify-between bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
                <div>
                  <Link to={`/projects/${p.id}`} className="font-semibold text-slate-900 dark:text-white hover:text-brand-600">{p.title}</Link>
                  <p className="text-sm text-slate-500 mt-0.5">{p.category} · {p.location}</p>
                </div>
                <Badge className={st.cls}>{st.label}</Badge>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {list.map((p) => <ProjectCard key={p.id} project={p} />)}
        </div>
      )}
    </div>
  );
};

export default MyProjects;
