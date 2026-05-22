import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Spinner from "@/components/Spinner";
import ApplicationStatusBadge from "@/components/ApplicationStatusBadge";
import { getMyApplications } from "@/services/applicationService";

export default function MyApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const data = await getMyApplications();
        if (!cancelled) setApplications(data.applications || []);
      } catch (err) {
        if (!cancelled)
          setError(err.response?.data?.message || "Failed to load applications.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-2xl font-bold text-white">My Applications</h1>
      <p className="mt-1 text-sm text-neutral-400">
        Jobs you've applied to and their current status.
      </p>

      {error && (
        <p className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </p>
      )}

      {!error && applications.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-4 py-12 text-center">
          <p className="text-sm font-medium text-white">No applications yet.</p>
          <p className="mt-1 text-xs text-neutral-500">
            Browse jobs and apply to get started.
          </p>
          <button
            onClick={() => navigate("/jobs")}
            className="mt-4 rounded-xl border border-white/10 px-4 py-2 text-xs text-neutral-300 transition hover:border-white/20 hover:text-white"
          >
            Browse Jobs
          </button>
        </div>
      ) : (
        <div className="mt-8 overflow-hidden rounded-2xl border border-white/10">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-white/10 bg-white/[0.03] text-xs uppercase tracking-wide text-neutral-400">
              <tr>
                <th className="px-4 py-3 font-medium">Job</th>
                <th className="hidden px-4 py-3 font-medium sm:table-cell">Company</th>
                <th className="hidden px-4 py-3 font-medium md:table-cell">Type</th>
                <th className="hidden px-4 py-3 font-medium md:table-cell">Applied</th>
                <th className="px-4 py-3 font-medium text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {applications.map((app) => (
                <tr
                  key={app._id}
                  onClick={() => navigate(`/jobs/${app.job?._id}`)}
                  className="cursor-pointer bg-white/[0.02] transition hover:bg-white/[0.05]"
                >
                  <td className="px-4 py-3 font-medium text-white">
                    {app.job?.title ?? "—"}
                  </td>
                  <td className="hidden px-4 py-3 text-neutral-400 sm:table-cell">
                    {app.job?.company ?? "—"}
                  </td>
                  <td className="hidden px-4 py-3 text-neutral-500 md:table-cell capitalize">
                    {app.job?.type ?? "—"}
                  </td>
                  <td className="hidden px-4 py-3 text-neutral-500 md:table-cell">
                    {app.appliedAt
                      ? new Date(app.appliedAt).toLocaleDateString()
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <ApplicationStatusBadge status={app.status} />
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