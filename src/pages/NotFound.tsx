
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();
  const { t } = useTranslation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-16 px-4 bg-gradient-to-br from-background to-special-50">
        <div className="text-center max-w-md mx-auto animate-fadeIn">
          <div className="w-24 h-24 bg-special-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-special-600 text-4xl font-bold">404</span>
          </div>
          <h1 className="text-3xl font-bold mb-4">{t("pages.notFound.title")}</h1>
          <p className="text-muted-foreground mb-8 font-medium">
            {t("pages.notFound.message")}
          </p>
          <Button asChild className="bg-special-600 hover:bg-special-700 rounded-full">
            <Link to="/">{t("pages.notFound.returnHome")}</Link>
          </Button>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default NotFound;
