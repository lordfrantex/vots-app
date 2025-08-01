"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { useAccount } from "wagmi";

// Hooks
import { useElectionValidation } from "@/hooks/use-election-validation";
import { useCreateElection } from "@/hooks/use-election-write-operations";
import { CreateElectionForm } from "@/components/layouts/create-election/create-election-form";

export default function CreateElectionPage() {
  const router = useRouter();

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

  // Get election data for review
  const getElectionData = useCallback(() => {
    const basicInfo = forms.basicInfo.getValues();
    const categories = forms.categories.getValues();
    const candidates = forms.candidates.getValues();
    // const voters = forms.voters.getValues();
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
      // voters:
      //   voters.voters?.map((voter) => ({
      //     id: voter.id,
      //     name: voter.name,
      //     matricNumber: voter.matricNumber,
      //     level: voter.level,
      //     department: voter.department,
      //     isAccredited: false,
      //     hasVoted: false,
      //   })) || [],
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
      // totalVoters: voters.voters?.length || 0,
      totalVotes: 0,
    };
  }, [forms]);

  return (
    <section
      id="create-page"
      className="justify-center items-center min-h-screen relative pt-[7rem] lg:pt-[10rem] -mt-20 pb-10 overflow-x-hidden"
    >
      <div className="mx-auto">
        <CreateElectionForm
          forms={forms}
          validationState={validationState}
          validCategories={validCategories}
          currentStep={currentStep}
          setCurrentStep={setCurrentStep}
          validateCompleteElection={validateCompleteElection}
          canAccessSection={canAccessSection}
          createElection={async (params) => {
            try {
              setIsSubmitting(true);
              const result = await createElection({
                electionParams: params.electionParams,
              });
              return result;
            } finally {
              setIsSubmitting(false);
            }
          }}
          getElectionData={getElectionData}
          walletCheckLoading={walletCheckLoading}
          isConnected={isConnected}
          isConnecting={isConnecting}
          address={address}
          isCreating={isCreating}
          isSuccess={isSuccess}
          contractError={contractError || null}
          hash={hash}
          isConfirming={isConfirming}
          isSubmitting={isSubmitting}
          isConfirmed={isConfirmed}
          onSuccess={() => router.push("/elections")}
        />
      </div>
    </section>
  );
}
