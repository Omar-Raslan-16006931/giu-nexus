import { useEffect, useState } from "react";
import { Users, Briefcase, FileText, Trophy } from "lucide-react";
import Spinner from "@/components/Spinner";
import { getAdminStats } from "@/services/adminService";

function StatCard({ title, icon: Icon, children }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <div className="flex items-center gap-2 text-neutral-400">
        <Icon className="h-4 w-4" />
        <h2 className="text-sm font-medium uppercase tracking-wide">{title}</h2>
      </div>
      <div className="mt-4 space-y-2">{children}</div>
    </div>
  );
}

function StatRow({ label, value }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-neutral-400">{label}</span>
      <span className="font-semibold text-white">{value ?? 0}</span>
    </div>
  );
}

function formatRoleLabel(role) {
  const labels = {
    jobSeeker: "Job Seekers",
    recruiter: "Recruiters",
    admin: "Admins",
  };
  return labels[role] ?? role;
}

function formatStatusLabel(status) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const data = await getAdminStats();
        if (!cancelled) setStats(data);
      } catch (err) {
        if (!cancelled) {
          setError(err.response?.data?.message || "Failed to load dashboard stats");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10">
        <p className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </p>
      </div>
    );
  }

  const { usersByRole, jobsByStatus, appsByStatus, topJobs } = stats ?? {};

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
      <p className="mt-1 text-sm text-neutral-400">Platform overview and top-performing jobs.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard title="Users by role" icon={Users}>
          {usersByRole &&
            Object.entries(usersByRole).map(([role, count]) => (
              <StatRow key={role} label={formatRoleLabel(role)} value={count} />
            ))}
        </StatCard>

        <StatCard title="Jobs by status" icon={Briefcase}>
          {jobsByStatus && Object.keys(jobsByStatus).length > 0 ? (
            Object.entries(jobsByStatus).map(([status, count]) => (
              <StatRow key={status} label={formatStatusLabel(status)} value={count} />
            ))
          ) : (
            <p className="text-sm text-neutral-500">No jobs yet</p>
          )}
        </StatCard>

        <StatCard title="Applications by status" icon={FileText}>
          {appsByStatus &&
            Object.entries(appsByStatus).map(([status, count]) => (
              <StatRow key={status} label={formatStatusLabel(status)} value={count} />
            ))}
        </StatCard>
      </div>

      <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <div className="flex items-center gap-2 text-neutral-400">
          <Trophy className="h-4 w-4" />
          <h2 className="text-sm font-medium uppercase tracking-wide">Top jobs by applications</h2>
        </div>

        {topJobs?.length > 0 ? (
          <ol className="mt-4 space-y-3">
            {topJobs.map((job, index) => (
              <li
                key={job._id}
                className="flex items-center justify-between gap-4 rounded-xl border border-white/5 bg-black/20 px-4 py-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-500/10 text-xs font-bold text-amber-400">
                    {index + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-white">{job.title}</p>
                    <p className="truncate text-xs text-neutral-500">{job.company}</p>
                  </div>
                </div>
                <span className="shrink-0 text-xs font-medium text-neutral-300">
                  {job.applicationCount} {job.applicationCount === 1 ? "application" : "applications"}
                </span>
              </li>
            ))}
          </ol>
        ) : (
          <p className="mt-4 text-sm text-neutral-500">No applications yet</p>
        )}
      </div>
    </div>
  );
}
