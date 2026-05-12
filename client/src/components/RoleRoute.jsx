import { Navigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

export default function RoleRoute({
  children,
  allowedRoles
}) {

  const { user } = useAuth();

  return allowedRoles.includes(user?.role)
    ? children
    : <Navigate to="/" />;
}