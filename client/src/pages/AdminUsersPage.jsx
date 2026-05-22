import { useState, useEffect, useCallback } from "react";
import api from "../../services/api";
import "./AdminUsersPage.css";

const ROLE_OPTIONS = ["all", "jobSeeker", "recruiter", "admin"];
const STATUS_OPTIONS = ["all", "active", "pending", "approved", "rejected"];

const ROLE_META = {
  jobSeeker: { label: "Job Seeker", color: "#4ade80", bg: "rgba(74,222,128,0.12)" },
  recruiter: { label: "Recruiter", color: "#60a5fa", bg: "rgba(96,165,250,0.12)" },
  admin: { label: "Admin", color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
};

const STATUS_META = {
  active: { label: "Active", color: "#4ade80", bg: "rgba(74,222,128,0.12)" },
  approved: { label: "Approved", color: "#4ade80", bg: "rgba(74,222,128,0.12)" },
  pending: { label: "Pending", color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
  rejected: { label: "Rejected", color: "#f87171", bg: "rgba(248,113,113,0.12)" },
};

function RoleBadge({ role }) {
  const meta = ROLE_META[role] || { label: role, color: "#94a3b8", bg: "rgba(148,163,184,0.12)" };
  return (
    <span className="badge" style={{ color: meta.color, background: meta.bg }}>
      {meta.label}
    </span>
  );
}

function StatusBadge({ status }) {
  const meta = STATUS_META[status] || { label: status, color: "#94a3b8", bg: "rgba(148,163,184,0.12)" };
  return (
    <span className="badge" style={{ color: meta.color, background: meta.bg }}>
      {meta.label}
    </span>
  );
}

function ConfirmModal({ isOpen, message, onConfirm, onCancel, danger = true }) {
  if (!isOpen) return null;
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <p className="modal-msg">{message}</p>
        <div className="modal-actions">
          <button className="btn-ghost" onClick={onCancel}>Cancel</button>
          <button className={danger ? "btn-danger" : "btn-primary"} onClick={onConfirm}>
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [modal, setModal] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (roleFilter !== "all") params.role = roleFilter;
      if (statusFilter !== "all") params.status = statusFilter;
      const { data } = await api.get("/api/v1/users", { params });
      setUsers(data.users || data || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load users.");
    } finally {
      setLoading(false);
    }
  }, [roleFilter, statusFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleDelete = async () => {
    const { userId } = modal;
    setActionLoading(userId + "_delete");
    setModal(null);
    try {
      await api.delete(`/api/v1/users/${userId}`);
      setUsers((prev) => prev.filter((u) => u._id !== userId));
      showToast("User deleted successfully.");
    } catch (err) {
      showToast(err?.response?.data?.message || "Delete failed.", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleStatusChange = async () => {
    const { userId, status } = modal;
    setActionLoading(userId + "_status");
    setModal(null);
    try {
      const { data } = await api.patch(`/api/v1/users/${userId}/status`, { status });
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, status: data.user?.status || status } : u))
      );
      showToast(`User status updated to "${status}".`);
    } catch (err) {
      showToast(err?.response?.data?.message || "Status update failed.", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = users.filter((u) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q);
  });

  const confirmDelete = (userId, name) =>
    setModal({ type: "delete", userId, message: `Delete user "${name}"? This cannot be undone.` });

  const confirmStatus = (userId, name, status) =>
    setModal({
      type: "status",
      userId,
      status,
      message: `Set "${name}" status to "${status}"?`,
      danger: status === "rejected",
    });

  return (
    <div className="au-page">
      {toast && <div className={`toast toast-${toast.type}`}>{toast.msg}</div>}

      <div className="au-header">
        <div>
          <h1 className="au-title">User Management</h1>
          <p className="au-subtitle">
            {loading ? "Loading…" : `${filtered.length} user${filtered.length !== 1 ? "s" : ""} found`}
          </p>
        </div>
      </div>

      <div className="au-filters">
        <input
          className="au-search"
          type="text"
          placeholder="Search by name or email…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <div className="filter-group">
          <label className="filter-label">Role</label>
          <div className="pill-group">
            {ROLE_OPTIONS.map((r) => (
              <button
                key={r}
                className={`pill ${roleFilter === r ? "pill-active" : ""}`}
                onClick={() => setRoleFilter(r)}
              >
                {r === "all" ? "All" : ROLE_META[r]?.label || r}
              </button>
            ))}
          </div>
        </div>
        <div className="filter-group">
          <label className="filter-label">Status</label>
          <div className="pill-group">
            {STATUS_OPTIONS.map((s) => (
              <button
                key={s}
                className={`pill ${statusFilter === s ? "pill-active" : ""}`}
                onClick={() => setStatusFilter(s)}
              >
                {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="au-skeletons">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton-row" style={{ animationDelay: `${i * 0.07}s` }} />
          ))}
        </div>
      ) : error ? (
        <div className="au-error">
          <span className="error-icon">⚠</span>
          <p>{error}</p>
          <button className="btn-primary" onClick={fetchUsers}>Retry</button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="au-empty"><p>No users match the current filters.</p></div>
      ) : (
        <div className="au-table-wrap">
          <table className="au-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => {
                const isActing = actionLoading?.startsWith(user._id);
                return (
                  <tr key={user._id} className={isActing ? "row-loading" : ""}>
                    <td>
                      <div className="user-cell">
                        <div className="avatar">
                          {user.profilePicture ? (
                            <img src={user.profilePicture} alt={user.name} />
                          ) : (
                            <span>{user.name?.charAt(0)?.toUpperCase() || "?"}</span>
                          )}
                        </div>
                        <div>
                          <div className="user-name">{user.name}</div>
                          <div className="user-email">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td><RoleBadge role={user.role} /></td>
                    <td><StatusBadge status={user.status} /></td>
                    <td className="date-cell">
                      {user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString("en-GB", {
                            day: "2-digit", month: "short", year: "numeric",
                          })
                        : "—"}
                    </td>
                    <td>
                      <div className="action-row">
                        {user.role !== "admin" && (
                          <>
                            {user.status !== "approved" && (
                              <button
                                className="act-btn act-approve"
                                disabled={isActing}
                                onClick={() => confirmStatus(user._id, user.name, "approved")}
                                title="Approve"
                              >✓</button>
                            )}
                            {user.status !== "rejected" && (
                              <button
                                className="act-btn act-reject"
                                disabled={isActing}
                                onClick={() => confirmStatus(user._id, user.name, "rejected")}
                                title="Reject"
                              >✕</button>
                            )}
                          </>
                        )}
                        <button
                          className="act-btn act-delete"
                          disabled={isActing}
                          onClick={() => confirmDelete(user._id, user.name)}
                          title="Delete user"
                        >🗑</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmModal
        isOpen={!!modal}
        message={modal?.message}
        danger={modal?.danger !== false}
        onCancel={() => setModal(null)}
        onConfirm={modal?.type === "delete" ? handleDelete : handleStatusChange}
      />
    </div>
  );
}