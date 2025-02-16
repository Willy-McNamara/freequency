// import { useState } from "react";
import "./App.css";
import { Outlet } from "react-router";
import { NavLink } from "react-router";

function App() {
  // const [count, setCount] = useState(0);

  return (
    <>
      <div>
        {/* menu */}
        <div>
          <NavLink to="/">Feed</NavLink>
        </div>
        <div>
          <NavLink to="/practice">Practice</NavLink>
        </div>
        <div>
          <NavLink to="/taskLibrary">Task Library</NavLink>
        </div>
        <div>
          <NavLink to="/growth">Growth / Stats</NavLink>
        </div>
        <div>
          <NavLink to="/profile">Profile</NavLink>
        </div>
      </div>
      <Outlet />
    </>
  );
}

export default App;
