"use client";

import type React from "react";

import { AlertCircle, CheckCircle2, Lock } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface FormSectionWrapperProps {
  children: React.ReactNode;
  isValid: boolean;
  canAccess: boolean;
  errors?: string[];
  title: string;
}

export function FormSectionWrapper({
  children,
  isValid,
  canAccess,
  errors,
  title,
}: FormSectionWrapperProps) {
  if (!canAccess) {
    return (
      <div className="glass-card opacity-50">
        <div className="p-6 text-center">
          <Lock className="w-8 h-8 mx-auto mb-3 text-gray-500" />
          <h3 className="text-lg font-semibold text-gray-400 mb-2">{title}</h3>
          <p className="text-gray-500">
            Complete previous sections to unlock this step
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {errors && errors.length > 0 && (
        <Alert className="border-red-500/30 bg-red-400/10">
          <AlertCircle className="h-4 w-4 text-red-400" />
          <AlertDescription className="text-red-700 dark:text-red-400">
            <ul className="list-disc list-inside space-y-1">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {isValid && (
        <Alert className="border-green-500/30 bg-green-500/10">
          <CheckCircle2 className="h-4 w-4 text-green-400" />
          <AlertDescription className="text-green-800 dark:text-green-300">
            This section is complete and valid
          </AlertDescription>
        </Alert>
      )}

      {children}
    </div>
  );
}
