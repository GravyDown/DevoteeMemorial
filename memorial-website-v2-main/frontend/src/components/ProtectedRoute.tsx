import { Navigate } from "react-router";
import { useAuth } from "@/hooks/use-auth";

export default function ProtectedRoute({ children }: any) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <div>Loading...</div>;

  if (!isAuthenticated) {
    return <Navigate to="/auth" />;
  }

  return children;
}