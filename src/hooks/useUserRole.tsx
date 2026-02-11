import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export type AppRole = "admin" | "caregiver" | "viewer";

export interface UseUserRoleResult {
  role: AppRole | null;
  isLoading: boolean;
  error: Error | null;
  isAdmin: boolean;
  isCaregiver: boolean;
  isViewer: boolean;
  canEdit: boolean;
  isApproved: boolean;
}

/**
 * Hook to fetch and manage user roles
 *
 * SECURITY: Returns null role on error instead of defaulting to 'viewer'.
 * Consumers MUST handle null role by denying access.
 */
export const useUserRole = (): UseUserRoleResult => {
  const { user } = useAuth();
  const [role, setRole] = useState<AppRole | null>(null);
  const [isApproved, setIsApproved] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchRole = async () => {
      // Reset state when user changes
      setError(null);

      if (!user) {
        setRole(null);
        setIsApproved(false);
        setIsLoading(false);
        return;
      }

      try {
        const { data, error: queryError } = await supabase
          .from("user_roles")
          .select("role, is_approved")
          .eq("user_id", user.id)
          .limit(1)
          .single();

        if (queryError) {
          // SECURITY FIX: Don't default to viewer on error
          // This prevents unauthorized access when role lookup fails
          console.error("Error fetching user role:", queryError);

          // Check if it's a "no rows" error (user has no role assigned)
          if (queryError.code === 'PGRST116') {
            // User exists but has no role - this is a valid state for new users
            // They should be treated as having no access until approved
            setRole(null);
            setIsApproved(false);
          } else {
            // Other errors should be surfaced
            setError(new Error(queryError.message));
            setRole(null);
            setIsApproved(false);
          }
        } else if (data) {
          setRole(data.role as AppRole);
          setIsApproved(data.is_approved ?? false);
        } else {
          // No data returned - user has no role
          setRole(null);
          setIsApproved(false);
        }
      } catch (err) {
        // SECURITY FIX: Don't default to viewer on error
        console.error("Error fetching role:", err);
        setError(err instanceof Error ? err : new Error("Unknown error fetching role"));
        setRole(null);
        setIsApproved(false);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRole();
  }, [user]);

  // Derived permissions - null role means no access
  const isAdmin = role === "admin";
  const isCaregiver = role === "caregiver";
  const isViewer = role === "viewer";

  // canEdit requires an explicit role, not null
  const canEdit = role === "admin" || role === "caregiver";

  return {
    role,
    isLoading,
    error,
    isAdmin,
    isCaregiver,
    isViewer,
    canEdit,
    isApproved
  };
};
