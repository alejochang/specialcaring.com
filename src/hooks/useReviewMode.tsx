
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

// Mock user data for review mode
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

export const useReviewMode = () => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Check for existing review session on mount
  useEffect(() => {
    const reviewSession = localStorage.getItem('review-session');
    if (reviewSession) {
      const parsed = JSON.parse(reviewSession);
      setSession(parsed);
      setUser(parsed.user);
    }
  }, []);

  const startReviewMode = async () => {
    setIsLoading(true);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Store review session
      localStorage.setItem('review-session', JSON.stringify(REVIEW_SESSION));
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
    localStorage.removeItem('review-session');
    setSession(null);
    setUser(null);
    
    toast({
      title: "Review Mode Ended",
      description: "You've exited the demo experience",
    });
  };

  return {
    user,
    session,
    isLoading,
    startReviewMode,
    exitReviewMode,
    isReviewMode: true
  };
};
