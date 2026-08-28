import { Link } from "react-router-dom";
import { FiAlertTriangle } from "react-icons/fi";

const ErrorState = ({ title = "Something went wrong", description, actionLabel, actionTo = "/" }) => (
  <div className="flex flex-col items-center justify-center py-16 px-4 text-center animate-fade-in">
    <div className="w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center mb-4">
      <FiAlertTriangle className="text-red-500" size={24} />
    </div>
    <h3 className="font-semibold text-slate-900 dark:text-white">{title}</h3>
    {description && <p className="text-sm text-slate-500 mt-1 max-w-sm">{description}</p>}
    {actionLabel && (
      <Link to={actionTo} className="mt-4 text-sm font-semibold text-brand-600 hover:text-brand-700">
        {actionLabel}
      </Link>
    )}
  </div>
);

export default ErrorState;
