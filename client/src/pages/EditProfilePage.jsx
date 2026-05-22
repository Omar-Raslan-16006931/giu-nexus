import { useEffect, useRef, useState } from "react";
import { Camera, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getProfile, updateProfile } from "../services/profileService";
import PopupMessage from "../components/PopupMessage";
import { useAuth } from "../context/AuthContext";

const getImageSrc = (src) => {
  if (!src) return "";
  if (src.startsWith("blob:") || src.startsWith("http")) return src;
  const base = (import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1").replace("/api/v1", "");
  return `${base}${src}`;
};

export default function EditProfilePage() {
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const { updateUser } = useAuth();

  const [form, setForm] = useState({ name: "", bio: "" });
  const [initial, setInitial] = useState({ name: "", bio: "" });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [fetching, setFetching] = useState(true);
  const [loading, setLoading] = useState(false);
  const [popup, setPopup] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await getProfile();
        const user = data?.user || data;

        const next = {
          name: user?.name || "",
          bio: user?.bio || "",
        };

        setForm(next);
        setInitial(next);
        setPreview(user?.profilePicture || "");
      } catch (err) {
        setPopup({
          variant: "error",
          title: "Error",
          message: err?.response?.data?.message || "Failed to load profile.",
        });
      } finally {
        setFetching(false);
      }
    })();
  }, []);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setPopup(null);

    try {
      const fd = new FormData();

      if (form.name.trim() !== initial.name) fd.append("name", form.name.trim());
      if (form.bio.trim() !== initial.bio) fd.append("bio", form.bio.trim());
      if (file) fd.append("profilePicture", file);

      const data = await updateProfile(fd);
      const updatedUser = data?.user || data;

      updateUser(updatedUser);

      navigate("/profile", {
        replace: true,
        state: {
          popup: {
            variant: "success",
            title: "Success",
            message: data?.message || "Profile updated successfully.",
          },
        },
      });
    } catch (err) {
      setPopup({
        variant: "error",
        title: "Error",
        message: err?.response?.data?.message || "Something went wrong.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-950">
        <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 px-4 py-14 text-white">
      <PopupMessage
        open={!!popup}
        onClose={() => setPopup(null)}
        variant={popup?.variant || "default"}
        title={popup?.title}
        message={popup?.message || ""}
        durationMs={5000}
      />

      <form
        onSubmit={handleSubmit}
        className="mx-auto w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.03] p-6 shadow-2xl shadow-black/20"
      >
        <h1 className="text-2xl font-semibold">Edit Profile</h1>
        <p className="mt-1 text-sm text-neutral-500">Update your profile details.</p>

        <div className="mt-6 flex flex-col items-center gap-3">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="h-24 w-24 overflow-hidden rounded-full border border-white/10 bg-black/20"
          >
            {preview ? (
              <img
                src={getImageSrc(preview)}
                alt="Profile"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-neutral-600">
                <Camera className="h-7 w-7" />
              </div>
            )}
          </button>

          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="text-xs text-neutral-400 underline underline-offset-4 hover:text-white"
          >
            Change photo
          </button>

          <input
            ref={fileRef}
            type="file"
            name="profilePicture"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        <div className="mt-6 space-y-4">
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Your name"
            className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 outline-none focus:border-white/30"
          />

          <textarea
            name="bio"
            value={form.bio}
            onChange={handleChange}
            rows={4}
            placeholder="Tell us about yourself..."
            className="w-full resize-none rounded-xl border border-white/10 bg-black/20 px-4 py-3 outline-none focus:border-white/30"
          />

          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 font-medium text-black transition hover:bg-neutral-200 disabled:opacity-60"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Changes"}
          </button>

          <button
            type="button"
            onClick={() => navigate("/profile")}
            className="w-full rounded-xl border border-white/10 px-4 py-3 text-sm text-neutral-400 transition hover:border-white/20 hover:text-white"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}