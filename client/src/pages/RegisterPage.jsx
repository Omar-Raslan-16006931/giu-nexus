import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import api from "@/services/api";
import { useAuth } from "@/context/AuthContext";

export default function RegisterPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("jobseeker");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!name.trim() || !email.trim() || !password.trim()) {
            setError("All fields are required");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const { data } = await api.post("/auth/register", {
                name,
                email,
                password,
                role,
            });

            login(data.token, data.user);

            if (data.message) {
                navigate("/", {
                    state: {
                        popup: {
                            message: data.message,
                            variant: data.user?.status === "pending" ? "warning" : "success",
                        },
                    },
                });
                return;
            }

            navigate("/");
        } catch (err) {
            setError(err.response?.data?.message || "");
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
                <h1 className="text-2xl font-bold text-white">Create account</h1>
                <p className="mt-1 text-sm text-neutral-400">Join Giu Nexus in a few steps.</p>

                <div className="mt-6 space-y-4">
                    <input
                        type="text"
                        placeholder="Full name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
                    />
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

                    <div className="grid grid-cols-2 gap-3">
                        <button
                            type="button"
                            onClick={() => setRole("jobseeker")}
                            className={`rounded-xl border px-4 py-3 text-sm font-medium transition-all duration-200 hover:cursor-pointer ${
                                role === "jobseeker"
                                    ? "border-white bg-white text-black shadow-lg"
                                    : "border-white/10 bg-black/20 text-white hover:bg-white/10"
                            }`}
                        >
                            Job Seeker
                        </button>
                        <button
                            type="button"
                            onClick={() => setRole("recruiter")}
                            className={`rounded-xl border px-4 py-3 text-sm font-medium transition-all duration-200 hover:cursor-pointer ${
                                role === "recruiter"
                                    ? "border-white bg-white text-black shadow-lg"
                                    : "border-white/10 bg-black/20 text-white hover:bg-white/10"
                            }`}
                        >
                            Recruiter
                        </button>
                    </div>

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
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 font-medium text-black transition-all duration-200 hover:-translate-y-0.5 hover:cursor-pointer hover:scale-[1.01] hover:shadow-lg active:translate-y-0 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                        {loading ? "Creating account..." : "Register"}
                    </button>
                </div>

                <p className="mt-4 text-sm text-neutral-400">
                    Already have an account?{" "}
                    <Link to="/login" className="text-white underline">
                        Login
                    </Link>
                </p>
            </form>
        </div>
    );
}