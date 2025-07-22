import { HamburgerMenu } from "../HamburgerMenu";
import { NavLink } from "react-router";
import { useAuth } from "../auth/AuthProvider";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Button } from "../ui/button";
import { LogOut } from "lucide-react";

export function TopBar() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      // The logout function should handle the redirect
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <header className="fixed top-0 left-0 w-full h-navbar bg-background z-50 flex items-center px-4 border-b border-border">
      <div className="flex items-center flex-1">
        <HamburgerMenu>
          {/* User Profile Section */}
          {user && (
            <div className="mt-auto mb-2 px-3 py-4 border-b border-border">
              <div className="flex items-center gap-3 mb-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-sm">
                    {user.displayName?.[0] ||
                      user.name?.[0] ||
                      user.email?.[0] ||
                      "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {user.displayName || user.name || "User"}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user.email}
                  </p>
                </div>
              </div>
            </div>
          )}
          <nav className="flex flex-col gap-2 mt-4">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `px-3 py-2 rounded-md transition-colors text-base font-medium ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-accent hover:text-accent-foreground"
                }`
              }
            >
              Feed
            </NavLink>
            <NavLink
              to="/practice"
              className={({ isActive }) =>
                `px-3 py-2 rounded-md transition-colors text-base font-medium ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-accent hover:text-accent-foreground"
                }`
              }
            >
              Practice
            </NavLink>
            <NavLink
              to="/task-library"
              className={({ isActive }) =>
                `px-3 py-2 rounded-md transition-colors text-base font-medium ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-accent hover:text-accent-foreground"
                }`
              }
            >
              Task Library
            </NavLink>
            <NavLink
              to="/growth"
              className={({ isActive }) =>
                `px-3 py-2 rounded-md transition-colors text-base font-medium ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-accent hover:text-accent-foreground"
                }`
              }
            >
              Growth / Stats
            </NavLink>
            <NavLink
              to="/profile"
              className={({ isActive }) =>
                `px-3 py-2 rounded-md transition-colors text-base font-medium ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-accent hover:text-accent-foreground"
                }`
              }
            >
              Profile
            </NavLink>
          </nav>

          <div className="flex flex-col items-start justify-end flex-1 h-full">
            <NavLink
              to="/about"
              className={({ isActive }) =>
                `mt-auto mb-4 ml-1 flex items-center gap-2 px-2 py-2 rounded-full transition-colors text-base font-medium ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-accent hover:text-accent-foreground"
                }`
              }
              style={{ position: "absolute", bottom: 16, left: 16 }}
              title="About / Info"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
            </NavLink>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="justify-center gap-2"
              style={{ position: "absolute", bottom: 36, left: 150 }}
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </HamburgerMenu>
      </div>
      <div className="flex-shrink-0">
        <NavLink to="/about" title="About / Info">
          <img
            src="/logo.svg"
            alt="Logo"
            className="h-10 w-auto ml-auto cursor-pointer"
          />
        </NavLink>
      </div>
    </header>
  );
}
