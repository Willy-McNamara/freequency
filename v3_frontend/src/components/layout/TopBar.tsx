import { HamburgerMenu } from "../HamburgerMenu";
import { NavLink } from "react-router";

export function TopBar() {
  return (
    <header className="fixed top-0 left-0 w-full h-navbar bg-background z-50 flex items-center px-4 border-b border-border">
      <div className="flex items-center flex-1">
        <HamburgerMenu>
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
        </HamburgerMenu>
      </div>
      <div className="flex-shrink-0">
        <img src="/logo.svg" alt="Logo" className="h-10 w-auto ml-auto" />
      </div>
    </header>
  );
}
