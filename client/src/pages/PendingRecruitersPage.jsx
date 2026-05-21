import { useCallback, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import Spinner from "@/components/Spinner";
import {
  getPendingRecruiters,
  updateUserStatus,
} from "@/services/adminService";

export default function PendingRecruitersPage() {
  const [recruiters, setRecruiters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionId, setActionId] = useState(null);

  const loadRecruiters = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const users = await getPendingRecruiters();
      setRecruiters(users);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load pending recruiters");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRecruiters();
  }, [loadRecruiters]);

  const handleStatusChange = async (userId, status) => {
    setActionId(userId);
    setError("");
    try {
      await updateUserStatus(userId, status);
      setRecruiters((prev) => prev.filter((u) => u._id !== userId));
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${status} recruiter`);
    } finally {
      setActionId(null);
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
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-2xl font-bold text-white">Pending Recruiters</h1>
      <p className="mt-1 text-sm text-neutral-400">
        Review and approve or reject recruiter registration requests.
      </p>

      {error && (
        <p className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </p>
      )}

      {recruiters.length === 0 ? (
        <p className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-8 text-center text-sm text-neutral-400">
          No pending recruiters at the moment.
        </p>
      ) : (
        <div className="mt-8 overflow-hidden rounded-2xl border border-white/10">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-white/10 bg-white/[0.03] text-xs uppercase tracking-wide text-neutral-400">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="hidden px-4 py-3 font-medium sm:table-cell">Registered</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {recruiters.map((recruiter) => {
                const busy = actionId === recruiter._id;
                return (
                  <tr key={recruiter._id} className="bg-white/[0.02]">
                    <td className="px-4 py-3 font-medium text-white">{recruiter.name}</td>
                    <td className="px-4 py-3 text-neutral-400">{recruiter.email}</td>
                    <td className="hidden px-4 py-3 text-neutral-500 sm:table-cell">
                      {recruiter.createdAt
                        ? new Date(recruiter.createdAt).toLocaleDateString()
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => handleStatusChange(recruiter._id, "approved")}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-green-500/30 bg-green-500/10 px-3 py-1.5 text-xs font-medium text-green-400 transition hover:bg-green-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {busy && <Loader2 className="h-3 w-3 animate-spin" />}
                          Approve
                        </button>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => handleStatusChange(recruiter._id, "rejected")}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-400 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
