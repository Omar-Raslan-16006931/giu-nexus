import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Bookmark, BookmarkCheck, Briefcase, CalendarDays,
  Loader2, MapPin, Pencil, Trash2, Users, DollarSign, Tag
} from "lucide-react";
import { getJobById, toggleSaveJob, deleteJob, getSavedJobs } from "../services/jobService";
import { getMyApplications, applyToJob } from "../services/applicationService";
import { generateCoverLetter } from "../services/aiService";
import { useAuth } from "../context/AuthContext";
import PopupMessage from "../components/PopupMessage";
import ApplicationStatusBadge from "../components/ApplicationStatusBadge";

const CATEGORY_CLASSES = {
  Frontend: "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/20",
  Backend: "bg-blue-500/15 text-blue-300 ring-1 ring-blue-500/20",
  "AI/ML": "bg-purple-500/15 text-purple-300 ring-1 ring-purple-500/20",
  AIML: "bg-purple-500/15 text-purple-300 ring-1 ring-purple-500/20",
  DevOps: "bg-cyan-500/15 text-cyan-300 ring-1 ring-cyan-500/20",
  DataEngineering: "bg-orange-500/15 text-orange-300 ring-1 ring-orange-500/20",
  Other: "bg-zinc-500/15 text-zinc-300 ring-1 ring-zinc-500/20",
};

