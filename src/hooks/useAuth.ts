import { useEffect } from "react";
import { useAuthStore } from "@/stores/useAuthStore";
import { AuthService } from "@/services/authService";

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
    } catch (err: any) {
      setError(err.message || "Failed to login");
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await AuthService.logout();
    } catch (err: any) {
      setError(err.message || "Failed to logout");
    } finally {
      setLoading(false);
    }
  };

  return { user, loading, error, login, logout };
};
