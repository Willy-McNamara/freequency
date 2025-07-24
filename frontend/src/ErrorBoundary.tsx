import { ReactNode } from "react";
import { ErrorBoundary } from "react-error-boundary";
import * as Sentry from "@sentry/react";
import { Loading } from "./components/ui/loading";

interface ErrorBoundaryWrapperProps {
  children: ReactNode;
}

function ErrorFallback({ error }: { error: unknown }) {
  // Report error to Sentry
  Sentry.captureException(error);

  // Check if this is an authentication-related error
  const isAuthError = (err: unknown): boolean => {
    if (err instanceof Error) {
      const message = err.message.toLowerCase();
      return (
        message.includes("authentication") ||
        message.includes("unauthorized") ||
        message.includes("401") ||
        message.includes("jwt") ||
        message.includes("token") ||
        message.includes("auth")
      );
    }
    return false;
  };

  // If it's an auth error, redirect to login
  if (isAuthError(error)) {
    // Use setTimeout to ensure the redirect happens after the error boundary renders
    setTimeout(() => {
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }, 0);

    // Return a minimal loading state while redirecting
    return <Loading size="xl" fullScreen />;
  }

  // For non-auth errors, show the original error fallback
  if (error instanceof Error) {
    return (
      <div>
        <h1>Something went wrong</h1>
        <p>{error.message}</p>
        <pre>{error.stack}</pre>
      </div>
    );
  }
  return <h1>Unknown Error</h1>;
}

export default function ErrorBoundaryWrapper({
  children,
}: ErrorBoundaryWrapperProps) {
  return (
    <Sentry.ErrorBoundary fallback={ErrorFallback}>
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        {children}
      </ErrorBoundary>
    </Sentry.ErrorBoundary>
  );
}
