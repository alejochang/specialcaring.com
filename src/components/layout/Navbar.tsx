import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, User, ChevronDown, LogOut, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useTranslation } from "react-i18next";
import logoImg from "@/assets/logo.png";
import logoWordmark from "@/assets/logo-wordmark.png";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut, isLoading } = useAuth();
  const { t } = useTranslation();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isActive = (path: string) => location.pathname === path;

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
    closeMenu();
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

  return (
    <header
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-background/80 backdrop-blur-lg shadow-sm py-2"
          : "bg-transparent py-4"
      }`}
    >
      <div className="container flex items-center justify-between">
        <Link to="/" className="flex items-center" onClick={closeMenu}>
          <img src={logoWordmark} alt="Special Caring" className="h-28 md:h-32 w-auto" />
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link
            to="/"
            className={`nav-link ${isActive("/") ? "nav-link-active" : ""}`}
          >
            {t('navigation.home')}
          </Link>
          {!isLoading && user ? (
            <>
              <Link
                to="/dashboard"
                className={`nav-link ${isActive("/dashboard") ? "nav-link-active" : ""}`}
              >
                {t('navigation.dashboard')}
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage 
                        src={user.user_metadata?.avatar_url as string} 
                        alt={user.user_metadata?.full_name as string || "User"} 
                      />
                      <AvatarFallback>{getUserInitials()}</AvatarFallback>
                    </Avatar>
                    <span className="ml-2">{(user.user_metadata?.full_name as string) || user.email}</span>
                    <ChevronDown size={16} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="w-full cursor-pointer flex items-center">
                      <User size={16} className="mr-2" />
                      {t('navigation.profile')}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/settings" className="w-full cursor-pointer flex items-center">
                      <Settings size={16} className="mr-2" />
                      {t('navigation.settings')}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer flex items-center">
                    <LogOut size={16} className="mr-2" />
                    {t('navigation.signOut')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="px-4 py-2 rounded-md text-special-600 font-medium transition-colors hover:text-special-700"
              >
                {t('navigation.signIn')}
              </Link>
              <Link to="/register">
                <Button className="bg-special-600 hover:bg-special-700 rounded-full">
                  {t('navigation.getStarted')}
                </Button>
              </Link>
            </>
          )}
          <LanguageSwitcher />
        </nav>

        <div className="flex items-center gap-2 md:hidden">
          <LanguageSwitcher />
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </Button>
        </div>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-40 bg-background pt-20 px-6 flex flex-col slide-up md:hidden">
          <div className="flex flex-col gap-6 text-lg">
            <Link
              to="/"
              className="py-3 border-b border-border"
              onClick={closeMenu}
            >
              {t('navigation.home')}
            </Link>
            {!isLoading && user ? (
              <>
                <Link
                  to="/dashboard"
                  className="py-3 border-b border-border"
                  onClick={closeMenu}
                >
                  {t('navigation.dashboard')}
                </Link>
                <Link
                  to="/profile"
                  className="py-3 border-b border-border"
                  onClick={closeMenu}
                >
                  {t('navigation.profile')}
                </Link>
                <Link
                  to="/settings"
                  className="py-3 border-b border-border"
                  onClick={closeMenu}
                >
                  {t('navigation.settings')}
                </Link>
                <button
                  onClick={handleSignOut}
                  className="py-3 border-b border-border flex items-center text-left"
                >
                  <LogOut size={18} className="mr-2" />
                  {t('navigation.signOut')}
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="py-3 border-b border-border"
                  onClick={closeMenu}
                >
                  {t('navigation.signIn')}
                </Link>
                <Link to="/register" onClick={closeMenu}>
                  <Button className="w-full bg-special-600 hover:bg-special-700 mt-4 rounded-full">
                    {t('navigation.getStarted')}
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
