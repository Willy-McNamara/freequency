import React from "react";
import { Link, Outlet } from 'react-router-dom'

const Root = () => {
  return(
    <div>
        <h1>Route shell</h1>
        <Link to="Feed">Feed</Link>
        <Link to="Profile">Profile</Link>
        <Link to="Practice">Practice</Link>
        <Outlet />
      </div>
  )
}

export default Root;