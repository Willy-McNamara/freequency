import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { authService } from "../../services/auth";
import {
  setSentryUser,
  clearSentryUser,
  addSentryBreadcrumb,
} from "../../utils/sentry";
import { trackUserEngagement, setUserId } from "../../utils/analytics";

interface User {
  id: number;
  email: string;
  name: string;
  displayName?: string;
  avatarUrl?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
  checkAuthStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuthStatus = async () => {
    try {
      const userData = await authService.checkAuthStatus();
      setUser(userData);

      // Set Sentry user context when authenticated
      if (userData) {
        setSentryUser({
          id: userData.id.toString(),
          email: userData.email,
          username: userData.name,
        });
        addSentryBreadcrumb("User authenticated", "auth");

        // Set Google Analytics user ID
        setUserId(userData.id.toString());
        trackUserEngagement.userLoggedIn("google_oauth");
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = () => {
    authService.loginWithGoogle();
  };

  const logout = async () => {
    try {
      await authService.logout();
      addSentryBreadcrumb("User logged out", "auth");
      trackUserEngagement.userLoggedOut();
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setUser(null);
      clearSentryUser();
      // Redirect to login page
      window.location.href = "/login";
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    checkAuthStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
