import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { User } from "@/types/auth";

interface UseAuthReturn {
  user: User | null;
  loading: boolean;
  error: string | null;
  isRefreshing: boolean;
  cookieStatus: CookieStatus | null;
  login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; user?: any; error?: string }>; // Updated return type
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuthToken: () => Promise<boolean>;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
}

interface CookieStatus {
  hasAuthToken: boolean;
  hasRefreshToken: boolean;
  authTokenExpiry?: string;
  refreshTokenExpiry?: string;
}

const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [cookieStatus, setCookieStatus] = useState<CookieStatus | null>(null);
  const router = useRouter();

  // Function to check cookie status
  const checkCookieStatus = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/cookie-status");
      if (!response.ok) {
        throw new Error("Failed to check cookie status");
      }
      const status = await response.json();
      setCookieStatus(status);
      return status;
    } catch (error) {
      console.error("Failed to check cookie status:", error);
      return null;
    }
  }, []);

  // Refresh token function
  const refreshAuthToken = useCallback(async () => {
    if (isRefreshing) return false;

    setIsRefreshing(true);
    try {
      // Don't check cookie status here to avoid loop
      const response = await fetch("/api/auth/refresh", {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to refresh token");
      }

      const data = await response.json();
      if (data.user) {
        setUser(data.user);
        setError(null);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Token refresh failed:", error);
      setUser(null);
      return false;
    } finally {
      setIsRefreshing(false);
    }
  }, [isRefreshing]);

  // Check authentication status
  const checkAuth = useCallback(async () => {
    try {
      const status = await checkCookieStatus();

      if (status?.hasAuthToken) {
        const response = await fetch("/api/auth/me", {
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
          setError(null);
          return;
        }
      }

      // Only try refresh if auth token is missing but refresh token exists
      if (!status?.hasAuthToken && status?.hasRefreshToken) {
        const refreshSuccess = await refreshAuthToken();
        if (refreshSuccess) {
          await checkCookieStatus(); // Update cookie status after successful refresh
          return;
        }
      }

      setUser(null);
    } catch (error) {
      console.error("Auth check failed:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [refreshAuthToken, checkCookieStatus]);

  // Initial auth check - only run once
  useEffect(() => {
    checkAuth();
  }, []); // Remove checkAuth from dependencies

  // Setup refresh token interval
  useEffect(() => {
    let refreshTimeout: NodeJS.Timeout;

    const setupRefreshInterval = async () => {
      const status = await checkCookieStatus();

      if (status?.hasAuthToken && status?.authTokenExpiry) {
        const expiryTime = new Date(status.authTokenExpiry).getTime();
        const timeUntilExpiry = expiryTime - Date.now();

        if (timeUntilExpiry > 0) {
          // Refresh 1 minute before expiry
          refreshTimeout = setTimeout(() => {
            refreshAuthToken().then(() => checkCookieStatus());
          }, Math.max(timeUntilExpiry - 60000, 0));
        }
      }
    };

    if (user) {
      // Only setup refresh interval if we have a user
      setupRefreshInterval();
    }

    return () => {
      if (refreshTimeout) {
        clearTimeout(refreshTimeout);
      }
    };
  }, [user]); // Only depend on user state

  const login = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; user?: any; error?: string }> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      setUser(data.user);
      await checkCookieStatus();
      return { success: true, user: data.user }; // Return success and user data
    } catch (error) {
      console.error("Login error:", error);
      setError(error instanceof Error ? error.message : "Login failed");
      return {
        success: false,
        error: error instanceof Error ? error.message : "Login failed",
      }; // Return error message
    } finally {
      setLoading(false);
    }
  };

  const register = async (formData: RegisterData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
        credentials: "include",
      });

      if (!response.ok) {
        const errorResponse = await response.json();
        throw new Error(errorResponse.message || "Registration failed");
      }

      const data = await response.json();
      setUser(data.user);
      await checkCookieStatus();
      router.push("/dashboard");
    } catch (error) {
      console.error("Registration error:", error);
      setError(error instanceof Error ? error.message : "Registration failed");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      setError(null);
      await checkCookieStatus();
      router.push("/login");
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    error,
    isRefreshing,
    cookieStatus,
    login,
    register,
    logout,
    refreshAuthToken,
  };
};

export default useAuth;
