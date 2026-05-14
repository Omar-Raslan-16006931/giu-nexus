import { useEffect, useState } from "react";
import { X } from "lucide-react";

export default function PopupMessage({
  open,
  onClose,
  message,
  title,
  variant = "default",
  durationMs = 5000,
}) {
  const [visible, setVisible] = useState(open);
  const [closing, setClosing] = useState(false);
  const [entered, setEntered] = useState(false);
  const [progressActive, setProgressActive] = useState(false);
  const closingMs = 300;

  useEffect(() => {
    let entryTimer;
    let progressTimer;
    let closeTimer;
    let hideTimer;

    setVisible(open);
    setClosing(false);
    setEntered(false);
    setProgressActive(false);

    if (open) {
      entryTimer = window.setTimeout(() => setEntered(true), 20);
      progressTimer = window.setTimeout(() => setProgressActive(true), 20);
      closeTimer = window.setTimeout(() => setClosing(true), durationMs);
      hideTimer = window.setTimeout(() => {
        setVisible(false);
        onClose?.();
      }, durationMs + closingMs);
    }

    return () => {
      window.clearTimeout(entryTimer);
      window.clearTimeout(progressTimer);
      window.clearTimeout(closeTimer);
      window.clearTimeout(hideTimer);
    };
  }, [open, durationMs, onClose]);

  if (!visible) return null;

  const variantClasses =
    variant === "success"
      ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-100"
      : variant === "warning"
        ? "border-amber-500/20 bg-amber-500/10 text-amber-100"
        : variant === "error"
          ? "border-red-500/20 bg-red-500/10 text-red-100"
          : "border-white/10 bg-neutral-900 text-white";

  const titleText =
    title ||
    (variant === "success"
      ? "Success"
      : variant === "warning"
        ? "Warning"
        : variant === "error"
          ? "Error"
          : "Notice");

  const progressClass =
    variant === "success"
      ? "bg-emerald-300"
      : variant === "warning"
        ? "bg-amber-300"
        : variant === "error"
          ? "bg-red-300"
          : "bg-white/60";

  return (
    <div
      className={`fixed right-4 top-4 z-[60] w-[calc(100%-2rem)] max-w-sm rounded-2xl p-0 shadow-2xl backdrop-blur-sm md:right-6 md:top-6 transition-all duration-200 ease-out ${
        closing
          ? "opacity-0 -translate-y-2 scale-95"
          : entered
            ? "opacity-100 translate-y-0 scale-100"
            : "opacity-0 -translate-y-1 scale-95"
      }`}
      style={{ transitionDuration: `${closingMs}ms` }}
    >
      <div className={`flex flex-col rounded-xl border p-4 ${variantClasses} overflow-hidden`}>
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium leading-relaxed">{titleText}</p>
            <p className="mt-1 text-sm leading-relaxed opacity-90">{message}</p>
          </div>
          <button
            type="button"
            onClick={() => {
              setClosing(true);
              window.setTimeout(() => {
                setVisible(false);
                onClose?.();
              }, closingMs);
            }}
            className="rounded-lg p-1 text-current/70 transition hover:bg-white/10 hover:text-current"
            aria-label="Close message"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-white/5">
          <div
            className={`h-full ${progressClass}`}
            style={{
              width: progressActive ? "0%" : "100%",
              transition: `width ${durationMs}ms linear`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
