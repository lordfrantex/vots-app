"use client";

import { useState, use } from "react";
import { useAccount } from "wagmi";

import VoterAuthenticationModal from "./components/voter-authentication-modal";
import VotingPage from "./components/voting-page";
import { PollingUnitWalletModal } from "@/app/elections/[electionId]/polling-unit/components/polling-unit-validation";

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
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [isValidPollingUnit, setIsValidPollingUnit] = useState(false);
  const [showConnectionModal, setShowConnectionModal] = useState(true);
  const [connectedWallet, setConnectedWallet] = useState("");

  const handleWalletConnection = async (
    walletAddress: string,
    isValid: boolean,
  ) => {
    try {
      if (isValid) {
        setIsWalletConnected(true);
        setIsValidPollingUnit(true);
        setConnectedWallet(walletAddress);
        setShowConnectionModal(false);

        // Set polling unit info based on connected wallet
        setPollingUnit({
          unitId: `unit-${walletAddress.slice(-6)}`,
          unitName: `Polling Unit ${walletAddress.slice(-6)}`,
          address: walletAddress,
        });

        setCurrentStep("authentication");
      } else {
        throw new Error(
          "Wallet not authorized as polling unit for this election",
        );
      }
    } catch (error) {
      console.error("Wallet validation failed:", error);
      throw error;
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
    setIsWalletConnected(false);
    setIsValidPollingUnit(false);
    setShowConnectionModal(true);
    setConnectedWallet("");
  };

  // Show wallet connection modal if not connected or not valid
  if (showConnectionModal || !isWalletConnected || !isValidPollingUnit) {
    return (
      <div className="min-h-screen">
        <PollingUnitWalletModal
          isOpen={showConnectionModal}
          onConnect={handleWalletConnection}
          electionId={electionId}
          electionName="Student Election" // You can get this from election data
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