export default function JobDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [job, setJob] = useState(null);
  const [saved, setSaved] = useState(false);
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [applyLoading, setApplyLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [popup, setPopup] = useState(null);

  const role = useMemo(() => String(user?.role || ""), [user?.role]);
  const isJobSeeker = role === "jobSeeker";
  const isAdmin = role === "admin";

  const isOwner = useMemo(() => {
    if (!isAuthenticated || !job || !user) return false;
    const jobOwner = String(job.createdBy?._id || job.createdBy || "");
    const currentUser = String(user._id || user.id || "");
    return jobOwner !== "" && jobOwner === currentUser;
  }, [job, user, isAuthenticated]);

  useEffect(() => {
    const loadJob = async () => {
      try {
        const data = await getJobById(id);
        const fetchedJob = data?.job || data?.data?.job || data?.data || data;
        setJob(fetchedJob);

        if (isAuthenticated && isJobSeeker && fetchedJob?._id) {
          const [savedRes, appsRes] = await Promise.all([
            getSavedJobs().catch(() => ({})),
            getMyApplications().catch(() => ({})),
          ]);

          const savedJobs = savedRes?.jobs || savedRes?.savedJobs || [];
          setSaved(
            savedJobs.some(
              (j) => String(j?._id || j?.job?._id || j?.job) === String(fetchedJob._id)
            )
          );

          const apps = appsRes?.applications || [];
          const found = apps.find(
            (a) => String(a?.job?._id || a?.job) === String(fetchedJob._id)
          );
          if (found) setApplication(found);
        }
      } catch (err) {
        setPopup({ variant: "error", message: err?.response?.data?.message });
      } finally {
        setLoading(false);
      }
    };
    loadJob();
  }, [id, isAuthenticated, isJobSeeker]);

  const handleSave = async () => {
    if (!isAuthenticated) return navigate("/login");
    try {
      setSaveLoading(true);
      const data = await toggleSaveJob(id);
      setSaved(!!data?.saved);
      setPopup({ variant: "success", message: data?.message });
    } catch (err) {
      setPopup({ variant: "error", message: err?.response?.data?.message });
    } finally {
      setSaveLoading(false);
    }
  };

  const handleApply = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) return navigate("/login");
    try {
      setApplyLoading(true);
      const data = await applyToJob(id, coverLetter.trim());
      setApplication(data?.application || { status: "pending" });
      setModalOpen(false);
      setCoverLetter("");
      setPopup({ variant: "success", message: data?.message });
    } catch (err) {
      setPopup({ variant: "error", message: err?.response?.data?.message });
    } finally {
      setApplyLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleteLoading(true);
      await deleteJob(id);
      setDeleteModalOpen(false);
      setPopup({ variant: "success", message: "Job deleted successfully. Redirecting..." });
      setTimeout(() => navigate(isAdmin ? "/admin/dashboard" : "/recruiter/dashboard"), 2000);
    } catch (err) {
      setDeleteModalOpen(false);
      setPopup({ variant: "error", message: err?.response?.data?.message || "Failed to delete job." });
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleGenerateCoverLetter = async () => {
    setAiLoading(true);
    try {
      const data = await generateCoverLetter({
        jobTitle: job.title,
        companyName: job.company,
        jobDescription: job.description,
      });
      setCoverLetter(data.coverLetter);
    } catch (err) {
      setPopup({ variant: "error", message: "Failed to generate cover letter. Try again." });
    } finally {
      setAiLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center bg-neutral-950">
        <Loader2 className="h-7 w-7 animate-spin text-neutral-400" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen grid place-items-center bg-neutral-950 text-white">
        Job not found.
      </div>
    );
  }

  const requirements = Array.isArray(job.requirements)
    ? job.requirements
    : typeof job.requirements === "string"
    ? job.requirements.split(",").map((x) => x.trim()).filter(Boolean)
    : [];

  const postedDate = job.createdAt
    ? new Date(job.createdAt).toLocaleDateString("en-US", {
        year: "numeric", month: "short", day: "numeric",
      })
    : "N/A";

  const recruiterName = job.createdBy?.name || job.createdBy?.username || null;

  return (
    <div className="min-h-screen bg-neutral-950 px-4 py-10 text-white">
      <PopupMessage
        open={!!popup}
        onClose={() => setPopup(null)}
        variant={popup?.variant}
        message={popup?.message || ""}
        durationMs={5000}
      />

      <div className="mx-auto max-w-5xl space-y-6">
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8">
          <div className="flex flex-wrap gap-2 mb-5">
            <span className={`rounded-full px-3 py-1 text-xs font-medium ${CATEGORY_CLASSES[job.category] || CATEGORY_CLASSES.Other}`}>
              {job.category || "Other"}
            </span>
            <span className="rounded-full px-3 py-1 text-xs font-medium bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/20">
              {job.status || "open"}
            </span>
          </div>
          <h1 className="text-3xl font-semibold">{job.title}</h1>
          <p className="mt-1 text-base text-neutral-400">{job.company || "No company"}</p>
          <div className="mt-5 flex flex-wrap gap-3 text-sm text-neutral-300">
            <span className="flex items-center gap-1.5 rounded-xl bg-white/5 px-3 py-1.5">
              <MapPin className="h-3.5 w-3.5 text-neutral-500" /> {job.location || "No location"}
            </span>
            <span className="flex items-center gap-1.5 rounded-xl bg-white/5 px-3 py-1.5">
              <Briefcase className="h-3.5 w-3.5 text-neutral-500" /> {job.type || "No type"}
            </span>
            <span className="flex items-center gap-1.5 rounded-xl bg-white/5 px-3 py-1.5">
              <DollarSign className="h-3.5 w-3.5 text-neutral-500" />
              {job.salary ? `$${Number(job.salary).toLocaleString()}` : "Unknown"}
            </span>
            <span className="flex items-center gap-1.5 rounded-xl bg-white/5 px-3 py-1.5">
              <Tag className="h-3.5 w-3.5 text-neutral-500" /> {job.category || "Other"}
            </span>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="space-y-6">
            <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
              <h2 className="text-lg font-semibold">About this role</h2>
              <p className="mt-4 whitespace-pre-line text-sm leading-7 text-neutral-300">
                {job.description || "No description provided."}
              </p>
            </section>

            <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
              <h2 className="text-lg font-semibold">Requirements</h2>
              {requirements.length ? (
                <ul className="mt-4 space-y-2 text-sm text-neutral-300">
                  {requirements.map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-neutral-500" />
                      {item}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-4 text-sm text-neutral-400">No requirements listed.</p>
              )}
            </section>
          </div>

          <aside className="space-y-4">
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 space-y-3">
              <h3 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider">Actions</h3>

              {(isOwner || isAdmin) && (
                <div className="flex gap-2">
                  {isOwner && (
                    <button
                      onClick={() => navigate(`/recruiter/jobs/${id}/edit`)}
                      className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-neutral-300 transition hover:bg-white/10 hover:text-white"
                    >
                      <Pencil className="h-4 w-4" /> Edit
                    </button>
                  )}
                  <button
                    onClick={() => setDeleteModalOpen(true)}
                    className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400 transition hover:bg-red-500/20 hover:text-red-300"
                  >
                    <Trash2 className="h-4 w-4" /> Delete
                  </button>
                </div>
              )}

              {isAuthenticated && isJobSeeker && (
                <button
                  onClick={handleSave}
                  disabled={saveLoading || job.status !== "open"}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm disabled:opacity-50"
                >
                  {saveLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : saved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
                  {saved ? "Unsave Job" : "Save Job"}
                </button>
              )}

              {isAuthenticated && isJobSeeker ? (
                application ? (
                  <ApplicationStatusBadge status={application.status} />
                ) : (
                  <button
                    onClick={() => setModalOpen(true)}
                    disabled={job.status !== "open"}
                    className="w-full rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-black disabled:opacity-50"
                  >
                    Apply Now
                  </button>
                )
              ) : !isAuthenticated ? (
                <button
                  onClick={() => navigate("/login")}
                  className="w-full rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-black"
                >
                  Login to apply
                </button>
              ) : null}
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 space-y-4">
              <h3 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider">Job Details</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Posted</span>
                  <span className="flex items-center gap-1.5 text-neutral-300">
                    <CalendarDays className="h-3.5 w-3.5 text-neutral-500" /> {postedDate}
                  </span>
                </div>
                {job.totalSlots != null && (
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Open slots</span>
                    <span className="flex items-center gap-1.5 text-neutral-300">
                      <Users className="h-3.5 w-3.5 text-neutral-500" /> {job.totalSlots}
                    </span>
                  </div>
                )}
                {job.applicantsCount != null && (
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Applicants</span>
                    <span className="text-neutral-300">{job.applicantsCount}</span>
                  </div>
                )}
                {recruiterName && (
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Posted by</span>
                    <span className="text-neutral-300">{recruiterName}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-neutral-500">Status</span>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${job.status === "open" ? "bg-emerald-500/15 text-emerald-300" : "bg-zinc-500/15 text-zinc-300"}`}>
                    {job.status || "open"}
                  </span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Apply Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-xl rounded-3xl border border-white/10 bg-neutral-900 p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Apply to {job.title}</h2>
              <button onClick={() => setModalOpen(false)} className="rounded-xl border border-white/10 px-3 py-2 text-sm">
                Close
              </button>
            </div>
            <form onSubmit={handleApply} className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm text-neutral-400">Cover Letter (optional)</label>
                <button
                  type="button"
                  onClick={handleGenerateCoverLetter}
                  disabled={aiLoading}
                  className="flex items-center gap-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 px-3 py-1.5 text-xs font-medium transition"
                >
                  {aiLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
                  {aiLoading ? "Generating..." : "AI Suggest"}
                </button>
              </div>
              <textarea
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                rows={7}
                placeholder="Write your cover letter or use AI Suggest..."
                className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none resize-none"
              />
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setModalOpen(false)} className="rounded-2xl border border-white/10 px-4 py-3 text-sm">
                  Cancel
                </button>
                <button type="submit" disabled={applyLoading} className="rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-black disabled:opacity-60">
                  {applyLoading ? "Submitting..." : "Submit"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-neutral-900 p-6">
            <div className="mb-1 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-red-500/10">
                <Trash2 className="h-5 w-5 text-red-400" />
              </div>
              <h2 className="text-lg font-semibold">Delete Job</h2>
            </div>
            <p className="mt-3 text-sm text-neutral-400">
              Are you sure you want to delete{" "}
              <span className="font-medium text-white">{job.title}</span>? This action cannot be undone and all applications will be lost.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setDeleteModalOpen(false)} disabled={deleteLoading} className="rounded-2xl border border-white/10 px-4 py-2.5 text-sm disabled:opacity-50">
                Cancel
              </button>
              <button onClick={handleDelete} disabled={deleteLoading} className="flex items-center gap-2 rounded-2xl bg-red-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-600 disabled:opacity-60">
                {deleteLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                {deleteLoading ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}