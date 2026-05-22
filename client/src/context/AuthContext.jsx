import { createContext, useContext, useEffect, useMemo, useState } from "react";

const AuthContext = createContext(null);

function normalizeUser(user) {
  if (!user) return null;

  const rawRole = String(user.role || "").trim().toLowerCase();

  let normalizedRole = rawRole;
  if (rawRole === "jobseeker") normalizedRole = "jobSeeker";
  if (rawRole === "admin") normalizedRole = "admin";
  if (rawRole === "recruiter") normalizedRole = "recruiter";

  return {
    ...user,
    role: normalizedRole,
  };
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [user, setUserState] = useState(() => {
    try {
      const raw = localStorage.getItem("user");
      return raw ? normalizeUser(JSON.parse(raw)) : null;
    } catch {
      return null;
    }
  });

  const isAuthenticated = !!token;

  const setUser = (newUser) => {
    const normalized = normalizeUser(newUser);
    setUserState(normalized);

    if (normalized) {
      localStorage.setItem("user", JSON.stringify(normalized));
    } else {
      localStorage.removeItem("user");
    }
  };

  const login = (newToken, newUser) => {
    setToken(newToken || "");

    if (newToken) {
      localStorage.setItem("token", newToken);
    } else {
      localStorage.removeItem("token");
    }

    setUser(newUser || null);
  };

  const logout = () => {
    setToken("");
    setUserState(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser || null);
  };

  useEffect(() => {
    const storedToken = localStorage.getItem("token") || "";
    const storedUser = localStorage.getItem("user");

    setToken(storedToken);

    try {
      const parsedUser = storedUser ? JSON.parse(storedUser) : null;
      const normalized = normalizeUser(parsedUser);
      setUserState(normalized);

      if (normalized) {
        localStorage.setItem("user", JSON.stringify(normalized));
      } else {
        localStorage.removeItem("user");
      }
    } catch {
      setUserState(null);
      localStorage.removeItem("user");
    }
  }, []);

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated,
      login,
      logout,
      updateUser,
      setUser,
    }),
    [token, user, isAuthenticated]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}