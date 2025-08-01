"use client";

import type React from "react";
import { ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Heading from "@/components/ui/heading";
import { ValidationState } from "@/hooks/use-election-validation";

interface Step {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface ProgressHeaderProps {
  steps: Step[];
  currentStep: number;
  validationState: ValidationState;
  onStepClick: (stepIndex: number) => void;
}

export function ProgressHeader({
  steps,
  currentStep,
  validationState,
  onStepClick,
}: ProgressHeaderProps) {
  // Map step indices to validation state keys
  const getValidationKey = (index: number): keyof ValidationState => {
    const stepMap: Record<number, keyof ValidationState> = {
      0: "basicInfo",
      1: "categories",
      2: "candidates",
      3: "voters",
      4: "polling",
      5: "complete",
    };
    return stepMap[index] || "basicInfo";
  };

  // Get step state for styling
  const getStepState = (index: number) => {
    const validationKey = getValidationKey(index);
    const isValid = validationState[validationKey];

    if (index < currentStep && isValid) {
      return "completed";
    } else if (index === currentStep) {
      return "current";
    } else if (canNavigateToStep(index)) {
      return "available";
    } else {
      return "locked";
    }
  };

  // Check if user can navigate to a specific step
  const canNavigateToStep = (index: number): boolean => {
    if (index === 0) return true; // Basic info always accessible
    if (index === 1) return validationState.basicInfo;
    if (index === 2) return validationState.categories;
    if (index === 3) return validationState.candidates;
    if (index === 4) return validationState.voters;
    if (index === 5) return validationState.polling;
    return false;
  };

  // Get the highest step that's accessible
  const getHighestAccessibleStep = (): number => {
    let highestStep = 0;
    for (let i = steps.length - 1; i >= 0; i--) {
      if (canNavigateToStep(i)) {
        highestStep = i;
        break;
      }
    }
    return highestStep;
  };

  const highestAccessible = getHighestAccessibleStep();

  return (
    <div className="glass-panel border-b border-white/10 fixed right-0 left-0 top-18 z-30 pb-4">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <Heading
            title="Create an Election"
            description="Set up a secure, transparent, and decentralized student election"
          />
          <Badge
            variant="outline"
            className="border-blue-500/40 text-blue-700 dark:text-blue-400"
          >
            Step {currentStep + 1} of {steps.length}
          </Badge>
        </div>

        {/* Progress Bar */}
        <div className="flex items-center space-x-4 overflow-x-auto pb-2">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const stepState = getStepState(index);
            const canNavigate = canNavigateToStep(index);

            let className =
              "flex items-center space-x-2 px-3 py-2 rounded-lg transition-all cursor-pointer whitespace-nowrap";

            if (stepState === "completed") {
              className +=
                " text-green-600 dark:text-green-400 hover:bg-green-500/10 border border-green-500/30";
            } else if (stepState === "current") {
              className +=
                " bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/50";
            } else if (
              stepState === "available" &&
              index <= highestAccessible
            ) {
              className +=
                " text-gray-600 dark:text-gray-300 hover:bg-gray-500/10 border border-gray-300/30 hover:border-gray-400/50";
            } else {
              className +=
                " text-gray-400 dark:text-gray-600 cursor-not-allowed border border-gray-200/20";
            }

            return (
              <div key={step.id} className="flex items-center">
                <div
                  className={className}
                  onClick={() => {
                    if (canNavigate && index <= highestAccessible) {
                      onStepClick(index);
                    }
                  }}
                  role="button"
                  tabIndex={canNavigate && index <= highestAccessible ? 0 : -1}
                  onKeyDown={(e) => {
                    if (
                      (e.key === "Enter" || e.key === " ") &&
                      canNavigate &&
                      index <= highestAccessible
                    ) {
                      e.preventDefault();
                      onStepClick(index);
                    }
                  }}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm font-medium">{step.title}</span>
                  {stepState === "completed" && (
                    <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0" />
                  )}
                </div>
                {index < steps.length - 1 && (
                  <ChevronRight className="w-4 h-4 mx-2 text-gray-400 dark:text-gray-600 flex-shrink-0" />
                )}
              </div>
            );
          })}
        </div>

        {/*/!* Progress Indicator *!/*/}
        {/*<div className="mt-4 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">*/}
        {/*  <div*/}
        {/*    className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300 ease-in-out"*/}
        {/*    style={{*/}
        {/*      width: `${((currentStep + 1) / steps.length) * 100}%`,*/}
        {/*    }}*/}
        {/*  />*/}
        {/*</div>*/}

        {/*/!* Step Indicator Text *!/*/}
        {/*<div className="mt-2 text-sm text-gray-600 dark:text-gray-400 text-center">*/}
        {/*  {validationState.complete*/}
        {/*    ? "All sections completed - Ready to submit"*/}
        {/*    : `Complete ${steps[currentStep]?.title || "current step"} to continue`}*/}
        {/*</div>*/}
      </div>
    </div>
  );
}
