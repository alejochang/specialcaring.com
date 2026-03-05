
import { useState } from "react";
import { Link } from "react-router-dom";
import AuthForm from "@/components/auth/AuthForm";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Trans, useTranslation } from "react-i18next";

const Register = () => {
  const [consentGiven, setConsentGiven] = useState(false);
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-16 px-4 bg-gradient-to-br from-background to-caregiver-50">
        <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center animate-fadeIn">
          <div className="hidden md:block">
            <div className="space-y-6">
              <h1 className="text-3xl font-bold">{t('auth.register.title')}</h1>
              <p className="text-muted-foreground">
                {t('auth.register.subtitle')}
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-caregiver-100 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-caregiver-600 font-medium">1</span>
                  </div>
                  <div>
                    <h3 className="font-medium">{t('auth.register.step1Title')}</h3>
                    <p className="text-sm text-muted-foreground">
                      {t('auth.register.step1Desc')}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-caregiver-100 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-caregiver-600 font-medium">2</span>
                  </div>
                  <div>
                    <h3 className="font-medium">{t('auth.register.step2Title')}</h3>
                    <p className="text-sm text-muted-foreground">
                      {t('auth.register.step2Desc')}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-caregiver-100 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-caregiver-600 font-medium">3</span>
                  </div>
                  <div>
                    <h3 className="font-medium">{t('auth.register.step3Title')}</h3>
                    <p className="text-sm text-muted-foreground">
                      {t('auth.register.step3Desc')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <AuthForm type="register" disabled={!consentGiven} />

            <div className="flex items-start space-x-3 rounded-md border border-border p-4 bg-muted/30">
              <Checkbox
                id="privacy-consent"
                checked={consentGiven}
                onCheckedChange={(checked) => setConsentGiven(checked as boolean)}
              />
              <div className="grid gap-1 leading-none">
                <Label htmlFor="privacy-consent" className="text-sm cursor-pointer">
                  <Trans
                    i18nKey="auth.register.privacyConsent"
                    components={{
                      1: <Link to="/privacy" className="text-special-600 hover:underline font-medium" />,
                    }}
                  />
                </Label>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Register;
