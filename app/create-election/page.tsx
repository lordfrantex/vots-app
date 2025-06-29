"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

// Form Components
import { BasicInfoForm } from "@/components/layouts/create-election/basic-info-form";
import { CategoriesForm } from "@/components/layouts/create-election/categories-form";
import { CandidatesForm } from "@/components/layouts/create-election/candidates-form";
import { VotersForm } from "@/components/layouts/create-election/voters-form";
import { PollingSetupForm } from "@/components/layouts/create-election/polling-setup-form";
import { ReviewSummary } from "@/components/layouts/create-election/review-summary";
import { ProgressHeader } from "@/components/layouts/create-election/progress-header";

// Validation Schemas
import {
  basicInfoSchema,
  categoriesSchema,
  createCandidatesSchema,
  votersSchema,
  pollingSetupSchema,
  type BasicInfoFormData,
  type CategoriesFormData,
  type CandidatesFormData,
  type VotersFormData,
  type PollingSetupFormData,
} from "@/lib/validation-schemas";

// Contract Integration
import { useCreateElection } from "@/hooks/use-election-write-operations";
import {
  convertToContractElectionParams,
  validateContractElectionParams,
  OffChainDataService,
} from "@/utils/contract-helpers";
import type { ValidationData } from "@/types/validation-data";
import type { Election } from "@/types/election";

// UI Components
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, CheckCircle, Loader2 } from "lucide-react";

interface FormSection {
  id: string;
  title: string;
  isExpanded: boolean;
  isValid: boolean;
  canAccess: boolean;
}

