// import { useState } from "react";
import "./App.css";
import { Outlet } from "react-router";
import { NavLink } from "react-router";
import { HamburgerMenu } from "./components/HamburgerMenu";
import { useAuth } from "./components/auth/AuthProvider";
import { Button } from "./components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./components/ui/avatar";

function App() {
  const { user, logout } = useAuth();

  return (
    <>
      <HamburgerMenu>
        <nav className="space-y-4">
          {/* User info section */}
          {user && (
            <div className="flex items-center space-x-3 p-2 border-b border-border mb-4">
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={user.avatarUrl}
                  alt={user.displayName || user.name}
                />
                <AvatarFallback>
                  {user.displayName?.charAt(0) || user.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {user.displayName || user.name}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user.email}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="text-xs"
              >
                Logout
              </Button>
            </div>
          )}

          {/* Navigation links */}
          <NavLink
            to="/"
            className={({ isActive }) =>
              `block p-2 rounded-md transition-colors ${
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
              `block p-2 rounded-md transition-colors ${
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
              `block p-2 rounded-md transition-colors ${
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
              `block p-2 rounded-md transition-colors ${
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
              `block p-2 rounded-md transition-colors ${
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
      <main className="flex mt-8 p-4">
        <Outlet />
      </main>
    </>
  );
}

export default App;
