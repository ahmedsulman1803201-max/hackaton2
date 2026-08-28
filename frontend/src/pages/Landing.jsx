import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiArrowRight, FiUsers, FiTarget, FiTrendingUp, FiCheckCircle, FiSearch, FiClipboard, FiAward, FiBriefcase, FiShield, FiStar } from "react-icons/fi";
import PublicNavbar from "../components/layout/PublicNavbar";
import PublicFooter from "../components/layout/PublicFooter";
import ProjectCard from "../components/projects/ProjectCard";
import Avatar from "../components/ui/Avatar";
import ProjectImage from "../components/ui/ProjectImage";
import teamImage from "../assets/community-team.jpg";
import { landingStats, howItWorks, testimonials } from "../data/mockData";
import { getProjects } from "../services/projects";

const heroImg = teamImage;

const features = [
  { icon: FiTarget, title: "Discover Projects", desc: "Browse community initiatives by category, skills, and location." },
  { icon: FiUsers, title: "Volunteer & Collaborate", desc: "Apply to projects, join teams, and track your contributions." },
  { icon: FiTrendingUp, title: "Measure Impact", desc: "Earn impact scores, climb the leaderboard, and see real results." },
  { icon: FiCheckCircle, title: "Manage with Ease", desc: "Kanban tasks, discussions, reviews, and analytics for project leads." },
];

const stepIcons = [FiSearch, FiClipboard, FiUsers, FiAward];

