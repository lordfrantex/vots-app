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
        // Fixed: Proper numeric comparison for BigInt values
        candidatesByCategory[category].sort((a, b) => {
          const aVotes = a.voteFor || 0n;
          const bVotes = b.voteFor || 0n;

          // Compare BigInt values properly
          if (bVotes > aVotes) return 1;
          if (bVotes < aVotes) return -1;
          return 0;
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
      {/* Election Status Banner */}
      <div
        className={`mb-6 p-4 rounded-lg text-center ${
          election.status === "UPCOMING"
            ? "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800"
            : election.status === "ACTIVE"
              ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
              : "bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700"
        }`}
      >
        <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
          {election.name}
        </h2>
        <p
          className={`text-sm ${
            election.status === "UPCOMING"
              ? "text-blue-700 dark:text-blue-300"
              : election.status === "ACTIVE"
                ? "text-green-700 dark:text-green-300"
                : "text-gray-600 dark:text-gray-400"
          }`}
        >
          {election.status === "UPCOMING" &&
            "Election is scheduled to begin soon. Vote counts will be hidden until completion."}
          {election.status === "ACTIVE" &&
            "Election is currently ongoing. Vote counts are hidden until completion."}
          {election.status === "COMPLETED" &&
            "Election has ended. Final results are now displayed."}
        </p>
      </div>

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
