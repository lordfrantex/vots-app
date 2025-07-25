"use client";

import { useState, use, useEffect, useMemo } from "react";
import { useAccount } from "wagmi";

import VoterAuthenticationModal from "./components/voter-authentication-modal";
import VotingPage from "./components/voting-page";
import { usePollingUnitSession } from "@/hooks/use-polling-unit-session";
import { PollingUnitValidationModal } from "@/app/elections/[electionId]/polling-unit/components/polling-unit-validation";
import { useElectionDetails } from "@/hooks/use-contract-address";

interface AuthenticatedVoter {
  name: string;
  matricNumber: string;
  isAccredited: boolean;
}

interface PollingUnit {
  unitId: string;
  unitName: string;
  address: string;
}

interface PollingUnitPageProps {
  params: Promise<{
    electionId: string;
  }>;
}

export default function PollingUnitPage({ params }: PollingUnitPageProps) {
  const { address } = useAccount();
  const resolvedParams = use(params);
  const { electionId } = resolvedParams;

  const [currentStep, setCurrentStep] = useState<
    "validation" | "authentication" | "voting"
  >("validation");
  const [pollingUnit, setPollingUnit] = useState<PollingUnit | null>(null);
  const [authenticatedVoter, setAuthenticatedVoter] =
    useState<AuthenticatedVoter | null>(null);
  const [showPollingUnitModal, setShowPollingUnitModal] = useState(true);

  const { election: electionDetails } = useElectionDetails(electionId);
  const { session, isSessionValid, clearSession } = usePollingUnitSession();

  useEffect(() => {
    if (electionDetails?.status === "COMPLETED") {
      // console.log("Election has ended, clearing session");
      clearSession();
      // Redirect to election page
      window.location.href = `/elections`;
    }
  }, [electionDetails, electionId, clearSession]);

  useEffect(() => {
    if (isSessionValid()) {
      if (currentStep === "validation") {
        const walletAddress = session.walletClient.account.address;

        // Only proceed if electionDetails is loaded
        if (!electionDetails?.pollingUnits) {
          return;
        }

        // Find the matching polling unit using the same logic
        const matchingUnit = electionDetails.pollingUnits.find(
          (unit) =>
            unit.address.pollAddress.toLowerCase() ===
            walletAddress.toLowerCase(),
        );

        // Use the actual pollRoleName instead of slicing the address
        const actualUnitName =
          matchingUnit?.address.pollRoleName ||
          `Unit ${walletAddress.slice(-6)}`;

        setPollingUnit({
          unitId: matchingUnit?.id || `unit-${walletAddress.slice(-6)}`,
          unitName: actualUnitName, // This will now be "Brigade Hall PU"
          address: walletAddress,
        });

        setShowPollingUnitModal(false);
        setCurrentStep("authentication");
      }
    } else {
      setShowPollingUnitModal(true);
      setCurrentStep("validation");
    }
  }, [
    session.isValid,
    session.walletClient,
    currentStep,
    isSessionValid,
    electionDetails?.pollingUnits,
  ]); // Added electionDetails dependency

  // Check session validity on mount and session changes
  useEffect(() => {
    if (
      isSessionValid() &&
      session?.walletClient?.account?.address &&
      electionDetails?.pollingUnits &&
      currentStep === "authentication" &&
      pollingUnit
    ) {
      const walletAddress = session.walletClient.account.address;

      const matchingUnit = electionDetails.pollingUnits.find(
        (unit) =>
          unit.address.pollAddress.toLowerCase() ===
          walletAddress.toLowerCase(),
      );

      if (
        matchingUnit &&
        pollingUnit.unitName.includes(walletAddress.slice(-6))
      ) {
        // Only update if we're still showing the sliced address

        setPollingUnit({
          unitId: matchingUnit.id,
          unitName: matchingUnit.address.pollRoleName,
          address: walletAddress,
        });
      }
    }
  }, [
    electionDetails?.pollingUnits,
    session?.walletClient?.account?.address,
    currentStep,
    pollingUnit,
    isSessionValid,
  ]);

  // Also, make sure your pollRoleName useMemo is clean:
  const pollRoleName = useMemo(() => {
    if (
      !session?.walletClient?.account?.address ||
      !electionDetails?.pollingUnits
    ) {
      return "Unknown Role";
    }

    const walletAddress = session.walletClient.account.address;

    const matchingUnit = electionDetails.pollingUnits.find(
      (unit) =>
        unit.address.pollAddress.toLowerCase() === walletAddress.toLowerCase(),
    );

    return matchingUnit?.address.pollRoleName || "Unknown Role";
  }, [electionDetails?.pollingUnits, session?.walletClient?.account?.address]);

  const handlePollingUnitValidationClose = () => {
    setShowPollingUnitModal(false);

    if (isSessionValid() && session?.walletClient?.account?.address) {
      setCurrentStep("authentication");
      const walletAddress = session.walletClient.account.address;

      // Find the matching polling unit
      const matchingUnit = electionDetails?.pollingUnits?.find(
        (unit) =>
          unit.address.pollAddress.toLowerCase() ===
          walletAddress.toLowerCase(),
      );

      // Use pollRoleName as the unit name
      const actualUnitName =
        matchingUnit?.address.pollRoleName || `Unit ${walletAddress.slice(-6)}`;

      setPollingUnit({
        unitId: matchingUnit?.id || `unit-${walletAddress.slice(-6)}`,
        unitName: actualUnitName, // This will be "Brigade Hall PU" from your data
        address: walletAddress,
      });
    } else {
      setTimeout(() => {
        setShowPollingUnitModal(true);
      }, 500);
    }
  };
  const handleVoterAuthenticated = (voter: AuthenticatedVoter) => {
    setAuthenticatedVoter(voter);
    setCurrentStep("voting");
  };

  const handleBackToAuthentication = () => {
    setCurrentStep("authentication");
    setAuthenticatedVoter(null);
  };

  const handleBackToValidation = () => {
    setCurrentStep("validation");
    setPollingUnit(null);
    setAuthenticatedVoter(null);
    setShowPollingUnitModal(true);
  };

  // Show validation modal if session is not valid
  if (!isSessionValid() || showPollingUnitModal) {
    return (
      <div className="min-h-screen">
        <PollingUnitValidationModal
          isOpen={showPollingUnitModal}
          onClose={handlePollingUnitValidationClose}
          electionId={electionId}
          electionName={"Student Election"}
        />
      </div>
    );
  }

  return (
    <section
      id="election-page"
      className="justify-center items-center min-h-screen relative pt-[7rem] -mt-20"
    >
      <div className="max-w-[1400px] mx-auto min-h-screen">
        {currentStep === "authentication" && pollingUnit && (
          <VoterAuthenticationModal
            electionId={electionId}
            pollingUnit={pollingUnit}
            onAuthenticated={handleVoterAuthenticated}
            onBack={handleBackToValidation}
          />
        )}

        {currentStep === "voting" && pollingUnit && authenticatedVoter && (
          <VotingPage
            electionId={electionId}
            voter={authenticatedVoter}
            pollingUnit={pollingUnit}
            onBack={handleBackToAuthentication}
          />
        )}
      </div>
    </section>
  );
}
