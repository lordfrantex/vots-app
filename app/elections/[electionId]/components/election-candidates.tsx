"use client";

import type React from "react";
import type { ContractCandidateInfoDTO } from "@/types/candidate";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ElectionCandidateCard from "@/app/elections/[electionId]/components/election-candidate-card";
import { cn } from "@/lib/utils";
import { useElectionStore } from "@/store/use-election";
import { useState, useEffect } from "react";

interface ElectionCandidatesProps {
  electionId: string;
}

const ElectionCandidates: React.FC<ElectionCandidatesProps> = ({
  electionId,
}) => {
  const { getElectionById } = useElectionStore();
  const election = getElectionById(electionId);

  const [activeCategory, setActiveCategory] = useState<string>("");

  useEffect(() => {
    if (election?.categories && election.categories.length > 0) {
      const firstCategory =
        typeof election.categories[0] === "string"
          ? election.categories[0]
          : election.categories[0]?.name || "";
      setActiveCategory(firstCategory);
    }
  }, [election?.categories]);

  if (!election) {
    return null;
  }

  const candidates = (election.candidates as ContractCandidateInfoDTO[]) || [];

  const categoryNames = election.categories.map((cat) =>
    typeof cat === "string" ? cat : cat.name,
  );

  const candidatesByCategory = candidates.reduce(
    (acc, candidate) => {
      if (!acc[candidate.category]) {
        acc[candidate.category] = [];
      }
      acc[candidate.category].push(candidate);
      return acc;
    },
    {} as Record<string, ContractCandidateInfoDTO[]>,
  );

  const isSingleCandidateCategory = (category: string) => {
    return candidatesByCategory[category]?.length === 1;
  };

  const getSingleCandidateOutcome = (candidate: ContractCandidateInfoDTO) => {
    const voteFor = candidate.voteFor || 0n;
    const voteAgainst = candidate.voteAgainst || 0n;
    return voteFor > voteAgainst ? "elected" : "not_elected";
  };

  if (election.status === "COMPLETED") {
    Object.keys(candidatesByCategory).forEach((category) => {
      if (isSingleCandidateCategory(category)) {
        candidatesByCategory[category].forEach((candidate) => {
          (candidate as any).outcome = getSingleCandidateOutcome(candidate);
        });
      } else {
        candidatesByCategory[category].sort((a, b) => {
          // Convert BigInt to string for comparison
          const aVotes = (a.voteFor || 0n).toString();
          const bVotes = (b.voteFor || 0n).toString();
          return bVotes.localeCompare(aVotes);
        });
      }
    });
  }

  if (categoryNames.length === 0) {
    return (
      <div className="mt-12">
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">
            No categories available for this election.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-12">
      <Tabs value={activeCategory} onValueChange={setActiveCategory}>
        <TabsList className="gap-4 bg-transparent dark:bg-[#0F172C] shadow-2xl/10 shadow-amber-50">
          {categoryNames.map((category) => (
            <TabsTrigger
              key={category}
              value={category}
              className={cn(
                "bg-gray-50 dark:bg-[#0F172C] text-gray-400 dark:text-[#697AA1] font-medium cursor-pointer",
                activeCategory === category &&
                  "font-bold text-white data-[state=active]:bg-indigo-600 data-[state=active]:bg-gradient-to-tr from-[#254192] to-[#192E69]",
              )}
            >
              {category}
            </TabsTrigger>
          ))}
        </TabsList>

        {categoryNames.map((category) => (
          <TabsContent key={category} value={category}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
              {candidatesByCategory[category] &&
              candidatesByCategory[category].length > 0 ? (
                candidatesByCategory[category].map((candidate, index) => {
                  const isSingleCandidate = isSingleCandidateCategory(category);
                  const isLeading =
                    !isSingleCandidate &&
                    index === 0 &&
                    election.status === "COMPLETED" &&
                    (candidate.voteFor || 0n) > 0n;

                  return (
                    <ElectionCandidateCard
                      key={candidate.matricNo}
                      candidate={candidate}
                      electionStatus={election.status}
                      isLeading={isLeading}
                      isSingleCandidate={isSingleCandidate}
                    />
                  );
                })
              ) : (
                <div className="col-span-full text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400">
                    No candidates registered for {category}
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default ElectionCandidates;
