
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function RoleRoute({ children, role, allowedRoles = [] }) {
  const { isAuthenticated, user } = useAuth();
  const requiredRoles = allowedRoles.length > 0 ? allowedRoles : role ? [role] : [];

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (requiredRoles.length > 0 && !requiredRoles.includes(user?.role)) {
    return <Navigate to="/login" replace />;
  }

  return children;
}