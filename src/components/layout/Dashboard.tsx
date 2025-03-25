
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
    title: "Key Information",
    icon: FileText,
    path: "/dashboard/key-information",
  },
  {
    title: "Emergency Cards",
    icon: AlertTriangle,
    path: "/dashboard/emergency-cards",
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

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);
  const toggleMobileSidebar = () => setIsMobileOpen(!isMobileOpen);
  
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
              <span className="text-xl font-bold text-caregiver-600">CG</span>
              <span className="text-xl font-light">Organizer</span>
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
                      ? "bg-caregiver-50 text-caregiver-600"
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
        <span className="ml-4 text-xl font-semibold">Caregiver Organizer</span>
      </div>

      {isMobileOpen && (
        <div className="fixed inset-0 z-50 bg-background md:hidden">
          <div className="flex justify-between items-center h-16 px-4 border-b border-border">
            <Link to="/dashboard" className="flex items-center gap-2">
              <span className="text-xl font-bold text-caregiver-600">Caregiver</span>
              <span className="text-xl font-light">Organizer</span>
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
                        ? "bg-caregiver-50 text-caregiver-600"
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
          "flex-1 transition-all duration-300 pt-16 md:pt-0",
          isCollapsed ? "md:ml-20" : "md:ml-64"
        )}
      >
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
