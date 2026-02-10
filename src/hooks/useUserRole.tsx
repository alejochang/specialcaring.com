import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export type AppRole = "admin" | "caregiver" | "viewer";

export const useUserRole = () => {
  const { user } = useAuth();
  const [role, setRole] = useState<AppRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRole = async () => {
      if (!user) {
        setRole(null);
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .limit(1)
          .single();

        if (error) {
          console.error("Error fetching user role:", error);
          setRole("viewer"); // fallback
        } else {
          setRole(data.role as AppRole);
        }
      } catch (err) {
        console.error("Error fetching role:", err);
        setRole("viewer");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRole();
  }, [user]);

  const isAdmin = role === "admin";
  const isCaregiver = role === "caregiver";
  const isViewer = role === "viewer";
  const canEdit = role === "admin" || role === "caregiver";

  return { role, isLoading, isAdmin, isCaregiver, isViewer, canEdit };
};
