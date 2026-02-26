import { useQuery } from "@tanstack/react-query";
import { Pill, Calendar, AlertTriangle, Heart, CheckCircle2, Circle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useChild } from "@/contexts/ChildContext";
import { Link } from "react-router-dom";

const moodEmoji: Record<string, string> = {
  happy: "😊",
  neutral: "😐",
  sad: "😢",
  anxious: "😰",
  excited: "🤩",
  frustrated: "😤",
  calm: "😌",
};

const TodaySnapshot = () => {
  const { user } = useAuth();
  const { activeChild } = useChild();

  const { data: medications = [], isLoading: medsLoading } = useQuery({
    queryKey: ["medications", activeChild?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("medications")
        .select("name, dosage, frequency, refill_date")
        .eq("child_id", activeChild!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user && !!activeChild,
  });

  const { data: latestLog } = useQuery({
    queryKey: ["dailyLogLatest", activeChild?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("daily_log_entries")
        .select("title, mood, date")
        .eq("child_id", activeChild!.id)
        .order("date", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user && !!activeChild,
  });

  const { data: childProfile } = useQuery({
    queryKey: ["childProfile", activeChild?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("children_secure")
        .select("*")
        .eq("id", activeChild!.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user && !!activeChild,
  });

  if (!activeChild) return null;

  // Upcoming refills (within 14 days)
  const today = new Date();
  const upcomingRefills = medications.filter((m) => {
    if (!m.refill_date) return false;
    const refill = new Date(m.refill_date);
    const diffDays = (refill.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
    return diffDays >= 0 && diffDays <= 14;
  });

  // Profile completeness
  const profileFields = childProfile
    ? [
        childProfile.full_name,
        childProfile.birth_date,
        childProfile.address,
        childProfile.phone_number,
        childProfile.emergency_contact,
        childProfile.emergency_phone,
        childProfile.medical_conditions,
        childProfile.allergies,
        childProfile.likes,
        childProfile.dislikes,
      ]
    : [];
  const filledFields = profileFields.filter((f) => f && f.trim() !== "").length;
  const completeness = childProfile ? Math.round((filledFields / profileFields.length) * 100) : 0;

  if (medsLoading) {
    return (
      <Card className="border border-border bg-card mb-6 animate-pulse h-48" />
    );
  }

  return (
    <Card className="border border-border bg-card mb-6 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Calendar className="h-5 w-5 text-special-600" />
          Today's Snapshot
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Medications checklist */}
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
            <Pill className="h-3.5 w-3.5" /> Medications ({medications.length})
          </h4>
          {medications.length > 0 ? (
            <ul className="space-y-1.5">
              {medications.slice(0, 5).map((med, i) => (
                <li key={i} className="flex items-center gap-2 text-sm">
                  <Circle className="h-3.5 w-3.5 text-muted-foreground/50 flex-shrink-0" />
                  <span className="font-medium text-foreground">{med.name}</span>
                  <span className="text-muted-foreground">·</span>
                  <span className="text-muted-foreground text-xs">{med.dosage}</span>
                  <span className="text-muted-foreground text-xs ml-auto">{med.frequency}</span>
                </li>
              ))}
              {medications.length > 5 && (
                <li className="text-xs text-muted-foreground">
                  + {medications.length - 5} more
                </li>
              )}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground italic">No medications recorded yet.</p>
          )}
        </div>

        {/* Refill alerts */}
        {upcomingRefills.length > 0 && (
          <div className="flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2">
            <AlertTriangle className="h-4 w-4 text-destructive flex-shrink-0" />
            <span className="text-sm text-foreground">
              {upcomingRefills.length} refill{upcomingRefills.length > 1 ? "s" : ""} due soon:{" "}
              <span className="font-medium">
                {upcomingRefills.map((r) => r.name).join(", ")}
              </span>
            </span>
          </div>
        )}

        {/* Latest daily log */}
        {latestLog && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-lg">{moodEmoji[latestLog.mood] || "📝"}</span>
            <span className="text-muted-foreground">Last log:</span>
            <span className="font-medium text-foreground truncate">{latestLog.title}</span>
            <span className="text-xs text-muted-foreground ml-auto">{latestLog.date}</span>
          </div>
        )}

        {/* Profile completeness nudge */}
        {completeness < 100 && (
          <Link to="/dashboard/key-information" className="block">
            <div className="rounded-lg bg-special-50 dark:bg-special-950/30 px-3 py-2.5 space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1.5 text-special-700 dark:text-special-300 font-medium">
                  <Heart className="h-3.5 w-3.5" />
                  Profile {completeness}% complete
                </span>
                <span className="text-xs text-muted-foreground">
                  {profileFields.length - filledFields} fields remaining
                </span>
              </div>
              <Progress value={completeness} className="h-1.5" />
            </div>
          </Link>
        )}
      </CardContent>
    </Card>
  );
};

export default TodaySnapshot;
