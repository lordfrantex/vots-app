"use client";

import { useState, use, useEffect } from "react";
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
      console.log("Election has ended, clearing session");
      clearSession();
      // Redirect to election page
      window.location.href = `/elections`;
    }
  }, [electionDetails, electionId, clearSession]);

  // Check session validity on mount and session changes
  useEffect(() => {
    if (isSessionValid()) {
      console.log("Valid session found, proceeding to authentication");
      const walletAddress = session.walletClient.account.address;
      setPollingUnit({
        unitId: `unit-${walletAddress.slice(-6)}`,
        unitName: `Polling Unit ${walletAddress.slice(-6)}`,
        address: walletAddress,
      });
      setShowPollingUnitModal(false);
      setCurrentStep("authentication");

      // Set polling unit info based on session
      if (session.walletClient?.account) {
        const walletAddress = session.walletClient.account.address;
        setPollingUnit({
          unitId: `unit-${walletAddress.slice(-6)}`,
          unitName: `Polling Unit ${walletAddress.slice(-6)}`,
          address: walletAddress,
        });
      }
    } else {
      console.log("No valid session, showing validation modal");
      setShowPollingUnitModal(true);
      setCurrentStep("validation");
    }
  }, [session.isValid, session.walletClient]);

  const handlePollingUnitValidationClose = () => {
    // Always close the modal, but check session validity
    setShowPollingUnitModal(false);

    // Check if session is now valid
    if (isSessionValid()) {
      setCurrentStep("authentication");

      // Set polling unit info
      if (session.walletClient?.account) {
        const walletAddress = session.walletClient.account.address;
        setPollingUnit({
          unitId: `unit-${walletAddress.slice(-6)}`,
          unitName: `Polling Unit ${walletAddress.slice(-6)}`,
          address: walletAddress,
        });
      }
    } else {
      // If session is not valid, keep showing validation modal
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
