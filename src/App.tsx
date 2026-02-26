
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ChildProvider } from "@/contexts/ChildContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useState, useEffect, lazy, Suspense } from "react";
import { Loader2 } from "lucide-react";

// Lazy-load route pages for code-splitting
const Index = lazy(() => import("./pages/Index"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Profile = lazy(() => import("./pages/Profile"));
const AdminPanel = lazy(() => import("./pages/AdminPanel"));
const AddChild = lazy(() => import("./pages/AddChild"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Terms = lazy(() => import("./pages/Terms"));
const Help = lazy(() => import("./pages/Help"));

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <Loader2 className="h-8 w-8 animate-spin text-special-600" />
  </div>
);

// Component to handle auth-based navigation
const AuthNavigationHandler = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isLoading) return; // Don't redirect while loading

    console.log('AuthNavigationHandler - User:', user?.email || 'No user', 'Path:', location.pathname, 'Loading:', isLoading);
    
    // If user is authenticated and on public pages, redirect to dashboard
    if (user && (location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/')) {
      console.log('Redirecting authenticated user to dashboard from:', location.pathname);
      navigate('/dashboard', { replace: true });
      return;
    }
    
    // If user is not authenticated and trying to access protected routes, redirect to login
    if (!user && (location.pathname.startsWith('/dashboard') || location.pathname === '/add-child')) {
      console.log('Redirecting unauthenticated user to login from:', location.pathname);
      navigate('/login', { replace: true });
      return;
    }
  }, [user, isLoading, navigate, location.pathname]);

  return <>{children}</>;
};

const AppContent = () => {
  return (
    <AuthProvider>
      <ChildProvider>
      <AuthNavigationHandler>
        <Suspense fallback={<PageLoader />}>
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
            path="/dashboard/admin" 
            element={
              <ProtectedRoute>
                <AdminPanel />
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
          <Route
            path="/add-child"
            element={
              <ProtectedRoute>
                <AddChild />
              </ProtectedRoute>
            }
          />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/help" element={<Help />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        </Suspense>
      </AuthNavigationHandler>
      </ChildProvider>
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
