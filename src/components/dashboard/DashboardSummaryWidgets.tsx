
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Pill, Calendar, Users, Heart, AlertTriangle, ArrowRight, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useChild } from "@/contexts/ChildContext";

const DashboardSummaryWidgets = () => {
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

  const { data: recentLogs = [], isLoading: logsLoading } = useQuery({
    queryKey: ["dailyLogRecent", activeChild?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("daily_log_entries")
        .select("title, mood, date, category")
        .eq("child_id", activeChild!.id)
        .order("date", { ascending: false })
        .limit(3);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user && !!activeChild,
  });

  const { data: careTeam = [], isLoading: teamLoading } = useQuery({
    queryKey: ["careTeamCount", activeChild?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("child_access")
        .select("role")
        .eq("child_id", activeChild!.id);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user && !!activeChild,
  });

  const { data: keyInfo, isLoading: profileLoading } = useQuery({
    queryKey: ["keyInformation", activeChild?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("key_information_secure")
        .select("*")
        .eq("child_id", activeChild!.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user && !!activeChild,
  });

  if (!activeChild) return null;

  // Calculate profile completeness
  const profileFields = keyInfo
    ? [
        keyInfo.full_name,
        keyInfo.birth_date,
        keyInfo.address,
        keyInfo.phone_number,
        keyInfo.emergency_contact,
        keyInfo.emergency_phone,
        keyInfo.medical_conditions,
        keyInfo.allergies,
        keyInfo.likes,
        keyInfo.dislikes,
      ]
    : [];
  const filledFields = profileFields.filter((f) => f && f.trim() !== "").length;
  const completeness = keyInfo ? Math.round((filledFields / profileFields.length) * 100) : 0;

  // Upcoming refills (within 14 days)
  const today = new Date();
  const upcomingRefills = medications.filter((m) => {
    if (!m.refill_date) return false;
    const refill = new Date(m.refill_date);
    const diffDays = (refill.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
    return diffDays >= 0 && diffDays <= 14;
  });

  const moodEmoji: Record<string, string> = {
    happy: "😊",
    neutral: "😐",
    sad: "😢",
    anxious: "😰",
    excited: "🤩",
    frustrated: "😤",
    calm: "😌",
  };

  const isLoading = medsLoading || logsLoading || teamLoading || profileLoading;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse bg-muted/30 border border-border h-36" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
      {/* Medications Widget */}
      <Link to="/dashboard/medications" className="block group">
        <Card className="border border-border bg-card hover:shadow-md transition-shadow h-full">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Pill className="h-5 w-5 text-blue-700" />
                </div>
                <CardTitle className="text-base font-semibold">Medications</CardTitle>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">{medications.length}</p>
            <p className="text-sm text-muted-foreground">active medications</p>
            {upcomingRefills.length > 0 && (
              <Badge variant="secondary" className="mt-2 bg-amber-100 text-amber-800 border-amber-200">
                <AlertTriangle className="h-3 w-3 mr-1" />
                {upcomingRefills.length} refill{upcomingRefills.length > 1 ? "s" : ""} due soon
              </Badge>
            )}
          </CardContent>
        </Card>
      </Link>

      {/* Recent Daily Logs Widget */}
      <Link to="/dashboard/daily-log" className="block group">
        <Card className="border border-border bg-card hover:shadow-md transition-shadow h-full">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-lg bg-green-100 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-green-700" />
                </div>
                <CardTitle className="text-base font-semibold">Recent Logs</CardTitle>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </CardHeader>
          <CardContent>
            {recentLogs.length > 0 ? (
              <ul className="space-y-1.5">
                {recentLogs.map((log, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <span>{moodEmoji[log.mood] || "📝"}</span>
                    <span className="text-foreground truncate font-medium">{log.title}</span>
                    <span className="text-muted-foreground text-xs ml-auto whitespace-nowrap">{log.date}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground italic">No daily logs recorded yet.</p>
            )}
          </CardContent>
        </Card>
      </Link>

      {/* Care Team Widget */}
      <Link to="/dashboard" className="block group">
        <Card className="border border-border bg-card hover:shadow-md transition-shadow h-full">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-lg bg-purple-100 flex items-center justify-center">
                  <Users className="h-5 w-5 text-purple-700" />
                </div>
                <CardTitle className="text-base font-semibold">Care Team</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">{careTeam.length}</p>
            <p className="text-sm text-muted-foreground">
              team member{careTeam.length !== 1 ? "s" : ""} with access
            </p>
            <div className="flex gap-1.5 mt-2">
              {careTeam.map((member, i) => (
                <Badge key={i} variant="outline" className="text-xs capitalize">
                  {member.role}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </Link>

      {/* Profile Completeness Widget */}
      <Link to="/dashboard/key-information" className="block group">
        <Card className="border border-border bg-card hover:shadow-md transition-shadow h-full">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-lg bg-special-100 flex items-center justify-center">
                  <Heart className="h-5 w-5 text-special-600" />
                </div>
                <CardTitle className="text-base font-semibold">Profile</CardTitle>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2">
              <p className="text-3xl font-bold text-foreground">{completeness}%</p>
              <p className="text-sm text-muted-foreground pb-1">complete</p>
            </div>
            <div className="w-full bg-muted rounded-full h-2 mt-2">
              <div
                className="bg-special-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${completeness}%` }}
              />
            </div>
            {completeness < 100 && (
              <p className="text-xs text-muted-foreground mt-2">
                Fill in {profileFields.length - filledFields} more field{profileFields.length - filledFields > 1 ? "s" : ""} for a complete profile
              </p>
            )}
          </CardContent>
        </Card>
      </Link>
    </div>
  );
};

export default DashboardSummaryWidgets;
