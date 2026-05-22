import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MapPin, Building2, BriefcaseBusiness, Sparkles, TrendingUp } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getAllJobs, getRecommendedJobs, toggleSaveJob, getSavedJobs } from "@/services/jobService";

const CATEGORY_CLASSES = {
  Frontend: "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/20",
  Backend: "bg-blue-500/15 text-blue-300 ring-1 ring-blue-500/20",
  "AI/ML": "bg-purple-500/15 text-purple-300 ring-1 ring-purple-500/20",
  AIML: "bg-purple-500/15 text-purple-300 ring-1 ring-purple-500/20",
  DevOps: "bg-cyan-500/15 text-cyan-300 ring-1 ring-cyan-500/20",
  DataEngineering: "bg-orange-500/15 text-orange-300 ring-1 ring-orange-500/20",
  Other: "bg-zinc-500/15 text-zinc-300 ring-1 ring-zinc-500/20",
};

const Skeleton = () => (
  <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 animate-pulse flex flex-col gap-4">
    <div className="flex justify-between"><div className="h-6 w-20 bg-white/5 rounded-full" /><div className="h-6 w-12 bg-white/5 rounded-full" /></div>
    <div className="h-6 w-3/4 bg-white/5 rounded" />
    <div className="space-y-2">{[1,2,3].map(i=><div key={i} className="h-4 bg-white/5 rounded" style={{width:`${[50,33,40][i-1]}%`}}/>)}</div>
    <div className="space-y-1">{[1,2,3].map(i=><div key={i} className="h-3 bg-white/5 rounded" style={{width:`${[100,83,66][i-1]}%`}}/>)}</div>
  </div>
);

const JobCard = ({ job, saved, onSave, onView }) => (
  <div onClick={() => onView(job)} className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 transition hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.05] cursor-pointer flex flex-col gap-4">
    <div className="flex items-start justify-between gap-3">
      <span className={`rounded-full px-3 py-1 text-xs font-medium ${CATEGORY_CLASSES[job.category] || CATEGORY_CLASSES.Other}`}>{job.category || "Other"}</span>
      <div className="flex items-center gap-2">
        {job.score != null && <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-black">{Math.round(job.score * 100)}%</span>}
        <button onClick={e => { e.stopPropagation(); onSave(job); }} className={`p-1.5 rounded-xl transition ${saved ? "bg-white text-black" : "bg-neutral-800 text-neutral-400 hover:text-white"}`}>
          <svg className="w-4 h-4" fill={saved ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
        </button>
      </div>
    </div>
    <h2 className="text-xl font-semibold">{job.title}</h2>
    <div className="space-y-2 text-sm text-neutral-400">
      <p className="flex items-center gap-2"><Building2 className="h-4 w-4" />{job.company || "No company"}</p>
      <p className="flex items-center gap-2"><MapPin className="h-4 w-4" />{job.location || "No location"}</p>
      <p className="flex items-center gap-2"><BriefcaseBusiness className="h-4 w-4" />{job.type || "No type"}</p>
    </div>
    <p className="line-clamp-3 text-sm leading-6 text-neutral-400">{job.description || "No description."}</p>
  </div>
);

const Grid = ({ loading, jobs, savedIds, onSave, onView }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
    {loading
      ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} />)
      : jobs.map(job => <JobCard key={job._id} job={job} saved={savedIds.has(String(job._id))} onSave={onSave} onView={onView} />)
    }
  </div>
);

export default function HomePage() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const isJobSeeker = user?.role === "jobSeeker";

  const [trending, setTrending] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [savedIds, setSavedIds] = useState(new Set());
  const [trendingLoading, setTrendingLoading] = useState(true);
  const [recommendedLoading, setRecommendedLoading] = useState(false);

  useEffect(() => {
    getAllJobs({ limit: 6, sort: "-createdAt" })
      .then(d => setTrending(d.jobs || d.data || d || []))
      .catch(() => {})
      .finally(() => setTrendingLoading(false));
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !isJobSeeker) return;
    setRecommendedLoading(true);
    getRecommendedJobs().then(d => setRecommended(d.jobs || d.data?.jobs || d.data || [])).catch(() => {}).finally(() => setRecommendedLoading(false));
    getSavedJobs().then(d => setSavedIds(new Set((d.jobs || d.savedJobs || d.data || []).map(j => String(j?._id || j?.job?._id || j?.job))))).catch(() => {});
  }, [isAuthenticated, isJobSeeker]);

  const handleSave = async (job) => {
    const res = await toggleSaveJob(job._id);
    const nowSaved = res.saved ?? !savedIds.has(job._id);
    setSavedIds(prev => { const n = new Set(prev); nowSaved ? n.add(job._id) : n.delete(job._id); return n; });
  };

  const handleView = (job) => navigate(`/jobs/${job._id}`);

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <div className="max-w-6xl mx-auto px-4 py-12 space-y-14">

        {isAuthenticated && isJobSeeker && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <div><div className="flex items-center gap-2 mb-1"><h2 className="text-xl font-semibold">Recommended for you</h2></div><p className="text-xs text-neutral-500">Ranked by match score</p></div>
              <Link to="/jobs/recommended" className="text-xs text-neutral-500 hover:text-white transition">View all →</Link>
            </div>
            <Grid loading={recommendedLoading} jobs={recommended} savedIds={savedIds} onSave={handleSave} onView={handleView} />
          </section>
        )}

        <section>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2"><TrendingUp className="w-4 h-4 text-neutral-500" /><h2 className="text-xl font-semibold">Trending jobs</h2></div>
            <Link to="/jobs" className="text-xs text-neutral-500 hover:text-white transition">View all →</Link>
          </div>
          <Grid loading={trendingLoading} jobs={trending} savedIds={savedIds} onSave={handleSave} onView={handleView} />
        </section>

      </div>
    </div>
  );
}