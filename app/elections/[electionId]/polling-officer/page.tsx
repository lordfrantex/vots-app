"use client";

import { useState, use } from "react";
import { useAccount } from "wagmi";

import { WalletConnectionModal } from "@/app/elections/[electionId]/polling-officer/components/wallet-connection-modal";
import { Dashboard } from "@/app/elections/[electionId]/polling-officer/components/dashboard";

interface PollingOfficerPageProps {
  params: Promise<{
    electionId: string;
  }>;
}

export default function PollingOfficerPage({
  params,
}: PollingOfficerPageProps) {
  const { address } = useAccount();
  const resolvedParams = use(params);
  const { electionId } = resolvedParams;

  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [isValidOfficer, setIsValidOfficer] = useState(false);
  const [showConnectionModal, setShowConnectionModal] = useState(true);
  const [connectedWallet, setConnectedWallet] = useState("");

  const handleWalletConnection = async (
    walletAddress: string,
    isValid: boolean,
  ) => {
    try {
      if (isValid) {
        setIsWalletConnected(true);
        setIsValidOfficer(true);
        setConnectedWallet(walletAddress);
        setShowConnectionModal(false);
      } else {
        throw new Error(
          "Wallet not authorized as polling officer for this election",
        );
      }
    } catch (error) {
      console.error("Wallet validation failed:", error);
      throw error;
    }
  };

  const handleBackToValidation = () => {
    setIsWalletConnected(false);
    setIsValidOfficer(false);
    setShowConnectionModal(true);
    setConnectedWallet("");
  };

  // Show wallet connection modal if not connected or not valid
  if (showConnectionModal || !isWalletConnected || !isValidOfficer) {
    return (
      <div className="min-h-screen">
        <WalletConnectionModal
          isOpen={showConnectionModal}
          onConnect={handleWalletConnection}
          electionId={electionId}
          electionName="Student Election" // You can fetch this from your election store or API
        />
      </div>
    );
  }

  return (
    <section
      id="election-page"
      className="justify-center items-center min-h-screen relative pt-[7rem] lg:pt-[10rem] -mt-20"
    >
      <div className="max-w-[1400px] mx-auto">
        <Dashboard
          electionId={electionId}
          officerWallet={connectedWallet}
          onBackToValidation={handleBackToValidation}
        />
      </div>
    </section>
  );
}
