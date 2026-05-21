import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import PopupMessage from "../components/PopupMessage";

export default function ChangePasswordPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [popup, setPopup] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.currentPassword === form.newPassword) {
      setPopup({
        type: "error",
        title: "Error",
        message: "Current password and new password cannot be the same.",
      });
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      setPopup({
        type: "error",
        title: "Error",
        message: "New password and confirm password do not match.",
      });
      return;
    }

    setLoading(true);
    setPopup(null);

    try {
      const response = await api.patch("/profile/change-password", {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });

      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      navigate("/login", {
        state: {
          popup: {
            variant: "success",
            title: "Success",
            message: response?.data?.message + ",Please log in again.",
          },
        },
        replace: true,
      });
    } catch (err) {
      setPopup({
        type: "error",
        title: "Error",
        message: err?.response?.data?.message || "Failed to update password.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 px-4 py-14 text-white">
      <PopupMessage
        open={Boolean(popup)}
        onClose={() => setPopup(null)}
        variant={popup?.type || "default"}
        title={popup?.title}
        message={popup?.message || ""}
        durationMs={5000}
      />

      <form
        onSubmit={handleSubmit}
        className="mx-auto w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.03] p-6 shadow-2xl shadow-black/20"
      >
        <h1 className="text-2xl font-semibold">Change Password</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Update your account password.
        </p>

        <div className="mt-6 space-y-4">
          <input
            type="password"
            name="currentPassword"
            value={form.currentPassword}
            onChange={handleChange}
            placeholder="Current password"
            className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 outline-none focus:border-white/30"
          />

          <input
            type="password"
            name="newPassword"
            value={form.newPassword}
            onChange={handleChange}
            placeholder="New password"
            className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 outline-none focus:border-white/30"
          />

          <input
            type="password"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm new password"
            className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 outline-none focus:border-white/30"
          />

          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 font-medium text-black transition hover:bg-neutral-200 hover:cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Change Password"}
          </button>
        </div>
      </form>
    </div>
  );
}