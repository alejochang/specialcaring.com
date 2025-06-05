
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import { useState, useEffect } from "react";

// Component to handle auth-based navigation
const AuthNavigationHandler = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isLoading) return; // Don't redirect while loading

    console.log('AuthNavigationHandler - User:', user?.email || 'No user', 'Path:', location.pathname, 'Loading:', isLoading);
    
    // Check for OAuth callback parameters in URL
    const urlParams = new URLSearchParams(location.search);
    const fragment = new URLSearchParams(location.hash.substring(1));
    const accessToken = urlParams.get('access_token') || fragment.get('access_token');
    const refreshToken = urlParams.get('refresh_token') || fragment.get('refresh_token');
    
    // If we have OAuth tokens in URL, we're returning from OAuth
    if (accessToken || refreshToken) {
      console.log('OAuth callback detected with tokens, waiting for auth state...');
      // Don't redirect immediately, let the auth state change handle it
      return;
    }
    
    // If user is authenticated and on public pages, redirect to dashboard
    if (user && (location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/')) {
      console.log('Redirecting authenticated user to dashboard from:', location.pathname);
      navigate('/dashboard', { replace: true });
      return;
    }
    
    // If user is not authenticated and trying to access protected routes, redirect to login
    if (!user && location.pathname.startsWith('/dashboard')) {
      console.log('Redirecting unauthenticated user to login from:', location.pathname);
      navigate('/login', { replace: true });
      return;
    }
  }, [user, isLoading, navigate, location.pathname, location.search, location.hash]);

  return <>{children}</>;
};

const AppContent = () => {
  return (
    <AuthProvider>
      <AuthNavigationHandler>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard/:section" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } 
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthNavigationHandler>
    </AuthProvider>
  );
};

const App = () => {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
