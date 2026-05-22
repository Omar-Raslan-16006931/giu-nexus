import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2, MapPin, Building2, BriefcaseBusiness } from "lucide-react";
import { getRecommendedJobs } from "../services/jobService";
import { useAuth } from "../context/AuthContext";
import PopupMessage from "../components/PopupMessage";

const CATEGORY_CLASSES = {
  Frontend: "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/20",
  Backend: "bg-blue-500/15 text-blue-300 ring-1 ring-blue-500/20",
  "AI/ML": "bg-purple-500/15 text-purple-300 ring-1 ring-purple-500/20",
  AIML: "bg-purple-500/15 text-purple-300 ring-1 ring-purple-500/20",
  DevOps: "bg-cyan-500/15 text-cyan-300 ring-1 ring-cyan-500/20",
  DataEngineering: "bg-orange-500/15 text-orange-300 ring-1 ring-orange-500/20",
  Other: "bg-zinc-500/15 text-zinc-300 ring-1 ring-zinc-500/20",
};

export default function RecommendedJobsPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [popup, setPopup] = useState(null);

  const role = useMemo(() => String(user?.role || ""), [user?.role]);
  const isJobSeeker = role === "jobSeeker";

  useEffect(() => {
    const loadRecommendedJobs = async () => {
      if (!isAuthenticated || !isJobSeeker) {
        setLoading(false);
        return;
      }

      try {
        const data = await getRecommendedJobs();
        const jobsList = data?.jobs || data?.data?.jobs || [];
        setJobs(jobsList);
      } catch (err) {
        setPopup({
          variant: "error",
          message: err?.response?.data?.message || "Failed to load recommended jobs.",
        });
      } finally {
        setLoading(false);
      }
    };

    loadRecommendedJobs();
  }, [isAuthenticated, isJobSeeker]);

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center bg-neutral-950">
        <Loader2 className="h-7 w-7 animate-spin text-neutral-400" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-neutral-950 px-4 py-10 text-white">
        <div className="mx-auto max-w-3xl rounded-3xl border border-white/10 bg-white/[0.03] p-8 text-center">
          <h1 className="text-2xl font-semibold">Recommended Jobs</h1>
          <p className="mt-3 text-sm text-neutral-400">
            Login to see your recommended jobs.
          </p>
          <button
            onClick={() => navigate("/login")}
            className="mt-6 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-black"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  if (!isJobSeeker) {
    return (
      <div className="min-h-screen bg-neutral-950 px-4 py-10 text-white">
        <div className="mx-auto max-w-3xl rounded-3xl border border-white/10 bg-white/[0.03] p-8 text-center">
          <h1 className="text-2xl font-semibold">Recommended Jobs</h1>
          <p className="mt-3 text-sm text-neutral-400">
            This page is available for job seekers only.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 px-4 py-10 text-white">
      <PopupMessage
        open={!!popup}
        onClose={() => setPopup(null)}
        variant={popup?.variant}
        message={popup?.message || ""}
        durationMs={5000}
      />

      <div className="mx-auto max-w-6xl space-y-6">
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
          <h1 className="text-3xl font-semibold">Recommended Jobs</h1>
          <p className="mt-2 text-sm text-neutral-400">Ranked for you by match score.</p>
        </div>

        {jobs.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 text-center">
            <h2 className="text-xl font-semibold">No recommendations yet</h2>
            <p className="mt-3 text-sm text-neutral-400">
              Try updating your profile and extracting your skills first.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <Link
                to="/profile"
                className="rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-black"
              >
                Go to Profile
              </Link>
              <Link
                to="/jobs"
                className="rounded-2xl border border-white/10 px-5 py-3 text-sm"
              >
                Browse Jobs
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {jobs.map((job) => {
              const score =
                typeof job?.score === "number"
                  ? `${Math.round(job.score * 100)}%`
                  : null;

              return (
                <Link
                  key={job._id}
                  to={`/jobs/${job._id}`}
                  className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 transition hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.05]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        CATEGORY_CLASSES[job.category] || CATEGORY_CLASSES.Other
                      }`}
                    >
                      {job.category || "Other"}
                    </span>

                    {score && (
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-black">
                        {score}
                      </span>
                    )}
                  </div>

                  <h2 className="mt-4 text-xl font-semibold">{job.title}</h2>

                  <div className="mt-4 space-y-2 text-sm text-neutral-400">
                    <p className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      {job.company || "No company"}
                    </p>
                    <p className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {job.location || "No location"}
                    </p>
                    <p className="flex items-center gap-2">
                      <BriefcaseBusiness className="h-4 w-4" />
                      {job.type || "No type"}
                    </p>
                  </div>

                  <p className="mt-4 line-clamp-3 text-sm leading-6 text-neutral-400">
                    {job.description || "No description provided."}
                  </p>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}