import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      setError("Email and password are required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { data } = await api.post("/auth/login", { email, password });
      login(data.token, data.user);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid place-items-center bg-neutral-950 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.03] p-6"
      >
        <h1 className="text-2xl font-bold text-white">Login</h1>
        <p className="mt-1 text-sm text-neutral-400">Sign in to continue.</p>

        <div className="mt-6 space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
          />

          <p
            className={`overflow-hidden text-sm text-red-400 transition-all duration-300 ${
              error ? "max-h-20 opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            {error}
          </p>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 font-medium text-black transition-all duration-200 hover:-translate-y-0.5 hover:scale-[1.01] hover:cursor-pointer hover:shadow-lg active:translate-y-0 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? "Logging in..." : "Login"}
          </button>
        </div>

        <p className="mt-4 text-sm text-neutral-400">
          No account?{" "}
          <Link to="/register" className="text-white underline">
            Register
          </Link>
        </p>

        <p className="mt-2 text-sm text-neutral-400">
          <Link
            to="/forgot-password"
            className="text-neutral-300 underline underline-offset-4 hover:text-white"
          >
            Forgot password?
          </Link>
        </p>
      </form>
    </div>
  );
}