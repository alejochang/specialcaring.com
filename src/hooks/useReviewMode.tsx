import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

// Mock user data for review mode (development only)
const REVIEW_USER = {
  id: "review-user-123",
  email: "reviewer@specialcaring.com",
  user_metadata: {
    full_name: "Demo User"
  },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

const REVIEW_SESSION = {
  access_token: "review-access-token",
  refresh_token: "review-refresh-token",
  expires_in: 3600,
  token_type: "bearer",
  user: REVIEW_USER
};

// Storage key for review session
const REVIEW_SESSION_KEY = 'review-session';

/**
 * Hook for managing review/demo mode
 *
 * SECURITY: Review mode is only available in development builds.
 * In production, this hook returns disabled state and all functions are no-ops.
 */
export const useReviewMode = () => {
  const [user, setUser] = useState<typeof REVIEW_USER | null>(null);
  const [session, setSession] = useState<typeof REVIEW_SESSION | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Check if review mode is available (only in development)
  const isReviewModeAvailable = __REVIEW_MODE_ENABLED__;

  // Check for existing review session on mount (dev only)
  useEffect(() => {
    if (!isReviewModeAvailable) {
      // In production, ensure any leftover review sessions are cleared
      localStorage.removeItem(REVIEW_SESSION_KEY);
      return;
    }

    const reviewSession = localStorage.getItem(REVIEW_SESSION_KEY);
    if (reviewSession) {
      try {
        const parsed = JSON.parse(reviewSession);
        setSession(parsed);
        setUser(parsed.user);
      } catch (e) {
        // Invalid session data, clear it
        localStorage.removeItem(REVIEW_SESSION_KEY);
      }
    }
  }, [isReviewModeAvailable]);

  const startReviewMode = async () => {
    // Security: Block review mode in production
    if (!isReviewModeAvailable) {
      console.warn('Review mode is not available in production builds');
      toast({
        title: "Review Mode Unavailable",
        description: "Demo mode is only available in development environments",
        variant: "destructive",
      });
      return { success: false };
    }

    setIsLoading(true);

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Store review session
      localStorage.setItem(REVIEW_SESSION_KEY, JSON.stringify(REVIEW_SESSION));
      setSession(REVIEW_SESSION);
      setUser(REVIEW_USER);

      toast({
        title: "Review Mode Active",
        description: "You're now exploring the application with sample data",
      });

      return { success: true };
    } catch (error) {
      toast({
        title: "Review Mode Failed",
        description: "Unable to start review mode",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const exitReviewMode = async () => {
    localStorage.removeItem(REVIEW_SESSION_KEY);
    setSession(null);
    setUser(null);

    if (isReviewModeAvailable) {
      toast({
        title: "Review Mode Ended",
        description: "You've exited the demo experience",
      });
    }
  };

  return {
    user,
    session,
    isLoading,
    startReviewMode,
    exitReviewMode,
    isReviewMode: session !== null,
    isReviewModeAvailable,
  };
};
