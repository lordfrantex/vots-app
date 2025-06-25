"use client";

import type React from "react";
import { use, useEffect } from "react";
import ElectionMain from "@/app/elections/[electionId]/components/election-main";
import ElectionCandidates from "@/app/elections/[electionId]/components/election-candidates";
import ElectionInformation from "@/app/elections/[electionId]/components/election-information";
import { useElectionStore } from "@/store/use-election";
import { useElectionDetails } from "@/hooks/use-contract-address";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  } = useElectionDetails(electionId);

  // Update store when contract data is loaded
  useEffect(() => {
    if (contractElection && !storeElection) {
      // Add to store if not already there
      addElection(contractElection);
      setCurrentElection(contractElection);
    }
  }, [contractElection, storeElection, addElection, setCurrentElection]);

  // Determine which election data to use
  const election = storeElection || contractElection;
  const isLoading = contractLoading && !storeElection;
  const error = contractError;

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
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
              >
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
      className="justify-center items-center min-h-screen relative pt-[7rem] lg:pt-[10rem] -mt-20"
    >
      <div className="max-w-[1400px] mx-auto">
        <ElectionMain electionId={electionId} />
        <ElectionCandidates electionId={electionId} />
        <ElectionInformation electionId={electionId} />
      </div>
    </section>
  );
};

export default ElectionPage;
