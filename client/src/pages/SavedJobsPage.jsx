import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import JobCard from "@/components/JobCard";
import PopupMessage from "@/components/PopupMessage";
import { getSavedJobs, toggleSaveJob } from "@/services/jobService";

export default function SavedJobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [popup, setPopup] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;

    const loadSavedJobs = async () => {
      setLoading(true);
      try {
        const data = await getSavedJobs();
        if (active) setJobs(data.jobs || []);
      } catch (err) {
        if (active) setError("Unable to load saved jobs. Please try again.");
      } finally {
        if (active) setLoading(false);
      }
    };

    loadSavedJobs();
    return () => { active = false; };
  }, []);

  const handleUnsave = async (jobId) => {
    const previousJobs = jobs;
    setJobs(jobs.filter((job) => job._id !== jobId));
    setError("");

    try {
      const response = await toggleSaveJob(jobId);
      setPopup({
        variant: "success",
        title: "Removed",
        message: response?.data?.message || "Job removed from your saved list.",
      });
    } catch (err) {
      setJobs(previousJobs);
      setPopup({
        variant: "error",
        title: "Error",
        message: err?.response?.data?.message || "Failed to remove saved job.",
      });
    }
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <PopupMessage
        open={!!popup}
        onClose={() => setPopup(null)}
        variant={popup?.variant || "default"}
        title={popup?.title}
        message={popup?.message || ""}
        durationMs={3000}
      />

      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-white">
            Saved Jobs
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-neutral-400">
            A list of jobs you bookmarked.
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-8 text-center text-sm text-neutral-400">
          Loading saved jobs...
        </div>
      ) : jobs.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-700 bg-neutral-900 p-12 text-center text-neutral-400">
          <p className="text-lg font-medium text-white">No saved jobs yet.</p>
          <p className="mt-2 text-sm">
            Browse jobs and bookmark the ones you want to keep.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {jobs.map((job) => (
            <JobCard
              key={job._id}
              job={job}
              saved
              onView={() => navigate(`/jobs/${job._id}`)}
              onSave={() => handleUnsave(job._id)}
            />
          ))}
        </div>
      )}
    </main>
  );
}