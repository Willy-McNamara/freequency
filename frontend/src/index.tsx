import React from 'react';
import { createRoot } from "react-dom/client";
import router from './routes'
import {
  RouterProvider,
  Route,
} from "react-router-dom";

const rootElement = document.getElementById("root");

if (rootElement) {
  createRoot(rootElement).render(
    <RouterProvider router={router} />
  );
} else {
  console.error("Root element with id 'root' not found.");
}


