import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { FiArrowLeft, FiUsers, FiCheckSquare, FiMessageSquare } from "react-icons/fi";
import Badge from "../ui/Badge";
import { getStatusBadge } from "../../data/mockData";
import { getProject } from "../../services/projects";

const ProjectSubNav = () => {
  const { id } = useParams();
  const { pathname } = useLocation();
  const [project, setProject] = useState(null);

  useEffect(() => {
    let active = true;
    getProject(id).then((data) => active && setProject(data)).catch(() => active && setProject(null));
    return () => { active = false; };
  }, [id]);

  const status = getStatusBadge(project?.status);
  const tabs = [
    { to: `/projects/${id}`, label: "Overview", icon: FiUsers, exact: true },
    { to: `/projects/${id}/tasks`, label: "Tasks", icon: FiCheckSquare },
    { to: `/projects/${id}/discussion`, label: "Discussion", icon: FiMessageSquare },
  ];

  const isActive = (tab) => tab.exact ? pathname === tab.to : pathname.startsWith(tab.to);

  return (
    <div className="mb-6">
      <Link to="/discover" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-brand-600 mb-3">
        <FiArrowLeft size={14} /> Back to Discover
      </Link>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            {project && <Badge className={status.cls}>{status.label}</Badge>}
            {project?.category && <span className="text-xs text-brand-600 font-medium">{project.category}</span>}
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{project?.title || "Project"}</h1>
        </div>
      </div>
      <nav className="mt-4 flex gap-1 overflow-x-auto border-b border-slate-200 dark:border-slate-800">
        {tabs.map((tab) => (
          <Link
            key={tab.to}
            to={tab.to}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              isActive(tab)
                ? "border-brand-600 text-brand-600"
                : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            <tab.icon size={15} /> {tab.label}
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default ProjectSubNav;
