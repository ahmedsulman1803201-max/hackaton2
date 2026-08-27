const AuthLayout = ({ children, title, subtitle }) => (
  <div className="min-h-screen grid lg:grid-cols-2 bg-slate-50 dark:bg-slate-950">
    <div className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-amber-500 via-amber-600 to-amber-800 p-12 text-white">
      <div>
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center font-bold">IH</div>
          <span className="text-xl font-bold">ImpactHub</span>
        </div>
        <h2 className="mt-12 text-3xl font-extrabold leading-tight">
          Empower communities.<br />Track real impact.
        </h2>
        <p className="mt-4 text-amber-100 max-w-md">
          Join students, project managers, and admins collaborating on meaningful community projects.
        </p>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {[
          { v: "50+", l: "Projects" },
          { v: "1.2K", l: "Volunteers" },
          { v: "15K", l: "Impact Hrs" },
        ].map((s) => (
          <div key={s.l} className="bg-white/10 rounded-xl p-4 backdrop-blur">
            <p className="text-2xl font-bold">{s.v}</p>
            <p className="text-xs text-amber-200">{s.l}</p>
          </div>
        ))}
      </div>
    </div>
    <div className="flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md animate-fade-in">
        <div className="lg:hidden flex items-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-bold text-sm">IH</div>
          <span className="font-bold text-lg">ImpactHub</span>
        </div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{title}</h1>
          {subtitle && <p className="text-slate-500 text-sm mt-1">{subtitle}</p>}
        </div>
        {children}
      </div>
    </div>
  </div>
);

export default AuthLayout;
