// src/pages/HomePage.jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import { Sparkles, Briefcase, ArrowRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import ApplicationStatusBadge from "@/components/ApplicationStatusBadge";
import SkillChip from "@/components/SkillChip";
import SaveJobButton from "@/components/SaveJobButton";
import { SkeletonCard } from "@/components/Skeleton";
import Spinner from "@/components/Spinner";
import Modal from "@/components/Modal";

// ─── fake data ────────────────────────────────────────────
const DEMO_JOB = {
  _id: "1",
  title: "Senior Frontend Engineer",
  company: "TechCo",
  location: "Cairo",
  type: "full-time",
  salary: "15,000 EGP",
  status: "open",
  category: "Frontend",
};

const DEMO_SKILLS = ["React", "Node.js", "MongoDB", "TypeScript", "Tailwind"];

const CATEGORY_COLORS = {
  Frontend:           "bg-green-500/10  text-green-400  border-green-500/20",
  Backend:            "bg-blue-500/10   text-blue-400   border-blue-500/20",
  "AI/ML":            "bg-purple-500/10 text-purple-400 border-purple-500/20",
  DevOps:             "bg-teal-500/10   text-teal-400   border-teal-500/20",
  "Data Engineering": "bg-orange-500/10 text-orange-400 border-orange-500/20",
  Other:              "bg-neutral-500/10 text-neutral-400 border-neutral-500/20",
};

// ─── mini job card for showcase ───────────────────────────
function DemoJobCard({ job }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold text-white">{job.title}</p>
          <p className="text-xs text-neutral-500 mt-0.5">{job.company}</p>
        </div>
        <SaveJobButton jobId={job._id} initialSaved={false} jobStatus={job.status} />
      </div>
      <div className="flex gap-2 text-xs text-neutral-500">
        <span>{job.location}</span>
        <span>·</span>
        <span>{job.type}</span>
        <span>·</span>
        <span>{job.salary}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className={`text-xs px-2.5 py-0.5 rounded-full border font-medium ${CATEGORY_COLORS[job.category]}`}>
          {job.category}
        </span>
        <Link to={`/jobs/${job._id}`} className="text-xs text-neutral-400 hover:text-white transition flex items-center gap-1">
          View <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}

// ─── showcase block ───────────────────────────────────────
function Block({ title, children }) {
  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5 flex flex-col gap-4">
      <p className="text-xs font-medium text-neutral-500 uppercase tracking-widest">{title}</p>
      {children}
    </div>
  );
}

// ─── main ─────────────────────────────────────────────────
export default function HomePage() {
  const { isAuthenticated, user } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-neutral-950 text-white">

      {/* HERO */}
      <div className="relative border-b border-white/5 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -top-20 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 py-24 text-center relative z-10">
          <span className="inline-flex items-center gap-2 text-xs font-medium text-purple-400 bg-purple-500/10 border border-purple-500/20 px-3 py-1 rounded-full mb-6">
            <Sparkles className="w-3 h-3" /> AI-Powered Career Platform
          </span>

          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight mb-5 leading-tight">
            Find Your Next{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
              Opportunity
            </span>
          </h1>

          <p className="text-neutral-400 text-lg max-w-lg mx-auto mb-8">
            Smart job matching for GIU students. Let AI extract your skills and surface the roles that fit.
          </p>

          <div className="flex justify-center gap-3">
            <Link to="/jobs" className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-white text-black hover:bg-neutral-200 transition">
              Browse Jobs
            </Link>
            {!isAuthenticated && (
              <Link to="/register" className="px-6 py-2.5 rounded-xl text-sm font-medium border border-white/10 hover:bg-white/5 transition">
                Get Started
              </Link>
            )}
          </div>

          <div className="flex justify-center gap-12 mt-14">
            {[["500+", "Job Listings"], ["200+", "Companies"], ["AI", "Skill Matching"]].map(([val, label]) => (
              <div key={label}>
                <p className="text-2xl font-bold">{val}</p>
                <p className="text-xs text-neutral-500 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* COMPONENT SHOWCASE */}
      <div className="max-w-6xl mx-auto px-4 py-14 space-y-6">

        <div className="flex items-center gap-2 mb-2">
          <Briefcase className="w-4 h-4 text-neutral-500" />
          <h2 className="text-sm font-medium text-neutral-400 uppercase tracking-widest">Component Preview</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

          {/* Job Card */}
          <Block title="Job Card + Save Button">
            <DemoJobCard job={DEMO_JOB} />
          </Block>

          {/* Application Status Badges */}
          <Block title="Application Status Badge">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-500">After applying</span>
                <ApplicationStatusBadge status="pending" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-500">Recruiter reviewed</span>
                <ApplicationStatusBadge status="shortlisted" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-500">Not selected</span>
                <ApplicationStatusBadge status="rejected" />
              </div>
            </div>
          </Block>

          {/* Skill Chips */}
          <Block title="Skill Chips (AI Extracted)">
            <div className="flex flex-wrap gap-2">
              {DEMO_SKILLS.map((s) => <SkillChip key={s} skill={s} />)}
            </div>
            <div className="border-t border-white/5 pt-3">
              <p className="text-xs text-neutral-500 mb-2">With remove button:</p>
              <div className="flex flex-wrap gap-2">
                {DEMO_SKILLS.slice(0, 3).map((s) => (
                  <SkillChip key={s} skill={s} onRemove={() => {}} />
                ))}
              </div>
            </div>
          </Block>

          {/* Category Badges */}
          <Block title="AI Category Badges">
            <div className="flex flex-wrap gap-2">
              {Object.entries(CATEGORY_COLORS).map(([cat, cls]) => (
                <span key={cat} className={`text-xs px-2.5 py-0.5 rounded-full border font-medium ${cls}`}>
                  {cat}
                </span>
              ))}
            </div>
          </Block>

          {/* Spinner + Skeleton */}
          <Block title="Loading States">
            <div className="flex items-center gap-6">
              <div className="flex flex-col items-center gap-2">
                <Spinner size="sm" />
                <span className="text-xs text-neutral-600">sm</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Spinner size="md" />
                <span className="text-xs text-neutral-600">md</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Spinner size="lg" />
                <span className="text-xs text-neutral-600">lg</span>
              </div>
            </div>
            <div className="border-t border-white/5 pt-3">
              <SkeletonCard />
            </div>
          </Block>

          {/* Modal */}
          <Block title="Modal (Confirmation Dialog)">
            <p className="text-xs text-neutral-500">Used for delete job, withdraw application, approve recruiter.</p>
            <div className="flex gap-2">
              <button
                onClick={() => setModalOpen(true)}
                className="px-4 py-2 rounded-xl text-sm border border-white/10 hover:bg-white/5 text-neutral-300 hover:text-white transition"
              >
                Open Modal →
              </button>
            </div>
            <Modal
              open={modalOpen}
              onClose={() => setModalOpen(false)}
              onConfirm={() => setModalOpen(false)}
              title="Delete Job Post"
              description="This will permanently delete the listing and all its applications. This action cannot be undone."
              confirmLabel="Delete"
              variant="danger"
            />
          </Block>

        </div>
      </div>
    </div>
  );
}