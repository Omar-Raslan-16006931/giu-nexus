import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { resetPassword } from "@/services/authService";
import { useAuth } from "@/context/AuthContext";

export default function ResetPasswordPage() {
    const { token } = useParams();
    const navigate = useNavigate();
    const { login } = useAuth();
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!password.trim()) {
            setError("Password is required");
            return;
        }

        setLoading(true);

        try {
            const data = await resetPassword(token, password);

            login(data.token, data.user);
            navigate("/", {
                state: {
                    popup: {
                        message: data.message,
                        variant: "success",
                    },
                },
            });
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
                <h1 className="text-2xl font-bold text-white">Reset password</h1>
                <p className="mt-1 text-sm text-neutral-400">Create a new password for your account.</p>

                <div className="mt-6 space-y-4">
                    <input
                        type="password"
                        placeholder="New password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
                    />

                    {error && (
                        <p className="overflow-hidden text-sm text-red-400 transition-all duration-300 max-h-20 opacity-100">
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 font-medium text-black transition-all duration-200 hover:-translate-y-0.5 hover:cursor-pointer hover:scale-[1.01] hover:shadow-lg active:translate-y-0 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                        {loading ? "Saving..." : "Reset password"}
                    </button>
                </div>

                <p className="mt-4 text-sm text-neutral-400">
                    Back to <Link to="/login" className="text-white underline">Login</Link>
                </p>
            </form>
        </div>
    );
}