import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import DashboardLayout from "@/components/layout/Dashboard";
import OnboardingWizard from "@/components/onboarding/OnboardingWizard";
import RedeemInvite from "@/components/RedeemInvite";

const AddChild = () => {
  const { t } = useTranslation();
  const [isRedeemOpen, setIsRedeemOpen] = useState(false);

  return (
    <DashboardLayout>
      <div className="animate-fadeIn">
        <OnboardingWizard />

        {/* Invite code section — alternative path */}
        <div className="max-w-xl mx-auto px-4 md:px-6 pb-8">
          <Separator className="mb-6" />
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-3">
              {t("pages.addChild.orJoinTeam")}
            </p>
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => setIsRedeemOpen(true)}
            >
              <Ticket className="h-4 w-4" /> {t("pages.addChild.joinWithInviteCode")}
            </Button>
          </div>
        </div>

        <RedeemInvite open={isRedeemOpen} onOpenChange={setIsRedeemOpen} />
      </div>
    </DashboardLayout>
  );
};

export default AddChild;
