import {
  createContext,
  useContext,
  useState
} from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {

  const [user, setUser] = useState(() => {

    const savedUser =
      localStorage.getItem("user");

    try {

      return savedUser
        ? JSON.parse(savedUser)
        : null;

    } catch {

      return null;
    }
  });

  const [token, setToken] = useState(() => {

    return localStorage.getItem("token")
      || null;

  });

  const login = (newToken, userData) => {

    localStorage.setItem(
      "token",
      newToken
    );

    localStorage.setItem(
      "user",
      JSON.stringify(userData)
    );

    setToken(newToken);

    setUser(userData);
  };

  const logout = () => {

    localStorage.removeItem("token");

    localStorage.removeItem("user");

    setToken(null);

    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        isAuthenticated: !!token
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}