import { Navigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { getDashboardPath } from "../utils/dashboard";

const RequireGuest = ({ children }) => {
  const { user } = useAuth();
  if (user) return <Navigate to={getDashboardPath(user.role)} replace />;
  return children;
};

export default RequireGuest;
