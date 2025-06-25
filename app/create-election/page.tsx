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
import {
  useWriteContract,
  useWaitForTransactionReceipt,
  useAccount,
} from "wagmi";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import { useElectionValidation } from "@/hooks/use-election-validation";
import { ProgressHeader } from "@/components/layouts/create-election/progress-header";
import { BasicInfoForm } from "@/components/layouts/create-election/basic-info-form";
import { CategoriesForm } from "@/components/layouts/create-election/categories-form";
import { CandidatesForm } from "@/components/layouts/create-election/candidates-form";
import { ReviewSummary } from "@/components/layouts/create-election/review-summary";
import { VotersForm } from "@/components/layouts/create-election/voters-form";
import { PollingSetupForm } from "@/components/layouts/create-election/polling-setup-form";
import { abi } from "@/contracts/abi";
import { electionAddress } from "@/contracts/election-address";
import {
  convertToContractArgs,
  validateContractArgs,
} from "@/utils/contract-helpers";

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
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(["basic"]),
  );
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();
  const [walletCheckLoading, setWalletCheckLoading] = useState(true);

  const router = useRouter();
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const {
    forms,
    validationState,
    validCategories,
    currentStep,
    setCurrentStep,
    validateCompleteElection,
    canAccessSection,
  } = useElectionValidation();

  // Wagmi hooks for contract interaction
  const { address, isConnected, isConnecting } = useAccount();
  const {
    writeContract,
    isPending: isWritePending,
    error: writeError,
    data: writeData,
  } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    error: confirmError,
  } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  // Wallet connection check effect
  useEffect(() => {
    const checkWallet = async () => {
      setWalletCheckLoading(true);
      // Simulate checking wallet connection
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setWalletCheckLoading(false);
    };

    checkWallet();
  }, []);

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

  const handleSubmit = useCallback(async () => {
    // Check wallet connection first
    if (!isConnected || !address) {
      toast.error("Please connect your wallet to create an election.");
      return;
    }

    const validation = validateCompleteElection();

    if (!validation.success || !validation.data) {
      console.error("Validation errors:", validation.errors);
      toast.error("Please complete all required fields before submitting.");
      return;
    }

    // Show loading toast
    const loadingToastId = toast.loading("Creating election...");

    try {
      console.log("=== ELECTION CREATION DEBUG ===");
      console.log("1. Original validation data:", validation.data);

      // Convert frontend data to contract format
      const contractArgs = convertToContractArgs(validation.data);
      console.log("2. Converted contract args:", contractArgs);

      // Validate contract arguments
      const contractValidation = validateContractArgs(contractArgs);
      console.log("3. Contract validation result:", contractValidation);

      if (!contractValidation.isValid) {
        console.error("Contract validation errors:", contractValidation.errors);
        toast.error(
          "Contract validation failed: " + contractValidation.errors.join(", "),
          {
            id: loadingToastId,
          },
        );
        return;
      }

      console.log("4. Calling writeContract with:");
      console.log("   - Address:", electionAddress);
      console.log("   - Function:", "createElection");
      console.log("   - Args length:", contractArgs.length);

      // Type-safe contract call
      writeContract(
        {
          address: electionAddress as `0x${string}`,
          abi: abi,
          functionName: "createElection",
          args: contractArgs,
        },
        {
          onSuccess: (hash) => {
            console.log("5. Contract write successful:", hash);
            setTxHash(hash);
            toast.success(
              "Transaction submitted! 📝 Waiting for confirmation...",
              {
                id: loadingToastId,
              },
            );
          },
          onError: (error) => {
            console.error("5. Contract write error:", error);
            toast.error(
              "Failed to create election: " +
                (error.message || "Unknown error"),
              {
                id: loadingToastId,
              },
            );
          },
        },
      );
    } catch (error) {
      console.error("Unexpected error creating election:", error);
      toast.error(
        "Unexpected error: " +
          (error instanceof Error ? error.message : "Please try again."),
        {
          id: loadingToastId,
        },
      );
    }
  }, [validateCompleteElection, writeContract, isConnected, address]);

  // Handle transaction confirmation and redirect
  useEffect(() => {
    if (isConfirmed && txHash) {
      toast.success(
        "🎉 Election created successfully! Redirecting to elections page...",
        {
          duration: 3000,
        },
      );

      console.log("Transaction confirmed:", txHash);

      // Redirect to elections page after showing success message
      setTimeout(() => {
        router.push("/elections");
        // Optional: Refresh the page to ensure fresh data
        setTimeout(() => {
          window.location.reload();
        }, 100);
      }, 2000); // Wait 2 seconds to let user see the success message
    }
  }, [isConfirmed, txHash, router]);

  // Handle write data changes
  useEffect(() => {
    if (writeData && !txHash) {
      setTxHash(writeData);
    }
  }, [writeData, txHash]);

  // Handle errors
  useEffect(() => {
    if (writeError) {
      console.error("Write error:", writeError);
      toast.error(
        "Transaction failed: " + (writeError.message || "Please try again"),
      );
    }
  }, [writeError]);

  useEffect(() => {
    if (confirmError) {
      console.error("Confirmation error:", confirmError);
      toast.error(
        "Transaction confirmation failed: " +
          (confirmError.message || "Please check your transaction"),
      );
    }
  }, [confirmError]);

  const setRef = (sectionId: string) => (el: HTMLDivElement | null) => {
    sectionRefs.current[sectionId] = el;
  };

  const isSubmitting = isWritePending || isConfirming;

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
              ✅ Wallet Connected
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
      className="justify-center items-center min-h-screen relative pt-[7rem] lg:pt-[10rem] -mt-20"
    >
      <div className="mx-auto">
        <div className="min-h-screen">
          <ProgressHeader
            steps={steps}
            currentStep={currentStep}
            validationState={validationState}
            onStepClick={handleStepClick}
          />

          <div className="max-w-7xl mx-auto px-6 py-8">
            {/* Enhanced Wallet Connection Status */}
            <WalletConnectionStatus />

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
                  electionData={{
                    id: "temp-id",
                    status: "UPCOMING",
                    name: forms.basicInfo.getValues("name"),
                    description: forms.basicInfo.getValues("description"),
                    startDate: forms.basicInfo.getValues("startDate"),
                    endDate: forms.basicInfo.getValues("endDate"),
                    timezone: forms.basicInfo.getValues("timezone"),
                    categories: forms.categories.getValues("categories"),
                    candidates: forms.candidates.getValues("candidates"),
                    voters: forms.voters.getValues("voters"),
                    pollingOfficers: forms.polling.getValues("pollingOfficers"),
                    pollingUnits: forms.polling.getValues("pollingUnits"),
                  }}
                  isExpanded={expandedSections.has("review")}
                  onToggle={() => toggleSection("review")}
                  onSubmit={handleSubmit}
                  canAccess={canAccessSection("complete")}
                  isValid={validationState.complete}
                  isSubmitting={isSubmitting}
                  txHash={txHash}
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
