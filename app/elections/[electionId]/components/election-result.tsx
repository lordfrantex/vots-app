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
import {FaUser} from "react-icons/fa6";

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
  const [activeCategory, setActiveCategory] = useState(election.categories[0]);

  // Memoize the results calculation to avoid recalculation
  const resultsByCategory = useMemo(() => {
    // Group candidates by category and sort by votes
    const results = (election?.candidates ?? []).reduce(
        (acc, candidate) => {
          if (!acc[candidate.category]) {
            acc[candidate.category] = [];
          }
          acc[candidate.category].push(candidate);
          return acc;
        },
        {} as Record<string, Candidate[]>,
    );

    // Sort candidates by vote count within each category
    Object.keys(results).forEach((category) => {
      results[category].sort((a, b) => (b.voteCount || 0) - (a.voteCount || 0));
    });

    return results;
  }, [election?.candidates]);

  // Calculate category total votes for percentage calculations
  const getCategoryTotalVotes = (category: string) => {
    return (
        resultsByCategory[category]?.reduce(
            (sum, c) => sum + (c.voteCount || 0),
            0,
        ) || 0
    );
  };

  // Handle category change - this will control both results and chart
  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
  };

  // Render candidate card
  const renderCandidateCard = (
      candidate: Candidate,
      index: number,
      category: string,
  ) => {
    const categoryTotalVotes = getCategoryTotalVotes(category);
    const percentage =
        categoryTotalVotes > 0
            ? (((candidate.voteCount || 0) / categoryTotalVotes) * 100).toFixed(1)
            : "0";
    const isWinner = index === 0 && (candidate.voteCount || 0) > 0;

    return (
        <div
            key={candidate.id}
            className={`bg-[#D6DADD]/30 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-300 dark:border-gray-600 relative transition-all duration-200 ${
                isWinner ? "ring-2 ring-indigo-600" : "border-slate-300"
            }`}
        >
          {/* Winner Badge */}
          {isWinner && (
              <div className="absolute top-3 right-3 bg-gradient-to-tr from-[#254192] to-[#192E69] text-white  px-2 py-1 rounded text-xs font-medium flex items-center gap-1">
                <Trophy className="w-3 h-3" />
                Winner
              </div>
          )}

          <div className="flex items-center gap-4 mb-3">
            {/* Avatar */}
            <div
                className={`
          w-16 h-16 rounded-full bg-gradient-to-b dark:from-slate-600 dark:via-55% dark:to-gray-500/40 border border-gray-500/30
          flex items-center justify-center text-white font-bold text-lg mb-3
          shadow-2xl
        `}
            >
              <FaUser size={24} className="text-indigo-400/40 dark:text-indigo-300/40"/>
            </div>

            {/* Candidate Info */}
            <div className="flex-1">
              <h4 className="font-semibold text-lg">
                {candidate.name}
              </h4>
              <p className="text-sm text-slate-400">
                ID: {candidate.matricNumber}
              </p>
            </div>
          </div>

          {/* Vote Count and Percentage */}
          <div className="flex items-center justify-between mb-2">
            <div className="font-medium">
              {candidate.voteCount || 0} votes
            </div>
            <div className="text-indigo-400 font-semibold">{percentage}%</div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-500 rounded-full h-2">
            <div
                className="bg-gradient-to-r from-indigo-500 to-blue-400 h-2 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${percentage}%` }}
            ></div>
          </div>
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
                  {formatDate(election.endTime)}
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
                    <p className="text-2xl font-bold text-indigo-600">
                      {election?.totalVoters}
                    </p>
                    <p className="text-sm text-gray-600">Total Voters</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-purple-600">
                      {election?.totalVotes}
                    </p>
                    <p className="text-sm text-gray-600">Votes Cast</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-blue-600">
                      {(
                          ((election?.totalVotes ?? 0) /
                              (election?.totalVoters ?? 0)) *
                          100
                      ).toFixed(1)}
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
                defaultValue={election.categories[0]}
                value={activeCategory}
                onValueChange={handleCategoryChange}
            >
              <TabsList className="gap-4 bg-transparent dark:bg-[#0F172C] shadow-2xl/10 shadow-amber-50">
                {election.categories.map((category) => (
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

              {election.categories.map((category) => (
                  <TabsContent key={category} value={category} className="space-y-6">
                    {/* Candidate Results */}
                    <Card className="bg-gray-50 dark:bg-gray-900 p-4 py-10 rounded-lg shadow-xl dark:shadow-2xl">
                      <CardHeader>
                        <CardTitle className="text-lg">
                          {category} - Candidates
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {resultsByCategory[category]?.map((candidate, index) =>
                              renderCandidateCard(candidate, index, category),
                          ) || (
                              <div className="text-center py-8">
                                <p className="text-gray-500 dark:text-gray-400">
                                  No candidates found for {category}
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