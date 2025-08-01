"use client";

import React, {
  useMemo,
  useEffect,
  useCallback,
  useRef,
  useState,
  use,
} from "react";
import ElectionMain from "@/app/elections/[electionId]/components/election-main";
import ElectionCandidates from "@/app/elections/[electionId]/components/election-candidates";
import ElectionInformation from "@/app/elections/[electionId]/components/election-information";
import { useElectionStore } from "@/store/use-election";
import { useElectionDetails } from "@/hooks/use-contract-address";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import VoterSearchFilter from "@/components/ui/voter-search-filter";
import { EnhancedVoter } from "@/types/voter";

interface ElectionPageProps {
  params: Promise<{
    electionId: string;
  }>;
}

const ElectionPage: React.FC<ElectionPageProps> = ({ params }) => {
  const [activeTab, setActiveTab] = useState<
    "REGISTERED" | "ACCREDITED" | "VOTED" | "UNACCREDITED"
  >("REGISTERED");

  const { electionId } = use(params);

  const { getElectionById, setCurrentElection, addElection } =
    useElectionStore();
  const storeElection = getElectionById(electionId);

  const {
    election: contractElection,
    isLoading: contractLoading,
    error: contractError,
    refetch,
  } = useElectionDetails(electionId);

  const statusCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasAutoRefreshedRef = useRef(false);

  const getTimeUntilStatusChange = useCallback((election: any) => {
    if (!election) return null;

    const now = Date.now();
    const startTime = new Date(election.startDate).getTime();
    const endTime = new Date(election.endDate).getTime();

    // Add validation for valid dates
    if (isNaN(startTime) || isNaN(endTime)) {
      console.error(
        "Invalid election dates:",
        election.startDate,
        election.endDate,
      );
      return null;
    }

    if (election.status === "UPCOMING" && now < startTime) {
      return startTime - now;
    } else if (election.status === "ACTIVE" && now < endTime) {
      return endTime - now;
    }

    return null;
  }, []);

  const handleAutoRefresh = useCallback(async () => {
    hasAutoRefreshedRef.current = true;

    try {
      await refetch();
      window.location.reload();
    } catch (error) {
      console.error("Error during auto-refresh:", error);
    }
  }, [refetch]);

  useEffect(() => {
    const election = storeElection || contractElection;
    if (!election || contractLoading) return;

    if (statusCheckIntervalRef.current) {
      clearInterval(statusCheckIntervalRef.current);
      statusCheckIntervalRef.current = null;
    }

    const timeUntilChange = getTimeUntilStatusChange(election);

    if (timeUntilChange !== null && timeUntilChange > 0) {
      const checkInterval = timeUntilChange > 300000 ? 60000 : 30000;

      statusCheckIntervalRef.current = setInterval(() => {
        const currentTimeUntilChange = getTimeUntilStatusChange(election);
        if (currentTimeUntilChange !== null && currentTimeUntilChange <= 0) {
          handleAutoRefresh();
        }
      }, checkInterval);

      const exactTimeout = setTimeout(() => {
        handleAutoRefresh();
      }, timeUntilChange + 5000);

      return () => {
        clearTimeout(exactTimeout);
        if (statusCheckIntervalRef.current) {
          clearInterval(statusCheckIntervalRef.current);
          statusCheckIntervalRef.current = null;
        }
      };
    }

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

  useEffect(() => {
    if (contractElection && (!storeElection || hasAutoRefreshedRef.current)) {
      addElection(contractElection);
      setCurrentElection(contractElection);
      hasAutoRefreshedRef.current = false;
    }
  }, [contractElection, storeElection, addElection, setCurrentElection]);

  useEffect(() => {
    // Clear any existing intervals
    if (statusCheckIntervalRef.current) {
      clearInterval(statusCheckIntervalRef.current);
      statusCheckIntervalRef.current = null;
    }

    const getCurrentElection = () => storeElection || contractElection;
    const election = getCurrentElection();

    if (!election || contractLoading) return;

    const getTimeUntilStatusChange = (electionData: any) => {
      if (!electionData) return null;
      const now = Date.now();
      const startTime = new Date(electionData.startDate).getTime();
      const endTime = new Date(electionData.endDate).getTime();

      if (electionData.status === "UPCOMING") {
        return startTime - now;
      } else if (electionData.status === "ACTIVE") {
        return endTime - now;
      }
      return null;
    };

    const performRefresh = async () => {
      hasAutoRefreshedRef.current = true;

      try {
        // Clear interval before refresh to prevent multiple calls
        if (statusCheckIntervalRef.current) {
          clearInterval(statusCheckIntervalRef.current);
          statusCheckIntervalRef.current = null;
        }

        await refetch();

        // Small delay to ensure the refetch completes
        setTimeout(() => {
          window.location.reload();
        }, 500);
      } catch (error) {
        console.error("Error during auto-refresh:", error);
        window.location.reload();
      }
    };

    const timeUntilChange = getTimeUntilStatusChange(election);

    if (timeUntilChange !== null && timeUntilChange > 0) {
      // Set up interval to check status periodically
      const checkInterval = Math.min(
        30000,
        Math.max(5000, timeUntilChange / 10),
      ); // Dynamic interval

      statusCheckIntervalRef.current = setInterval(() => {
        const currentElection = getCurrentElection();
        const currentTimeUntilChange =
          getTimeUntilStatusChange(currentElection);

        if (currentTimeUntilChange !== null && currentTimeUntilChange <= 0) {
          performRefresh();
        }
      }, checkInterval);

      // Also set up exact timeout as backup
      const exactTimeout = setTimeout(() => {
        performRefresh();
      }, timeUntilChange + 2000); // Reduced buffer time

      return () => {
        clearTimeout(exactTimeout);
        if (statusCheckIntervalRef.current) {
          clearInterval(statusCheckIntervalRef.current);
          statusCheckIntervalRef.current = null;
        }
      };
    }

    return () => {
      if (statusCheckIntervalRef.current) {
        clearInterval(statusCheckIntervalRef.current);
        statusCheckIntervalRef.current = null;
      }
    };
  }, [electionId, contractLoading]); // Simplified dependency array

  const election = storeElection || contractElection;
  const isLoading = contractLoading && !storeElection;
  const error = contractError;

  //console.log("Individaual Election", election);

  // Updated enhancedVoters computation in your ElectionPage component
  // Updated enhancedVoters computation in your ElectionPage component
  const enhancedVoters: EnhancedVoter[] = useMemo(() => {
    if (!election?.voters) return [];

    // console.log("=== ENHANCED VOTERS DEBUG ===");
    // console.log("Total voters:", election.voters.length);
    // console.log(
    //   "Total accredited voters:",
    //   election.accreditedVoters?.length || 0,
    // );

    // Use name-based matching instead of ID matching
    // since the IDs don't match between voters and accreditedVoters arrays
    const accreditedByName = new Map();
    const votedByName = new Map();

    // Process accredited voters array
    (election.accreditedVoters || []).forEach((voter) => {
      if (voter && voter.name) {
        // Store the accredited voter info by name
        accreditedByName.set(voter.name, voter);

        // Check if they voted (using multiple conditions)
        const hasVoted =
          voter.hasVoted === true ||
          voter.voterState === 3 ||
          (voter.isAccredited === true && voter.hasVoted !== false);

        if (hasVoted) {
          votedByName.set(voter.name, true);
        }
      }
    });

    // console.log("Accredited by name map size:", accreditedByName.size);
    // console.log("Voted by name map size:", votedByName.size);
    // console.log("Accredited names:", Array.from(accreditedByName.keys()));
    // console.log("Voted names:", Array.from(votedByName.keys()));

    const enhanced = election.voters
      .map((voter) => {
        if (!voter || !voter.name) {
          console.warn("Invalid voter object:", voter);
          return null;
        }

        // Match by name instead of ID
        const accreditedVoter = accreditedByName.get(voter.name);
        const isAccredited = !!accreditedVoter;
        const hasVoted = votedByName.has(voter.name);

        return {
          id: voter.id,
          name: voter.name,
          matricNumber: voter.matricNumber,
          department: voter.department,
          level: voter.level ? Number(voter.level) : undefined,
          isAccredited,
          hasVoted,
          isRegistered: true,
          photo: "/placeholder-user.jpg",
          accreditedAt: isAccredited ? new Date().toISOString() : undefined,
          votedAt: hasVoted ? new Date().toISOString() : undefined,
        };
      })
      .filter(Boolean);

    // console.log("Enhanced voters sample:", enhanced.slice(0, 3));
    // console.log("Stats:", {
    //   total: enhanced.length,
    //   accredited: enhanced.filter((v) => v.isAccredited).length,
    //   voted: enhanced.filter((v) => v.hasVoted).length,
    //   unaccredited: enhanced.filter((v) => !v.isAccredited).length,
    // });
    // console.log("=== END DEBUG ===");

    return enhanced;
  }, [election?.voters, election?.accreditedVoters]);

  // Updated tabFilteredVoters logic
  const tabFilteredVoters = useMemo(() => {
    switch (activeTab) {
      case "REGISTERED":
        return enhancedVoters; // All voters (they're all registered)
      case "ACCREDITED":
        return enhancedVoters.filter((v) => v.isAccredited); // Accredited but not voted
      case "VOTED":
        return enhancedVoters.filter((v) => v.hasVoted); // Has voted
      case "UNACCREDITED":
        return enhancedVoters.filter((v) => !v.isAccredited); // Not accredited (and by extension, not voted)
      default:
        return enhancedVoters;
    }
  }, [activeTab, enhancedVoters]);

  const [selectedVoter, setSelectedVoter] = useState<EnhancedVoter | null>(
    null,
  );
  const [filteredVoters, setFilteredVoters] = useState<EnhancedVoter[]>([]);

  const handleVoterSelect = useCallback((voter: EnhancedVoter) => {
    setSelectedVoter(voter);
  }, []);

  const handleFilterChange = useCallback((filtered: EnhancedVoter[]) => {
    setFilteredVoters(filtered);
  }, []);

  const handleManualRefresh = useCallback(async () => {
    try {
      await refetch();
    } catch (error) {
      console.error("Manual refresh failed:", error);
      window.location.reload();
    }
  }, [refetch]);

  if (isLoading) {
    return (
      <section className="justify-center items-center min-h-screen relative pt-[7rem] lg:pt-[10rem] -mt-20">
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

  if (error && !election) {
    return (
      <section className="justify-center items-center min-h-screen relative pt-[7rem] lg:pt-[10rem] -mt-20">
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

  if (!isLoading && !election) {
    return (
      <section className="justify-center items-center min-h-screen relative pt-[7rem] lg:pt-[10rem] -mt-20">
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

  return (
    <section
      id="election-page"
      className="justify-center items-center min-h-screen relative pt-[10rem] -mt-20 mb-[10rem]"
    >
      <div className="max-w-[1400px] mx-auto">
        <ElectionMain electionId={electionId} />
        <ElectionCandidates electionId={electionId} />
        <ElectionInformation electionId={electionId} />

        {election.status === "COMPLETED" && (
          <div className="mt-12 space-y-6">
            <Tabs
              value={activeTab}
              onValueChange={(val) => setActiveTab(val as any)}
              className="hidden"
            >
              <TabsList>
                <TabsTrigger value="REGISTERED">Registered</TabsTrigger>
                <TabsTrigger value="ACCREDITED">Accredited</TabsTrigger>
                <TabsTrigger value="VOTED">Voted</TabsTrigger>
                <TabsTrigger value="UNACCREDITED">Unaccredited</TabsTrigger>
              </TabsList>
            </Tabs>

            <VoterSearchFilter
              voters={tabFilteredVoters}
              onFilter={handleFilterChange}
              onVoterSelect={handleVoterSelect}
              showResults={true}
              placeholder="Search voters by name, level, or department..."
              className="h-fit"
            />
          </div>
        )}

        {/* Display selected voter */}
        {/*{selectedVoter && (*/}
        {/*  <div className="mt-8 p-4 border rounded-md bg-slate-50 dark:bg-slate-800 shadow-sm">*/}
        {/*    <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">*/}
        {/*      Selected Voter*/}
        {/*    </h4>*/}
        {/*    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">*/}
        {/*      <strong>Name:</strong> {selectedVoter.name}*/}
        {/*      <br />*/}
        {/*      <strong>Matric:</strong> {selectedVoter.matricNumber}*/}
        {/*      <br />*/}
        {/*      {selectedVoter.level && (*/}
        {/*        <>*/}
        {/*          <strong>Level:</strong> {selectedVoter.level}*/}
        {/*          <br />*/}
        {/*        </>*/}
        {/*      )}*/}
        {/*      {selectedVoter.department && (*/}
        {/*        <>*/}
        {/*          <strong>Department:</strong> {selectedVoter.department}*/}
        {/*        </>*/}
        {/*      )}*/}
        {/*    </p>*/}
        {/*  </div>*/}
        {/*)}*/}
      </div>
    </section>
  );
};

export default ElectionPage;
