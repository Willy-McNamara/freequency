import "./globals.css";
import "./index.css";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router";
import App from "./App";
import Feed from "./pages/Feed";
import Practice from "./pages/Practice";
import TaskLibrary from "./pages/TaskLibrary";
import Growth from "./pages/Growth";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import { PostView } from "./pages/PostView";
import ErrorBoundaryWrapper from "./ErrorBoundary.tsx";
import { SessionProvider } from "./components/SessionContext";
import { AuthProvider } from "./components/auth/AuthProvider";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";

const root = document.getElementById("root");

if (!root) {
  throw new Error("Root element not found");
}

ReactDOM.createRoot(root).render(
  <BrowserRouter>
    <ErrorBoundaryWrapper>
      <AuthProvider>
        <SessionProvider>
          <Routes>
            {/* Public route */}
            <Route path="/login" element={<Login />} />

            {/* Protected routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <App />
                </ProtectedRoute>
              }
            >
              <Route index element={<Feed />} />
              <Route path="/feed" element={<Feed />} />
              <Route path="/practice" element={<Practice />} />
              <Route path="/task-library" element={<TaskLibrary />} />
              <Route path="/growth" element={<Growth />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/post/:postId" element={<PostView />} />
              {/* Fallback for unknown routes */}
              <Route path="*" element={<h1>Page Not Found</h1>} />
            </Route>
          </Routes>
        </SessionProvider>
      </AuthProvider>
    </ErrorBoundaryWrapper>
  </BrowserRouter>
);
