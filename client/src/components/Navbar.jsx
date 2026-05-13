import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MenuToggleIcon } from "@/components/ui/menu-toggle-icon";
import { useScroll } from "@/components/ui/use-scroll";
import { useAuth } from "@/context/AuthContext";

const ROLE_LINKS = {
  jobSeeker: [
    { label: "Jobs", href: "/jobs" },
    { label: "Saved", href: "/jobs/saved" },
    { label: "Applications", href: "/applications/my" },
    { label: "Profile", href: "/profile" },
  ],
  recruiter: [
    { label: "Dashboard", href: "/recruiter/dashboard" },
    { label: "Post a Job", href: "/recruiter/jobs/create" },
  ],
  admin: [
    { label: "Dashboard", href: "/admin/dashboard" },
    { label: "Recruiters", href: "/admin/recruiters" },
    { label: "Jobs", href: "/admin/jobs" },
    { label: "Users", href: "/admin/users" },
  ],
};

export default function Navbar() {
  const [open, setOpen] = React.useState(false);
  const scrolled = useScroll(10);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const links = isAuthenticated
    ? (ROLE_LINKS[user?.role] ?? [])
    : [{ label: "Browse Jobs", href: "/jobs" }];

  React.useEffect(() => { setOpen(false); }, [location.pathname]);

  React.useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-50 mx-auto w-full max-w-5xl border-b border-transparent md:rounded-md md:border md:transition-all md:ease-out",
        {
          "bg-background/95 supports-[backdrop-filter]:bg-background/50 border-border backdrop-blur-lg md:top-4 md:max-w-4xl md:shadow":
            scrolled && !open,
          "bg-background/90": open,
        }
      )}
    >
      <nav
        className={cn(
          "flex h-14 w-full items-center justify-between px-4 md:h-12 md:transition-all md:ease-out",
          { "md:px-2": scrolled }
        )}
      >
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 flex-shrink-0">
          <img src="/giunexus.pfp.png" alt="Home" className="h-22 w-auto" />
          <span className="font-bold text-base text-foreground hidden sm:inline">Home</span>
        </Link>

        {/* Desktop links */}
        <div className="hidden items-center gap-1 md:flex flex-1 ml-8">
          {links.map((link) => (
            <Link
              key={link.label}
              to={link.href}
              className={buttonVariants({ variant: "ghost", className: "text-sm" })}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop auth */}
        <div className="hidden items-center gap-1.5 md:flex">
          {isAuthenticated ? (
            <>
              <Link
                to="/profile"
                className="flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-muted transition-colors"
              >
                {user?.profilePicture ? (
                  <img
                    src={user.profilePicture}
                    alt={user.name}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
                    {user?.name?.charAt(0)?.toUpperCase()}
                  </div>
                )}
                <span className="text-xs font-medium text-foreground hidden sm:inline">
                  {user?.name?.split(" ")[0]}
                </span>
              </Link>
              <Button variant="outline" size="sm" className="text-xs" onClick={handleLogout}>
                Log Out
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="outline" size="sm">Sign In</Button>
              </Link>
              <Link to="/register">
                <Button size="sm">Get Started</Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <Button
          size="icon"
          variant="outline"
          onClick={() => setOpen(!open)}
          className="md:hidden"
        >
          <MenuToggleIcon open={open} className="size-5" duration={300} />
        </Button>
      </nav>

      {/* Mobile menu */}
      <div
        className={cn(
          "bg-background/90 fixed top-14 right-0 bottom-0 left-0 z-50 flex flex-col overflow-hidden border-y md:hidden",
          open ? "block" : "hidden"
        )}
      >
        <div
          data-slot={open ? "open" : "closed"}
          className={cn(
            "data-[slot=open]:animate-in data-[slot=open]:zoom-in-95 data-[slot=closed]:animate-out data-[slot=closed]:zoom-out-95 ease-out",
            "flex h-full w-full flex-col justify-between gap-y-2 p-4"
          )}
        >
          <div className="grid gap-y-2">
            {links.map((link) => (
              <Link
                key={link.label}
                to={link.href}
                className={buttonVariants({ variant: "ghost", className: "justify-start" })}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex flex-col gap-2">
            {isAuthenticated ? (
              <>
                <Link
                  to="/profile"
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-muted"
                >
                  {user?.profilePicture ? (
                    <img
                      src={user.profilePicture}
                      alt={user.name}
                      className="w-7 h-7 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
                      {user?.name?.charAt(0)?.toUpperCase()}
                    </div>
                  )}
                  <span className="text-sm font-medium text-foreground">
                    {user?.name}
                  </span>
                </Link>
                <Button variant="outline" className="w-full text-xs" onClick={handleLogout}>
                  Log Out
                </Button>
              </>
            ) : (
              <>
                <Link to="/login" className="w-full">
                  <Button variant="outline" className="w-full text-xs">Sign In</Button>
                </Link>
                <Link to="/register" className="w-full">
                  <Button className="w-full text-xs">Get Started</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}