const AuthLayout = ({ children, title, subtitle }) => (
  <div className="min-h-screen grid lg:grid-cols-2 bg-slate-100 dark:bg-slate-950">
    <div className="relative hidden overflow-hidden lg:flex flex-col justify-between bg-gradient-to-br from-amber-400 via-amber-600 to-orange-800 p-12 text-white">
      <div className="absolute -top-20 -right-16 h-72 w-72 rounded-full bg-white/10" />
      <div className="absolute bottom-24 -left-20 h-56 w-56 rounded-full border-[28px] border-white/10" />
      <div>
        <div className="relative flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-white text-amber-600 shadow-lg flex items-center justify-center font-bold">IH</div>
          <span className="text-xl font-bold">ImpactHub</span>
        </div>
        <p className="relative mt-16 inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-semibold tracking-wide">COMMUNITY COLLABORATION</p>
        <h2 className="relative mt-4 text-4xl font-extrabold leading-tight">
          Empower communities.<br />Track real impact.
        </h2>
        <p className="relative mt-4 text-amber-100 max-w-md leading-relaxed">
          Join students, project managers, and admins collaborating on meaningful community projects.
        </p>
      </div>
      <div className="relative grid grid-cols-3 gap-4">
        {[
          { v: "50+", l: "Projects" },
          { v: "1.2K", l: "Volunteers" },
          { v: "15K", l: "Impact Hrs" },
        ].map((s) => (
          <div key={s.l} className="bg-white/10 rounded-2xl p-4 backdrop-blur border border-white/10">
            <p className="text-2xl font-bold">{s.v}</p>
            <p className="text-xs text-amber-200">{s.l}</p>
          </div>
        ))}
      </div>
    </div>
    <div className="flex items-center justify-center px-4 py-10 sm:px-6">
      <div className="w-full max-w-md animate-fade-in rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xl shadow-slate-300/40 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none sm:p-8">
        <div className="lg:hidden flex items-center gap-2 mb-10">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-bold text-sm shadow-md">IH</div>
          <span className="font-bold text-lg">ImpactHub</span>
        </div>
        <div className="mb-7">
          <div className="mb-3 h-1.5 w-10 rounded-full bg-amber-500" />
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">{title}</h1>
          {subtitle && <p className="text-slate-500 text-sm mt-2">{subtitle}</p>}
        </div>
        {children}
      </div>
    </div>
  </div>
);

export default AuthLayout;