export default function CreateElectionPage() {
  const router = useRouter();

  // Contract integration
  const {
    createElection,
    isLoading: isCreating,
    isSuccess,
    error: contractError,
    hash,
    isConfirming,
  } = useCreateElection();

  // Form states
  const [sections, setSections] = useState<FormSection[]>([
    {
      id: "basic",
      title: "Basic Information",
      isExpanded: true,
      isValid: false,
      canAccess: true,
    },
    {
      id: "categories",
      title: "Position Categories",
      isExpanded: false,
      isValid: false,
      canAccess: false,
    },
    {
      id: "candidates",
      title: "Candidates",
      isExpanded: false,
      isValid: false,
      canAccess: false,
    },
    {
      id: "voters",
      title: "Voters",
      isExpanded: false,
      isValid: false,
      canAccess: false,
    },
    {
      id: "polling",
      title: "Polling Setup",
      isExpanded: false,
      isValid: false,
      canAccess: false,
    },
    {
      id: "review",
      title: "Review & Submit",
      isExpanded: false,
      isValid: false,
      canAccess: false,
    },
  ]);

  const [validCategories, setValidCategories] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();
  const [isConfirmed, setIsConfirmed] = useState(false);

  // Form instances
  const basicInfoForm = useForm<BasicInfoFormData>({
    resolver: zodResolver(basicInfoSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      description: "",
      startDate: "",
      endDate: "",
      timezone: "",
    },
  });

  const categoriesForm = useForm<CategoriesFormData>({
    resolver: zodResolver(categoriesSchema),
    mode: "onChange",
    defaultValues: {
      categories: [],
    },
  });

  const candidatesForm = useForm<CandidatesFormData>({
    resolver: zodResolver(createCandidatesSchema(validCategories)),
    mode: "onChange",
    defaultValues: {
      candidates: [],
    },
  });

  const votersForm = useForm<VotersFormData>({
    resolver: zodResolver(votersSchema),
    mode: "onChange",
    defaultValues: {
      voters: [],
    },
  });

  const pollingForm = useForm<PollingSetupFormData>({
    resolver: zodResolver(pollingSetupSchema),
    mode: "onChange",
    defaultValues: {
      pollingOfficers: [],
      pollingUnits: [],
    },
  });

  // Watch form validity
  const basicInfoValid = basicInfoForm.formState.isValid;
  const categoriesValid = categoriesForm.formState.isValid;
  const candidatesValid = candidatesForm.formState.isValid;
  const votersValid = votersForm.formState.isValid;
  const pollingValid = pollingForm.formState.isValid;

  // Update valid categories when categories form changes
  useEffect(() => {
    const subscription = categoriesForm.watch((value) => {
      const categories =
        value.categories
          ?.map((cat) => cat?.name)
          .filter((name): name is string => Boolean(name)) || [];
      setValidCategories(categories);
    });
    return () => subscription.unsubscribe();
  }, [categoriesForm]);

  // Update section validity and access
  useEffect(() => {
    setSections((prev) =>
      prev.map((section) => {
        switch (section.id) {
          case "basic":
            return { ...section, isValid: basicInfoValid };
          case "categories":
            return {
              ...section,
              isValid: categoriesValid,
              canAccess: basicInfoValid,
            };
          case "candidates":
            return {
              ...section,
              isValid: candidatesValid,
              canAccess: basicInfoValid && categoriesValid,
            };
          case "voters":
            return {
              ...section,
              isValid: votersValid,
              canAccess: basicInfoValid && categoriesValid,
            };
          case "polling":
            return {
              ...section,
              isValid: pollingValid,
              canAccess:
                basicInfoValid &&
                categoriesValid &&
                candidatesValid &&
                votersValid,
            };
          case "review":
            return {
              ...section,
              isValid:
                basicInfoValid &&
                categoriesValid &&
                candidatesValid &&
                votersValid &&
                pollingValid,
              canAccess:
                basicInfoValid &&
                categoriesValid &&
                candidatesValid &&
                votersValid &&
                pollingValid,
            };
          default:
            return section;
        }
      }),
    );
  }, [
    basicInfoValid,
    categoriesValid,
    candidatesValid,
    votersValid,
    pollingValid,
  ]);

  // Handle section toggle
  const toggleSection = (sectionId: string) => {
    setSections((prev) =>
      prev.map((section) => {
        if (section.id === sectionId && section.canAccess) {
          return { ...section, isExpanded: !section.isExpanded };
        }
        return section;
      }),
    );
  };

  // Handle transaction updates
  useEffect(() => {
    if (hash) {
      setTxHash(hash);
    }
  }, [hash]);

  useEffect(() => {
    if (isSuccess) {
      setIsConfirmed(true);
      toast.success("Election created successfully!");

      // Redirect after a delay
      setTimeout(() => {
        router.push("/elections");
      }, 3000);
    }
  }, [isSuccess, router]);

  useEffect(() => {
    if (contractError) {
      toast.error("Failed to create election");
    }
  }, [contractError]);

  // Collect all form data
  const collectFormData = (): ValidationData => {
    return {
      basicInfo: basicInfoForm.getValues(),
      categories: categoriesForm.getValues(),
      candidates: candidatesForm.getValues(),
      voters: votersForm.getValues(),
      polling: pollingForm.getValues(),
    };
  };

  // Convert to election format for review
  const getElectionData = (): Election => {
    const formData = collectFormData();

    return {
      id: "preview",
      name: formData.basicInfo.name,
      description: formData.basicInfo.description,
      startDate: formData.basicInfo.startDate,
      endDate: formData.basicInfo.endDate,
      timezone: formData.basicInfo.timezone,
      status: "UPCOMING",
      categories:
        formData.categories?.categories?.map((cat) => ({
          id: cat.id,
          name: cat.name,
        })) || [],
      candidates:
        formData.candidates?.candidates?.map((candidate) => ({
          id: candidate.id,
          name: candidate.name,
          matricNo: candidate.matricNo,
          category: candidate.category,
          photo: candidate.photo,
          voteCount: 0,
        })) || [],
      voters:
        formData.voters?.voters?.map((voter) => ({
          id: voter.id,
          name: voter.name,
          matricNumber: voter.matricNumber,
          email: voter.email,
          department: voter.department,
          isAccredited: false,
          hasVoted: false,
        })) || [],
      pollingOfficers:
        formData.polling?.pollingOfficers?.map((officer) => ({
          id: officer.id,
          address: officer.address as `0x${string}`,
          role: officer.role,
        })) || [],
      pollingUnits:
        formData.polling?.pollingUnits?.map((unit) => ({
          id: unit.id,
          address: unit.address as `0x${string}`,
          name: unit.name,
        })) || [],
      totalVoters: formData.voters?.voters?.length || 0,
      totalVotes: 0,
    };
  };

  // Handle form submission
  const handleSubmit = async () => {
    console.log("=== FORM SUBMISSION START ===");

    try {
      setIsSubmitting(true);

      // Collect and validate all form data
      const validationData = collectFormData();
      console.log("Collected form data:", validationData);

      // Convert to contract parameters
      const contractParams = convertToContractElectionParams(validationData);
      console.log("Contract parameters:", contractParams);

      // Validate contract parameters
      const validation = validateContractElectionParams(contractParams);
      if (!validation.isValid) {
        console.error("Contract validation failed:", validation.errors);
        toast.error("Validation failed");
        return;
      }

      // Generate a temporary election ID for off-chain data storage
      const tempElectionId = `temp-${Date.now()}`;

      // Save off-chain data before blockchain transaction
      OffChainDataService.saveElectionCreationData(
        tempElectionId,
        validationData,
      );
      console.log("Saved off-chain data for election:", tempElectionId);

      // Submit to blockchain
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
  };

  const allFormsValid = sections.every((section) =>
    section.id === "review" ? true : section.isValid,
  );
  const reviewSection = sections.find((s) => s.id === "review");

  return (
    <section
      id="create-page"
      className="justify-center items-center min-h-screen relative pt-[7rem] lg:pt-[10rem] -mt-20"
    >
      <div className="mx-auto">
        {/* Progress Header */}
        <ProgressHeader sections={sections} />

        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Contract Error Alert */}
          {contractError && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Contract Error:</strong> {contractError}
              </AlertDescription>
            </Alert>
          )}

          {/* Success Alert */}
          {isConfirmed && (
            <Alert className="border-green-200 bg-green-50 text-green-800">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Success!</strong> Your election has been created
                successfully. Redirecting to elections page...
              </AlertDescription>
            </Alert>
          )}

          {/* Transaction Status */}
          {(isCreating || isConfirming) && (
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="pt-6">
                <div className="flex items-center space-x-3">
                  <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                  <div>
                    <p className="font-medium text-blue-900">
                      {isCreating && !txHash && "Preparing transaction..."}
                      {isCreating &&
                        txHash &&
                        !isConfirmed &&
                        "Confirming transaction..."}
                    </p>
                    {txHash && (
                      <p className="text-sm text-blue-700 font-mono break-all">
                        Transaction: {txHash}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Form Sections */}
          <div className="space-y-6">
            {/* Basic Information */}
            <BasicInfoForm
              form={basicInfoForm}
              isExpanded={
                sections.find((s) => s.id === "basic")?.isExpanded || false
              }
              onToggle={() => toggleSection("basic")}
              canAccess={
                sections.find((s) => s.id === "basic")?.canAccess || false
              }
              isValid={sections.find((s) => s.id === "basic")?.isValid || false}
            />

            {/* Categories */}
            <CategoriesForm
              form={categoriesForm}
              isExpanded={
                sections.find((s) => s.id === "categories")?.isExpanded || false
              }
              onToggle={() => toggleSection("categories")}
              canAccess={
                sections.find((s) => s.id === "categories")?.canAccess || false
              }
              isValid={
                sections.find((s) => s.id === "categories")?.isValid || false
              }
            />

            {/* Candidates */}
            <CandidatesForm
              form={candidatesForm}
              validCategories={validCategories}
              isExpanded={
                sections.find((s) => s.id === "candidates")?.isExpanded || false
              }
              onToggle={() => toggleSection("candidates")}
              canAccess={
                sections.find((s) => s.id === "candidates")?.canAccess || false
              }
              isValid={
                sections.find((s) => s.id === "candidates")?.isValid || false
              }
            />

            {/* Voters */}
            <VotersForm
              form={votersForm}
              isExpanded={
                sections.find((s) => s.id === "voters")?.isExpanded || false
              }
              onToggle={() => toggleSection("voters")}
              canAccess={
                sections.find((s) => s.id === "voters")?.canAccess || false
              }
              isValid={
                sections.find((s) => s.id === "voters")?.isValid || false
              }
            />

            {/* Polling Setup */}
            <PollingSetupForm
              form={pollingForm}
              isExpanded={
                sections.find((s) => s.id === "polling")?.isExpanded || false
              }
              onToggle={() => toggleSection("polling")}
              canAccess={
                sections.find((s) => s.id === "polling")?.canAccess || false
              }
              isValid={
                sections.find((s) => s.id === "polling")?.isValid || false
              }
            />

            {/* Review & Submit */}
            <ReviewSummary
              electionData={getElectionData()}
              isExpanded={reviewSection?.isExpanded || false}
              onToggle={() => toggleSection("review")}
              onSubmit={handleSubmit}
              canAccess={reviewSection?.canAccess || false}
              isValid={allFormsValid}
              isSubmitting={isSubmitting || isCreating || isConfirming}
              txHash={txHash}
              isConfirmed={isConfirmed}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
