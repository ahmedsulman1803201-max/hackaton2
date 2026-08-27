import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiFolder, FiClipboard, FiAward, FiArrowRight, FiCheckSquare, FiMessageSquare, FiBell } from "react-icons/fi";
import ProjectCard from "../../components/projects/ProjectCard";
import Badge from "../../components/ui/Badge";
import StatCard from "../../components/ui/StatCard";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import EmptyState from "../../components/ui/EmptyState";
import { getStatusBadge, timeAgo } from "../../data/mockData";
import { getMyApplications, getProjects, getTasks } from "../../services/projects";
import { useAuth } from "../../context/useAuth";
import { useNotifications } from "../../context/useNotifications";
import { entityId } from "../../utils/ids";

const StudentDashboard = () => {
  const { user } = useAuth();
  const { notifications } = useNotifications();
  const [projects, setProjects] = useState([]);
  const [applications, setApplications] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    Promise.all([getProjects(), getMyApplications().catch(() => []), getTasks().catch(() => [])])
      .then(([allProjects, apps, assignedTasks]) => {
        if (!active) return;
        setProjects(allProjects);
        setApplications(apps);
        setTasks(assignedTasks);
      })
      .catch((requestError) => active && setError(requestError.response?.data?.message || "Could not load dashboard."))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  const joined = projects.filter((project) => project.memberIds.includes(user.id));
  const pendingApps = applications.filter((application) => application.status === "pending");
  const recommended = projects.filter((project) => ["approved", "active", "recruiting"].includes(project.status) && !project.memberIds.includes(user.id)).slice(0, 3);
  const firstName = user.name?.split(" ")[0] || "there";

  if (loading) return <LoadingSpinner label="Loading your dashboard..." />;

  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-brand-900 text-white p-6 sm:p-8">
        <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-brand-500/20 blur-2xl" />
        <div className="relative">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-200 mb-2">Student workspace</p>
          <h1 className="text-2xl sm:text-3xl font-bold">Welcome back, {firstName}</h1>
          <p className="text-slate-300 text-sm mt-2 max-w-2xl">Track projects, tasks, applications, and discussion activity in one place.</p>
        </div>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard icon={FiFolder} label="Projects joined" value={joined.length} color="text-brand-600" />
        <StatCard icon={FiCheckSquare} label="Assigned tasks" value={tasks.length} color="text-emerald-600" />
        <StatCard icon={FiClipboard} label="Pending applications" value={pendingApps.length} color="text-amber-600" />
        <StatCard icon={FiAward} label="Skills listed" value={user.skills?.length || 0} color="text-sky-600" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-900 dark:text-white">My tasks</h2>
            <Link to="/tasks" className="text-sm text-brand-600 font-semibold">View all</Link>
          </div>
          {tasks.length === 0 ? (
            <p className="text-sm text-slate-400 py-4 text-center">No tasks assigned yet.</p>
          ) : (
            <div className="space-y-2">
              {tasks.slice(0, 5).map((task) => {
                const projectId = entityId(task.project);
                const st = getStatusBadge(task.status);
                return (
                  <Link key={entityId(task.id)} to={projectId ? `/projects/${projectId}/tasks` : "/tasks"} className="flex items-center justify-between gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    <span className="text-sm font-medium text-slate-900 dark:text-white truncate">{task.title}</span>
                    <Badge className={st.cls}>{st.label}</Badge>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-900 dark:text-white">Applications</h2>
            <Link to="/applications" className="text-sm text-brand-600 font-semibold">View all</Link>
          </div>
          {applications.length === 0 ? (
            <p className="text-sm text-slate-400 py-4 text-center">No applications yet. <Link to="/discover" className="text-brand-600">Discover projects</Link></p>
          ) : (
            <div className="space-y-2">
              {applications.slice(0, 5).map((application) => {
                const title = application.project?.title || "Project";
                const st = getStatusBadge(application.status);
                return (
                  <div key={entityId(application.id)} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                    <span className="text-sm font-medium truncate">{title}</span>
                    <Badge className={st.cls}>{st.label}</Badge>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-900 dark:text-white inline-flex items-center gap-2"><FiBell /> Recent notifications</h2>
            <Link to="/notifications" className="text-sm text-brand-600 font-semibold">Inbox</Link>
          </div>
          {notifications.length === 0 ? (
            <p className="text-sm text-slate-400 py-4 text-center">No notifications yet.</p>
          ) : (
            <div className="space-y-2">
              {notifications.slice(0, 5).map((item) => (
                <Link key={item.id} to={item.link} className="block p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800">
                  <p className={`text-sm ${item.read ? "text-slate-600 dark:text-slate-300" : "font-semibold text-slate-900 dark:text-white"}`}>{item.message}</p>
                  <p className="text-xs text-slate-400 mt-1">{timeAgo(item.createdAt)}</p>
                </Link>
              ))}
            </div>
          )}
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-900 dark:text-white inline-flex items-center gap-2"><FiMessageSquare /> Project discussions</h2>
          </div>
          {joined.length === 0 ? (
            <EmptyState title="No joined projects" description="Approved applications unlock project discussions." />
          ) : (
            <div className="space-y-2">
              {joined.slice(0, 5).map((project) => (
                <Link key={project.id} to={`/projects/${project.id}/discussion`} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-medium">
                  {project.title} <FiArrowRight size={14} className="text-slate-400" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-slate-900 dark:text-white">Joined projects</h2>
          <Link to="/my-projects" className="text-sm text-brand-600 font-semibold inline-flex items-center gap-1">View all <FiArrowRight size={14} /></Link>
        </div>
        {joined.length === 0 ? (
          <p className="text-sm text-slate-400">You haven&apos;t joined any projects yet.</p>
        ) : (
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {joined.map((project) => <ProjectCard key={project.id} project={project} compact />)}
          </div>
        )}
      </div>

      {recommended.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-900 dark:text-white">Recommended for you</h2>
            <Link to="/discover" className="text-sm text-brand-600 font-semibold">Discover more</Link>
          </div>
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {recommended.map((project) => <ProjectCard key={project.id} project={project} compact />)}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
