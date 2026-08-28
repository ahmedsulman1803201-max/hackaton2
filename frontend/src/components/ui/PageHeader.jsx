const PageHeader = ({ title, description, action, className = "" }) => (
  <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2 ${className}`}>
    <div>
      <div className="h-1 w-9 rounded-full bg-gradient-to-r from-brand-500 to-amber-400 mb-3" />
      <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{title}</h1>
      {description && <p className="text-slate-500 text-sm mt-1.5">{description}</p>}
    </div>
    {action && <div className="shrink-0">{action}</div>}
  </div>
);

export default PageHeader;
