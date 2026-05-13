import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import api from "@/services/api";

export default function VerifyOtpPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    
    useEffect(() => {
        if (location.state?.email) {
            setEmail(location.state.email);
        }
    }, [location.state]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!otp.trim()) {
            setError("OTP is required");
            return;
        }

        setLoading(true);

        try {
            const response = await api.post("/auth/verify-otp", {
                email: email.toLowerCase(),
                otpCode: otp,
            });

            if (response.data.resetToken) {
                navigate(`/reset-password/${response.data.resetToken}`, {
                    state: {
                        popup: {
                            message: response.data.message,
                            variant: "success",
                        },
                    },
                });
            }
        } catch (err) {
            const apiMsg = err.response?.data?.message;
            if (apiMsg) {
                if (apiMsg === "User not found") {
                    setError("Invalid or expired OTP");
                } else {
                    setError(apiMsg);
                }
            } else {
                setError("Invalid or expired OTP");
            }
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
                <h1 className="text-2xl font-bold text-white">Verify OTP</h1>
                <p className="mt-1 text-sm text-neutral-400">
                    Enter the code sent to your email.
                </p>

                <div className="mt-6 space-y-4">
                    <input
                        type="text"
                        placeholder="OTP code"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
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
                        {loading ? "Verifying..." : "Verify OTP"}
                    </button>
                </div>

                <p className="mt-4 text-sm text-neutral-400">
                    Back to <Link to="/login" className="text-white underline">Login</Link>
                </p>
            </form>
        </div>
    );
}
