// import { useState } from "react";
import "./App.css";
import { Outlet } from "react-router";
import { NavLink } from "react-router";
import { HamburgerMenu } from "./components/HamburgerMenu";
import { useAuth } from "./components/auth/AuthProvider";
import { Button } from "./components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./components/ui/avatar";
import { TopBar } from "./components/layout/TopBar";

function App() {
  const { user, logout } = useAuth();

  return (
    <>
      <TopBar />
      <main className="flex w-full pt-navbar">
        <Outlet />
      </main>
    </>
  );
}

export default App;
