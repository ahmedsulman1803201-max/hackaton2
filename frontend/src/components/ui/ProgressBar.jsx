const ProgressBar = ({ value, max = 100, showLabel = true, size = "md" }) => {
  const pct = Math.min(Math.round((value / max) * 100), 100);
  const heights = { sm: "h-1.5", md: "h-2.5", lg: "h-3" };
  return (
    <div>
      {showLabel && (
        <div className="flex justify-between text-xs mb-1.5">
          <span className="font-medium text-brand-600 dark:text-brand-400">{pct}%</span>
          <span className="text-slate-400">{value}/{max}</span>
        </div>
      )}
      <div className={`${heights[size]} bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden`}>
        <div className="h-full bg-gradient-to-r from-brand-500 to-accent-500 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
};

export default ProgressBar;
