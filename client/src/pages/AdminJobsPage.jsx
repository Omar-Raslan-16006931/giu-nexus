import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Trash2 } from "lucide-react";
import Spinner from "@/components/Spinner";
import PopupMessage from "@/components/PopupMessage";
import { getAllJobs, deleteJob } from "@/services/jobService";

function ConfirmModal({ open, onConfirm, onCancel, title }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-neutral-900 p-6 shadow-xl">
        <h2 className="text-base font-semibold text-white">Delete Job</h2>
        <p className="mt-2 text-sm text-neutral-400">
          Are you sure you want to delete{" "}
          <span className="font-medium text-white">{title}</span>? This action
          cannot be undone.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="rounded-xl border border-white/10 px-4 py-2 text-sm text-neutral-400 transition hover:text-white"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="rounded-xl border border-red-500/30 bg-red-500/20 px-4 py-2 text-sm font-medium text-red-400 transition hover:bg-red-500/30"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminJobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [popup, setPopup] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null); // { jobId, title }
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const data = await getAllJobs();
        if (!cancelled) setJobs(data.jobs || []);
      } catch (err) {
        if (!cancelled)
          setError(err.response?.data?.message || "Failed to load jobs.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  const handleDelete = async () => {
    const { jobId } = confirmModal;
    setConfirmModal(null);
    setDeletingId(jobId);
    try {
      await deleteJob(jobId);
      setJobs((prev) => prev.filter((j) => j._id !== jobId));
      setPopup({ variant: "success", title: "Deleted", message: "Job listing deleted successfully." });
    } catch (err) {
      setPopup({
        variant: "error",
        title: "Error",
        message: err.response?.data?.message || "Failed to delete job.",
      });
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <PopupMessage
        open={!!popup}
        onClose={() => setPopup(null)}
        variant={popup?.variant || "default"}
        title={popup?.title}
        message={popup?.message || ""}
        durationMs={3000}
      />

      <ConfirmModal
        open={!!confirmModal}
        title={confirmModal?.title}
        onConfirm={handleDelete}
        onCancel={() => setConfirmModal(null)}
      />

      <h1 className="text-2xl font-bold text-white">All Jobs</h1>
      <p className="mt-1 text-sm text-neutral-400">
        Browse and manage all job listings on the platform.
      </p>

      {error && (
        <p className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </p>
      )}

      {!error && jobs.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-4 py-12 text-center">
          <p className="text-sm font-medium text-white">No jobs found.</p>
        </div>
      ) : (
        <div className="mt-8 overflow-hidden rounded-2xl border border-white/10">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-white/10 bg-white/[0.03] text-xs uppercase tracking-wide text-neutral-400">
              <tr>
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="hidden px-4 py-3 font-medium sm:table-cell">Company</th>
                <th className="hidden px-4 py-3 font-medium md:table-cell">Category</th>
                <th className="hidden px-4 py-3 font-medium md:table-cell">Type</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {jobs.map((job) => (
                <tr
                  key={job._id}
                  onClick={() => navigate(`/jobs/${job._id}`)}
                  className="cursor-pointer bg-white/[0.02] transition hover:bg-white/[0.05]"
                >
                  <td className="px-4 py-3 font-medium text-white">{job.title}</td>
                  <td className="hidden px-4 py-3 text-neutral-400 sm:table-cell">{job.company}</td>
                  <td className="hidden px-4 py-3 text-neutral-500 md:table-cell">{job.category ?? "—"}</td>
                  <td className="hidden px-4 py-3 capitalize text-neutral-500 md:table-cell">{job.type}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      job.status === "open"
                        ? "bg-emerald-500/10 text-emerald-400"
                        : "bg-neutral-500/10 text-neutral-400"
                    }`}>
                      {job.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setConfirmModal({ jobId: job._id, title: job.title });
                      }}
                      disabled={deletingId === job._id}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-400 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Trash2 className="h-3 w-3" />
                      {deletingId === job._id ? "Deleting..." : "Delete"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}