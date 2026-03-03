import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface StepContainerProps {
  stepKey: string;
  direction: "forward" | "backward";
  children: ReactNode;
}

/**
 * Wraps each wizard step with a fade-in animation.
 * Uses `key` externally (via parent) to trigger remount on step change.
 * Direction determines whether we fade up (forward) or down (backward).
 */
const StepContainer = ({ stepKey, direction, children }: StepContainerProps) => {
  return (
    <div
      key={stepKey}
      className={cn(
        "w-full",
        direction === "forward" ? "animate-fadeIn" : "animate-fadeInDown"
      )}
    >
      {children}
    </div>
  );
};

export default StepContainer;
