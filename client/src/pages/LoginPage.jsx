import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { loginUser } from "../services/authService";

export default function LoginPage() {

  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [error, setError] = useState("");

  const handleSubmit = async (e) => {

    e.preventDefault();
    
    try {

      const data = await loginUser({
        email,
        password
      });
      
      login(data.token, data.user);
      if (data.user.role === "admin") {
        navigate("/admin/dashboard");
      } else if (data.user.role === "recruiter") {
        navigate("/recruiter/dashboard");
      } else {
        navigate("/profile");
      }
    } catch (err) {
      
      setError(
        err.response?.data?.message ||
        "Login failed"
      );
    }
  };

  return (
    <div>

      <h1>Login Page</h1>

      <form onSubmit={handleSubmit}>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
        />

        <br />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
        />

        <br />

        <button type="submit">
          Login
        </button>

      </form>

      {error && <p>{error}</p>}

    </div>
  );
}