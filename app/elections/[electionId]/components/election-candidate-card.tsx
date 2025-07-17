import React from "react";
import { ContractCandidateInfoDTO } from "@/types/candidate";
import {
  TrendingUp,
  Trophy,
  ThumbsUp,
  ThumbsDown,
  X,
  Equal,
} from "lucide-react";
import { FaUser } from "react-icons/fa6";

const ElectionCandidateCard: React.FC<{
  candidate: ContractCandidateInfoDTO;
  electionStatus: string;
  isSingleCandidate?: boolean;
  outcome?: string;
}> = ({ candidate, electionStatus, isSingleCandidate = false, outcome }) => {
  const showActualVotes = electionStatus === "COMPLETED";
  const showVoteCounts = electionStatus === "COMPLETED";

  const voteFor = candidate.voteFor || 0n;
  const voteAgainst = candidate.voteAgainst || 0n;

  const getCardStyling = () => {
    if (showActualVotes && outcome) {
      switch (outcome) {
        case "elected":
        case "winner":
          return "ring-2 ring-green-600 bg-gradient-to-br from-purple-50 to-orange-50/10 dark:from-blue-600/20 dark:via-70% dark:to-gray-950";
        case "not_elected":
          return "ring-2 ring-red-600 bg-gradient-to-br from-red-50 to-rose-50/10 dark:from-red-600/20 dark:via-70% dark:to-gray-950";
        case "tied":
          // No ring border for tied candidates
          return "bg-gradient-to-br ";
        default:
          return "";
      }
    }
    return "";
  };

  const getStatusIcon = () => {
    if (!showActualVotes || !outcome) return null;

    switch (outcome) {
      case "elected":
      case "winner":
        return (
          <div className="absolute -top-2 -right-2 bg-gradient-to-tr from-green-500 to-emerald-600 text-white rounded-full p-2 shadow-lg">
            <Trophy size={16} />
          </div>
        );
      case "not_elected":
        return (
          <div className="absolute -top-2 -right-2 bg-gradient-to-tr from-red-500 to-rose-600 text-white rounded-full p-2 shadow-lg">
            <X size={16} />
          </div>
        );
      case "tied":
        return (
          <div className="absolute -top-2 -right-2 bg-gradient-to-tr from-yellow-500 to-amber-600 text-white rounded-full p-2 shadow-lg">
            <Equal size={16} />
          </div>
        );
      default:
        return null;
    }
  };

  const getStatusBadge = () => {
    if (electionStatus === "UPCOMING") {
      return (
        <span className="inline-block px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
          Upcoming
        </span>
      );
    }

    if (electionStatus === "ACTIVE") {
      return (
        <span className="inline-block px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
          Voting Open
        </span>
      );
    }

    if (electionStatus === "COMPLETED" && outcome) {
      switch (outcome) {
        case "elected":
          return (
            <span className="inline-block px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border border-green-800/10">
              Elected
            </span>
          );
        case "winner":
          return (
            <span className="inline-block px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border border-green-800/10">
              Winner
            </span>
          );
        case "not_elected":
          return (
            <span className="inline-block px-2 py-1 text-xs rounded-full bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border border-red-800/10">
              Not Elected
            </span>
          );
        case "tied":
          return (
            <span className="inline-block px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border border-yellow-800/10">
              Tied
            </span>
          );
        default:
          return null;
      }
    }

    return null;
  };

  return (
    <div
      className={`bg-gray-50 dark:bg-gray-900 p-6 rounded-lg shadow-xl
            dark:shadow-2xl hover:shadow-2xl hover:shadow-black/20 relative transition-all duration-300 
      ${getCardStyling()}
    `}
    >
      {/* Winner/Status indicator */}
      {getStatusIcon()}

      <div className="flex items-center justify-between mb-6">
        {/* Avatar */}
        <div className="flex gap-3 items-center justify-center">
          <div
            className={`
          w-16 h-16 rounded-full bg-gradient-to-b dark:from-blue-500/30 dark:via-55% dark:to-gray-900 border border-gray-500/30
          flex items-center justify-center text-white font-bold text-lg mb-3
          shadow-2xl
        `}
          >
            <FaUser size={24} className="text-indigo-400/40" />
          </div>

          <div className="flex flex-col items-start gap-1">
            <h3 className="font-bold text-base text-gray-900 dark:text-white text-center">
              {candidate.name}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
              {candidate.matricNo}
            </p>
          </div>
        </div>

        <div>{getStatusBadge()}</div>
      </div>

      {/* Vote Count Section */}
      {showVoteCounts ? (
        <>
          {isSingleCandidate ? (
            <div className="space-y-3">
              <div className="flex justify-between items-center bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <ThumbsUp size={16} className="text-green-600" />
                  <span className="text-sm font-medium text-green-700 dark:text-green-400">
                    Vote For
                  </span>
                </div>
                <div className="text-xl font-bold text-green-600 dark:text-green-400">
                  {voteFor.toString()}
                </div>
              </div>

              <div className="flex justify-between items-center bg-red-50 dark:bg-red-900/20 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <ThumbsDown size={16} className="text-red-600" />
                  <span className="text-sm font-medium text-red-700 dark:text-red-400">
                    Vote Against
                  </span>
                </div>
                <div className="text-xl font-bold text-red-600 dark:text-red-400">
                  {voteAgainst.toString()}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center flex justify-between items-center bg-[#D6DADD]/30 dark:bg-gray-700/50 rounded-lg p-2 px-4">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Final Vote Count
              </div>
              <div
                className={`text-2xl font-bold flex items-center justify-center gap-1 ${
                  outcome === "winner"
                    ? "text-green-600 dark:text-green-400"
                    : outcome === "tied"
                      ? "text-yellow-600 dark:text-yellow-400"
                      : "text-gray-600 dark:text-gray-400"
                }`}
              >
                {voteFor.toString()}
                {outcome === "winner" && (
                  <TrendingUp size={16} className="text-green-500" />
                )}
                {outcome === "tied" && (
                  <Equal size={16} className="text-yellow-500" />
                )}
              </div>
            </div>
          )}
        </>
      ) : (
        // Show N/A when election is not completed
        <div className="text-center flex justify-between items-center bg-[#D6DADD]/30 dark:bg-gray-700/50 rounded-lg p-2 px-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Vote Count
          </div>
          <div className="text-2xl font-bold text-gray-500 dark:text-gray-400">
            N/A
          </div>
        </div>
      )}
    </div>
  );
};

export default ElectionCandidateCard;
