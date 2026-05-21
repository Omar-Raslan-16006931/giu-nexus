export function MenuToggleIcon({ open }) {

  return (
    <div className="relative w-5 h-5">

      <span
        className={`absolute h-0.5 w-5 bg-current transition-all duration-300 ${
          open
            ? "rotate-45 top-2"
            : "top-1"
        }`}
      />

      <span
        className={`absolute h-0.5 w-5 bg-current transition-all duration-300 ${
          open
            ? "-rotate-45 top-2"
            : "top-3"
        }`}
      />

    </div>
  );
}