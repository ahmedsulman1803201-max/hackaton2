import { Link } from "react-router-dom";

const PublicFooter = () => (
  <footer className="bg-slate-900 dark:bg-black text-slate-400 border-t border-slate-800">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
      <div className="sm:col-span-2">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center">
            <span className="text-white font-bold text-sm">IH</span>
          </div>
          <span className="font-bold text-white text-lg">ImpactHub</span>
        </div>
        <p className="text-sm max-w-sm">Empowering communities through project collaboration, volunteer management, and measurable impact.</p>
      </div>
      <div>
        <h4 className="text-white font-semibold mb-3 text-sm">Platform</h4>
        <ul className="space-y-2 text-sm">
          <li><Link to="/discover" className="hover:text-brand-400 transition-colors">Discover Projects</Link></li>
          <li><Link to="/leaderboard" className="hover:text-brand-400 transition-colors">Leaderboard</Link></li>
          <li><Link to="/signup" className="hover:text-brand-400 transition-colors">Join as Volunteer</Link></li>
        </ul>
      </div>
      <div>
        <h4 className="text-white font-semibold mb-3 text-sm">Roles</h4>
        <ul className="space-y-2 text-sm">
          <li>Student Volunteers</li>
          <li>Project Managers</li>
          <li>Platform Admins</li>
        </ul>
      </div>
    </div>
    <div className="border-t border-slate-800 py-4 text-center text-xs">
      © {new Date().getFullYear()} ImpactHub. All rights reserved.
    </div>
  </footer>
);

export default PublicFooter;
