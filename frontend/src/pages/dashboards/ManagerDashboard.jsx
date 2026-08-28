import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiPlus, FiUsers, FiFolder, FiClipboard, FiArrowRight, FiMessageSquare, FiBell } from "react-icons/fi";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import ProjectCard from "../../components/projects/ProjectCard";
import Badge from "../../components/ui/Badge";
import PageHeader from "../../components/ui/PageHeader";
import StatCard from "../../components/ui/StatCard";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import EmptyState from "../../components/ui/EmptyState";
import { getStatusBadge, timeAgo } from "../../data/mockData";
import { getManagedApplications, getProjects } from "../../services/projects";
import { useAuth } from "../../context/useAuth";
import { useNotifications } from "../../context/useNotifications";
import { entityId, sameId } from "../../utils/ids";

const ManagerDashboard = () => {
  const { user } = useAuth();
  const { notifications } = useNotifications();
  const [projects, setProjects] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    Promise.all([getProjects(), getManagedApplications().catch(() => [])])
      .then(([allProjects, apps]) => {
        if (!active) return;
        setProjects(allProjects.filter((project) => sameId(project.managerId, user.id)));
        setApplications(apps);
      })
      .catch((requestError) => active && setError(requestError.response?.data?.message || "Could not load dashboard."))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [user.id]);

  const pendingApps = applications.filter((application) => application.status === "pending");
  const totalVolunteers = projects.reduce((sum, project) => sum + (project.volunteersJoined || 0), 0);
  const chartData = projects.map((project) => ({ name: project.title.slice(0, 14), volunteers: project.volunteersJoined || 0, spots: project.volunteersNeeded || 0 }));

  if (loading) return <LoadingSpinner label="Loading manager dashboard..." />;

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600 mb-2">Manager workspace</p>
          <PageHeader title="Project overview" description="Monitor volunteers, applications, and discussion activity." />
        </div>
        <Link to="/projects/new" className="inline-flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold px-4 py-2.5 rounded-xl text-sm">
          <FiPlus size={16} /> New project
        </Link>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard icon={FiFolder} label="My projects" value={projects.length} color="text-brand-600" />
        <StatCard icon={FiUsers} label="Total volunteers" value={totalVolunteers} color="text-emerald-600" />
        <StatCard icon={FiClipboard} label="Pending applications" value={pendingApps.length} color="text-amber-600" />
        <StatCard icon={FiBell} label="Unread alerts" value={notifications.filter((item) => !item.read).length} color="text-sky-600" />
      </div>

      {chartData.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 overflow-hidden">
          <h2 className="font-bold text-slate-900 dark:text-white mb-4">Team capacity</h2>
          <div className="h-64 min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="volunteers" fill="#0f766e" name="Volunteers" radius={[4, 4, 0, 0]} />
                <Bar dataKey="spots" fill="#93c5fd" name="Needed" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold">Recent applications</h2>
            <Link to="/applications" className="text-sm text-brand-600 font-semibold">Review all</Link>
          </div>
          {applications.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-4">No applications yet.</p>
          ) : (
            <div className="space-y-2">
              {applications.slice(0, 5).map((application) => {
                const st = getStatusBadge(application.status);
                return (
                  <div key={entityId(application.id)} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-sm">
                    <div className="min-w-0">
                      <p className="font-medium truncate">{application.project?.title || "Project"}</p>
                      <p className="text-xs text-slate-400 truncate">{application.student?.name}</p>
                    </div>
                    <Badge className={st.cls}>{st.label}</Badge>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6">
          <h2 className="font-bold mb-4 inline-flex items-center gap-2"><FiMessageSquare /> Discussions & alerts</h2>
          {notifications.length === 0 ? (
            <p className="text-sm text-slate-400 py-4 text-center">No notifications yet.</p>
          ) : (
            <div className="space-y-2">
              {notifications.slice(0, 5).map((item) => (
                <Link key={item.id} to={item.link} className="block p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800">
                  <p className={`text-sm ${item.read ? "text-slate-600" : "font-semibold text-slate-900 dark:text-white"}`}>{item.message}</p>
                  <p className="text-xs text-slate-400 mt-1">{timeAgo(item.createdAt)}</p>
                </Link>
              ))}
            </div>
          )}
          <div className="mt-4 space-y-2">
            {projects.slice(0, 4).map((project) => (
              <Link key={project.id} to={`/projects/${project.id}/discussion`} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-medium">
                {project.title} discussion <FiArrowRight size={14} className="text-slate-400" />
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div>
        <h2 className="font-bold mb-4">Your projects</h2>
        {projects.length === 0 ? (
          <EmptyState title="No projects yet" description="Create a project to start recruiting volunteers." action={<Link to="/projects/new" className="text-brand-600 font-semibold text-sm">Create project</Link>} />
        ) : (
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {projects.map((project) => <ProjectCard key={project.id} project={project} />)}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManagerDashboard;
