
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Loader2, User, Save, Trash2, AlertTriangle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

type ProfileFormValues = z.infer<ReturnType<typeof createProfileSchema>>;

function createProfileSchema(t: (key: string) => string) {
  return z.object({
    fullName: z.string().min(2, t("validation.nameMinLength")),
  });
}

const Profile = () => {
  const { t } = useTranslation();
  const { user, isLoading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profile, setProfile] = useState<{ full_name: string; avatar_url: string | null } | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  const profileSchema = useMemo(() => createProfileSchema(t), [t]);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: "",
    },
  });

  // Redirect if not logged in
  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/login");
    }
  }, [user, isLoading, navigate]);

  // Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("full_name, avatar_url")
          .eq("id", user.id)
          .single();

        if (error) throw error;

        setProfile(data);
        if (data) {
          form.setValue("fullName", data.full_name || "");
        }
      } catch (error: any) {
        console.error("Error fetching profile:", error);
        toast({
          title: t("toast.error"),
          description: t("toast.profileLoadFailed"),
          variant: "destructive",
        });
      } finally {
        setIsLoadingProfile(false);
      }
    };

    if (user) {
      fetchProfile();
    }
  }, [user, form, toast]);

  const onSubmit = async (values: ProfileFormValues) => {
    if (!user) return;

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: values.fullName,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) throw error;

      // Update the user metadata as well
      await supabase.auth.updateUser({
        data: { full_name: values.fullName }
      });

      toast({
        title: t("toast.success"),
        description: t("toast.profileUpdated"),
      });

      // Update local state
      setProfile(prev => prev ? {...prev, full_name: values.fullName} : null);

    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast({
        title: t("toast.error"),
        description: t("toast.profileUpdateFailed"),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get user initials for avatar fallback
  const getUserInitials = () => {
    if (!profile?.full_name) {
      return user?.email?.substring(0, 2).toUpperCase() || "U";
    }
    return profile.full_name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  if (isLoading || isLoadingProfile) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-caregiver-600" />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 container py-16 px-4 mt-16">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">{t("pages.profile.title")}</h1>

          <Card>
            <CardHeader className="flex flex-col items-center sm:flex-row sm:items-start gap-4">
              <Avatar className="h-24 w-24">
                <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.full_name || "User"} />
                <AvatarFallback className="text-lg">{getUserInitials()}</AvatarFallback>
              </Avatar>
              <div className="text-center sm:text-left">
                <CardTitle className="text-xl">{profile?.full_name || user?.email}</CardTitle>
                <CardDescription>{user?.email}</CardDescription>
                {/* Future feature: Avatar upload button */}
              </div>
            </CardHeader>

            <CardContent className="mt-4">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("pages.profile.fullName")}</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                            <Input placeholder={t("pages.profile.fullNamePlaceholder")} className="pl-10" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="bg-caregiver-600 hover:bg-caregiver-700"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={16} className="mr-2 animate-spin" />
                        {t("common.saving")}
                      </>
                    ) : (
                      <>
                        <Save size={16} className="mr-2" />
                        {t("common.saveChanges")}
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
          {/* Delete Account Section */}
          <Card className="mt-8 border-destructive/30">
            <CardHeader>
              <CardTitle className="text-lg text-destructive flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                {t("pages.profile.dangerZone")}
              </CardTitle>
              <CardDescription>
                {t("pages.profile.dangerZoneDesc")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DeleteAccountButton />
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

const DeleteAccountButton = () => {
  const { t } = useTranslation();
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error("Not authenticated");

      const { data, error } = await supabase.functions.invoke("delete-own-account", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast({
        title: t("toast.accountDeleted"),
        description: t("toast.accountDeletedDesc"),
      });

      await supabase.auth.signOut();
      navigate("/");
    } catch (err: any) {
      console.error("Delete account error:", err);
      toast({
        title: t("toast.error"),
        description: err.message || t("toast.accountDeleteFailed"),
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" className="gap-2">
          <Trash2 className="h-4 w-4" />
          {t("pages.profile.deleteMyAccount")}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("pages.profile.deleteConfirmTitle")}</AlertDialogTitle>
          <AlertDialogDescription className="space-y-3">
            <p>
              {t("pages.profile.deleteConfirmMessage")}
            </p>
            <ul className="list-disc pl-6 space-y-1 text-sm">
              <li>{t("pages.profile.deleteItems.childrenProfiles")}</li>
              <li>{t("pages.profile.deleteItems.medicalRecords")}</li>
              <li>{t("pages.profile.deleteItems.documents")}</li>
              <li>{t("pages.profile.deleteItems.accountCredentials")}</li>
            </ul>
            <p className="font-medium text-destructive">
              {t("pages.profile.deleteIrreversible")}
            </p>
            <div className="pt-2">
              <label className="text-sm font-medium text-foreground">
                {t("pages.profile.typeDeleteConfirm").replace("<1>", "").replace("</1>", "")}
              </label>
              <Input
                className="mt-1"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="DELETE"
              />
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDeleteAccount}
            disabled={confirmText !== "DELETE" || isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t("common.deleting")}
              </>
            ) : (
              t("pages.profile.deleteEverything")
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default Profile;
