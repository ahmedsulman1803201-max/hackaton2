const Button = ({ children, variant = "primary", size = "md", className = "", loading, ...props }) => {
  const base = "inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:hover:translate-y-0";
  const variants = {
    primary: "bg-gradient-to-r from-[#b88013] to-[#e2b448] hover:from-[#9f6b0c] hover:to-[#d5a329] text-[#101820] shadow-lg shadow-amber-700/20",
    secondary: "border border-amber-900/15 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-amber-500/40 hover:bg-amber-50/60 dark:hover:bg-slate-800",
    ghost: "text-brand-700 hover:bg-brand-50 dark:hover:bg-brand-500/10",
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