const Landing = () => {
  const [featured, setFeatured] = useState([]);

  useEffect(() => {
    getProjects().then((projects) => setFeatured(projects.slice(0, 3))).catch(() => setFeatured([]));
  }, []);

  return (
    <div className="min-h-screen professional-page">
      <PublicNavbar />

      <section className="relative overflow-hidden bg-[#101820] hero-grid">
        <div className="absolute w-96 h-96 -right-20 -top-24 rounded-full bg-amber-400/20 hero-orb" />
        <div className="absolute w-72 h-72 left-[42%] -bottom-32 rounded-full bg-amber-200/10 hero-orb" />
        <div className="absolute inset-0 opacity-[.08]">
          <ProjectImage src={heroImg} alt="" className="w-full h-full object-cover" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 grid lg:grid-cols-[1.15fr_.85fr] gap-12 items-center">
          <div className="max-w-2xl reveal-up">
            <span className="inline-flex items-center gap-2 text-amber-200 text-xs font-bold tracking-[.16em] uppercase mb-6"><FiStar /> Premium impact marketplace</span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight tracking-tight">
              Find meaningful work.<br /><span className="text-amber-300">Build real impact.</span>
            </h1>
            <p className="mt-5 text-lg text-amber-100 max-w-xl">
              Connect with verified community projects, skilled volunteers, and ambitious teams — all in one professional workspace.
            </p>
            <div className="mt-8 bg-white rounded-2xl p-2 shadow-2xl flex flex-col sm:flex-row gap-2 max-w-xl">
              <div className="flex items-center gap-2 flex-1 px-3 text-slate-500"><FiSearch className="text-amber-600" /><span className="text-sm">Search projects, skills, or causes</span></div>
              <Link to="/discover" className="inline-flex justify-center items-center gap-2 bg-[#d5a329] hover:bg-[#bd8b18] text-[#101820] font-bold px-5 py-3 rounded-xl transition-colors">Explore now <FiArrowRight /></Link>
            </div>
            <div className="mt-5 flex flex-wrap gap-2 text-xs text-stone-300"><span>Popular:</span>{["Education", "Healthcare", "Environment", "Technology"].map((tag) => <span key={tag} className="border border-white/15 px-3 py-1 rounded-full">{tag}</span>)}</div>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/signup" className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-200 via-amber-400 to-amber-300 text-slate-950 font-bold px-6 py-3 rounded-xl shadow-xl shadow-amber-500/25 hover:-translate-y-1 transition-all">
                Join as volunteer <FiArrowRight />
              </Link>
              <Link to="/discover" className="inline-flex items-center gap-2 border border-amber-300/30 text-white font-semibold px-6 py-3 rounded-xl hover:bg-amber-500/10 backdrop-blur transition-colors">
                Explore Projects
              </Link>
            </div>
          </div>
          <div className="hidden lg:grid grid-cols-2 gap-4 reveal-up-delay">
            {[{ icon: FiBriefcase, title: "Verified projects", text: "Opportunities that matter" }, { icon: FiUsers, title: "Expert community", text: "Grow with great people" }, { icon: FiShield, title: "Trusted workflow", text: "Clear roles & progress" }, { icon: FiAward, title: "Earn recognition", text: "Show your contribution" }].map((item, index) => <div key={item.title} className={`rounded-2xl p-6 border border-white/10 bg-white/${index === 0 ? "15" : "10"} backdrop-blur ${index % 2 ? "mt-8" : ""}`}><item.icon className="text-amber-300 mb-5" size={25} /><h3 className="font-bold text-white">{item.title}</h3><p className="text-sm text-stone-300 mt-1">{item.text}</p></div>)}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {landingStats.map((s, i) => (
            <div key={s.label} className="market-card rounded-xl p-6 animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
              <span className="text-2xl">{s.icon}</span>
              <p className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-white">{s.value}</p>
              <p className="text-sm text-slate-500">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <div className="gold-line mx-auto mb-4" /><h2 className="text-3xl font-bold text-slate-900">Everything you need to make an impact</h2>
          <p className="text-slate-500 mt-2 max-w-lg mx-auto">A complete platform for community project lifecycle management</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f) => (
            <div key={f.title} className="market-card rounded-xl p-6">
              <div className="w-11 h-11 rounded-xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center mb-4">
                <f.icon className="text-amber-600" size={20} />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white">{f.title}</h3>
              <p className="text-sm text-slate-500 mt-1">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-gradient-to-b from-amber-50 to-white dark:from-amber-950/20 dark:bg-slate-900/50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">How It Works</h2>
            <p className="text-slate-500 mt-2">From discovery to impact in four simple steps</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {howItWorks.map((item, i) => {
              const Icon = stepIcons[i];
              return (
                <div key={item.step} className="relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                  <span className="text-4xl font-extrabold text-amber-100 dark:text-amber-500/20">{item.step}</span>
                  <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center mt-2 mb-3">
                    <Icon className="text-amber-600" size={18} />
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white">{item.title}</h3>
                  <p className="text-sm text-slate-500 mt-1">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-b from-white to-amber-50 dark:from-slate-900 dark:to-amber-950/20 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Featured Projects</h2>
              <p className="text-slate-500 text-sm mt-1">Join active community initiatives today</p>
            </div>
            <Link to="/discover" className="text-sm font-semibold text-amber-600 hover:gap-2 inline-flex items-center gap-1 transition-all">
              View all <FiArrowRight />
            </Link>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map((p) => <ProjectCard key={p.id} project={p} />)}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">What Our Community Says</h2>
          <p className="text-slate-500 mt-2">Real stories from volunteers and project leaders</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div key={t.name} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">&ldquo;{t.quote}&rdquo;</p>
              <div className="flex items-center gap-3 mt-5 pt-5 border-t border-slate-100 dark:border-slate-800">
                <Avatar src={t.avatar} name={t.name} />
                <div>
                  <p className="font-semibold text-sm text-slate-900 dark:text-white">{t.name}</p>
                  <p className="text-xs text-slate-500">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 rounded-3xl p-10 sm:p-14 text-center shadow-xl shadow-amber-500/20">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">Ready to make a difference?</h2>
          <p className="text-amber-100 mt-2 max-w-md mx-auto">Join thousands of volunteers and project leaders building stronger communities.</p>
          <Link to="/signup" className="mt-6 inline-flex bg-white text-amber-700 font-semibold px-6 py-3 rounded-xl hover:bg-amber-50 transition-colors">
            Create Free Account
          </Link>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
};

export default Landing;
