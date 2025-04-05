import "./index.css";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router";
import App from "./App";
import Feed from "./pages/Feed";
import Practice from "./pages/Practice";
import TaskLibrary from "./pages/TaskLibrary";
import Growth from "./pages/Growth";
import Profile from "./pages/Profile";
import ErrorBoundaryWrapper from "./ErrorBoundary.tsx";

const root = document.getElementById("root");

if (!root) {
  throw new Error("Root element not found");
}

ReactDOM.createRoot(root).render(
  <BrowserRouter>
    <ErrorBoundaryWrapper>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<Feed />} />
          <Route path="/practice" element={<Practice />} />
          <Route path="/task-library" element={<TaskLibrary />} />
          <Route path="/growth" element={<Growth />} />
          <Route path="/profile" element={<Profile />} />
          {/* Fallback for unknown routes */}
          <Route path="*" element={<h1>Page Not Found</h1>} />
        </Route>
      </Routes>
    </ErrorBoundaryWrapper>
  </BrowserRouter>
);
