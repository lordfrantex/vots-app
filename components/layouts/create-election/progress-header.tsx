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
  const getStepState = (index: number) => {
    const stepIds = [
      "basicInfo",
      "categories",
      "candidates",
      "polling",
      "complete",
    ] as const;
    const stepId = stepIds[index];

    if (index < currentStep && validationState[stepId]) {
      return "completed";
    } else if (index === currentStep) {
      return "current";
    } else if (
      index < currentStep ||
      (index === 1 && validationState.basicInfo) ||
      (index === 2 && validationState.categories) ||
      (index === 3 && validationState.candidates) ||
      (index === 4 && validationState.polling)
    ) {
      return "available";
    } else {
      return "locked";
    }
  };

  const canNavigateToStep = (index: number) => {
    if (index === 0) return true; // Basic info always accessible
    if (index === 1) return validationState.basicInfo;
    if (index === 2) return validationState.categories;
    if (index === 3) return validationState.candidates;
    if (index === 4) return validationState.polling;
    return false;
  };

  const getHighestAccessibleStep = () => {
    if (validationState.polling) return 4;
    if (validationState.candidates) return 3;
    if (validationState.categories) return 2;
    if (validationState.basicInfo) return 1;
    return 0;
  };

  return (
    <div className="glass-panel border-b border-white/10 sticky top-18 z-30 pb-4 ">
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
        <div className="flex items-center space-x-4">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const stepState = getStepState(index);
            const canNavigate = canNavigateToStep(index);
            const highestAccessible = getHighestAccessibleStep();

            let className =
              "flex items-center space-x-2 px-3 py-2 rounded-lg transition-all cursor-pointer";

            if (stepState === "completed") {
              className +=
                " text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/10";
            } else if (stepState === "current") {
              className += " bg-blue-500/20 text-blue-600 dark:text-blue-400";
            } else if (
              stepState === "available" &&
              index <= highestAccessible
            ) {
              className +=
                " text-gray-600 dark:text-gray-300 hover:bg-gray-500/10";
            } else {
              className +=
                " text-gray-400 dark:text-gray-600 cursor-not-allowed";
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
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{step.title}</span>
                </div>
                {index < steps.length - 1 && (
                  <ChevronRight className="w-4 h-4 mx-2 text-gray-600" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
