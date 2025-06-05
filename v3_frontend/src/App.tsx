// import { useState } from "react";
import "./App.css";
import { Outlet } from "react-router";
import { NavLink } from "react-router";
import { HamburgerMenu } from "./components/HamburgerMenu";

function App() {
  return (
    <>
      <HamburgerMenu>
        <nav className="space-y-4">
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
      <main className="p-4">
        <Outlet />
      </main>
    </>
  );
}

export default App;
