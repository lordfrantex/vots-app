"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import {
  Vote,
  Users,
  CheckCircle,
  Loader2,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { useAccount } from "wagmi";

// Hooks
import { useElectionValidation } from "@/hooks/use-election-validation";
import { useCreateElection } from "@/hooks/use-election-write-operations";

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
  OffChainDataService,
} from "@/utils/contract-helpers";
import type { Election } from "@/types/election";

// UI Components
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

const steps = [
  { id: "basic", title: "Basic Info", icon: Vote },
  { id: "categories", title: "Categories", icon: Users },
  { id: "candidates", title: "Candidates", icon: Users },
  { id: "voters", title: "Voters", icon: Users },
  { id: "polling", title: "Polling Setup", icon: CheckCircle },
  { id: "review", title: "Review", icon: CheckCircle },
];

const sectionIds = [
  "basic",
  "categories",
  "candidates",
  "voters",
  "polling",
  "review",
];

export default function CreateElectionPage() {
  const router = useRouter();
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Wallet connection
  const { address, isConnected, isConnecting } = useAccount();
  const [walletCheckLoading, setWalletCheckLoading] = useState(true);

  // Election validation hook
  const {
    forms,
    validationState,
    validCategories,
    currentStep,
    setCurrentStep,
    validateCompleteElection,
    canAccessSection,
  } = useElectionValidation();

  // Contract integration hook
  const {
    createElection,
    isLoading: isCreating,
    isSuccess,
    error: contractError,
    hash,
    isConfirming,
  } = useCreateElection();

  // Local state for UI
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(["basic"]),
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);

  // Wallet connection check effect
  useEffect(() => {
    const checkWallet = async () => {
      setWalletCheckLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setWalletCheckLoading(false);
    };
    checkWallet();
  }, []);

  // Handle success state
  useEffect(() => {
    if (isSuccess) {
      setIsConfirmed(true);
      toast.success("Election created successfully!");
      setTimeout(() => {
        router.push("/elections");
      }, 3000);
    }
  }, [isSuccess, router]);

  // Handle contract errors
  useEffect(() => {
    if (contractError) {
      toast.error("Failed to create election");
    }
  }, [contractError]);

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

  // Get election data for review
  const getElectionData = useCallback((): Election => {
    const basicInfo = forms.basicInfo.getValues();
    const categories = forms.categories.getValues();
    const candidates = forms.candidates.getValues();
    const voters = forms.voters.getValues();
    const polling = forms.polling.getValues();

    return {
      id: "preview",
      name: basicInfo.name,
      description: basicInfo.description,
      startDate: basicInfo.startDate,
      endDate: basicInfo.endDate,
      timezone: basicInfo.timezone,
      status: "UPCOMING",
      categories:
        categories.categories?.map((cat) => ({
          id: cat.id,
          name: cat.name,
        })) || [],
      candidates:
        candidates.candidates?.map((candidate) => ({
          id: candidate.id,
          name: candidate.name,
          matricNo: candidate.matricNo,
          category: candidate.category,
          photo: candidate.photo,
          voteCount: 0,
        })) || [],
      voters:
        voters.voters?.map((voter) => ({
          id: voter.id,
          name: voter.name,
          matricNumber: voter.matricNumber,
          email: voter.email,
          department: voter.department,
          isAccredited: false,
          hasVoted: false,
        })) || [],
      pollingOfficers:
        polling.pollingOfficers?.map((officer) => ({
          id: officer.id,
          address: officer.address as `0x${string}`,
          role: officer.role,
        })) || [],
      pollingUnits:
        polling.pollingUnits?.map((unit) => ({
          id: unit.id,
          address: unit.address as `0x${string}`,
          name: unit.name,
        })) || [],
      totalVoters: voters.voters?.length || 0,
      totalVotes: 0,
    };
  }, [forms]);

  // Form submission handler
  const handleSubmit = useCallback(async () => {
    // Check wallet connection first
    if (!isConnected || !address) {
      toast.error("Please connect your wallet to create an election.");
      return;
    }

    console.log("=== FORM SUBMISSION START ===");

    try {
      setIsSubmitting(true);

      // Validate complete election
      const validation = validateCompleteElection();
      if (!validation.success || !validation.data) {
        console.error("Validation errors:", validation.errors);
        toast.error("Please complete all required fields before submitting.");
        return;
      }

      console.log("Collected form data:", validation.data);

      // Convert to contract parameters
      const contractParams = convertToContractElectionParams(validation.data);
      console.log("Contract parameters:", contractParams);

      // Validate contract parameters
      const contractValidation = validateContractElectionParams(contractParams);
      if (!contractValidation.isValid) {
        console.error("Contract validation failed:", contractValidation.errors);
        toast.error("Validation failed");
        return;
      }

      // Generate temporary election ID for off-chain data storage
      const tempElectionId = `temp-${Date.now()}`;

      // Save off-chain data before blockchain transaction
      OffChainDataService.saveElectionCreationData(
        tempElectionId,
        validation.data,
      );
      console.log("Saved off-chain data for election:", tempElectionId);

      // Submit to blockchain using the hook
      const result = await createElection({
        electionParams: contractParams,
      });

      console.log("Blockchain submission result:", result);

      if (!result.success) {
        toast.error("Failed to create election");
      }
    } catch (error) {
      console.error("Error in form submission:", error);
      toast.error("Unexpected error");
    } finally {
      setIsSubmitting(false);
      console.log("=== FORM SUBMISSION END ===");
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
    <section
      id="create-page"
      className="justify-center items-center min-h-screen relative pt-[7rem] lg:pt-[10rem] -mt-20 overflow-x-hidden"
    >
      <div className="mx-auto">
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
                  <strong>Contract Error:</strong> {contractError}
                </AlertDescription>
              </Alert>
            )}

            {/* Success Alert */}
            {isConfirmed && (
              <Alert className="border-green-200 bg-green-50 text-green-800 mb-6">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Success!</strong> Your election has been created
                  successfully. Redirecting to elections page...
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

              <div ref={setRef("voters")}>
                <VotersForm
                  form={forms.voters}
                  isExpanded={expandedSections.has("voters")}
                  onToggle={() => toggleSection("voters")}
                  canAccess={canAccessSection("voters")}
                  isValid={validationState.voters}
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
      </div>
    </section>
  );
}
