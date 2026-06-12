import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@/hooks/useAuth";

export function useAdminAuth() {
  const { user, isLoading, isAuthenticated } = useAuth({
    redirectOnUnauthenticated: true,
    redirectPath: "/login",
  });
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && isAuthenticated && user?.role !== "admin" && user?.role !== "super_admin") {
      navigate("/");
    }
  }, [isLoading, isAuthenticated, user, navigate]);

  return { user, isLoading };
}
