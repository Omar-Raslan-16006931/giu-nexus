import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MenuToggleIcon } from "@/components/ui/menu-toggle-icon";
import { useScroll } from "@/components/ui/use-scroll";
import { useAuth } from "@/context/AuthContext";
import PopupMessage from "./PopupMessage";
import api from "../services/api";

const ROLE_LINKS = {
  jobseeker: [
    { label: "Jobs", href: "/jobs" },
    { label: "Saved", href: "/jobs/saved" },
    { label: "Recommended", href: "/jobs/recommended" },
    { label: "Applications", href: "/applications/my" },
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
  const [popupDismissed, setPopupDismissed] = React.useState(false);
  const scrolled = useScroll(10);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const popup = location.state?.popup;
  const [liveStatus, setLiveStatus] = React.useState(user?.status || "");

    React.useEffect(() => {
     if (!isAuthenticated) return;
     api.get("/profile")
     .then(({ data }) => setLiveStatus(data.user?.status || ""))
     .catch(() => {});
    }, [isAuthenticated, location.pathname]);

    const pendingNotice =
     isAuthenticated && liveStatus === "pending"
     ? "Account pending admin approval"
     : location.state?.flashMessage || "";

  const getImageSrc = (pic) =>
    !pic
      ? ""
      : pic.startsWith("http") || pic.startsWith("blob:")
      ? pic
      : `${api.defaults.baseURL.replace("/api/v1", "")}${pic}`;

  React.useEffect(() => {
    setPopupDismissed(false);
  }, [location.pathname, popup?.message, popup?.variant]);

  const normalizedRole = user?.role?.toLowerCase();

  const links = isAuthenticated
    ? ROLE_LINKS[normalizedRole] ?? []
    : [{ label: "Jobs", href: "/jobs" }];

  React.useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  React.useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <>
      {popup && !popupDismissed && (
        <PopupMessage
          open
          message={popup.message}
          variant={popup.variant}
          onClose={() => setPopupDismissed(true)}
        />
      )}

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
          <div className="hidden items-center md:flex flex-1 ml-4">
            <Link
              to="/"
              className="flex items-center gap-2 flex-shrink-0 rounded-xl px-2 py-1 transition-all duration-200 hover:-translate-y-0.5 hover:bg-muted"
            >
              <img src="/giunexus.pfp.png" alt="Home" className="h-20 w-auto" />
              <span className="hidden sm:inline text-sm font-semibold tracking-[0.18em] uppercase text-foreground">
                Home
              </span>
            </Link>

            <span className="mx-2 h-4 w-px bg-gray-500" />

            <div className="flex items-center gap-1">
              {links.map((link, index) => (
                <React.Fragment key={link.label}>
                  {index > 0 && <span className="h-3.5 w-px bg-gray-500" />}
                  <Link
                    to={link.href}
                    className={buttonVariants({
                      variant: "ghost",
                      className:
                        "text-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-muted hover:shadow-sm",
                    })}
                  >
                    {link.label}
                  </Link>
                </React.Fragment>
              ))}
            </div>
          </div>

          <div className="hidden items-center gap-1.5 md:flex">
            {isAuthenticated ? (
              <>
                {pendingNotice && (
                  <span className="max-w-44 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-[11px] font-medium text-amber-100">
                    {pendingNotice}
                  </span>
                )}

                <Link
                  to="/profile"
                  className={buttonVariants({
                    variant: "outline",
                    size: "sm",
                    className:
                      "cursor-pointer flex items-center gap-1.5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:bg-muted text-xs px-3",
                  })}
                >
                  {user?.profilePicture ? (
                    <img
                      src={getImageSrc(user.profilePicture)}
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

                <Button
                  variant="outline"
                  size="sm"
                  className="cursor-pointer text-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:bg-muted"
                  onClick={handleLogout}
                >
                  Log Out
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button
                    variant="outline"
                    size="sm"
                    className="cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:bg-muted"
                  >
                    Sign In
                  </Button>
                </Link>

                <Link to="/register">
                  <Button
                    variant="outline"
                    size="sm"
                    className="cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:bg-muted"
                  >
                    Register
                  </Button>
                </Link>
              </>
            )}
          </div>

          <Button
            size="icon"
            variant="outline"
            onClick={() => setOpen(!open)}
            className="md:hidden"
          >
            <MenuToggleIcon open={open} className="size-5" duration={300} />
          </Button>
        </nav>

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
              {links.map((link, index) => (
                <React.Fragment key={link.label}>
                  {index > 0 && <span className="mx-2 h-px bg-gray-500" />}
                  <Link
                    to={link.href}
                    className={buttonVariants({
                      variant: "ghost",
                      className:
                        "justify-start transition-all duration-200 hover:translate-x-0.5",
                    })}
                  >
                    {link.label}
                  </Link>
                </React.Fragment>
              ))}
            </div>

            <div className="flex flex-col gap-2">
              {isAuthenticated ? (
                <>
                  {pendingNotice && (
                    <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-xs font-medium text-amber-100">
                      {pendingNotice}
                    </div>
                  )}

                  <Link
                    to="/profile"
                    className={buttonVariants({
                      variant: "outline",
                      size: "sm",
                      className:
                        "w-full justify-start cursor-pointer flex items-center gap-2.5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:bg-muted text-xs px-3 py-2",
                    })}
                  >
                    {user?.profilePicture ? (
                      <img
                        src={getImageSrc(user.profilePicture)}
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

                  <Button
                    variant="outline"
                    className="w-full text-xs"
                    onClick={handleLogout}
                  >
                    Log Out
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/login" className="w-full">
                    <Button className="w-full text-xs cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:bg-muted" variant="outline">
                      Sign In
                    </Button>
                  </Link>

                  <Link to="/register" className="w-full">
                    <Button className="w-full text-xs cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:bg-muted" variant="outline">
                      Register
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  );
}