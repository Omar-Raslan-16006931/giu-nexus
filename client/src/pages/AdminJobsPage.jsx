import { useState, useEffect, useCallback } from "react";
import api from "../../services/api";
import "./AdminJobsPage.css";

//dj
const CATEGORY_MAP = {
  Frontend:           { color: "#4ade80", bg: "rgba(74,222,128,0.12)" },
  Backend:            { color: "#60a5fa", bg: "rgba(96,165,250,0.12)" },
  "AI/ML":            { color: "#c084fc", bg: "rgba(192,132,252,0.12)" },
  DevOps:             { color: "#2dd4bf", bg: "rgba(45,212,191,0.12)" },
  "Data Engineering": { color: "#fb923c", bg: "rgba(251,146,60,0.12)" },
  Other:              { color: "#94a3b8", bg: "rgba(148,163,184,0.12)" },
};

const STATUS_MAP = {
  open:   { label: "Open",   color: "#4ade80", bg: "rgba(74,222,128,0.12)" },
  closed: { label: "Closed", color: "#f87171", bg: "rgba(248,113,113,0.12)" },
};

const TYPE_OPTIONS = ["all", "full-time", "part-time", "internship", "remote", "contract"];

function CategoryBadge({ category }) {
  const c = CATEGORY_MAP[category] || CATEGORY_MAP["Other"];
  return (
    <span className="ajb-badge" style={{ color: c.color, background: c.bg, borderColor: c.color }}>
      {category || "Other"}
    </span>
  );
}

function StatusBadge({ status }) {
  const s = STATUS_MAP[status] || { label: status, color: "#94a3b8", bg: "rgba(148,163,184,0.12)" };
  return (
    <span className="ajb-badge" style={{ color: s.color, background: s.bg, borderColor: s.color }}>
      {s.label}
    </span>
  );
}

function ConfirmModal({ isOpen, message, onConfirm, onCancel }) {
  if (!isOpen) return null;
  return (
    <div className="ajb-overlay" onClick={onCancel}>
      <div className="ajb-modal" onClick={(e) => e.stopPropagation()}>
        <div className="ajb-modal-icon">🗑</div>
        <p className="ajb-modal-msg">{message}</p>
        <div className="ajb-modal-actions">
          <button className="ajb-btn-ghost" onClick={onCancel}>Cancel</button>
          <button className="ajb-btn-danger" onClick={onConfirm}>Delete</button>
        </div>
      </div>
    </div>
  );
}

