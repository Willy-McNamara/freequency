/**
 * CSRF Hook for React Components
 * Provides CSRF token management and form protection
 */

import { useState, useEffect, useCallback } from "react";
import { csrfService } from "../services/csrf";

export interface CSRFHookReturn {
  token: string | null;
  isAvailable: boolean;
  isLoading: boolean;
  error: string | null;
  refreshToken: () => Promise<void>;
  getHeaders: () => Promise<Record<string, string>>;
}

export const useCSRF = (): CSRFHookReturn => {
  const [token, setToken] = useState<string | null>(null);
  const [isAvailable, setIsAvailable] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshToken = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const newToken = await csrfService.getToken();
      setToken(newToken);
      setIsAvailable(true);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to refresh CSRF token";
      setError(errorMessage);
      setIsAvailable(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getHeaders = useCallback(async () => {
    return await csrfService.getHeaders();
  }, []);

  useEffect(() => {
    const initialize = async () => {
      try {
        await csrfService.initialize();
        // After initialization, try to get a token
        try {
          const currentToken = await csrfService.getToken();
          setToken(currentToken);
          setIsAvailable(true);
        } catch {
          setIsAvailable(false);
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "CSRF initialization failed";
        setError(errorMessage);
        setIsAvailable(false);
      } finally {
        setIsLoading(false);
      }
    };

    initialize();
  }, []);

  return {
    token,
    isAvailable,
    isLoading,
    error,
    refreshToken,
    getHeaders,
  };
};
