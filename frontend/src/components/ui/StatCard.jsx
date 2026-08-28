const StatCard = ({ icon: Icon, label, value, trend, color = "text-brand-600" }) => (
  <div className="professional-card bg-white dark:bg-slate-900 rounded-2xl p-5 hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between">
      {Icon && (
        <div className={`w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-500/10 flex items-center justify-center ${color}`}>
          <Icon size={18} />
        </div>
      )}
      {trend && <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full">{trend}</span>}
    </div>
    <p className="mt-3 text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
    <p className="text-sm text-slate-500 mt-0.5">{label}</p>
  </div>
);

export default StatCard;
