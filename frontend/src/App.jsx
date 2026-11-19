import { Routes, Route, Navigate } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Discover from "./pages/Discover";
import ProjectDetail from "./pages/ProjectDetail";
import ProjectTasks from "./pages/ProjectTasks";
import ProjectDiscussion from "./pages/ProjectDiscussion";
import ProjectForm from "./pages/ProjectForm";
import DashboardRouter from "./pages/DashboardRouter";
import StudentDashboard from "./pages/dashboards/StudentDashboard";
import ManagerDashboard from "./pages/dashboards/ManagerDashboard";
import ScoreBoard from "./pages/ScoreBoard";
import AdminDashboard from "./pages/dashboards/AdminDashboard";
import MyProjects from "./pages/MyProjects";
import VolunteerApplications from "./pages/VolunteerApplications";
import Notifications from "./pages/Notifications";
import Leaderboard from "./pages/Leaderboard";
import Profile from "./pages/Profile";
import DashboardLayout from "./components/layout/DashboardLayout";
import RequireAuth from "./components/RequireAuth";
import RequireGuest from "./components/RequireGuest";
import RequireRole from "./components/RequireRole";

const App = () => (
  <div className="app-shell">
  <div className="app-ambient" aria-hidden="true" />
  <Routes>
    <Route path="/" element={<Landing />} />
    <Route path="/discover" element={<Discover />} />
    <Route path="/leaderboard" element={<Leaderboard />} />
    <Route path="/projects/:id" element={<ProjectDetail />} />
    <Route path="/projects/:id/tasks" element={<ProjectTasks />} />
    <Route path="/projects/:id/discussion" element={<ProjectDiscussion />} />
    <Route path="/login" element={<RequireGuest><Login /></RequireGuest>} />
    <Route path="/signup" element={<RequireGuest><Signup /></RequireGuest>} />
    <Route path="/register" element={<RequireGuest><Signup /></RequireGuest>} />

    <Route element={<RequireAuth><DashboardLayout /></RequireAuth>}>
      <Route path="/dashboard" element={<DashboardRouter />} />
      <Route path="/dashboard/student" element={<RequireRole roles={["student"]}><StudentDashboard /></RequireRole>} />
      <Route path="/dashboard/user" element={<Navigate to="/dashboard/student" replace />} />
      <Route path="/dashboard/manager" element={<RequireRole roles={["manager"]}><ManagerDashboard /></RequireRole>} />
      <Route path="/score-board" element={<RequireRole roles={["manager", "admin"]}><ScoreBoard /></RequireRole>} />
      <Route path="/dashboard/admin" element={<RequireRole roles={["admin"]}><AdminDashboard /></RequireRole>} />
      <Route path="/my-projects" element={<MyProjects />} />
      <Route path="/tasks" element={<MyProjects />} />
      <Route path="/applications" element={<VolunteerApplications />} />
      <Route path="/notifications" element={<Notifications />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/projects/new" element={<RequireRole roles={["manager", "admin"]}><ProjectForm /></RequireRole>} />
      <Route path="/projects/:id/edit" element={<RequireRole roles={["manager", "admin"]}><ProjectForm /></RequireRole>} />
    </Route>

    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
  </div>
);

export default App;
