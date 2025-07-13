// components/ElectionResult.tsx
import React, { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Lock, Unlock, Vote, Trophy, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Candidate } from "@/types/candidate";
import { Election } from "@/types/election";
import { cn, formatDate } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ElectionChart from "@/components/ui/election-chart";
import { FaUser } from "react-icons/fa6";
import { Category } from "@/types/category";

interface ElectionResultProps {
  election: Election;
  handleViewResults?: () => void;
  canViewResults?: boolean;
}

const ElectionResult: React.FC<ElectionResultProps> = ({
  election,
  handleViewResults,
  canViewResults = false,
}) => {
  const [open, setOpen] = React.useState(false);
  const [activeCategory, setActiveCategory] = useState<string>(
    election.categories[0]?.name || "",
  );

  // Memoize the results calculation to avoid recalculation
  const resultsByCategory = useMemo(() => {
    const results = (election?.candidates ?? []).reduce(
      (acc, candidate) => {
        const category = candidate.category;
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push(candidate);
        return acc;
      },
      {} as Record<string, Candidate[]>,
    );

    // Sort candidates by vote count within each category
    Object.keys(results).forEach((category) => {
      results[category].sort((a, b) => {
        const aVotes = Number((a.voteCount || 0n).toString());
        const bVotes = Number((b.voteCount || 0n).toString());
        return bVotes - aVotes;
      });
    });

    return results;
  }, [election?.candidates]);

  // Calculate category total votes for percentage calculations
  const getCategoryTotalVotes = (category: string) => {
    return resultsByCategory[category]?.reduce((sum, c) => {
      const votes = Number((c.voteCount || 0n).toString());
      return sum + votes;
    }, 0);
  };

  // Check if a category has only one candidate
  const isSingleCandidate = (category: string) => {
    return resultsByCategory[category]?.length === 1;
  };

  // Handle category change - this will control both results and chart
  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
  };

  const renderCandidateCard = (
    candidate: Candidate,
    index: number,
    categoryName: string,
  ) => {
    const isOnlyCandidate = isSingleCandidate(categoryName);

    return (
      <div
        key={`${categoryName}-${candidate.id}-${index}`}
        className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
            <FaUser className="text-gray-500 dark:text-gray-400" />
          </div>

          <div>
            <p className="text-lg font-medium text-gray-900 dark:text-white">
              {candidate.name}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Matric No: {candidate.matricNo}
            </p>
          </div>
        </div>

        {isOnlyCandidate ? (
          <div className="text-right">
            <div className="flex gap-4 mb-1">
              <div className="text-center">
                <p className="text-lg font-bold text-green-600 dark:text-green-400">
                  {candidate.voteFor || 0}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">For</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-yellow-600 dark:text-yellow-400">
                  {candidate.voteAgainst || 0}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Against
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Total: {(candidate.voteFor || 0) + (candidate.voteAgainst || 0)}{" "}
              votes
            </p>
          </div>
        ) : (
          <div>
            <p
              className={`text-lg font-bold ${candidate.voteFor ? "text-green-600 dark:text-green-400" : "text-yellow-600 dark:text-yellow-400"}`}
            >
              {candidate.voteFor || candidate.voteAgainst} Votes
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          onClick={handleViewResults}
          disabled={!canViewResults}
          size="lg"
          className={`flex items-center justify-center gap-3 p-4 rounded-lg transition-colors duration-200 shadow-lg ${
            canViewResults
              ? "bg-gradient-to-tr from-[#254192] to-[#192E69] text-white hover:shadow-xl cursor-pointer"
              : "bg-gray-400 dark:bg-gray-600 text-gray-200 dark:text-gray-400 cursor-not-allowed"
          }`}
        >
          {canViewResults ? (
            <Unlock className="w-5 h-5" />
          ) : (
            <Lock className="w-5 h-5" />
          )}
          <span className="font-medium">View Results</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-4xl xl:max-w-6xl max-h-[80vh] overflow-y-auto dark:[background-image:var(--gradient-dark-bg)]">
        <DialogTitle className="text-2xl font-bold text-start">
          {election?.name} - Results
        </DialogTitle>
        <DialogDescription className="text-start mb-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-red-600 dark:text-red-400" />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                End Date:
              </span>
              <p className="text-gray-900 dark:text-white">
                {formatDate(election.endDate)}
              </p>
            </div>
          </div>
        </DialogDescription>

        <div className="space-y-6">
          {/* Election Summary */}
          <Card className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg shadow-xl dark:shadow-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Vote className="w-5 h-5" />
                Election Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold">{election?.totalVoters}</p>
                  <p className="text-sm text-gray-600">Total Voters</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">
                    {election?.totalVotes}
                  </p>
                  <p className="text-sm text-gray-600">Votes Cast</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-600">
                    {election?.totalVoters > 0
                      ? (
                          (Number((election?.totalVotes || 0n).toString()) /
                            Number((election?.totalVoters || 0n).toString())) *
                          100
                        ).toFixed(1)
                      : "0"}
                    %
                  </p>
                  <p className="text-sm text-gray-600">Turnout</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-violet-600">
                    {election?.categories.length}
                  </p>
                  <p className="text-sm text-gray-600">Categories</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Single Tabs for Both Results and Chart */}
          <Tabs
            defaultValue={election.categories[0]?.name || ""}
            value={activeCategory}
            onValueChange={handleCategoryChange}
          >
            <TabsList className="gap-4 bg-transparent dark:bg-[#0F172C] shadow-2xl/10 shadow-amber-50">
              {election.categories.map((category) => (
                <TabsTrigger
                  key={category.id}
                  value={category.name}
                  className={cn(
                    "bg-gray-50 dark:bg-[#0F172C] text-gray-400 dark:text-[#697AA1] font-medium cursor-pointer",
                    activeCategory === category.name &&
                      "font-bold text-white data-[state=active]:bg-indigo-600 data-[state=active]:bg-gradient-to-tr from-[#254192] to-[#192E69]",
                  )}
                >
                  {category.name}
                </TabsTrigger>
              ))}
            </TabsList>

            {election.categories.map((category) => (
              <TabsContent
                key={category.id}
                value={category.name}
                className="space-y-6"
              >
                {/* Candidate Results */}
                <Card className="bg-gray-50 dark:bg-gray-900 p-4 py-10 rounded-lg shadow-xl dark:shadow-2xl">
                  <CardHeader>
                    <CardTitle className="text-lg">
                      {category.name} - Candidates
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {resultsByCategory[category.name]?.map(
                        (candidate, index) =>
                          renderCandidateCard(candidate, index, category.name),
                      ) || (
                        <div className="text-center py-8">
                          <p className="text-gray-500 dark:text-gray-400">
                            No candidates found for {category.name}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Vote Analysis Chart - No tabs, just the chart */}
                <ElectionChart
                  election={election}
                  selectedCategory={activeCategory}
                  resultsByCategory={resultsByCategory}
                  showCategoryTabs={false} // Hide category tabs in chart
                  showChartTypeToggle={true} // Keep chart type toggle
                />
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ElectionResult;
