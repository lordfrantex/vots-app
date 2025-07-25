"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  Vote,
  Users,
  CheckCircle,
  Loader2,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

// Form Components
import { BasicInfoForm } from "@/components/layouts/create-election/basic-info-form";
import { CategoriesForm } from "@/components/layouts/create-election/categories-form";
import { CandidatesForm } from "@/components/layouts/create-election/candidates-form";
import { VotersForm } from "@/components/layouts/create-election/voters-form";
import { PollingSetupForm } from "@/components/layouts/create-election/polling-setup-form";
import { ReviewSummary } from "@/components/layouts/create-election/review-summary";
import { ProgressHeader } from "@/components/layouts/create-election/progress-header";

// Contract Integration
import {
  convertToContractElectionParams,
  validateContractElectionParams,
} from "@/utils/contract-helpers";
import type { Election } from "@/types/election";

// UI Components
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAccount } from "wagmi";
import toast from "react-hot-toast";

const steps = [
  { id: "basic", title: "Basic Info", icon: Vote },
  { id: "categories", title: "Categories", icon: Users },
  { id: "candidates", title: "Candidates", icon: Users },
  { id: "polling", title: "Polling Setup", icon: CheckCircle },
  { id: "review", title: "Review", icon: CheckCircle },
];

const sectionIds = ["basic", "categories", "candidates", "polling", "review"];

interface CreateElectionFormProps {
  forms: any;
  validationState: any;
  validCategories: any;
  currentStep: number;
  setCurrentStep: (step: number) => void;
  validateCompleteElection: () => any;
  canAccessSection: (section: string) => boolean;
  createElection: (params: any) => Promise<any>;
  getElectionData: () => Election;
  walletCheckLoading: boolean;
  isConnected: boolean;
  isConnecting: boolean;
  address: string | undefined;
  isCreating: boolean;
  isSuccess: boolean;
  contractError: string | null;
  hash: string | undefined;
  isConfirming: boolean;
  isSubmitting: boolean;
  isConfirmed: boolean;
  onSuccess?: () => void;
}

