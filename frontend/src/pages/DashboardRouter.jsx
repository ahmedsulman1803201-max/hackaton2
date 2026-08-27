import { Navigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import StudentDashboard from "./dashboards/StudentDashboard";
import ManagerDashboard from "./dashboards/ManagerDashboard";
import AdminDashboard from "./dashboards/AdminDashboard";

const DashboardRouter = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;

  switch (user.role) {
    case "admin": return <AdminDashboard />;
    case "manager": return <ManagerDashboard />;
    default: return <StudentDashboard />;
  }
};

export default DashboardRouter;
