import { ReactNode } from "react";
import { ErrorBoundary } from "react-error-boundary";

interface ErrorBoundaryWrapperProps {
  children: ReactNode;
}

function ErrorFallback({ error }: { error: unknown }) {
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
    <ErrorBoundary FallbackComponent={ErrorFallback}>{children}</ErrorBoundary>
  );
}
