
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
    if (!isLoading) {
      console.log('AuthNavigationHandler - User:', user?.email, 'Path:', location.pathname, 'Loading:', isLoading);
      
      // If user is authenticated and on public pages, redirect to dashboard
      if (user && (location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/')) {
        console.log('Redirecting authenticated user to dashboard from:', location.pathname);
        navigate('/dashboard', { replace: true });
      }
      
      // If user is not authenticated and on protected routes, redirect to home
      if (!user && location.pathname.startsWith('/dashboard')) {
        console.log('Redirecting unauthenticated user to home from:', location.pathname);
        navigate('/', { replace: true });
      }
    }
  }, [user, isLoading, navigate, location.pathname]);

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
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthNavigationHandler>
    </AuthProvider>
  );
};

const App = () => {
  // Create a client
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
