import React from "react";
import { Navigate, useLocation } from "react-router";
import { useAuth } from "./AuthProvider";
import { Loading } from "../ui/loading";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    // Show loading spinner while checking auth status
    return <Loading size="xl" fullScreen />;
  }

  if (!isAuthenticated) {
    // Redirect to login page, saving the attempted location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
