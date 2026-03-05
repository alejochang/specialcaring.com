
import { Link } from "react-router-dom";
import AuthForm from "@/components/auth/AuthForm";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useTranslation } from "react-i18next";

const Login = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-16 px-4 bg-gradient-to-br from-background to-special-50">
        <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center animate-fadeIn">
          <div className="hidden md:block">
            <div className="space-y-6">
              <h1 className="text-3xl font-bold">{t('auth.login.title')}</h1>
              <p className="text-muted-foreground font-medium">
                {t('auth.login.subtitle')}
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-special-100 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-special-600 font-medium">1</span>
                  </div>
                  <div>
                    <h3 className="font-medium">{t('auth.login.centralizedAccess')}</h3>
                    <p className="text-sm text-muted-foreground font-medium">
                      {t('auth.login.centralizedAccessDesc')}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-special-100 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-special-600 font-medium">2</span>
                  </div>
                  <div>
                    <h3 className="font-medium">{t('auth.login.secureStorage')}</h3>
                    <p className="text-sm text-muted-foreground font-medium">
                      {t('auth.login.secureStorageDesc')}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-special-100 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-special-600 font-medium">3</span>
                  </div>
                  <div>
                    <h3 className="font-medium">{t('auth.login.easyUpdates')}</h3>
                    <p className="text-sm text-muted-foreground font-medium">
                      {t('auth.login.easyUpdatesDesc')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <AuthForm type="login" />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Login;
