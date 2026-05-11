"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { LogIn, Loader2 } from "lucide-react";

export const LoginButton = () => {
  const { login, loading } = useAuth();

  return (
    <Button
      onClick={login}
      disabled={loading}
      className="flex items-center gap-2"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <LogIn className="h-4 w-4" />
      )}
      Login with Google
    </Button>
  );
};
