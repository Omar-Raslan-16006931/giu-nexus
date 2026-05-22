import { useEffect, useMemo, useState } from "react";
import { Loader2, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getAllJobs, getSavedJobs, toggleSaveJob } from "../services/jobService";
import JobCard from "../components/JobCard";
import PopupMessage from "../components/PopupMessage";
import { useAuth } from "../context/AuthContext";

const initialFilters = {
  keyword: "",
  location: "",
  type: "",
  status: "open",
  page: 1,
  limit: 9,
};

export default function JobListPage() {
  const [filters, setFilters] = useState(initialFilters);
  const [jobs, setJobs] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [popup, setPopup] = useState(null);

  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const normalizedRole = useMemo(
    () => String(user?.role || "").trim().toLowerCase(),
    [user?.role]
  );

  const isJobSeeker =
    normalizedRole === "jobseeker" || normalizedRole === "jobseeker".toLowerCase();

  const totalPages = Math.max(1, Math.ceil(total / filters.limit));

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);

      try {
        const params = {};
        if (filters.keyword) params.keyword = filters.keyword;
        if (filters.location) params.location = filters.location;
        if (filters.type) params.type = filters.type;
        if (filters.status) params.status = filters.status;
        params.page = filters.page;
        params.limit = filters.limit;


        const jobsRes = await getAllJobs(params);
        let jobsData = Array.isArray(jobsRes?.jobs) ? jobsRes.jobs : [];

        if (isAuthenticated && isJobSeeker) {
          try {
           const savedRes = await getSavedJobs();
           const savedRaw = Array.isArray(savedRes?.jobs) ? savedRes.jobs
           : Array.isArray(savedRes?.savedJobs) ? savedRes.savedJobs
           : Array.isArray(savedRes?.data) ? savedRes.data
           : Array.isArray(savedRes) ? savedRes : [];
            const savedIds = new Set(
              savedRaw.map((item) => String(item?._id || item?.job?._id || item?.job))
            );

            jobsData = jobsData.map((job) => ({
              ...job,
              saved: savedIds.has(String(job._id)),
            }));

            
          } catch (err) {
            console.log( err?.response?.data || err.message);
          }
        }

        setJobs(jobsData);
        setTotal(jobsRes?.total || 0);
      } catch (err) {
        setPopup({
          variant: "error",
          title: "Error",
          message: err?.response?.data?.message || "Failed to load jobs.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [filters, isAuthenticated, isJobSeeker, normalizedRole, user]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFilters((prev) => ({
      ...prev,
      [name]: name === "limit" ? Number(value) : value,
      page: 1,
    }));
  };

  const handlePageChange = (nextPage) => {
    setFilters((prev) => ({
      ...prev,
      page: nextPage,
    }));
  };

  const handleView = (job) => {
    navigate(`/jobs/${job._id}`);
  };

  const handleSave = async (job) => {
    try {
      const data = await toggleSaveJob(job._id);

      setJobs((prev) =>
        prev.map((item) =>
          item._id === job._id ? { ...item, saved: data.saved } : item
        )
      );

      setPopup({
        variant: "success",
        title: "Success",
        message:
          data?.message || (data?.saved ? "Job saved." : "Job removed from saved."),
      });

      return data.saved;
    } catch (err) {
      setPopup({
        variant: "error",
        title: "Error",
        message: err?.response?.data?.message || "Failed to update saved job.",
      });

      throw err;
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 px-4 py-10 text-white">
      <PopupMessage
        open={!!popup}
        onClose={() => setPopup(null)}
        variant={popup?.variant || "default"}
        title={popup?.title}
        message={popup?.message || ""}
        durationMs={5000}
      />

      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight">Browse Jobs</h1>
          <p className="mt-2 text-sm text-neutral-400">
            Search and filter available opportunities.
          </p>
        </div>

        <div className="mb-8 grid gap-4 rounded-3xl border border-white/10 bg-white/[0.03] p-4 md:grid-cols-5">
          <div className="relative md:col-span-2">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
            <input
              type="text"
              name="keyword"
              value={filters.keyword}
              onChange={handleChange}
              placeholder="Search by title, company, keyword..."
              className="w-full rounded-xl border border-white/10 bg-black/20 py-3 pl-10 pr-4 text-sm outline-none focus:border-white/30"
            />
          </div>

          <input
            type="text"
            name="location"
            value={filters.location}
            onChange={handleChange}
            placeholder="Location"
            className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm outline-none focus:border-white/30"
          />

          <select
            name="type"
            value={filters.type}
            onChange={handleChange}
            className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm outline-none focus:border-white/30"
          >
            <option value="">All Types</option>
            <option value="full-time">Full-time</option>
            <option value="part-time">Part-time</option>
            <option value="internship">Internship</option>
          </select>

          <select
            name="status"
            value={filters.status}
            onChange={handleChange}
            className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm outline-none focus:border-white/30"
          >
            <option value="">All Statuses</option>
            <option value="open">Open</option>
            <option value="closed">Closed</option>
          </select>

          <select
            name="limit"
            value={filters.limit}
            onChange={handleChange}
            className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm outline-none focus:border-white/30"
          >
            <option value={6}>6 per page</option>
            <option value={9}>9 per page</option>
            <option value={12}>12 per page</option>
          </select>
        </div>

        {loading ? (
          <div className="flex min-h-[280px] items-center justify-center rounded-3xl border border-white/10 bg-white/[0.03]">
            <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
          </div>
        ) : jobs.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-10 text-center">
            <h2 className="text-lg font-medium">No jobs found</h2>
            <p className="mt-2 text-sm text-neutral-400">
              Try changing your filters or search keyword.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-4 text-sm text-neutral-400">
              Showing {jobs.length} of {total} jobs
            </div>

            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {jobs.map((job) => (
                <JobCard
                  key={job._id}
                  job={job}
                  saved={job.saved}
                  onView={handleView}
                  onSave={handleSave}
                />
              ))}
            </div>

            <div className="mt-8 flex items-center justify-center gap-3">
              <button
                type="button"
                disabled={filters.page === 1}
                onClick={() => handlePageChange(filters.page - 1)}
                className="rounded-xl border border-white/10 px-4 py-2 text-sm text-white transition hover:border-white/20 hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>

              <span className="text-sm text-neutral-400">
                Page {filters.page} of {totalPages}
              </span>

              <button
                type="button"
                disabled={filters.page >= totalPages}
                onClick={() => handlePageChange(filters.page + 1)}
                className="rounded-xl border border-white/10 px-4 py-2 text-sm text-white transition hover:border-white/20 hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}