export default function AdminJobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [modal, setModal] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [toast, setToast] = useState(null);
  const LIMIT = 12;

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { page, limit: LIMIT };
      if (keyword.trim())         params.keyword  = keyword.trim();
      if (location.trim())        params.location = location.trim();
      if (typeFilter !== "all")   params.type     = typeFilter;
      if (statusFilter !== "all") params.status   = statusFilter;
      const { data } = await api.get("/api/v1/jobs", { params });
      if (Array.isArray(data)) { setJobs(data); setTotal(data.length); }
      else { setJobs(data.jobs || data.data || []); setTotal(data.total || data.count || 0); }
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load jobs.");
    } finally {
      setLoading(false);
    }
  }, [keyword, location, typeFilter, statusFilter, page]);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);
  useEffect(() => { setPage(1); }, [keyword, location, typeFilter, statusFilter]);

  const handleDelete = async () => {
    const { jobId, title } = modal;
    setDeletingId(jobId);
    setModal(null);
    try {
      await api.delete(`/api/v1/jobs/${jobId}`);
      setJobs((prev) => prev.filter((j) => j._id !== jobId));
      setTotal((t) => t - 1);
      showToast(`"${title}" deleted.`);
    } catch (err) {
      showToast(err?.response?.data?.message || "Delete failed.", "error");
    } finally {
      setDeletingId(null);
    }
  };

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="ajb-page">
      {toast && <div className={`ajb-toast ajb-toast-${toast.type}`}>{toast.msg}</div>}

      <div className="ajb-header">
        <h1 className="ajb-title">Job Listings</h1>
        <p className="ajb-subtitle">
          {loading ? "Loading…" : `${total} job${total !== 1 ? "s" : ""} in the system`}
        </p>
      </div>

      <div className="ajb-filters">
        <input className="ajb-input" type="text" placeholder="Search keyword…" value={keyword} onChange={(e) => setKeyword(e.target.value)} />
        <input className="ajb-input" type="text" placeholder="Location…" value={location} onChange={(e) => setLocation(e.target.value)} />
        <div className="ajb-filter-group">
          <span className="ajb-filter-label">Status</span>
          <div className="ajb-pills">
            {["all", "open", "closed"].map((s) => (
              <button key={s} className={`ajb-pill ${statusFilter === s ? "ajb-pill-active" : ""}`} onClick={() => setStatusFilter(s)}>
                {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div className="ajb-filter-group">
          <span className="ajb-filter-label">Type</span>
          <div className="ajb-pills">
            {TYPE_OPTIONS.map((t) => (
              <button key={t} className={`ajb-pill ${typeFilter === t ? "ajb-pill-active" : ""}`} onClick={() => setTypeFilter(t)}>
                {t === "all" ? "All" : t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="ajb-grid">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="ajb-skeleton" style={{ animationDelay: `${i * 0.06}s` }} />
          ))}
        </div>
      ) : error ? (
        <div className="ajb-state">
          <span className="ajb-state-icon">⚠</span>
          <p>{error}</p>
          <button className="ajb-btn-primary" onClick={fetchJobs}>Retry</button>
        </div>
      ) : jobs.length === 0 ? (
        <div className="ajb-state">
          <span className="ajb-state-icon">📭</span>
          <p>No jobs match the current filters.</p>
        </div>
      ) : (
        <>
          <div className="ajb-grid">
            {jobs.map((job) => {
              const isDeleting = deletingId === job._id;
              return (
                <div key={job._id} className={`ajb-card ${isDeleting ? "ajb-card-deleting" : ""}`}>
                  <div className="ajb-card-top">
                    <div className="ajb-card-badges">
                      <StatusBadge status={job.status} />
                      <CategoryBadge category={job.category} />
                    </div>
                    <button
                      className="ajb-delete-btn"
                      disabled={isDeleting}
                      onClick={() => setModal({ jobId: job._id, title: job.title, message: `Delete "${job.title}"? This action is permanent.` })}
                      title="Delete job"
                    >
                      {isDeleting ? "…" : "🗑"}
                    </button>
                  </div>
                  <h3 className="ajb-job-title">{job.title}</h3>
                  <p className="ajb-company">{job.company}</p>
                  <div className="ajb-meta">
                    {job.location && <span className="ajb-meta-item"><span className="ajb-meta-icon">📍</span> {job.location}</span>}
                    {job.type && <span className="ajb-meta-item"><span className="ajb-meta-icon">⏱</span> {job.type}</span>}
                    {job.salary && <span className="ajb-meta-item"><span className="ajb-meta-icon">💰</span> {job.salary}</span>}
                  </div>
                  <div className="ajb-card-footer">
                    <span className="ajb-applicants">
                      {job.applicants?.length ?? job.applicantCount ?? 0} applicant{(job.applicants?.length ?? job.applicantCount ?? 0) !== 1 ? "s" : ""}
                    </span>
                    <span className="ajb-posted">
                      {job.createdAt ? new Date(job.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : ""}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="ajb-pagination">
              <button className="ajb-page-btn" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>← Prev</button>
              <span className="ajb-page-info">Page {page} of {totalPages}</span>
              <button className="ajb-page-btn" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>Next →</button>
            </div>
          )}
        </>
      )}

      <ConfirmModal isOpen={!!modal} message={modal?.message} onCancel={() => setModal(null)} onConfirm={handleDelete} />
    </div>
  );
}