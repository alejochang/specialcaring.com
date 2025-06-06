
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useMockAuth } from "@/hooks/useMockAuth";

type AuthContextType = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithTwitter: () => Promise<void>;
  signInWithFacebook: () => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  isMockMode: boolean;
  enableMockMode: () => void;
  disableMockMode: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mockModeEnabled, setMockModeEnabled] = useState(false);
  const { toast } = useToast();

  // Mock auth hook - ALWAYS call this hook
  const mockAuth = useMockAuth();

  // Check for mock mode preference on mount - ALWAYS call this hook
  useEffect(() => {
    const mockMode = localStorage.getItem('mock-mode-enabled');
    if (mockMode === 'true') {
      setMockModeEnabled(true);
    }
  }, []);

  // Real Supabase auth setup - ALWAYS call this hook
  useEffect(() => {
    if (mockModeEnabled) {
      setIsLoading(false);
      return;
    }

    console.log('Setting up auth state listener...');
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change event:', event, 'Session user:', session?.user?.email || 'No user');
        
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
        
        if (event === 'SIGNED_IN') {
          console.log('User signed in:', session?.user?.email);
          toast({
            title: "Welcome!",
            description: "You have successfully signed in.",
          });
        }
        
        if (event === 'SIGNED_OUT') {
          console.log('User signed out');
          setSession(null);
          setUser(null);
        }

        if (event === 'TOKEN_REFRESHED') {
          console.log('Token refreshed for user:', session?.user?.email);
        }
      }
    );

    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        console.log('Initial session check:', session?.user?.email || 'No user', 'Error:', error);
        
        if (error) {
          console.error('Error getting session:', error);
        }
        
        setSession(session);
        setUser(session?.user ?? null);
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    return () => {
      subscription.unsubscribe();
    };
  }, [toast, mockModeEnabled]);

  // Session validation effect - ALWAYS call this hook
  useEffect(() => {
    if (!session || mockModeEnabled) return;

    const validateSession = async () => {
      try {
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        
        if (error || !currentSession) {
          console.log('Session validation failed, signing out');
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

    const interval = setInterval(validateSession, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [session, toast, mockModeEnabled]);

  // Mock mode functions
  const enableMockMode = () => {
    setMockModeEnabled(true);
    localStorage.setItem('mock-mode-enabled', 'true');
    // Clear real auth state
    setUser(null);
    setSession(null);
  };

  const disableMockMode = () => {
    setMockModeEnabled(false);
    localStorage.removeItem('mock-mode-enabled');
    localStorage.removeItem('mock-session');
    // Reset mock auth state
    mockAuth.signOut();
  };

  // Real auth functions
  const signInWithEmail = async (email: string, password: string) => {
    try {
      console.log('Attempting email sign in for:', email);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      console.log('Email sign in successful for:', email);
    } catch (error: any) {
      console.error('Email sign in error:', error);
      toast({
        title: "Error signing in",
        description: error.message || "An error occurred during sign in",
        variant: "destructive",
      });
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    try {
      console.log('Attempting Google OAuth sign in');
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google"
      });

      if (error) throw error;
      console.log('Google OAuth initiated successfully');
    } catch (error: any) {
      console.error('Google sign in error:', error);
      toast({
        title: "Error signing in with Google",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
      throw error;
    }
  };

  const signInWithTwitter = async () => {
    try {
      console.log('Attempting Twitter OAuth sign in');
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "twitter"
      });

      if (error) throw error;
      console.log('Twitter OAuth initiated successfully');
    } catch (error: any) {
      console.error('Twitter sign in error:', error);
      toast({
        title: "Error signing in with Twitter",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
      throw error;
    }
  };

  const signInWithFacebook = async () => {
    try {
      console.log('Attempting Facebook OAuth sign in');
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "facebook"
      });

      if (error) throw error;
      console.log('Facebook OAuth initiated successfully');
    } catch (error: any) {
      console.error('Facebook sign in error:', error);
      toast({
        title: "Error signing in with Facebook",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
      throw error;
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          }
        },
      });

      if (error) throw error;
      
      toast({
        title: "Registration successful",
        description: "Please check your email to confirm your account",
      });
    } catch (error: any) {
      toast({
        title: "Error signing up",
        description: error.message || "An error occurred during sign up",
        variant: "destructive",
      });
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setSession(null);
      setUser(null);
    } catch (error: any) {
      toast({
        title: "Error signing out",
        description: error.message || "An error occurred during sign out",
        variant: "destructive",
      });
    }
  };

  // NOW we can conditionally return different provider values based on mock mode
  if (mockModeEnabled) {
    return (
      <AuthContext.Provider
        value={{
          user: mockAuth.user,
          session: mockAuth.session,
          isLoading: mockAuth.isLoading,
          signInWithEmail: mockAuth.signInWithMockCredentials,
          signInWithGoogle: async () => { throw new Error("OAuth not available in mock mode"); },
          signInWithTwitter: async () => { throw new Error("OAuth not available in mock mode"); },
          signInWithFacebook: async () => { throw new Error("OAuth not available in mock mode"); },
          signUp: async () => { throw new Error("Sign up not available in mock mode"); },
          signOut: mockAuth.signOut,
          isMockMode: true,
          enableMockMode,
          disableMockMode,
        }}
      >
        {children}
      </AuthContext.Provider>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        signInWithEmail,
        signInWithGoogle,
        signInWithTwitter,
        signInWithFacebook,
        signUp,
        signOut,
        isMockMode: false,
        enableMockMode,
        disableMockMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
