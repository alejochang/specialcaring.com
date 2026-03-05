import { useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Eye, EyeOff, Loader2, Mail, Lock, User } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Separator } from "@/components/ui/separator";
import logoImg from "@/assets/logo.png";

// Schema factory functions to support translated validation messages
const createRegisterSchema = (t: (key: string) => string) => z.object({
  name: z.string().trim().min(2, t('validation.nameMinLength')).max(100, t('validation.nameMaxLength')),
  email: z.string().trim().email(t('validation.invalidEmail')).max(255),
  password: z.string().min(8, t('validation.passwordMinLength')),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: t('validation.passwordsDoNotMatch'),
  path: ["confirmPassword"],
});

const createLoginSchema = (t: (key: string) => string) => z.object({
  email: z.string().trim().email(t('validation.invalidEmail')),
  password: z.string().min(1, t('validation.passwordRequired')),
});

type RegisterFormValues = z.infer<ReturnType<typeof createRegisterSchema>>;
type LoginFormValues = z.infer<ReturnType<typeof createLoginSchema>>;

export interface AuthFormProps {
  type: "login" | "register";
  disabled?: boolean;
}

const AuthForm = ({ type, disabled }: AuthFormProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signInWithEmail, signInWithGoogle, signUp } = useAuth();
  const { t } = useTranslation();

  const registerSchema = useMemo(() => createRegisterSchema(t), [t]);
  const loginSchema = useMemo(() => createLoginSchema(t), [t]);
  const schema = type === "login" ? loginSchema : registerSchema;

  const form = useForm<any>({
    resolver: zodResolver(schema),
    defaultValues: type === "login"
      ? { email: "", password: "" }
      : { name: "", email: "", password: "", confirmPassword: "" },
  });

  const onSubmit = async (values: any) => {
    setLoading(true);
    try {
      if (type === "login") {
        await signInWithEmail(values.email, values.password);
        toast({ title: t('toast.success'), description: t('toast.signInSuccess') });
        navigate("/dashboard");
      } else {
        await signUp(values.email, values.password, values.name);
        // Record privacy consent — the profile is created by trigger, update it with consent
        const { data: { user: newUser } } = await supabase.auth.getUser();
        if (newUser) {
          await supabase
            .from("profiles")
            .update({
              privacy_consent_at: new Date().toISOString(),
              privacy_consent_version: "1.0",
            })
            .eq("id", newUser.id);
        }
        toast({ title: t('toast.success'), description: t('toast.accountCreated') });
      }
    } catch (error: any) {
      console.error("Authentication error:", error);
      toast({ title: t('toast.error'), description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (error: any) {
      console.error("Google sign in error:", error);
      toast({ title: t('toast.error'), description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-card rounded-2xl shadow-lg border border-border p-8 space-y-6">
        {/* Header */}
        <div className="text-center space-y-3">
          <img src={logoImg} alt={t('common.specialCaring')} className="h-12 w-12 mx-auto" />
          <h2 className="text-2xl font-bold text-foreground">
            {type === "login" ? t('auth.welcomeBack') : t('auth.createAccount')}
          </h2>
          <p className="text-muted-foreground text-sm">
            {type === "login"
              ? t('auth.signInSubtitle')
              : t('auth.signUpSubtitle')}
          </p>
        </div>

        {/* Google Sign In */}
        <Button
          type="button"
          variant="outline"
          className="w-full h-12 text-sm font-medium gap-3 border-border hover:bg-accent"
          onClick={handleGoogleSignIn}
          disabled={loading}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5">
            <path fill="#EA4335" d="M5.26620003,9.76452941 C6.19878754,6.93863203 8.85444915,4.90909091 12,4.90909091 C13.6909091,4.90909091 15.2181818,5.50909091 16.4181818,6.49090909 L19.9090909,3 C17.7818182,1.14545455 15.0545455,0 12,0 C7.27006974,0 3.1977497,2.69829785 1.23999023,6.65002441 L5.26620003,9.76452941 Z" />
            <path fill="#34A853" d="M16.0407269,18.0125889 C14.9509167,18.7163016 13.5660892,19.0909091 12,19.0909091 C8.86648613,19.0909091 6.21911939,17.076871 5.27698177,14.2678769 L1.23746264,17.3349879 C3.19279051,21.2936293 7.26500293,24 12,24 C14.9328362,24 17.7353462,22.9573905 19.834192,20.9995801 L16.0407269,18.0125889 Z" />
            <path fill="#4A90E2" d="M19.834192,20.9995801 C22.0291676,18.9520994 23.4545455,15.903663 23.4545455,12 C23.4545455,11.2909091 23.3454545,10.5272727 23.1818182,9.81818182 L12,9.81818182 L12,14.4545455 L18.4363636,14.4545455 C18.1187732,16.013626 17.2662994,17.2212117 16.0407269,18.0125889 L19.834192,20.9995801 Z" />
            <path fill="#FBBC05" d="M5.27698177,14.2678769 C5.03832634,13.556323 4.90909091,12.7937589 4.90909091,12 C4.90909091,11.2182781 5.03443647,10.4668121 5.26620003,9.76452941 L1.23999023,6.65002441 C0.43658717,8.26043162 0,10.0753848 0,12 C0,13.9195484 0.444780743,15.7301709 1.23746264,17.3349879 L5.27698177,14.2678769 Z" />
          </svg>
          {type === "login" ? t('auth.continueWithGoogle') : t('auth.signUpWithGoogle')}
        </Button>

        {/* Divider */}
        <div className="relative">
          <Separator />
          <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-3 text-xs text-muted-foreground uppercase tracking-wider">
            {t('common.or')}
          </span>
        </div>

        {/* Email Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {type === "register" && (
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground">{t('auth.fullName')}</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input placeholder={t('auth.fullName')} className="pl-10 h-11" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">{t('auth.email')}</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input type="email" placeholder="name@example.com" className="pl-10 h-11" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">{t('auth.password')}</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="pl-10 h-11"
                        {...field}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-foreground"
                        onClick={togglePasswordVisibility}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {type === "register" && (
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground">{t('auth.confirmPassword')}</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          className="pl-10 h-11"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <Button
              type="submit"
              className="w-full h-11 mt-2"
              disabled={loading || disabled}
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="mr-2 animate-spin" />
                  {type === "login" ? t('auth.signingIn') : t('auth.creatingAccount')}
                </>
              ) : (
                <>{type === "login" ? t('auth.signIn') : t('auth.createAccountBtn')}</>
              )}
            </Button>
          </form>
        </Form>

        {/* Footer link */}
        <p className="text-center text-sm text-muted-foreground">
          {type === "login" ? (
            <>
              {t('auth.noAccount')}{" "}
              <Link to="/register" className="text-primary hover:underline font-semibold">
                {t('auth.signUp')}
              </Link>
            </>
          ) : (
            <>
              {t('auth.haveAccount')}{" "}
              <Link to="/login" className="text-primary hover:underline font-semibold">
                {t('auth.signInLink')}
              </Link>
            </>
          )}
        </p>
      </div>
    </div>
  );
};

export default AuthForm;
