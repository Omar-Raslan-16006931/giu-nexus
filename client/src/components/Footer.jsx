export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-neutral-950 mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">

        
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-xs">
            G
          </div>
          <span className="text-sm font-semibold text-white">GIU Nexus</span>
          <span className="text-neutral-600 text-sm">·</span>
          <span className="text-neutral-500 text-xs">AI-Powered Career Platform</span>
        </div>

        
        <div className="flex flex-wrap justify-center sm:justify-end items-center gap-x-3 gap-y-1">
          <span className="text-neutral-600 text-xs">Built by</span>
          {["Name 1", "Name 2", "Name 3", "Name 4","Name 5","Name 6","Name 7","Name 8"].map((name) => (
            <span key={name} className="text-xs text-neutral-400 hover:text-white transition cursor-default">
              {name}
            </span>
          ))}
        </div>

      </div>

      
      <div className="border-t border-white/5 py-3 text-center">
        <p className="text-xs text-neutral-600">
          © {new Date().getFullYear()} GIU Nexus · German International University · Software Engineering Spring 2026
        </p>
      </div>
    </footer>
  );
}