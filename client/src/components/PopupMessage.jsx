import { useEffect, useState } from "react";
import { X } from "lucide-react";

export default function PopupMessage({
  open,
  onClose,
  message,
  variant = "default",
}) {
  const [visible, setVisible] = useState(open);
  const [closing, setClosing] = useState(false);
  const [progressActive, setProgressActive] = useState(false);
  const durationMs = 5000;
  const closingMs = 300;

  useEffect(() => {
    setVisible(open);
    setClosing(false);
    setProgressActive(false);
    if (open) {
      
      const t = setTimeout(() => setProgressActive(true), 10);
      
      const tClose = setTimeout(() => setClosing(true), durationMs);
      const tHide = setTimeout(() => {
        setVisible(false);
        onClose?.();
      }, durationMs + closingMs);
      return () => {
        clearTimeout(t);
        clearTimeout(tClose);
        clearTimeout(tHide);
      };
    }
  }, [open]);

  

  if (!visible) return null;

  const variantClasses =
    variant === "success"
      ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-100"
      : variant === "warning"
        ? "border-amber-500/20 bg-amber-500/10 text-amber-100"
        : "border-white/10 bg-neutral-900 text-white";

  return (
    <div
      className={`fixed right-4 top-4 z-[60] w-[calc(100%-2rem)] max-w-sm rounded-2xl p-0 shadow-2xl backdrop-blur-sm md:right-6 md:top-6 transition-all ${
        closing ? "opacity-0 -translate-y-2 scale-95" : "opacity-100 translate-y-0 scale-100"
      }`}
        style={{ transitionDuration: `${closingMs}ms` }}
    >
      <div className={`flex flex-col rounded-xl border p-4 ${variantClasses} overflow-hidden`}>{/* container */}
        <div className="flex items-start gap-3">
          <p className="flex-1 text-sm leading-relaxed">{message}</p>
          <button
            type="button"
            onClick={() => {
              setClosing(true);
              setTimeout(() => {
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

        {/* progress bar */}
        <div className="mt-3 h-1 w-full bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full bg-white/60"
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
