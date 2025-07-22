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
