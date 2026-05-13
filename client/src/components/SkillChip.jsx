// src/components/SkillChip.jsx
export default function SkillChip({ skill, onRemove }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-white/5 text-neutral-300 border border-white/10 hover:border-white/20 hover:text-white transition">
      {skill}
      {onRemove && (
        <button
          onClick={() => onRemove(skill)}
          className="text-neutral-500 hover:text-white transition ml-0.5"
        >
          ×
        </button>
      )}
    </span>
  );
}