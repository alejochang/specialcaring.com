import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  Home,
  FileText,
  AlertTriangle,
  Heart,
  Pill,
  Calendar,
  Phone,
  Shield,
  Building,
  Briefcase,
  ClipboardList,
  DollarSign,
  FileCheck,
  Menu,
  X,
  LogOut,
  User,
  Truck,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const sidebarItems = [
  {
    title: "Dashboard",
    icon: Home,
    path: "/dashboard",
  },
  {
    title: "Child Profile",
    icon: FileText,
    path: "/dashboard/key-information",
  },
  {
    title: "Emergency Cards",
    icon: AlertTriangle,
    path: "/dashboard/emergency-cards",
  },
  {
    title: "Emergency Protocols",
    icon: FileText,
    path: "/dashboard/medical-emergency-protocols",
  },
  {
    title: "Medical Information",
    icon: Heart,
    path: "/dashboard/medical-information",
  },
  {
    title: "Medications",
    icon: Pill,
    path: "/dashboard/medications",
  },
  {
    title: "Suppliers & Providers",
    icon: Truck,
    path: "/dashboard/suppliers",
  },
  {
    title: "Medical Contacts & Log",
    icon: Phone,
    path: "/dashboard/medical-contacts",
  },
  {
    title: "Home Safety",
    icon: Shield,
    path: "/dashboard/home-safety",
  },
  {
    title: "Community Services",
    icon: Building,
    path: "/dashboard/community-services",
  },
  {
    title: "Employment Agreement",
    icon: Briefcase,
    path: "/dashboard/employment",
  },
  {
    title: "Daily Log",
    icon: ClipboardList,
    path: "/dashboard/daily-log",
  },
  {
    title: "Financial & Legal",
    icon: DollarSign,
    path: "/dashboard/financial-legal",
  },
  {
    title: "End-of-Life Wishes",
    icon: FileCheck,
    path: "/dashboard/end-of-life",
  },
];

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();
  const { user, signOut, isLoading } = useAuth();
  const navigate = useNavigate();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/login");
    }
  }, [user, isLoading, navigate]);

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);
  const toggleMobileSidebar = () => setIsMobileOpen(!isMobileOpen);
  
  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const getUserInitials = () => {
    if (!user || !user.user_metadata?.full_name) {
      return "U";
    }
    const fullName = user.user_metadata.full_name as string;
    return fullName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-special-600" />
      </div>
    );
  }

  // Don't render if not authenticated
  if (!user) {
    return null;
  }
  
  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-30 h-screen bg-white border-r border-border transition-all duration-300 hidden md:flex md:flex-col",
          isCollapsed ? "w-20" : "w-64"
        )}
      >
        <div className="flex items-center h-16 px-4 border-b border-border">
          {!isCollapsed && (
            <Link to="/dashboard" className="flex items-center gap-2 flex-grow">
              <span className="text-xl font-bold text-special-600">Special</span>
              <span className="text-xl font-light">Caring</span>
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className={cn("rounded-full", isCollapsed && "ml-auto")}
          >
            {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </Button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-2">
            {sidebarItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                    location.pathname === item.path
                      ? "bg-special-50 text-special-600"
                      : "text-foreground/70 hover:bg-muted hover:text-foreground"
                  )}
                >
                  <item.icon size={18} />
                  {!isCollapsed && <span>{item.title}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Mobile Sidebar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 h-16 bg-background border-b border-border flex items-center px-4">
        <Button variant="ghost" size="icon" onClick={toggleMobileSidebar}>
          <Menu size={24} />
        </Button>
        <span className="ml-4 text-xl font-semibold">Special Caring</span>
        
        <div className="ml-auto flex items-center gap-2">
          <LanguageSwitcher />
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-9 px-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage 
                    src={user?.user_metadata?.avatar_url as string} 
                    alt={user?.user_metadata?.full_name as string || "User"} 
                  />
                  <AvatarFallback>{getUserInitials()}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem asChild>
                <Link to="/profile" className="w-full cursor-pointer flex items-center">
                  <User size={16} className="mr-2" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer flex items-center">
                <LogOut size={16} className="mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {isMobileOpen && (
        <div className="fixed inset-0 z-50 bg-background md:hidden">
          <div className="flex justify-between items-center h-16 px-4 border-b border-border">
            <Link to="/dashboard" className="flex items-center gap-2">
              <span className="text-xl font-bold text-special-600">Special</span>
              <span className="text-xl font-light">Caring</span>
            </Link>
            <Button variant="ghost" size="icon" onClick={toggleMobileSidebar}>
              <X size={24} />
            </Button>
          </div>
          <nav className="p-4">
            <ul className="space-y-2">
              {sidebarItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={cn(
                      "flex items-center gap-3 px-3 py-3 rounded-md transition-colors",
                      location.pathname === item.path
                        ? "bg-special-50 text-special-600"
                        : "text-foreground/70 hover:bg-muted hover:text-foreground"
                    )}
                    onClick={toggleMobileSidebar}
                  >
                    <item.icon size={20} />
                    <span>{item.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      )}

      {/* Main Content */}
      <main
        className={cn(
          "flex-1 transition-all duration-300",
          isCollapsed ? "md:ml-20" : "md:ml-64"
        )}
      >
        {/* Desktop Header */}
        <div className="hidden md:flex h-16 items-center justify-end px-6 border-b border-border bg-white">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2 text-special-600 hover:text-special-700">
              <Home size={20} />
              <span>Home</span>
            </Link>
            <LanguageSwitcher />
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage 
                      src={user?.user_metadata?.avatar_url as string} 
                      alt={user?.user_metadata?.full_name as string || "User"} 
                    />
                    <AvatarFallback>{getUserInitials()}</AvatarFallback>
                  </Avatar>
                  <span className="ml-2">{(user?.user_metadata?.full_name as string) || user?.email}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="w-full cursor-pointer flex items-center">
                    <User size={16} className="mr-2" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer flex items-center">
                  <LogOut size={16} className="mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
