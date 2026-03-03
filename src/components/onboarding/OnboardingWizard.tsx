import { useOnboardingWizard, type WizardStep } from "./useOnboardingWizard";
import OnboardingProgress from "./OnboardingProgress";
import StepContainer from "./StepContainer";
import StepChildName from "./steps/StepChildName";
import StepBirthDate from "./steps/StepBirthDate";
import StepMedicalInfo from "./steps/StepMedicalInfo";
import StepEmergencyContact from "./steps/StepEmergencyContact";
import StepMedication from "./steps/StepMedication";
import StepEmergencyProtocol from "./steps/StepEmergencyProtocol";
import StepCompletion from "./steps/StepCompletion";
import type { OnboardingWizardAPI } from "./useOnboardingWizard";

const STEP_COMPONENTS: Record<
  WizardStep,
  React.ComponentType<{ wizard: OnboardingWizardAPI }>
> = {
  name: StepChildName,
  birthDate: StepBirthDate,
  medical: StepMedicalInfo,
  emergency: StepEmergencyContact,
  medication: StepMedication,
  protocol: StepEmergencyProtocol,
  completion: StepCompletion,
};

const OnboardingWizard = () => {
  const wizard = useOnboardingWizard();
  const { currentStep } = wizard.state;
  const StepComponent = STEP_COMPONENTS[currentStep];

  const showProgress = currentStep !== "completion";

  return (
    <div className="max-w-xl mx-auto py-8 px-4 md:px-6">
      {showProgress && (
        <OnboardingProgress
          currentStep={currentStep}
          currentStepIndex={wizard.currentStepIndex}
          progressPercent={wizard.progressPercent}
        />
      )}

      <StepContainer
        stepKey={currentStep}
        direction={wizard.state.direction}
      >
        <StepComponent wizard={wizard} />
      </StepContainer>
    </div>
  );
};

export default OnboardingWizard;
