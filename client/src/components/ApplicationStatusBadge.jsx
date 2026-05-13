const STATUS = {
  pending:     { label: "Pending",     classes: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" },
  shortlisted: { label: "Shortlisted", classes: "bg-green-500/10  text-green-400  border-green-500/20"  },
  rejected:    { label: "Rejected",    classes: "bg-red-500/10    text-red-400    border-red-500/20"    },
};

export default function ApplicationStatusBadge({ status }) {
  const s = STATUS[status] ?? STATUS.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${s.classes}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {s.label}
    </span>
  );
}