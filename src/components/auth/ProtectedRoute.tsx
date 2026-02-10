
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import PendingApproval from "@/components/auth/PendingApproval";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireApproval?: boolean;
}

const ProtectedRoute = ({ children, requireApproval = true }: ProtectedRouteProps) => {
  const { user, isLoading } = useAuth();
  const { isApproved, isAdmin, isLoading: roleLoading } = useUserRole();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !user) {
      console.log('ProtectedRoute: Redirecting to login - no user found');
      navigate("/login", { replace: true });
    }
  }, [user, isLoading, navigate]);

  if (isLoading || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-special-600" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Admins always pass; other users need approval if required
  if (requireApproval && !isAdmin && !isApproved) {
    return <PendingApproval />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
