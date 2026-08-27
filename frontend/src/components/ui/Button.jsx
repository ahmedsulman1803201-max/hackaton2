const Button = ({ children, variant = "primary", size = "md", className = "", loading, ...props }) => {
  const base = "inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60";
  const variants = {
    primary: "bg-gradient-to-r from-brand-500 to-amber-500 hover:from-brand-400 hover:to-amber-400 text-slate-950 shadow-lg shadow-brand-500/20",
    secondary: "border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800",
    ghost: "text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-500/10",
    danger: "bg-red-600 hover:bg-red-700 text-white",
  };
  const sizes = { sm: "px-3 py-2 text-sm", md: "px-5 py-2.5 text-sm", lg: "px-6 py-3 text-base" };

  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} disabled={loading || props.disabled} {...props}>
      {loading ? (
        <>
          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          Loading...
        </>
      ) : children}
    </button>
  );
};

export default Button;
