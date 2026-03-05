import { useNavigate } from "react-router-dom";
import {
  PartyPopper,
  Heart,
  ArrowRight,
  Pill,
  ShieldAlert,
  AlertTriangle,
  Calendar,
  Users,
  Check,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";
import type { OnboardingWizardAPI } from "../useOnboardingWizard";

interface StepCompletionProps {
  wizard: OnboardingWizardAPI;
}

const StepCompletion = ({ wizard }: StepCompletionProps) => {
  const navigate = useNavigate();
  const { stepData, childName } = wizard.state;
  const { t } = useTranslation();

  // Calculate what was filled
  const items = [
    { label: t('onboarding.completion.items.birthDate'), filled: !!stepData.birthDate },
    { label: t('onboarding.completion.items.medicalConditions'), filled: !!stepData.medicalConditions?.trim() },
    { label: t('onboarding.completion.items.allergies'), filled: !!stepData.allergies?.trim() },
    { label: t('onboarding.completion.items.emergencyContact'), filled: !!stepData.emergencyContact?.trim() },
    { label: t('onboarding.completion.items.emergencyPhone'), filled: !!stepData.emergencyPhone?.trim() },
    { label: t('onboarding.completion.items.medication'), filled: !!stepData.medication },
    { label: t('onboarding.completion.items.emergencyProtocol'), filled: !!stepData.protocol },
  ];

  const filledCount = items.filter((i) => i.filled).length;
  const completeness = Math.round((filledCount / items.length) * 100);

  const nextSteps = [
    {
      label: t('onboarding.completion.nextSteps.completeProfile.label'),
      description: t('onboarding.completion.nextSteps.completeProfile.description'),
      path: "/dashboard/key-information",
      icon: Heart,
    },
    {
      label: t('onboarding.completion.nextSteps.addEmergencyCards.label'),
      description: t('onboarding.completion.nextSteps.addEmergencyCards.description'),
      path: "/dashboard/emergency-cards",
      icon: AlertTriangle,
    },
    {
      label: t('onboarding.completion.nextSteps.startDailyLog.label'),
      description: t('onboarding.completion.nextSteps.startDailyLog.description'),
      path: "/dashboard/daily-log",
      icon: Calendar,
    },
    {
      label: t('onboarding.completion.nextSteps.inviteCaregivers.label'),
      description: t('onboarding.completion.nextSteps.inviteCaregivers.description'),
      path: "/dashboard",
      icon: Users,
    },
  ];

  return (
    <div className="space-y-8 text-center">
      {/* Celebration header */}
      <div className="space-y-4">
        <div className="flex items-center justify-center gap-2">
          <PartyPopper className="h-10 w-10 text-yellow-500 animate-bounce" />
          <PartyPopper className="h-10 w-10 text-pink-500 animate-bounce [animation-delay:150ms]" />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">
          {t('onboarding.completion.title', { childName })}
        </h1>
        <p className="text-muted-foreground text-lg max-w-md mx-auto">
          {t('onboarding.completion.subtitle')}
        </p>
      </div>

      {/* Completeness bar */}
      <div className="max-w-sm mx-auto space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{t('onboarding.completion.setupProgress')}</span>
          <span className="font-semibold text-foreground">{completeness}%</span>
        </div>
        <Progress value={completeness} className="h-2.5" />
      </div>

      {/* Summary checklist */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-lg mx-auto text-left">
        {items.map((item) => (
          <div
            key={item.label}
            className="flex items-center gap-2 text-sm py-1.5"
          >
            {item.filled ? (
              <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                <Check className="h-3 w-3 text-green-600" />
              </div>
            ) : (
              <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center shrink-0">
                <X className="h-3 w-3 text-muted-foreground" />
              </div>
            )}
            <span
              className={
                item.filled
                  ? "text-foreground"
                  : "text-muted-foreground"
              }
            >
              {item.label}
            </span>
            {!item.filled && (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 ml-auto">
                {t('common.later')}
              </Badge>
            )}
          </div>
        ))}
      </div>

      {/* Primary actions */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        <Button
          onClick={() => navigate("/dashboard")}
          className="bg-special-600 hover:bg-special-700 px-8 h-11 w-full sm:w-auto"
        >
          {t('onboarding.completion.goToDashboard')}
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
        <Button
          variant="outline"
          onClick={() => navigate("/dashboard/key-information")}
          className="px-8 h-11 w-full sm:w-auto"
        >
          {t('onboarding.completion.completeFullProfile')}
        </Button>
      </div>

      {/* Suggested next steps */}
      <div className="pt-4">
        <h3 className="text-sm font-medium text-muted-foreground mb-3">
          {t('onboarding.completion.suggestedNextSteps')}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg mx-auto">
          {nextSteps.map((step) => (
            <Card
              key={step.path}
              className="cursor-pointer hover:shadow-sm transition-shadow border-border"
              onClick={() => navigate(step.path)}
            >
              <CardContent className="p-3 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-special-50 flex items-center justify-center shrink-0">
                  <step.icon className="h-4 w-4 text-special-600" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-foreground">
                    {step.label}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StepCompletion;
