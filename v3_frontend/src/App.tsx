// import { useState } from "react";
import "./App.css";
import { Outlet } from "react-router";
// import { useAuth } from "./components/auth/AuthProvider";
import { TopBar } from "./components/layout/TopBar";

function App() {
  // const { user, logout } = useAuth();

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
