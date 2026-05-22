import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { getMyJobs } from "@/services/jobService";

const statusStyles = {
  open: "bg-emerald-500/15 text-emerald-300",
  closed: "bg-rose-500/15 text-rose-300",
};

export default function RecruiterDashboard() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const loadJobs = async () => {
      setLoading(true);
      try {
        const data = await getMyJobs();
        if (active) {
          setJobs(data.jobs || []);
        }
      } catch (err) {
        if (active) {
          setError("Unable to load your job posts. Please try again.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadJobs();

    return () => {
      active = false;
    };
  }, []);

  const isPendingRecruiter = user?.status === "pending";

  return (
    <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-white">
            Recruiter Dashboard
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-neutral-400">
            Review your active job posts and track applicant counts .
          </p>
        </div>
        {!isPendingRecruiter && (
          <Link
            to="/recruiter/jobs/create"
            className="inline-flex items-center justify-center rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-neutral-100"
          >
            Post a Job
          </Link>
        )}
      </div>

      {isPendingRecruiter && (
        <div className="mb-6 rounded-2xl border border-amber-400/30 bg-amber-400/10 p-5 text-sm text-amber-100">
          Your recruiter account is currently pending admin approval. You can view your posted jobs, but you cannot create new job listings until your account is approved.
        </div>
      )}

      {error && (
        <div className="mb-6 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-5 text-sm text-rose-100">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-8 text-center text-sm text-neutral-400">
          Loading your job posts...
        </div>
      ) : jobs.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-700 bg-neutral-900 p-12 text-center text-neutral-400">
          <p className="text-lg font-medium text-white">No job posts yet.</p>
          <p className="mt-2 text-sm">
            {isPendingRecruiter
              ? "Your recruiter account is pending approval. Once approved, you will be able to post jobs."
              : "Post your first job to start receiving applications."
            }
          </p>
          {!isPendingRecruiter && (
            <Link
              to="/recruiter/jobs/create"
              className="mt-6 inline-flex rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-neutral-100"
            >
              Create Job Post
            </Link>
          )}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {jobs.map((job) => (
            <article key={job._id} className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5 transition hover:border-white/20">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-white">{job.title}</h2>
                  <p className="mt-2 text-sm text-neutral-400 capitalize">{job.type}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[job.status] ?? statusStyles.open}`}>
                  {job.status}
                </span>
              </div>

              <div className="mt-4 grid gap-3 text-sm text-neutral-400">
                <div className="flex items-center justify-between rounded-2xl bg-white/5 px-3 py-2">
                  <span>Applicants</span>
                  <strong className="text-white">{job.applicantsCount ?? 0}</strong>
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-white/5 px-3 py-2">
                  <span>Posted</span>
                  <strong className="text-white">{new Date(job.createdAt).toLocaleDateString()}</strong>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <Link
                  to={`/recruiter/applicants/${job._id}`}
                  className="inline-flex rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-neutral-100"
                >
                  View Applicants
                </Link>
                <Link
                  to={`/recruiter/jobs/${job._id}/edit`}
                  className="inline-flex rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:border-white"
                >
                  Edit Post
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}