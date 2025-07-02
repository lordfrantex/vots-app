"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Clock,
  User,
  CheckCircle,
  AlertTriangle,
  ArrowLeft,
  Vote,
  Loader2,
  ThumbsUp,
  ThumbsDown,
  Users,
} from "lucide-react";
import { useElectionDetails } from "@/hooks/use-contract-address";
import { useVoteCandidates } from "@/hooks/use-election-write-operations";
import VoteConfirmationModal from "./vote-confirmation-modal";
import type { Candidate } from "@/types/candidate";
import Image from "next/image";
import toast from "react-hot-toast";

interface VotingPageProps {
  electionId: string;
  voter: {
    name: string;
    matricNumber: string;
    isAccredited: boolean;
  };
  pollingUnit: {
    unitId: string;
    unitName: string;
    address: string;
  };
  onBack: () => void;
}

interface VoteSelection {
  [category: string]: {
    candidateName: string;
    candidateMatricNo: string;
    voteType?: "for" | "against";
  };
}

const VotingPage = ({ electionId, voter, onBack }: VotingPageProps) => {
  const [selections, setSelections] = useState<VoteSelection>({});
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState("");
  const [votingEnded, setVotingEnded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);

  // Use the consolidated hook for election details
  const { election, error } = useElectionDetails(electionId);

  // Voting hook - get the transaction states from the hook
  const {
    voteCandidates,
    isLoading: isCreating,
    isSuccess,
    error: votingError,
    hash,
    isConfirming,
  } = useVoteCandidates();

  // Group candidates by category
  const candidatesByCategory = useMemo(() => {
    if (!election?.candidates) return {};

    const grouped: { [category: string]: Candidate[] } = {};

    election.candidates.forEach((candidate: Candidate) => {
      if (!grouped[candidate.category]) {
        grouped[candidate.category] = [];
      }
      grouped[candidate.category].push(candidate);
    });

    return grouped;
  }, [election?.candidates]);

  // Calculate progress
  const categories = Object.keys(candidatesByCategory);
  const selectedCategories = Object.keys(selections);
  const progress =
    categories.length > 0
      ? (selectedCategories.length / categories.length) * 100
      : 0;

  // Handle success state - similar to create-election page
  useEffect(() => {
    if (isSuccess) {
      setIsConfirmed(true);
      toast.success("Vote submitted successfully!");
      setTimeout(() => {
        onBack();
      }, 3000);
    }
  }, [isSuccess, onBack]);

  // Handle contract errors
  useEffect(() => {
    if (votingError) {
      toast.error("Failed to submit vote");
    }
  }, [votingError]);

  // Update countdown timer
  useEffect(() => {
    if (!election) return;

    const updateTimer = () => {
      const endTime = new Date(election?.endDate ?? "").getTime();
      const now = Date.now();
      const remaining = endTime - now;

      if (remaining <= 0) {
        setTimeRemaining("Voting Ended");
        setVotingEnded(true);
        return;
      }

      const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
      );
      const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((remaining % (1000 * 60)) / 1000);

      if (days > 0) {
        setTimeRemaining(`${days}d ${hours}h ${minutes}m ${seconds}s`);
      } else if (hours > 0) {
        setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`);
      } else {
        setTimeRemaining(`${minutes}m ${seconds}s`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [election]);

  // Handle candidate selection for multiple candidates
  const handleCandidateSelect = (category: string, candidate: Candidate) => {
    setSelections((prev) => ({
      ...prev,
      [category]: {
        candidateName: candidate.name,
        candidateMatricNo: candidate.matricNo,
      },
    }));
  };

  // Handle vote for/against for single candidate
  const handleSingleCandidateVote = (
    category: string,
    candidate: Candidate,
    voteType: "for" | "against",
  ) => {
    setSelections((prev) => ({
      ...prev,
      [category]: {
        candidateName: candidate.name,
        candidateMatricNo: candidate.matricNo,
        voteType,
      },
    }));
  };

  // Simplified submit handler - similar to create-election page
  const handleSubmitVote = async () => {
    if (selectedCategories.length !== categories.length || votingEnded) {
      return;
    }

    console.log("=== VOTE SUBMISSION START ===");

    try {
      setIsSubmitting(true);
      setShowConfirmation(false);

      // Convert selections to contract format
      const candidatesList = Object.entries(selections).map(
        ([category, selection]) => ({
          name: selection.candidateName,
          matricNo: selection.candidateMatricNo,
          category: category,
          voteFor: selection.voteType === "against" ? BigInt(0) : BigInt(1),
          voteAgainst: selection.voteType === "against" ? BigInt(1) : BigInt(0),
        }),
      );

      console.log("Vote selections:", candidatesList);

      // Submit to blockchain using the hook
      const result = await voteCandidates({
        voterMatricNo: voter.matricNumber,
        voterName: voter.name,
        candidatesList,
        electionTokenId: BigInt(electionId),
      });

      console.log("Blockchain submission result:", result);

      if (!result.success) {
        toast.error("Failed to submit vote");
      }
    } catch (error) {
      console.error("Error in vote submission:", error);
      toast.error("Unexpected error occurred");
    } finally {
      setIsSubmitting(false);
      console.log("=== VOTE SUBMISSION END ===");
    }
  };

  const isLoading = isSubmitting || isCreating || isConfirming;

  // Loading state
  if (isLoading && !election) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400 mx-auto" />
          <p className="text-slate-600 dark:text-slate-300">
            Loading election data...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !election) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center space-y-4">
          <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400 mx-auto" />
          <p className="text-slate-600 dark:text-slate-300">
            Failed to load election data. Please try again.
          </p>
          <Button onClick={onBack} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
      </div>
    );
  }

  // Check if voting has ended based on election status
  const isVotingEnded = election.status === "COMPLETED" || votingEnded;

  // Vote submitted success state
  if (isConfirmed) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="p-4 bg-green-100 dark:bg-green-900/30 rounded-full w-20 h-20 mx-auto flex items-center justify-center">
            <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Vote Submitted Successfully!
            </h2>
            <p className="text-slate-600 dark:text-slate-300">
              Your vote has been recorded on the blockchain.
            </p>
            {hash && (
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                Transaction: {hash.slice(0, 10)}...{hash.slice(-8)}
              </p>
            )}
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Redirecting you back to the authentication page...
            </p>
          </div>
          <div className="flex items-center justify-center space-x-2">
            <Loader2 className="h-4 w-4 animate-spin text-blue-600 dark:text-blue-400" />
            <span className="text-sm text-slate-600 dark:text-slate-300">
              Please wait
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-24">
      <div className="container mx-auto px-4 py-6 max-w-5xl">
        {/* Header */}
        <Card className="mb-6 bg-white dark:bg-slate-900/95 backdrop-blur-xl border-slate-200 dark:border-slate-700/50 shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <Vote className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <CardTitle className="text-slate-900 dark:text-white text-xl font-bold">
                      {election.name}
                    </CardTitle>
                    <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
                      {election.description}
                    </p>
                  </div>
                </div>
              </div>
              <Button
                onClick={onBack}
                variant="ghost"
                size="sm"
                className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </div>

            <Separator className="my-4" />

            {/* Voter and Election Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Voter Info */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Voter Information
                  </span>
                </div>
                <div className="pl-6 space-y-1">
                  <p className="text-sm text-slate-900 dark:text-white font-medium">
                    {voter.name}
                  </p>
                  <Badge
                    variant="outline"
                    className="border-green-200 dark:border-green-500/50 text-green-700 dark:text-green-400 font-mono text-xs"
                  >
                    ID: {voter.matricNumber}
                  </Badge>
                </div>
              </div>

              {/* Time Remaining */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Time Remaining
                  </span>
                </div>
                <div className="pl-6">
                  <Badge
                    variant="outline"
                    className={`font-mono ${
                      isVotingEnded
                        ? "border-red-200 dark:border-red-500/50 text-red-700 dark:text-red-400"
                        : "border-blue-200 dark:border-blue-500/50 text-blue-700 dark:text-blue-400"
                    }`}
                  >
                    {timeRemaining}
                  </Badge>
                </div>
              </div>

              {/* Progress */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Progress
                  </span>
                </div>
                <div className="pl-6 space-y-2">
                  <div className="flex items-center gap-2">
                    <Progress value={progress} className="flex-1 h-2" />
                    <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                      {selectedCategories.length}/{categories.length}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-500">
                    {Math.round(progress)}% complete
                  </p>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Voting Ended Alert */}
        {isVotingEnded && (
          <Alert className="mb-6 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700/50">
            <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
            <AlertDescription className="text-red-700 dark:text-red-300">
              <strong>Voting has ended.</strong> You can no longer cast your
              vote for this election.
            </AlertDescription>
          </Alert>
        )}

        {/* Voting Categories */}
        <div className="space-y-6">
          {Object.entries(candidatesByCategory).map(
            ([category, categoryCandidate]) => {
              const isSingleCandidate = categoryCandidate.length === 1;
              const selectedCandidate = selections[category];

              return (
                <Card
                  key={category}
                  className="bg-white dark:bg-slate-900/95 backdrop-blur-xl border-slate-200 dark:border-slate-700/50 shadow-sm"
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-slate-900 dark:text-white text-lg">
                          {category}
                        </CardTitle>
                        <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
                          {isSingleCandidate
                            ? "Vote FOR or AGAINST this candidate"
                            : "Select one candidate for this position"}
                        </p>
                      </div>
                      {selectedCandidate && (
                        <Badge className="bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-500/50">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          {isSingleCandidate && selectedCandidate.voteType
                            ? `Voted ${selectedCandidate.voteType.toUpperCase()}`
                            : "Selected"}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="grid grid-cols-1 gap-4">
                      {categoryCandidate.map((candidate) => (
                        <div
                          key={candidate.id}
                          className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                            selectedCandidate?.candidateMatricNo ===
                            candidate.matricNo
                              ? "border-blue-300 dark:border-blue-500 bg-blue-50 dark:bg-blue-500/10"
                              : "border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800/30 hover:border-slate-300 dark:hover:border-slate-500"
                          }`}
                        >
                          <div className="flex items-center space-x-4">
                            <div className="relative">
                              <Image
                                src={
                                  candidate.photo ||
                                  "/placeholder.svg?height=48&width=48"
                                }
                                alt={candidate.name}
                                fill
                                className="w-12 h-12 rounded-full object-cover border-2 border-slate-200 dark:border-slate-600"
                              />
                            </div>

                            <div className="flex-1">
                              <h4 className="font-medium text-slate-900 dark:text-white">
                                {candidate.name}
                              </h4>
                              <p className="text-sm text-slate-600 dark:text-slate-400">
                                Candidate ID: {candidate.matricNo}
                              </p>
                            </div>

                            <div className="flex items-center space-x-2">
                              {isSingleCandidate ? (
                                // For/Against buttons for single candidate
                                <>
                                  <Button
                                    onClick={() =>
                                      handleSingleCandidateVote(
                                        category,
                                        candidate,
                                        "for",
                                      )
                                    }
                                    variant={
                                      selectedCandidate?.candidateMatricNo ===
                                        candidate.matricNo &&
                                      selectedCandidate?.voteType === "for"
                                        ? "default"
                                        : "outline"
                                    }
                                    size="sm"
                                    disabled={isVotingEnded}
                                    className={`${
                                      selectedCandidate?.candidateMatricNo ===
                                        candidate.matricNo &&
                                      selectedCandidate?.voteType === "for"
                                        ? "bg-green-600 hover:bg-green-700 text-white"
                                        : "border-green-300 dark:border-green-500/50 text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-500/10"
                                    }`}
                                  >
                                    <ThumbsUp className="h-4 w-4 mr-1" />
                                    FOR
                                  </Button>
                                  <Button
                                    onClick={() =>
                                      handleSingleCandidateVote(
                                        category,
                                        candidate,
                                        "against",
                                      )
                                    }
                                    variant={
                                      selectedCandidate?.candidateMatricNo ===
                                        candidate.matricNo &&
                                      selectedCandidate?.voteType === "against"
                                        ? "default"
                                        : "outline"
                                    }
                                    size="sm"
                                    disabled={isVotingEnded}
                                    className={`${
                                      selectedCandidate?.candidateMatricNo ===
                                        candidate.matricNo &&
                                      selectedCandidate?.voteType === "against"
                                        ? "bg-red-600 hover:bg-red-700 text-white"
                                        : "border-red-300 dark:border-red-500/50 text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10"
                                    }`}
                                  >
                                    <ThumbsDown className="h-4 w-4 mr-1" />
                                    AGAINST
                                  </Button>
                                </>
                              ) : (
                                // Radio button for multiple candidates
                                <button
                                  onClick={() =>
                                    !isVotingEnded &&
                                    handleCandidateSelect(category, candidate)
                                  }
                                  disabled={isVotingEnded}
                                  className={`w-5 h-5 rounded-full border-2 cursor-pointer transition-all ${
                                    selectedCandidate?.candidateMatricNo ===
                                    candidate.matricNo
                                      ? "border-blue-500 bg-blue-500"
                                      : "border-slate-400 dark:border-slate-500 hover:border-slate-500 dark:hover:border-slate-400"
                                  } ${isVotingEnded ? "opacity-50 cursor-not-allowed" : ""}`}
                                >
                                  {selectedCandidate?.candidateMatricNo ===
                                    candidate.matricNo && (
                                    <div className="w-full h-full rounded-full bg-blue-500 flex items-center justify-center">
                                      <div className="w-2 h-2 bg-white rounded-full"></div>
                                    </div>
                                  )}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            },
          )}
        </div>

        {/* Vote Summary */}
        {selectedCategories.length > 0 && (
          <Card className="mt-6 bg-white dark:bg-slate-900/95 backdrop-blur-xl border-slate-200 dark:border-slate-700/50 shadow-sm">
            <CardHeader>
              <CardTitle className="text-slate-900 dark:text-white">
                Vote Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(selections).map(([category, selection]) => (
                  <div
                    key={category}
                    className="flex justify-between items-center py-2 border-b border-slate-200 dark:border-slate-700/50 last:border-b-0"
                  >
                    <span className="text-slate-600 dark:text-slate-400 font-medium">
                      {category}:
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className="text-slate-900 dark:text-white font-medium">
                        {selection.candidateName}
                      </span>
                      {selection.voteType && (
                        <Badge
                          className={`${
                            selection.voteType === "for"
                              ? "bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-500/50"
                              : "bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-500/50"
                          }`}
                        >
                          {selection.voteType === "for" ? (
                            <ThumbsUp className="h-3 w-3 mr-1" />
                          ) : (
                            <ThumbsDown className="h-3 w-3 mr-1" />
                          )}
                          {selection.voteType.toUpperCase()}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {selectedCategories.length < categories.length &&
                !isVotingEnded && (
                  <Alert className="mt-4 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700/50">
                    <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                    <AlertDescription className="text-yellow-700 dark:text-yellow-300">
                      Please make selections for all {categories.length}{" "}
                      positions before submitting your vote.
                    </AlertDescription>
                  </Alert>
                )}

              {votingError && (
                <Alert className="mt-4 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700/50">
                  <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                  <AlertDescription className="text-red-700 dark:text-red-300">
                    <strong>Error:</strong> {votingError}
                  </AlertDescription>
                </Alert>
              )}

              <div className="mt-6 flex space-x-4">
                <Button
                  onClick={() => setShowConfirmation(true)}
                  disabled={
                    selectedCategories.length !== categories.length ||
                    isConfirming ||
                    isVotingEnded
                  }
                  className="flex-1 bg-[#324278] hover:bg-blue-900 cursor-pointer text-white font-medium py-3 h-12 disabled:opacity-50"
                >
                  {isConfirming ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting Vote..
                    </>
                  ) : (
                    <>
                      <Vote className="mr-2 h-4 w-4" />
                      Complete Vote
                    </>
                  )}
                </Button>
              </div>

              <Alert className="mt-4 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-700/50">
                <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <AlertDescription className="text-amber-700 dark:text-amber-300">
                  <strong>Warning:</strong> Once submitted, you cannot change
                  your vote. Please review your selections carefully.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Vote Confirmation Modal */}
      <VoteConfirmationModal
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        onConfirm={handleSubmitVote}
        selections={selections}
        voter={voter}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default VotingPage;
