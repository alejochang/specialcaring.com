import { useAuth } from "@/contexts/AuthContext";
import { useChild } from "@/contexts/ChildContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Heart, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const DashboardHero = () => {
  const { user } = useAuth();
  const { activeChild, children } = useChild();
  const { t } = useTranslation();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t('dashboard.hero.goodMorning');
    if (hour < 17) return t('dashboard.hero.goodAfternoon');
    return t('dashboard.hero.goodEvening');
  };

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

  // Empty state — no children yet
  if (children.length === 0) {
    return (
      <div className="rounded-2xl bg-gradient-to-r from-special-600 via-special-500 to-kids-400 p-6 md:p-10 text-primary-foreground mb-6 animate-fadeIn">
        <div className="flex flex-col items-center text-center gap-4 max-w-md mx-auto">
          <div className="w-14 h-14 rounded-full bg-primary-foreground/20 flex items-center justify-center">
            <Star className="h-7 w-7 text-primary-foreground" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              {t('dashboard.hero.greeting', { greeting: getGreeting(), name: firstName })}
            </h1>
            <p className="text-primary-foreground/80 text-sm md:text-base">
              {t('dashboard.hero.emptyTitle')}
            </p>
          </div>
          <Button
            asChild
            size="lg"
            className="bg-primary-foreground text-special-700 hover:bg-primary-foreground/90 font-semibold gap-2 mt-2"
          >
            <Link to="/add-child">
              <Heart className="h-4 w-4" />
              {t('dashboard.hero.addFirstChild')}
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const childInitial = activeChild?.name?.charAt(0)?.toUpperCase() || "?";

  return (
    <div className="rounded-2xl bg-gradient-to-r from-special-600 via-special-500 to-kids-400 p-6 md:p-8 text-primary-foreground mb-6 animate-fadeIn">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            {t('dashboard.hero.greeting', { greeting: getGreeting(), name: firstName })}
          </h1>
          {activeChild && (
            <p className="text-primary-foreground/80 text-sm md:text-base">
              {t('dashboard.hero.caringFor', { childName: activeChild.full_name || activeChild.name })}
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
