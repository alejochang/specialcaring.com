import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { useIsMobile } from "@/hooks/use-mobile";
import { STEP_ORDER, STEP_LABELS, type WizardStep } from "./useOnboardingWizard";
import { useTranslation } from "react-i18next";

interface OnboardingProgressProps {
  currentStep: WizardStep;
  currentStepIndex: number;
  progressPercent: number;
}

const OnboardingProgress = ({
  currentStep,
  currentStepIndex,
  progressPercent,
}: OnboardingProgressProps) => {
  const isMobile = useIsMobile();
  const { t } = useTranslation();

  return (
    <div className="mb-8 md:mb-12">
      {/* Step label */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-muted-foreground">
          {t('onboarding.progress', { current: currentStepIndex + 1, total: STEP_ORDER.length })}
        </p>
        <p className="text-sm font-medium text-foreground">
          {t(STEP_LABELS[currentStep])}
        </p>
      </div>

      {/* Progress bar */}
      <Progress value={progressPercent} className="h-1.5 bg-muted" />

      {/* Step dots — hidden on mobile */}
      {!isMobile && (
        <div className="flex items-center justify-between mt-3">
          {STEP_ORDER.map((step, idx) => (
            <div key={step} className="flex flex-col items-center">
              <div
                className={cn(
                  "w-2.5 h-2.5 rounded-full transition-all duration-300",
                  idx < currentStepIndex
                    ? "bg-special-600"
                    : idx === currentStepIndex
                      ? "bg-special-600 ring-2 ring-special-200 ring-offset-1"
                      : "bg-muted"
                )}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OnboardingProgress;
