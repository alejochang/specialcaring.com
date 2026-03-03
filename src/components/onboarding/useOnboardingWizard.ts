import { useReducer, useMemo } from "react";

// --- Types ---

export type WizardStep =
  | "name"
  | "birthDate"
  | "medical"
  | "emergency"
  | "medication"
  | "protocol"
  | "completion";

export const STEP_ORDER: WizardStep[] = [
  "name",
  "birthDate",
  "medical",
  "emergency",
  "medication",
  "protocol",
  "completion",
];

export const STEP_LABELS: Record<WizardStep, string> = {
  name: "Child's Name",
  birthDate: "Birth Date",
  medical: "Medical Info",
  emergency: "Emergency Contact",
  medication: "Medications",
  protocol: "Emergency Protocol",
  completion: "All Done",
};

export interface StepData {
  birthDate?: string;
  medicalConditions?: string;
  allergies?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  medication?: { id: string; name: string; dosage: string; frequency: string } | null;
  protocol?: { id: string; title: string; severity: string; immediateSteps: string } | null;
}

export interface WizardState {
  currentStep: WizardStep;
  childId: string | null;
  childName: string;
  direction: "forward" | "backward";
  stepData: StepData;
  savingStep: WizardStep | null;
}

type WizardAction =
  | { type: "NEXT_STEP" }
  | { type: "PREV_STEP" }
  | { type: "SKIP_STEP" }
  | { type: "GO_TO_STEP"; step: WizardStep }
  | { type: "SET_CHILD_CREATED"; childId: string; childName: string }
  | { type: "UPDATE_STEP_DATA"; data: Partial<StepData> }
  | { type: "SET_SAVING"; step: WizardStep | null };

// --- Reducer ---

const initialState: WizardState = {
  currentStep: "name",
  childId: null,
  childName: "",
  direction: "forward",
  stepData: {},
  savingStep: null,
};

function wizardReducer(state: WizardState, action: WizardAction): WizardState {
  const currentIndex = STEP_ORDER.indexOf(state.currentStep);

  switch (action.type) {
    case "NEXT_STEP": {
      const nextIndex = Math.min(currentIndex + 1, STEP_ORDER.length - 1);
      return {
        ...state,
        currentStep: STEP_ORDER[nextIndex],
        direction: "forward",
      };
    }
    case "PREV_STEP": {
      const prevIndex = Math.max(currentIndex - 1, 0);
      return {
        ...state,
        currentStep: STEP_ORDER[prevIndex],
        direction: "backward",
      };
    }
    case "SKIP_STEP": {
      const nextIndex = Math.min(currentIndex + 1, STEP_ORDER.length - 1);
      return {
        ...state,
        currentStep: STEP_ORDER[nextIndex],
        direction: "forward",
      };
    }
    case "GO_TO_STEP":
      return {
        ...state,
        currentStep: action.step,
        direction:
          STEP_ORDER.indexOf(action.step) > currentIndex ? "forward" : "backward",
      };
    case "SET_CHILD_CREATED":
      return {
        ...state,
        childId: action.childId,
        childName: action.childName,
      };
    case "UPDATE_STEP_DATA":
      return {
        ...state,
        stepData: { ...state.stepData, ...action.data },
      };
    case "SET_SAVING":
      return {
        ...state,
        savingStep: action.step,
      };
    default:
      return state;
  }
}

// --- Hook ---

export function useOnboardingWizard() {
  const [state, dispatch] = useReducer(wizardReducer, initialState);

  const currentStepIndex = STEP_ORDER.indexOf(state.currentStep);
  const totalSteps = STEP_ORDER.length;

  const computed = useMemo(
    () => ({
      currentStepIndex,
      totalSteps,
      progressPercent: Math.round((currentStepIndex / (totalSteps - 1)) * 100),
      isFirstStep: currentStepIndex === 0,
      isLastStep: currentStepIndex === totalSteps - 1,
      canGoBack: currentStepIndex > 0,
      currentLabel: STEP_LABELS[state.currentStep],
    }),
    [currentStepIndex, totalSteps, state.currentStep]
  );

  return {
    state,
    ...computed,
    goNext: () => dispatch({ type: "NEXT_STEP" }),
    goPrev: () => dispatch({ type: "PREV_STEP" }),
    skipStep: () => dispatch({ type: "SKIP_STEP" }),
    goToStep: (step: WizardStep) => dispatch({ type: "GO_TO_STEP", step }),
    setChildCreated: (childId: string, childName: string) =>
      dispatch({ type: "SET_CHILD_CREATED", childId, childName }),
    updateStepData: (data: Partial<StepData>) =>
      dispatch({ type: "UPDATE_STEP_DATA", data }),
    setSaving: (step: WizardStep | null) =>
      dispatch({ type: "SET_SAVING", step }),
  };
}

export type OnboardingWizardAPI = ReturnType<typeof useOnboardingWizard>;
