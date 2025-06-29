"use client";

import { useMemo, useCallback } from "react";
import { useElectionDetails } from "@/hooks/use-contract-address";
import { useAccreditVoter } from "@/hooks/use-election-write-operations";
import { DashboardHeader } from "./dashboard-header";
import { InputAccreditationPanel } from "./search-panel";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Shield,
  RefreshCw,
  AlertTriangle,
  ArrowLeft,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface DashboardProps {
  electionId: string;
  officerWallet: string;
  onBackToValidation?: () => void;
}

export function Dashboard({
  electionId,
  officerWallet,
  onBackToValidation,
}: DashboardProps) {
  // Fetch election data
  const {
    election,
    isLoading: isLoadingElection,
    error: electionError,
    refetch,
  } = useElectionDetails(electionId);

  // Accreditation hook
  const {
    accreditVoter,
    isLoading: isAccrediting,
    isConfirming,
    isSuccess: accreditationSuccess,
    error: accreditationError,
    hash: txHash,
  } = useAccreditVoter();

  // Convert election voters to polling officer view
  const pollingOfficerVoters = useMemo(() => {
    if (!election?.voters) return [];

    // Convert from standard Voter interface to PollingOfficerVoterView
    return election.voters.map((voter) => {
      // For now, we'll use the matricNumber as both masked and full
      // In a real implementation, you'd have off-chain data mapping
      const fullMatricNumber = voter.matricNumber; // This should come from secure off-chain storage

      return {
        id: voter.id,
        name: voter.name,
        maskedMatricNumber: voter.matricNumber, // Already masked in the data
        fullMatricNumber, // From off-chain data
        photo: "/placeholder-user.jpg",
        isAccredited: voter.isAccredited || false,
        hasVoted: voter.hasVoted || false,
        accreditedAt: voter.isAccredited ? new Date().toISOString() : undefined,
        votedAt: voter.hasVoted ? new Date().toISOString() : undefined,
      };
    });
  }, [election?.voters]);

  // Handle voter accreditation
  const handleAccreditVoter = useCallback(
    async (
      matricNumber: string,
    ): Promise<{ success: boolean; message: string; txHash?: string }> => {
      console.log("=== HANDLE ACCREDIT VOTER ===");
      console.log("Matric Number:", matricNumber);
      console.log("Officer Wallet:", officerWallet);

      try {
        const result = await accreditVoter({
          voterMatricNo: matricNumber,
          electionTokenId: BigInt(electionId),
        });

        console.log("Accreditation result:", result);

        if (result.success) {
          // Refetch election data after successful transaction confirmation
          setTimeout(() => {
            console.log("Refetching election data...");
            refetch();
          }, 5000); // Wait 5 seconds for blockchain confirmation
        }

        return {
          success: result.success,
          message: result.message,
        };
      } catch (error) {
        console.error("Error accrediting voter:", error);
        return {
          success: false,
          message:
            error instanceof Error ? error.message : "Failed to accredit voter",
        };
      }
    },
    [accreditVoter, electionId, refetch, officerWallet],
  );

  // Calculate stats for header
  const totalVoters = pollingOfficerVoters.length;
  const accreditedCount = pollingOfficerVoters.filter(
    (v) => v.isAccredited,
  ).length;
  const votedCount = pollingOfficerVoters.filter((v) => v.hasVoted).length;

  // Loading state
  if (isLoadingElection) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto"></div>
          <p className="text-slate-300">
            Loading election data from blockchain...
          </p>
          <p className="text-slate-500 text-sm">This may take a few moments</p>
        </div>
      </div>
    );
  }

  // Error state
  if (electionError || !election) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-red-400 text-lg">Error loading election data</p>
          <p className="text-slate-400">
            {electionError?.message || "Election not found"}
          </p>
          <div className="flex gap-4 justify-center">
            <Button
              onClick={() => refetch()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
            {onBackToValidation && (
              <Button
                onClick={onBackToValidation}
                variant="outline"
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Validation
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Top Navigation Bar */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold">Polling Officer Dashboard</h1>
            <div className="text-sm text-slate-400">
              Connected: {officerWallet.slice(0, 6)}...{officerWallet.slice(-4)}
            </div>
          </div>
          {onBackToValidation && (
            <Button
              onClick={onBackToValidation}
              variant="outline"
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Disconnect Wallet
            </Button>
          )}
        </div>

        {/* Header with correct props */}
        <DashboardHeader
          election={election}
          totalVoters={totalVoters}
          accreditedCount={accreditedCount}
          votedCount={votedCount}
        />

        {/* Officer Information Alert */}
        <Alert className="bg-blue-50 dark:bg-blue-900/20 border-blue-700 max-w-6xl mx-auto">
          <Shield className="h-4 w-4" />
          <AlertDescription className="text-blue-900 dark:text-blue-300">
            <strong>Polling Officer:</strong> {officerWallet}
            <br />
            <span className="text-sm text-blue-900 dark:text-blue-300">
              All accreditation transactions will be signed with this wallet
              address.
            </span>
          </AlertDescription>
        </Alert>

        {/* Accreditation Error Alert */}
        {accreditationError && (
          <Alert className="bg-red-900/20 border-red-700">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-red-300">
              <strong>Accreditation Error:</strong> {accreditationError}
            </AlertDescription>
          </Alert>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
          {/* Accreditation Panel */}
          <div className="space-y-6">
            <InputAccreditationPanel
              onAccredit={handleAccreditVoter}
              isAccrediting={isAccrediting}
              isConfirming={isConfirming}
              isSuccess={accreditationSuccess}
              txHash={txHash}
              electionId={electionId}
              voters={election.voters.map((voter) => ({
                matricNumber: voter.matricNumber,
                isAccredited: voter.isAccredited || false,
                name: voter.name,
              }))}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
