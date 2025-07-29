import "./globals.css";
import "./index.css";
import "./App.css";
import { Suspense, lazy } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router";
import * as Sentry from "@sentry/react";
import Login from "./pages/Login";

// Google Analytics types
declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}
import NotFound from "./pages/NotFound";
import ErrorBoundaryWrapper from "./ErrorBoundary.tsx";
import { AuthProvider } from "./components/auth/AuthProvider";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { Loading } from "./components/ui/loading";

// Initialize Sentry
Sentry.init({
  dsn: "https://ffbef4489c0e7f6dc80f75c112874af6@o4509719071358976.ingest.us.sentry.io/4509719073652736",
  // Performance monitoring
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration({
      // Capture 10% of all sessions
      maskAllText: false,
      blockAllMedia: false,
    }),
  ],
  // Performance monitoring
  tracesSampleRate: 0.1, // Capture 10% of transactions
  // Session replay
  replaysSessionSampleRate: 0.1, // Capture 10% of sessions
  replaysOnErrorSampleRate: 1.0, // Capture 100% of error sessions
  // Environment
  environment: import.meta.env.MODE,
  // Enable Sentry based on environment variable (fallback to true for prod) or production mode
  enabled:
    import.meta.env.VITE_ENABLE_SENTRY !== "false" || import.meta.env.PROD,
  // Send default PII data
  sendDefaultPii: true,
});

// Initialize Google Analytics
if (import.meta.env.VITE_ENABLE_GA !== "false" || import.meta.env.PROD) {
  // Add Google Analytics script to head
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=G-ME5N6V63GL`;
  document.head.appendChild(script);

  // Initialize gtag
  window.dataLayer = window.dataLayer || [];
  function gtag(...args: unknown[]) {
    window.dataLayer.push(args);
  }
  gtag("js", new Date());
  gtag("config", "G-ME5N6V63GL");

  // Make gtag available globally
  window.gtag = gtag;
}

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

const LoadingScreen = () => <Loading size="lg" text="Loading..." fullScreen />;

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
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </AuthProvider>
    </ErrorBoundaryWrapper>
  </BrowserRouter>
);
