"use client";

import React, { useMemo } from "react";
import { use, useEffect, useCallback, useRef } from "react";
import ElectionMain from "@/app/elections/[electionId]/components/election-main";
import ElectionCandidates from "@/app/elections/[electionId]/components/election-candidates";
import ElectionInformation from "@/app/elections/[electionId]/components/election-information";
import { useElectionStore } from "@/store/use-election";
import { useElectionDetails } from "@/hooks/use-contract-address";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import VoterSearchFilter from "@/components/ui/voter-search-filter";
import { EnhancedVoter } from "@/types/voter";

interface ElectionPageProps {
  params: Promise<{
    electionId: string;
  }>;
}

const ElectionPage: React.FC<ElectionPageProps> = ({ params }) => {
  // Unwrap the params Promise using React.use()
  const { electionId } = use(params);

  // Get election from store (might be empty on page reload)
  const { getElectionById, setCurrentElection, addElection } =
    useElectionStore();
  const storeElection = getElectionById(electionId);

  // Fetch election details from contract (this will always work, even on page reload)
  const {
    election: contractElection,
    isLoading: contractLoading,
    error: contractError,
    refetch,
  } = useElectionDetails(electionId);

  // Refs to track timers and prevent multiple intervals
  const statusCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasAutoRefreshedRef = useRef(false);

  // Calculate time until next status change
  const getTimeUntilStatusChange = useCallback((election: any) => {
    if (!election) return null;

    const now = Date.now();
    const startTime = new Date(election.startDate).getTime();
    const endTime = new Date(election.endDate).getTime();

    if (election.status === "UPCOMING") {
      return startTime - now;
    } else if (election.status === "ACTIVE") {
      return endTime - now;
    }

    return null;
  }, []);

  // Auto-refresh function
  const handleAutoRefresh = useCallback(async () => {
    console.log("Auto-refreshing election data due to status change...");
    hasAutoRefreshedRef.current = true;

    try {
      await refetch();
      // Perform a full page refresh
      window.location.reload();
    } catch (error) {
      console.error("Error during auto-refresh:", error);
    }
  }, [refetch]);
  // Set up status change monitoring
  useEffect(() => {
    const election = storeElection || contractElection;
    if (!election || contractLoading) return;

    // Clear any existing interval
    if (statusCheckIntervalRef.current) {
      clearInterval(statusCheckIntervalRef.current);
      statusCheckIntervalRef.current = null;
    }

    const timeUntilChange = getTimeUntilStatusChange(election);

    // Only set up monitoring for UPCOMING or ACTIVE elections
    if (timeUntilChange !== null && timeUntilChange > 0) {
      console.log(
        `Election status will change in ${Math.ceil(timeUntilChange / 1000)} seconds`,
      );

      // Set up interval to check status every 30 seconds as we approach the change
      const checkInterval = timeUntilChange > 300000 ? 60000 : 30000; // 1 min if >5 min away, otherwise 30 sec

      statusCheckIntervalRef.current = setInterval(() => {
        const currentTimeUntilChange = getTimeUntilStatusChange(election);

        if (currentTimeUntilChange !== null && currentTimeUntilChange <= 0) {
          // Status should have changed, trigger refresh
          handleAutoRefresh();
        }
      }, checkInterval);

      // Also set a timeout for the exact moment of change (with small buffer)
      const exactTimeout = setTimeout(() => {
        handleAutoRefresh();
      }, timeUntilChange + 5000); // 5 second buffer

      // Cleanup timeout on unmount
      return () => {
        clearTimeout(exactTimeout);
        if (statusCheckIntervalRef.current) {
          clearInterval(statusCheckIntervalRef.current);
          statusCheckIntervalRef.current = null;
        }
      };
    }

    // Cleanup interval on dependency change
    return () => {
      if (statusCheckIntervalRef.current) {
        clearInterval(statusCheckIntervalRef.current);
        statusCheckIntervalRef.current = null;
      }
    };
  }, [
    storeElection,
    contractElection,
    contractLoading,
    getTimeUntilStatusChange,
    handleAutoRefresh,
  ]);

  // Update store when contract data is loaded
  useEffect(() => {
    if (contractElection && (!storeElection || hasAutoRefreshedRef.current)) {
      // Add to store if not already there or if this is an auto-refresh
      addElection(contractElection);
      setCurrentElection(contractElection);
      hasAutoRefreshedRef.current = false; // Reset flag
    }
  }, [contractElection, storeElection, addElection, setCurrentElection]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (statusCheckIntervalRef.current) {
        clearInterval(statusCheckIntervalRef.current);
        statusCheckIntervalRef.current = null;
      }
    };
  }, []);

  // Determine which election data to use
  const election = storeElection || contractElection;
  const isLoading = contractLoading && !storeElection;
  const error = contractError;

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

  // Manual refresh function for error cases
  const handleManualRefresh = useCallback(async () => {
    try {
      await refetch();
    } catch (error) {
      console.error("Manual refresh failed:", error);
      // Fallback to page reload if refetch fails
      window.location.reload();
    }
  }, [refetch]);

  // Show loading state while fetching from contract (and no cached data)
  if (isLoading) {
    return (
      <section
        id="election-page"
        className="justify-center items-center min-h-screen relative pt-[7rem] lg:pt-[10rem] -mt-20"
      >
        <div className="max-w-[1400px] mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-8 h-8 animate-spin" />
              <p className="text-muted-foreground">
                Loading election details...
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Show error state with retry option
  if (error && !election) {
    return (
      <section
        id="election-page"
        className="justify-center items-center min-h-screen relative pt-[7rem] lg:pt-[10rem] -mt-20"
      >
        <div className="max-w-[1400px] mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center space-y-4">
              <p className="text-destructive">Error loading election details</p>
              <p className="text-sm text-muted-foreground">
                {error?.message || "Something went wrong"}
              </p>
              <Button onClick={handleManualRefresh} variant="outline">
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Show not found only after loading is complete and no election exists
  if (!isLoading && !election) {
    return (
      <section
        id="election-page"
        className="justify-center items-center min-h-screen relative pt-[7rem] lg:pt-[10rem] -mt-20"
      >
        <div className="max-w-[1400px] mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center space-y-4">
              <p className="text-muted-foreground">Election not found</p>
              <p className="text-sm text-muted-foreground">
                The election with ID &#34;{electionId}&#34; does not exist.
              </p>
              <Button onClick={() => window.history.back()} variant="outline">
                Go Back
              </Button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Render the election page
  return (
    <section
      id="election-page"
      className="justify-center items-center min-h-screen relative pt-[10rem] -mt-20  mb-[10rem]"
    >
      <div className="max-w-[1400px] mx-auto">
        <ElectionMain electionId={electionId} />
        <ElectionCandidates electionId={electionId} />
        <ElectionInformation electionId={electionId} />
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
    </section>
  );
};

export default ElectionPage;