export function CreateElectionForm({
  forms,
  validationState,
  validCategories,
  currentStep,
  setCurrentStep,
  validateCompleteElection,
  canAccessSection,
  createElection,
  getElectionData,
  walletCheckLoading,
  isConnected,
  isConnecting,
  address,
  isCreating,
  isSuccess,
  contractError,
  hash,
  isConfirming,
  isSubmitting,
  isConfirmed,
  onSuccess,
}: CreateElectionFormProps) {
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(["basic"]),
  );

  // Handle success state
  useEffect(() => {
    if (isSuccess && onSuccess) {
      onSuccess();
    }
  }, [isSuccess, onSuccess]);

  // Section toggle handler
  const toggleSection = useCallback(
    (sectionId: string) => {
      const newExpanded = new Set(expandedSections);
      if (newExpanded.has(sectionId)) {
        newExpanded.delete(sectionId);
      } else {
        newExpanded.add(sectionId);
      }
      setExpandedSections(newExpanded);
    },
    [expandedSections],
  );

  // Step navigation handler
  const handleStepClick = useCallback(
    (stepIndex: number) => {
      const sectionId = sectionIds[stepIndex];
      setCurrentStep(stepIndex);
      setExpandedSections((prev) => new Set([...prev, sectionId]));

      const sectionRef = sectionRefs.current[sectionId];
      if (sectionRef) {
        sectionRef.scrollIntoView({
          behavior: "smooth",
          block: "start",
          inline: "nearest",
        });
      }
    },
    [setCurrentStep],
  );

  // Ref setter helper
  const setRef = (sectionId: string) => (el: HTMLDivElement | null) => {
    sectionRefs.current[sectionId] = el;
  };

  // Form submission handler
  const handleSubmit = useCallback(async () => {
    // Check wallet connection first
    if (!isConnected || !address) {
      toast.error("Please connect your wallet to create an election.");
      return;
    }

    try {
      // Validate complete election
      const validation = validateCompleteElection();
      if (!validation.success || !validation.data) {
        toast.error("Please complete all required fields before submitting.");
        return;
      }

      // Convert to contract parameters
      const contractParams = convertToContractElectionParams(validation.data);

      // Validate contract parameters
      const contractValidation = validateContractElectionParams(contractParams);
      if (!contractValidation.isValid) {
        toast.error("Validation failed");
        return;
      }

      // Submit to blockchain using the hook
      await createElection({
        electionParams: contractParams,
      });
    } catch (error) {
      toast.error("Unexpected error");
    }
  }, [validateCompleteElection, createElection, isConnected, address]);

  const isLoading = isSubmitting || isCreating || isConfirming;

  // Wallet connection status component
  const WalletConnectionStatus = () => {
    if (walletCheckLoading || isConnecting) {
      return (
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-center gap-3">
            <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
            <p className="text-blue-800 dark:text-blue-200">
              Checking wallet connection...
            </p>
          </div>
        </div>
      );
    }

    if (!isConnected) {
      return (
        <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
            <p className="text-yellow-800 dark:text-yellow-200">
              Please connect your wallet to create an election.
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-600" />
          <div>
            <p className="text-green-800 dark:text-green-200 font-medium">
              Wallet Connected
            </p>
            <p className="text-green-600 dark:text-green-300 text-sm">
              {address?.slice(0, 6)}...{address?.slice(-4)}
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen">
      {/* Progress Header */}
      <ProgressHeader
        steps={steps}
        currentStep={currentStep}
        validationState={validationState}
        onStepClick={handleStepClick}
      />

      <div className="max-w-7xl mx-auto px-6 pt-[15rem]">
        {/* Wallet Connection Status */}
        <WalletConnectionStatus />

        {/* Contract Error Alert */}
        {contractError && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Contract Error:</strong> Election could not be created.
            </AlertDescription>
          </Alert>
        )}

        {/* Success Alert */}
        {isConfirmed && (
          <Alert className="border-green-200 bg-green-50 text-green-800 mb-6">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Success!</strong> Your election has been created
              successfully.
            </AlertDescription>
          </Alert>
        )}

        {/* Transaction Status */}
        {(isCreating || isConfirming) && (
          <Card className="border-blue-200 bg-blue-50 mb-6">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-3">
                <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                <div>
                  <p className="font-medium text-blue-900">
                    {isCreating && !hash && "Preparing transaction..."}
                    {isCreating &&
                      hash &&
                      !isConfirmed &&
                      "Confirming transaction..."}
                  </p>
                  {hash && (
                    <p className="text-sm text-blue-700 font-mono break-all">
                      Transaction: {hash}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Form Sections */}
        <div className="space-y-6">
          <div ref={setRef("basic")}>
            <BasicInfoForm
              form={forms.basicInfo}
              isExpanded={expandedSections.has("basic")}
              onToggle={() => toggleSection("basic")}
              canAccess={canAccessSection("basicInfo")}
              isValid={validationState.basicInfo}
            />
          </div>

          <div ref={setRef("categories")}>
            <CategoriesForm
              form={forms.categories}
              isExpanded={expandedSections.has("categories")}
              onToggle={() => toggleSection("categories")}
              canAccess={canAccessSection("categories")}
              isValid={validationState.categories}
            />
          </div>

          <div ref={setRef("candidates")}>
            <CandidatesForm
              form={forms.candidates}
              validCategories={validCategories}
              isExpanded={expandedSections.has("candidates")}
              onToggle={() => toggleSection("candidates")}
              canAccess={canAccessSection("candidates")}
              isValid={validationState.candidates}
            />
          </div>

          <div ref={setRef("polling")}>
            <PollingSetupForm
              form={forms.polling}
              isExpanded={expandedSections.has("polling")}
              onToggle={() => toggleSection("polling")}
              canAccess={canAccessSection("polling")}
              isValid={validationState.polling}
            />
          </div>

          <div ref={setRef("review")}>
            <ReviewSummary
              electionData={getElectionData()}
              isExpanded={expandedSections.has("review")}
              onToggle={() => toggleSection("review")}
              onSubmit={handleSubmit}
              canAccess={canAccessSection("complete")}
              isValid={validationState.complete}
              isSubmitting={isLoading}
              txHash={hash}
              isConfirmed={isConfirmed}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
