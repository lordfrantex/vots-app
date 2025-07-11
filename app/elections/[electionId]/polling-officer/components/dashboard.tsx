"use client";

import { useMemo, useCallback, useState } from "react";
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
import { useQueryClient } from "@tanstack/react-query";
import VoterSearchFilter from "@/components/ui/voter-search-filter";
import { Separator } from "@/components/ui/separator";
import { EnhancedVoter } from "@/types/voter";

interface DashboardProps {
  electionId: string;
  officerWallet: string;
  onBackToValidation?: () => void;
}

// Enhanced voter interface for better compatibility

export function Dashboard({
  electionId,
  officerWallet,
  onBackToValidation,
}: DashboardProps) {
  const [filteredVoters, setFilteredVoters] = useState<EnhancedVoter[]>([]);
  const [selectedVoter, setSelectedVoter] = useState<EnhancedVoter | null>(
    null,
  );

  // Fetch election data
  const {
    election,
    isLoading: isLoadingElection,
    error: electionError,
    refetch,
  } = useElectionDetails(electionId);

  // Extract pollRoleName for the current officer
  const pollRoleName = useMemo(() => {
    return (
      election?.pollingOfficers.find(
        (officer) => officer.address?.pollAddress === officerWallet,
      )?.address?.pollRoleName || "Unknown Role"
    );
  }, [election?.pollingOfficers, officerWallet]);

  const queryClient = useQueryClient();

  // Accreditation hook
  const {
    accreditVoter,
    isLoading: isAccrediting,
    isConfirming,
    isSuccess: accreditationSuccess,
    error: accreditationError,
    hash: txHash,
  } = useAccreditVoter();

  // Convert election voters to enhanced format
  const enhancedVoters = useMemo(() => {
    if (!election?.voters) return [];

    return election.voters.map((voter): EnhancedVoter => {
      return {
        id: voter.id,
        name: voter.name,
        matricNumber: voter.matricNumber,
        level: voter.level ? Number(voter.level) : undefined,
        department: voter.department || undefined,
        isAccredited: voter.isAccredited || false,
        hasVoted: voter.hasVoted || false,
        photo: "/placeholder-user.jpg",
        accreditedAt: voter.isAccredited ? new Date().toISOString() : undefined,
        votedAt: voter.hasVoted ? new Date().toISOString() : undefined,
      };
    });
  }, [election?.voters]);

  // Handle voter selection from search filter
  const handleVoterSelect = useCallback((voter: EnhancedVoter) => {
    setSelectedVoter(voter);
  }, []);

  // Handle filter changes
  const handleFilterChange = useCallback((filtered: EnhancedVoter[]) => {
    setFilteredVoters(filtered);
  }, []);
  // Handle voter accreditation
  const handleAccreditVoter = async (voterMatricNo: string) => {
    if (!electionId) {
      console.error("Election ID is not defined");
      return { success: false, message: "Election ID is required" };
    }

    try {
      const electionTokenId = BigInt(electionId);
      const result = await accreditVoter({ voterMatricNo, electionTokenId });

      if (result.success) {
        console.log("Voter accredited successfully:", result.message);
        queryClient.invalidateQueries({
          queryKey: [`electionVoters`, String(electionTokenId)],
        });
      } else {
        console.error("Accreditation failed:", result.message);
      }

      return result;
    } catch (error) {
      console.error("Error during voter accreditation:", error);
      return { success: false, message: "An unexpected error occurred" };
    }
  };

  // Calculate stats for header
  const totalVoters = enhancedVoters.length;
  const accreditedCount = election?.accreditedVoters || 0;
  const votedCount = election?.totalVotes || 0;

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
      <div className="container mx-auto px-4 py-6 pb-12 space-y-6">
        {/* Top Navigation Bar */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex flex-col items-start space-y-2">
            <h1 className="text-2xl font-bold">Polling Officer Dashboard</h1>
            <div className="text-sm text-slate-500 font-medium">
              Officer: {pollRoleName}
            </div>
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
        {/*<Alert className="bg-blue-50 dark:bg-blue-900/20 border-blue-700">*/}
        {/*  <Shield className="h-4 w-4" />*/}
        {/*  <AlertDescription className="text-blue-900 dark:text-blue-300">*/}
        {/*    <strong>Polling Officer:</strong> {officerWallet}*/}
        {/*    <br />*/}
        {/*    <span className="text-sm text-blue-900 dark:text-blue-300">*/}
        {/*      All accreditation transactions will be signed with this wallet*/}
        {/*      address.*/}
        {/*    </span>*/}
        {/*  </AlertDescription>*/}
        {/*</Alert>*/}

        {/* Accreditation Error Alert */}
        {accreditationError && (
          <Alert className="bg-red-900/20 border-red-700 max-w-6xl mx-auto">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-red-300">
              <strong>Accreditation Error:</strong> Voter is already accredited
              or has voted or is not registered.
            </AlertDescription>
          </Alert>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12">
          {/* Accreditation Panel */}
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

          <VoterSearchFilter
            voters={enhancedVoters}
            onFilter={handleFilterChange}
            onVoterSelect={handleVoterSelect}
            showResults={true}
            placeholder="Search voters by name, level, or department..."
            className="h-fit"
            electionStatus="ACTIVE"
          />
        </div>
      </div>
    </div>
  );
}
