export function MenuToggleIcon({ open }) {
  return (
    <div className="relative w-5 h-5 flex items-center justify-center">
      <span
        className={`absolute h-0.5 w-5 bg-current transition-all duration-300 ${
          open ? "rotate-45 translate-y-0" : "-translate-y-1.5"
        }`}
      />
      <span
        className={`absolute h-0.5 w-5 bg-current transition-all duration-300 ${
          open ? "-rotate-45 translate-y-0" : "translate-y-1.5"
        }`}
      />
    </div>
  );
}