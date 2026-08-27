import { Link } from "react-router-dom";
import { FiArrowRight, FiMapPin, FiUsers } from "react-icons/fi";
import Badge from "../ui/Badge";
import ProgressBar from "../ui/ProgressBar";
import ProjectImage from "../ui/ProjectImage";
import { getStatusBadge } from "../../data/mockData";

const ProjectCard = ({ project, compact = false }) => {
  const status = getStatusBadge(project.status);

  return (
    <Link
      to={`/projects/${project.id}`}
      className="group block bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-lg hover:border-brand-200 dark:hover:border-brand-500/30 transition-all duration-300"
    >
      {!compact && (
        <div className="aspect-[16/9] overflow-hidden relative">
          <ProjectImage src={project.image || project.projectImage} alt={project.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          {project.featured && (
            <span className="absolute top-3 left-3 bg-accent-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">Featured</span>
          )}
          <Badge className={`absolute top-3 right-3 ${status.cls}`}>{status.label}</Badge>
        </div>
      )}
      <div className="p-5">
        {compact && <Badge className={`mb-2 ${status.cls}`}>{status.label}</Badge>}
        <span className="text-xs font-medium text-brand-600 dark:text-brand-400">{project.category}</span>
        <h3 className="mt-1 font-bold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors line-clamp-1">
          {project.title}
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{project.description}</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {(project.skillsNeeded || []).slice(0, 3).map((s) => (
            <span key={s} className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-md">{s}</span>
          ))}
        </div>
        <div className="mt-4 flex items-center gap-3 text-xs text-slate-400">
          <span className="inline-flex items-center gap-1"><FiMapPin size={12} /> {project.location}</span>
          <span className="inline-flex items-center gap-1"><FiUsers size={12} /> {project.volunteersJoined}/{project.volunteersNeeded}</span>
        </div>
        {!compact && (
          <div className="mt-3">
            <ProgressBar value={project.volunteersJoined} max={project.volunteersNeeded} />
          </div>
        )}
        <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-brand-600 dark:text-brand-400 group-hover:gap-2 transition-all">
          View project <FiArrowRight size={14} />
        </span>
      </div>
    </Link>
  );
};

export default ProjectCard;
