const PageHeader = ({ title, description, action, className = "" }) => (
  <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2 ${className}`}>
    <div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{title}</h1>
      {description && <p className="text-slate-500 text-sm mt-1">{description}</p>}
    </div>
    {action && <div className="shrink-0">{action}</div>}
  </div>
);

export default PageHeader;
