import { useAuth } from "@/contexts/AuthContext";
import { useChild } from "@/contexts/ChildContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
};

const DashboardHero = () => {
  const { user } = useAuth();
  const { activeChild } = useChild();

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user!.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  const firstName = profile?.full_name?.split(" ")[0] || user?.email?.split("@")[0] || "there";
  const childInitial = activeChild?.name?.charAt(0)?.toUpperCase() || "?";

  return (
    <div className="rounded-2xl bg-gradient-to-r from-special-600 via-special-500 to-kids-400 p-6 md:p-8 text-primary-foreground mb-6 animate-fadeIn">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            {getGreeting()}, {firstName}! 👋
          </h1>
          {activeChild && (
            <p className="text-primary-foreground/80 text-sm md:text-base">
              Caring for <span className="font-semibold">{activeChild.full_name || activeChild.name}</span>
            </p>
          )}
        </div>
        {activeChild && (
          <Avatar className="h-14 w-14 border-2 border-primary-foreground/30 shadow-lg">
            <AvatarImage src={activeChild.avatar_url || undefined} alt={activeChild.name} />
            <AvatarFallback className="bg-primary-foreground/20 text-primary-foreground text-xl font-bold">
              {childInitial}
            </AvatarFallback>
          </Avatar>
        )}
      </div>
    </div>
  );
};

export default DashboardHero;
