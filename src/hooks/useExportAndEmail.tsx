import { useState } from "react";
import i18next from "i18next";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function useExportAndEmail() {
  const [isExporting, setIsExporting] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

  const exportAsHtml = async (functionName: string, filename: string) => {
    setIsExporting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error(i18next.t("toast.pleaseSignInExport"));

      const response = await fetch(
        `https://ogkieklnxxmvjgikyzog.supabase.co/functions/v1/${functionName}`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
            apikey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9na2lla2xueHhtdmpnaWt5em9nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA2NTE0OTcsImV4cCI6MjA4NjIyNzQ5N30.t_QNH0OWpAG5mMFL8MVxbychwoYJljKTobE3lsMi8YU",
          },
        }
      );

      const result = await response.json();
      if (result.error) throw new Error(result.error);

      // Create downloadable HTML file
      const blob = new Blob([result.html], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({ title: i18next.t("toast.exportSuccessful"), description: i18next.t("toast.fileDownloaded", { filename }) });
    } catch (error: any) {
      toast({ title: i18next.t("toast.exportFailed"), description: error.message, variant: "destructive" });
    } finally {
      setIsExporting(false);
    }
  };

  const sendByEmail = async (functionName: string, recipientEmail: string, recipientName?: string) => {
    setIsSending(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error(i18next.t("toast.pleaseSignInEmail"));

      const response = await fetch(
        `https://ogkieklnxxmvjgikyzog.supabase.co/functions/v1/${functionName}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
            apikey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9na2lla2xueHhtdmpnaWt5em9nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA2NTE0OTcsImV4cCI6MjA4NjIyNzQ5N30.t_QNH0OWpAG5mMFL8MVxbychwoYJljKTobE3lsMi8YU",
          },
          body: JSON.stringify({ recipientEmail, recipientName }),
        }
      );

      const result = await response.json();
      if (result.error) throw new Error(result.error);

      toast({ title: i18next.t("toast.emailSent"), description: i18next.t("toast.emailSentDesc", { email: recipientEmail }) });
    } catch (error: any) {
      toast({ title: i18next.t("toast.emailFailed"), description: error.message, variant: "destructive" });
    } finally {
      setIsSending(false);
    }
  };

  return { exportAsHtml, sendByEmail, isExporting, isSending };
}
