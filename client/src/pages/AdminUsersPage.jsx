import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import Spinner from "@/components/Spinner";
import PopupMessage from "@/components/PopupMessage";
import { getAllUsers, deleteUser, updateUserStatus } from "@/services/adminService";

const ROLES = ["", "jobSeeker", "recruiter", "admin"];
const STATUSES = ["", "approved", "pending", "rejected"];

function formatRole(role) {
  const map = { jobSeeker: "Job Seeker", recruiter: "Recruiter", admin: "Admin" };
  return map[role] ?? role;
}

function ConfirmModal({ open, onConfirm, onCancel, name }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-neutral-900 p-6 shadow-xl">
        <h2 className="text-base font-semibold text-white">Delete User</h2>
        <p className="mt-2 text-sm text-neutral-400">
          Are you sure you want to delete{" "}
          <span className="font-medium text-white">{name}</span>? This action
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

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({ role: "", status: "" });
  const [actionId, setActionId] = useState(null);
  const [popup, setPopup] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null); // { userId, name }

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const params = {};
        if (filters.role) params.role = filters.role;
        if (filters.status) params.status = filters.status;
        const data = await getAllUsers(params);
        if (!cancelled) setUsers(data.users || []);
      } catch (err) {
        if (!cancelled)
          setError(err.response?.data?.message || "Failed to load users.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [filters]);

  const handleDelete = async () => {
    const { userId } = confirmModal;
    setConfirmModal(null);
    setActionId(userId);
    try {
      await deleteUser(userId);
      setUsers((prev) => prev.filter((u) => u._id !== userId));
      setPopup({ variant: "success", title: "Deleted", message: "User deleted successfully." });
    } catch (err) {
      setPopup({
        variant: "error",
        title: "Error",
        message: err.response?.data?.message || "Failed to delete user.",
      });
    } finally {
      setActionId(null);
    }
  };

  const handleStatusChange = async (userId, status) => {
    setActionId(userId);
    try {
      await updateUserStatus(userId, status);
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, status } : u))
      );
      setPopup({
        variant: "success",
        title: "Updated",
        message: `User status changed to ${status}.`,
      });
    } catch (err) {
      setPopup({
        variant: "error",
        title: "Error",
        message: err.response?.data?.message || "Failed to update status.",
      });
    } finally {
      setActionId(null);
    }
  };

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
        name={confirmModal?.name}
        onConfirm={handleDelete}
        onCancel={() => setConfirmModal(null)}
      />

      <h1 className="text-2xl font-bold text-white">All Users</h1>
      <p className="mt-1 text-sm text-neutral-400">
        Manage all registered users on the platform.
      </p>

      {/* Filters */}
      <div className="mt-6 flex flex-wrap gap-3">
        <select
          value={filters.role}
          onChange={(e) => setFilters((f) => ({ ...f, role: e.target.value }))}
          className="rounded-xl border border-white/10 bg-neutral-900 px-3 py-2 text-sm text-white outline-none focus:border-white/20"
        >
          <option value="" className="bg-neutral-900 text-white">All Roles</option>
          {ROLES.filter(Boolean).map((r) => (
            <option key={r} value={r} className="bg-neutral-900 text-white">
              {formatRole(r)}
            </option>
          ))}
        </select>

        <select
          value={filters.status}
          onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
          className="rounded-xl border border-white/10 bg-neutral-900 px-3 py-2 text-sm text-white outline-none focus:border-white/20"
        >
          <option value="" className="bg-neutral-900 text-white">All Statuses</option>
          {STATUSES.filter(Boolean).map((s) => (
            <option key={s} value={s} className="bg-neutral-900 text-white capitalize">
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </option>
          ))}
        </select>

        {(filters.role || filters.status) && (
          <button
            onClick={() => setFilters({ role: "", status: "" })}
            className="rounded-xl border border-white/10 px-3 py-2 text-sm text-neutral-400 transition hover:text-white"
          >
            Clear filters
          </button>
        )}
      </div>

      {error && (
        <p className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </p>
      )}

      {loading ? (
        <div className="flex min-h-[30vh] items-center justify-center">
          <Spinner size="lg" />
        </div>
      ) : users.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-4 py-12 text-center">
          <p className="text-sm text-neutral-400">No users found.</p>
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-2xl border border-white/10">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-white/10 bg-white/[0.03] text-xs uppercase tracking-wide text-neutral-400">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="hidden px-4 py-3 font-medium sm:table-cell">Email</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="hidden px-4 py-3 font-medium md:table-cell">Status</th>
                <th className="hidden px-4 py-3 font-medium md:table-cell">Joined</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {users.map((user) => {
                const busy = actionId === user._id;
                return (
                  <tr key={user._id} className="bg-white/[0.02]">
                    <td className="px-4 py-3 font-medium text-white">{user.name}</td>
                    <td className="hidden px-4 py-3 text-neutral-400 sm:table-cell">{user.email}</td>
                    <td className="px-4 py-3 text-neutral-400">{formatRole(user.role)}</td>
                    <td className="hidden px-4 py-3 md:table-cell">
                      {user.role === "recruiter" ? (
                        <select
                          value={user.status || "pending"}
                          disabled={busy}
                          onChange={(e) => handleStatusChange(user._id, e.target.value)}
                          className="rounded-lg border border-white/10 bg-neutral-900 px-2 py-1 text-xs text-white outline-none disabled:opacity-50"
                        >
                          <option value="pending" className="bg-neutral-900 text-white">Pending</option>
                          <option value="approved" className="bg-neutral-900 text-white">Approved</option>
                          <option value="rejected" className="bg-neutral-900 text-white">Rejected</option>
                        </select>
                      ) : (
                        <span className="text-neutral-500">—</span>
                      )}
                    </td>
                    <td className="hidden px-4 py-3 text-neutral-500 md:table-cell">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        disabled={busy}
                        onClick={() => setConfirmModal({ userId: user._id, name: user.name })}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-400 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Trash2 className="h-3 w-3" />
                        {busy ? "..." : "Delete"}
                      </button>
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