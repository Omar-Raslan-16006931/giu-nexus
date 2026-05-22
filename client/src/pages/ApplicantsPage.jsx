import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Loader2, ArrowLeft } from "lucide-react";
import { getApplicants, updateApplicationStatus } from "../services/applicationService";
import PopupMessage from "../components/PopupMessage";

const STATUS_STYLES = {
  pending:     "bg-yellow-500/15 text-yellow-300 border-yellow-500/20",
  shortlisted: "bg-blue-500/15 text-blue-300 border-blue-500/20",
  rejected:    "bg-red-500/15 text-red-300 border-red-500/20",
};

const FILTERS = ["all", "pending", "shortlisted", "rejected"];

export default function ApplicantsPage() {
  const { jobId } = useParams();
  const navigate = useNavigate();

  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [filter, setFilter] = useState("all");
  const [popup, setPopup] = useState(null);

  useEffect(() => {
    getApplicants(jobId)
      .then((data) => setApplicants(data?.applications || []))
      .catch((err) => setPopup({ variant: "error", message: err?.response?.data?.message || "Failed to load applicants." }))
      .finally(() => setLoading(false));
  }, [jobId]);

  const handleStatusChange = async (applicationId, newStatus) => {
    setUpdating(applicationId);
    try {
      await updateApplicationStatus(applicationId, newStatus);
      setApplicants((prev) =>
        prev.map((a) => a._id === applicationId ? { ...a, status: newStatus } : a)
      );
      setPopup({ variant: "success", message: `Status updated to ${newStatus}.` });
    } catch (err) {
      setPopup({ variant: "error", message: err?.response?.data?.message || "Failed to update status." });
    } finally {
      setUpdating(null);
    }
  };

  const filtered = filter === "all" ? applicants : applicants.filter((a) => a.status === filter);

  if (loading) return (
    <div className="min-h-screen grid place-items-center bg-neutral-950">
      <Loader2 className="h-7 w-7 animate-spin text-neutral-400" />
    </div>
  );

  return (
    <div className="min-h-screen bg-neutral-950 px-4 py-10 text-white">
      <PopupMessage
        open={!!popup} onClose={() => setPopup(null)}
        variant={popup?.variant} message={popup?.message || ""}
        durationMs={4000}
      />

      <div className="mx-auto max-w-5xl space-y-6">

        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/recruiter/dashboard")}
            className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-neutral-400 transition hover:bg-white/10 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <div>
            <h1 className="text-2xl font-semibold">Applicants</h1>
            <p className="text-sm text-neutral-400">{applicants.length} total applicant{applicants.length !== 1 ? "s" : ""}</p>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium capitalize transition ${
                filter === f
                  ? "bg-white text-black"
                  : "border border-white/10 bg-white/5 text-neutral-400 hover:bg-white/10 hover:text-white"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Applicants list */}
        {filtered.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-10 text-center text-sm text-neutral-400">
            No applicants{filter !== "all" ? ` with status "${filter}"` : ""}.
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((applicant) => (
              <div
                key={applicant._id}
                className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/[0.03] p-5 sm:flex-row sm:items-center sm:justify-between"
              >
                {/* Applicant info */}
                <div className="space-y-1">
                  <p className="font-semibold">{applicant.user?.name || "Unknown"}</p>
                  <p className="text-sm text-neutral-400">{applicant.user?.email || "No email"}</p>
                  {applicant.user?.skills?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {applicant.user.skills.map((skill) => (
                        <span key={skill} className="rounded-full bg-white/5 px-2.5 py-0.5 text-xs text-neutral-300">
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                  {applicant.coverLetter && (
                    <p className="mt-1 max-w-lg text-xs text-neutral-500 line-clamp-2">
                      {applicant.coverLetter}
                    </p>
                  )}
                </div>

                {/* Status selector */}
                <div className="flex shrink-0 items-center gap-3">
                  <span className={`rounded-full border px-3 py-1 text-xs font-medium capitalize ${STATUS_STYLES[applicant.status] || STATUS_STYLES.pending}`}>
                    {applicant.status}
                  </span>

                  {updating === applicant._id ? (
                    <Loader2 className="h-4 w-4 animate-spin text-neutral-400" />
                  ) : (
                    <select
                      value={applicant.status}
                      onChange={(e) => handleStatusChange(applicant._id, e.target.value)}
                      className="rounded-xl border border-white/10 bg-neutral-900 px-3 py-2 text-sm text-white outline-none"
                    >
                      <option value="pending">Pending</option>
                      <option value="shortlisted">Shortlisted</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}