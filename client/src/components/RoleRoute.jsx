
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function RoleRoute({ children, role }) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (user?.role !== role) return <Navigate to="/" replace />;

  return children;
}