import { useEffect } from "react";
import { AuthService } from "@/services/authService";
import { useAuthStore } from "@/stores/useAuthStore";

export const useAuth = () => {
  const { user, loading, error, setUser, setLoading, setError } =
    useAuthStore();

  useEffect(() => {
    const unsubscribe = AuthService.subscribeToAuthChanges((user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, [setUser]);

  const login = async () => {
    setLoading(true);
    setError(null);
    try {
      await AuthService.loginWithGoogle();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to login");
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await AuthService.logout();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to logout");
    } finally {
      setLoading(false);
    }
  };

  return { user, loading, error, login, logout };
};
