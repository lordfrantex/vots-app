"use client";

import { useMemo, useCallback, useState } from "react";
import { useElectionDetails } from "@/hooks/use-contract-address";
import { useAccreditVoter } from "@/hooks/use-election-write-operations";
import { DashboardHeader } from "./dashboard-header";
import { InputAccreditationPanel } from "./search-panel";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RefreshCw, AlertTriangle, ArrowLeft, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import VoterSearchFilter from "@/components/ui/voter-search-filter";
import { EnhancedVoter } from "@/types/voter";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  const [selectedVoter, setSelectedVoter] = useState<EnhancedVoter | null>(
    null,
  );
  const [filteredVoters, setFilteredVoters] = useState<EnhancedVoter[]>([]);
  const [activeTab, setActiveTab] = useState<
    "REGISTERED" | "ACCREDITED" | "VOTED" | "UNACCREDITED"
  >("REGISTERED");

  const {
    election,
    isLoading: isLoadingElection,
    error: electionError,
    refetch,
  } = useElectionDetails(electionId);

  const queryClient = useQueryClient();

  const {
    accreditVoter,
    isLoading: isAccrediting,
    isConfirming,
    isSuccess: accreditationSuccess,
    error: accreditationError,
    hash: txHash,
  } = useAccreditVoter();

  const pollRoleName = useMemo(() => {
    return (
      election?.pollingOfficers.find(
        (officer) => officer.address?.pollAddress === officerWallet,
      )?.address?.pollRoleName || "Unknown Role"
    );
  }, [election?.pollingOfficers, officerWallet]);

  // Create ID Sets
  const accreditedSet = useMemo(() => {
    return new Set(election?.accreditedVoters?.map((v) => v.id));
  }, [election?.accreditedVoters]);

  const votedSet = useMemo(() => {
    return new Set(election?.votedVoters?.map((v) => v.id));
  }, [election?.votedVoters]);

  // Enhance all voters
  const enhancedVoters: EnhancedVoter[] = useMemo(() => {
    if (!election?.voters) return [];
    return election.voters.map((voter) => {
      const isAccredited = accreditedSet.has(voter.id);
      const hasVoted = votedSet.has(voter.id);
      return {
        id: voter.id,
        name: voter.name,
        matricNumber: voter.matricNumber,
        level: voter.level ? Number(voter.level) : undefined,
        department: voter.department || undefined,
        isRegistered: true,
        isAccredited,
        hasVoted,
        photo: "/placeholder-user.jpg",
        accreditedAt: isAccredited ? new Date().toISOString() : undefined,
        votedAt: hasVoted ? new Date().toISOString() : undefined,
      };
    });
  }, [election?.voters, accreditedSet, votedSet]);

  const totalVoters = enhancedVoters.length;
  const accreditedCount = election?.accreditedVotersCount || 0;
  const votedCount = election?.votedVoters?.length || 0;

  const handleVoterSelect = useCallback((voter: EnhancedVoter) => {
    setSelectedVoter(voter);
  }, []);

  const handleFilterChange = useCallback((filtered: EnhancedVoter[]) => {
    setFilteredVoters(filtered);
  }, []);

  const handleAccreditVoter = async (voterMatricNo: string) => {
    if (!electionId)
      return { success: false, message: "Election ID is required" };
    try {
      const electionTokenId = BigInt(electionId);
      const result = await accreditVoter({ voterMatricNo, electionTokenId });
      if (result.success) {
        queryClient.invalidateQueries({
          queryKey: [`electionVoters`, String(electionTokenId)],
        });
      }
      return result;
    } catch (error) {
      console.error("Accreditation error:", error);
      return { success: false, message: "An unexpected error occurred" };
    }
  };

  // Derive voters by tab
  const displayedVoters = useMemo(() => {
    switch (activeTab) {
      case "ACCREDITED":
        return enhancedVoters.filter((v) => v.isAccredited);
      case "VOTED":
        return enhancedVoters.filter((v) => v.hasVoted);
      case "UNACCREDITED":
        return enhancedVoters.filter((v) => !v.isAccredited && v.isRegistered);
      default:
        return enhancedVoters;
    }
  }, [activeTab, enhancedVoters]);

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
        {/* Header */}
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

        <DashboardHeader
          election={election}
          totalVoters={totalVoters}
          accreditedCount={accreditedCount}
          votedCount={votedCount}
        />

        {accreditationError && (
          <Alert className="bg-red-900/20 border-red-700 max-w-6xl mx-auto">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-red-300">
              <strong>Accreditation Error:</strong> Voter is already accredited
              or has voted or is not registered.
            </AlertDescription>
          </Alert>
        )}

        <Tabs
          value={activeTab}
          onValueChange={(val) => setActiveTab(val as any)}
          className="mb-4"
        >
          <TabsList>
            <TabsTrigger value="REGISTERED">Registered</TabsTrigger>
            <TabsTrigger value="ACCREDITED">Accredited</TabsTrigger>
            <TabsTrigger value="VOTED">Voted</TabsTrigger>
            <TabsTrigger value="UNACCREDITED">Unaccredited</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12">
          <InputAccreditationPanel
            onAccredit={handleAccreditVoter}
            isAccrediting={isAccrediting}
            isConfirming={isConfirming}
            isSuccess={accreditationSuccess}
            txHash={txHash}
            electionId={electionId}
            voters={enhancedVoters.map((v) => ({
              name: v.name,
              matricNumber: v.matricNumber,
              isAccredited: v.isAccredited,
            }))}
          />

          <VoterSearchFilter
            voters={displayedVoters}
            onFilter={handleFilterChange}
            onVoterSelect={handleVoterSelect}
            showResults={true}
            placeholder="Search voters by name, level, or department..."
            className="h-fit"
            electionStatus={election.status}
          />
        </div>

        {selectedVoter && (
          <div className="mt-6 max-w-2xl border rounded-md bg-slate-50 dark:bg-slate-800 p-4 shadow-sm">
            <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
              Selected Voter
            </h4>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              <strong>Name:</strong> {selectedVoter.name}
              <br />
              <strong>Matric:</strong> {selectedVoter.matricNumber}
              <br />
              {selectedVoter.level && (
                <>
                  <strong>Level:</strong> {selectedVoter.level}
                  <br />
                </>
              )}
              {selectedVoter.department && (
                <>
                  <strong>Department:</strong> {selectedVoter.department}
                </>
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
