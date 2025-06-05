
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useSessionValidator = () => {
  const { session, signOut } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!session) return;

    const validateSession = async () => {
      try {
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        
        if (error || !currentSession) {
          toast({
            title: "Session Expired",
            description: "Your session has expired. Please sign in again.",
            variant: "destructive",
          });
          await signOut();
        }
      } catch (error) {
        console.error("Session validation error:", error);
        await signOut();
      }
    };

    // Validate session every 5 minutes
    const interval = setInterval(validateSession, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [session, signOut, toast]);
};
