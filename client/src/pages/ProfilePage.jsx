import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, Pencil, KeyRound, Sparkles, Mail, Shield } from "lucide-react";
import api from "../services/api";
import PopupMessage from "../components/PopupMessage";
import SkillChip from "../components/SkillChip";

const getImageSrc = (pic) =>
  !pic ? "" : pic.startsWith("http") ? pic : `${api.defaults.baseURL}${pic}`;

const getErrorMessage = (err, fallback) =>
  err?.response?.data?.message || err?.message || fallback;

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [extracting, setExtracting] = useState(false);
  const [popup, setPopup] = useState(null);

  useEffect(() => {
    let active = true;
    api.get("/profile")
      .then(({ data }) => active && setProfile(data.user))
      .catch((err) => active && setPageError(getErrorMessage(err, "Failed to load profile.")))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  const isRecruiter = profile?.role === "recruiter";
  const hasBio = Boolean(profile?.bio?.trim());
  const skills = useMemo(() => profile?.skills || [], [profile]);

  const handleExtractSkills = async () => {
    if (!hasBio) return setPopup({ type: "error", title: "Extraction failed", message: "Add a bio before extracting skills." });

    setExtracting(true);
    setPopup(null);
    try {
      const { data } = await api.post("/profile/extract-skills");
      setProfile((prev) => ({ ...prev, skills: data.skills || [] }));
      setPopup({ type: "success", title: "Success", message: "Skills extracted successfully from your bio." });
    } catch (err) {
      setPopup({ type: "error", title: "Extraction failed", message: getErrorMessage(err, "Failed to extract skills.") });
    } finally {
      setExtracting(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-neutral-950 px-4 py-14">
      <div className="mx-auto flex min-h-[60vh] max-w-4xl items-center justify-center rounded-3xl border border-white/10 bg-white/[0.03]">
        <Loader2 className="h-10 w-10 animate-spin text-neutral-400" />
      </div>
    </div>
  );

  if (pageError) return (
    <div className="min-h-screen bg-neutral-950 px-4 py-14">
      <div className="mx-auto max-w-3xl rounded-3xl border border-red-500/20 bg-red-500/10 p-6 text-red-200">{pageError}</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-neutral-950 px-4 py-14 text-white">
      <PopupMessage
        open={Boolean(popup)} onClose={() => setPopup(null)}
        variant={popup?.type || "default"} title={popup?.title}
        message={popup?.message || ""} durationMs={3500}
      />

      <div className="mx-auto max-w-4xl space-y-6">

        {/* Profile Card */}
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 shadow-2xl shadow-black/20 sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">

            <div className="flex min-w-0 items-start gap-4 sm:gap-5">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/5 text-2xl font-bold">
                {profile?.profilePicture
                  ? <img src={getImageSrc(profile.profilePicture)} alt={profile?.name} className="h-full w-full object-cover" />
                  : <span>{(profile?.name?.[0] || "U").toUpperCase()}</span>}
              </div>
              <div className="min-w-0">
                <h1 className="truncate text-2xl font-semibold sm:text-3xl">{profile?.name}</h1>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-neutral-400">
                  <span className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" />{profile?.email}</span>
                  <span className="flex items-center gap-1.5"><Shield className="h-3.5 w-3.5" /><span className="capitalize">{profile?.role}</span></span>
                </div>
                {isRecruiter && (
                  <span className={`mt-3 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${
                    profile?.status === "approved"
                      ? "border-green-500/20 bg-green-500/10 text-green-400"
                      : "border-yellow-500/20 bg-yellow-500/10 text-yellow-400"}`}>
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />{profile?.status}
                  </span>
                )}
              </div>
            </div>

            <div className="flex shrink-0 flex-col gap-2 sm:items-end">
              {[
                { to: "/profile/edit", icon: <Pencil className="h-4 w-4" />, label: "Edit Profile" },
                { to: "/profile/change-password", icon: <KeyRound className="h-4 w-4" />, label: "Change Password" },
              ].map(({ to, icon, label }) => (
                <Link key={to} to={to} className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-neutral-300 transition hover:bg-white/10 hover:text-white">
                  {icon} {label}
                </Link>
              ))}
            </div>
          </div>

          <div className="mt-6 border-t border-white/5 pt-6">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">About</h2>
            {hasBio
              ? <p className="max-w-3xl leading-7 text-neutral-300">{profile.bio}</p>
              : <p className="text-sm italic text-neutral-500">No bio yet. <Link to="/profile/edit" className="text-white underline underline-offset-4">Add one</Link></p>}
          </div>
        </div>

        {/* Skills Card */}
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 shadow-2xl shadow-black/20 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold">Skill Chips</h2>
              <p className="mt-1 text-sm text-neutral-500">Extract skills from your bio and refresh the list below.</p>
            </div>
            <button
              type="button" onClick={handleExtractSkills} disabled={extracting}
              className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-black transition hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {extracting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {extracting ? "Extracting..." : "Extract Skills from Bio"}
            </button>
          </div>

          <div className="mt-5 flex flex-wrap gap-2.5">
            {skills.length > 0
              ? skills.map((skill) => <SkillChip key={skill} skill={skill} />)
              : <div className="w-full rounded-2xl border border-dashed border-white/10 px-4 py-8 text-center text-sm text-neutral-500">
                  {hasBio ? `Click "Extract Skills from Bio" to refresh the chips.` : "Add a bio first, then extract skills."}
                </div>}
          </div>
        </div>

      </div>
    </div>
  );
}