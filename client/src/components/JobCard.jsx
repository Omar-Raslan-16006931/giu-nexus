
import { MapPin, Briefcase, DollarSign, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import ApplicationStatusBadge from "@/components/ApplicationStatusBadge";

const CATEGORY_COLORS = {
  Frontend:         "bg-green-900/60 text-green-300",
  Backend:          "bg-blue-900/60 text-blue-300",
  "AI/ML":          "bg-purple-900/60 text-purple-300",
  DevOps:           "bg-teal-900/60 text-teal-300",
  "Data Engineering": "bg-orange-900/60 text-orange-300",
  Other:            "bg-neutral-800 text-neutral-300",
};

export default function JobCard({ job, onView, onSave, saved = false }) {
  const categoryStyle =
    CATEGORY_COLORS[job.category] ?? CATEGORY_COLORS.Other;

  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4 hover:bg-neutral-800/70 transition flex flex-col gap-3">

     
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-base font-semibold leading-snug truncate">
            {job.title}
          </h2>
          <p className="text-sm text-neutral-400 truncate mt-0.5">
            {job.company}
          </p>
        </div>

        <button
          onClick={onSave}
          className={`shrink-0 p-1.5 rounded-xl transition ${
            saved
              ? "bg-white text-black"
              : "bg-neutral-800 text-neutral-400 hover:text-white"
          }`}
        >
          <Bookmark
            className="w-4 h-4"
            fill={saved ? "currentColor" : "none"}
          />
        </button>
      </div>

      
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-400">
        <span className="flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5" />
          {job.location}
        </span>
        <span className="flex items-center gap-1">
          <Briefcase className="w-3.5 h-3.5" />
          {job.type}
        </span>
        {job.salary && (
          <span className="flex items-center gap-1">
            <DollarSign className="w-3.5 h-3.5" />
            {job.salary}
          </span>
        )}
      </div>

      
      <div className="flex items-center justify-between gap-2 pt-1">
        <div className="flex items-center gap-2 flex-wrap">
          {job.category && (
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${categoryStyle}`}>
              {job.category}
            </span>
          )}
          {job.applicationStatus && (
            <ApplicationStatusBadge status={job.applicationStatus} />
          )}
        </div>

        <Button
          onClick={onView}
          size="sm"
          className="rounded-xl shrink-0 text-xs px-4"
        >
          View
        </Button>
      </div>

    </div>
  );
}