// src/components/Modal.jsx
import { useEffect } from "react";
import { X } from "lucide-react";

export default function Modal({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "default", // "default" | "danger"
  loading = false,
}) {
  // close on Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    if (open) window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  // lock body scroll
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  const confirmStyles = variant === "danger"
    ? "bg-red-500 hover:bg-red-600 text-white"
    : "bg-white hover:bg-neutral-200 text-black";

  return (
    // backdrop
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* panel — stop click bubbling to backdrop */}
      <div
        className="w-full max-w-md rounded-2xl border border-white/10 bg-neutral-900 p-6 shadow-xl flex flex-col gap-5"
        onClick={(e) => e.stopPropagation()}
      >

        {/* header */}
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-base font-semibold text-white">{title}</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-500 hover:text-white hover:bg-white/5 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* description */}
        {description && (
          <p className="text-sm text-neutral-400 leading-relaxed">{description}</p>
        )}

        {/* actions */}
        <div className="flex justify-end gap-2 pt-1">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 rounded-xl text-sm font-medium text-neutral-400 hover:text-white hover:bg-white/5 border border-white/10 transition disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition disabled:opacity-50 flex items-center gap-2 ${confirmStyles}`}
          >
            {loading && (
              <div className="w-3.5 h-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
            )}
            {confirmLabel}
          </button>
        </div>

      </div>
    </div>
  );
}