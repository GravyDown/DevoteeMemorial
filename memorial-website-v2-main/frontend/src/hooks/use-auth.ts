import { useEffect, useState, useCallback } from "react";
import api from "@/lib/api";

interface User {
  id?: string;
  username?: string;
  email?: string;
  avatar?: string;
  phone?: string;
  temple?: string;
  location?: string;
  accountType?: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    try {
      const res = await api.get("/users/profile");

      // Handle both response shapes:
      // { username, email } OR { success: true, user: { username, email } }
      const userData = res.data?.user ?? res.data;

      if (userData?.email || userData?.username) {
        setUser(userData);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const logout = useCallback(async () => {
    try {
      await api.post("/users/logout");
    } catch {
      // ignore
    } finally {
      setUser(null);
    }
  }, []);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    await checkAuth();
  }, [checkAuth]);

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    logout,
    refresh,
  };
}
