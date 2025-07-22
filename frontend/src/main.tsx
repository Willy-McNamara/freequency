import "./globals.css";
import "./index.css";
import "./App.css";
import { Suspense, lazy } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router";
import Login from "./pages/Login";
import ErrorBoundaryWrapper from "./ErrorBoundary.tsx";
import { AuthProvider } from "./components/auth/AuthProvider";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";

// Lazy load all protected components
const App = lazy(() => import("./App"));
const Feed = lazy(() => import("./pages/Feed"));
const Practice = lazy(() => import("./pages/Practice"));
const TaskLibrary = lazy(() => import("./pages/TaskLibrary"));
const Growth = lazy(() => import("./pages/Growth"));
const Profile = lazy(() => import("./pages/Profile"));
const PostView = lazy(() =>
  import("./pages/PostView").then((m) => ({ default: m.PostView }))
);
const About = lazy(() => import("./pages/About"));
const SessionProvider = lazy(() =>
  import("./components/SessionContext").then((m) => ({
    default: m.SessionProvider,
  }))
);

const LoadingScreen = () => (
  <div className="flex items-center justify-center min-h-screen text-lg">
    Loading...
  </div>
);

const root = document.getElementById("root");

if (!root) {
  throw new Error("Root element not found");
}

ReactDOM.createRoot(root).render(
  <BrowserRouter>
    <ErrorBoundaryWrapper>
      <AuthProvider>
        <Routes>
          {/* Public route */}
          <Route path="/login" element={<Login />} />

          {/* Protected routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Suspense fallback={<LoadingScreen />}>
                  <SessionProvider>
                    <App />
                  </SessionProvider>
                </Suspense>
              </ProtectedRoute>
            }
          >
            <Route
              index
              element={
                <Suspense fallback={<LoadingScreen />}>
                  <Feed />
                </Suspense>
              }
            />
            <Route
              path="/feed"
              element={
                <Suspense fallback={<LoadingScreen />}>
                  <Feed />
                </Suspense>
              }
            />
            <Route
              path="/practice"
              element={
                <Suspense fallback={<LoadingScreen />}>
                  <Practice />
                </Suspense>
              }
            />
            <Route
              path="/task-library"
              element={
                <Suspense fallback={<LoadingScreen />}>
                  <TaskLibrary />
                </Suspense>
              }
            />
            <Route
              path="/growth"
              element={
                <Suspense fallback={<LoadingScreen />}>
                  <Growth />
                </Suspense>
              }
            />
            <Route
              path="/profile"
              element={
                <Suspense fallback={<LoadingScreen />}>
                  <Profile />
                </Suspense>
              }
            />
            <Route
              path="/profile/:id"
              element={
                <Suspense fallback={<LoadingScreen />}>
                  <Profile />
                </Suspense>
              }
            />
            <Route
              path="/post/:postId"
              element={
                <Suspense fallback={<LoadingScreen />}>
                  <PostView />
                </Suspense>
              }
            />
            <Route
              path="/about"
              element={
                <Suspense fallback={<LoadingScreen />}>
                  <About />
                </Suspense>
              }
            />
            {/* Fallback for unknown routes */}
            <Route path="*" element={<h1>Page Not Found</h1>} />
          </Route>
        </Routes>
      </AuthProvider>
    </ErrorBoundaryWrapper>
  </BrowserRouter>
);
