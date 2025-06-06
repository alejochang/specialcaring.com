
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

// Mock user data
const MOCK_USER = {
  id: "mock-user-123",
  email: "test@specialcaring.com",
  user_metadata: {
    full_name: "Test User"
  },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

const MOCK_SESSION = {
  access_token: "mock-access-token",
  refresh_token: "mock-refresh-token",
  expires_in: 3600,
  token_type: "bearer",
  user: MOCK_USER
};

// Test credentials
export const MOCK_CREDENTIALS = {
  email: "test@specialcaring.com",
  password: "testpassword123"
};

export const useMockAuth = () => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Check for existing mock session on mount
  useEffect(() => {
    const mockSession = localStorage.getItem('mock-session');
    if (mockSession) {
      const parsed = JSON.parse(mockSession);
      setSession(parsed);
      setUser(parsed.user);
    }
  }, []);

  const signInWithMockCredentials = async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (email === MOCK_CREDENTIALS.email && password === MOCK_CREDENTIALS.password) {
        // Store mock session
        localStorage.setItem('mock-session', JSON.stringify(MOCK_SESSION));
        setSession(MOCK_SESSION);
        setUser(MOCK_USER);
        
        toast({
          title: "Mock Login Successful!",
          description: `Logged in as ${email}`,
        });
        
        return { success: true };
      } else {
        throw new Error("Invalid test credentials");
      }
    } catch (error) {
      toast({
        title: "Mock Login Failed",
        description: "Use test@specialcaring.com / testpassword123",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    localStorage.removeItem('mock-session');
    setSession(null);
    setUser(null);
    
    toast({
      title: "Signed Out",
      description: "Mock session ended",
    });
  };

  return {
    user,
    session,
    isLoading,
    signInWithMockCredentials,
    signOut,
    isMockMode: true
  };
};
