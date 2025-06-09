import React from "react";
import { Candidate } from "@/types/candidate";
import { TrendingUp, Trophy } from "lucide-react";
import { FaUser } from "react-icons/fa6";

const ElectionCandidateCard: React.FC<{
  candidate: Candidate;
  electionStatus: string;
  isLeading?: boolean;
}> = ({ candidate, electionStatus, isLeading = false }) => {
  const showActualVotes = electionStatus === "COMPLETED";

  return (
    <div
      className={` bg-gray-50 dark:bg-gray-900 p-6 rounded-lg shadow-xl
            dark:shadow-2xl hover:shadow-2xl/50 relative transition-all duration-300 
      ${isLeading && showActualVotes ? "ring-2 ring-indigo-600 bg-gradient-to-br from-purple-50 to-orange-50/10 dark:from-blue-600/20 dark:via-70% dark:to-gray-950" : ""}
    `}
    >
      {/* Winner indicator - only show for completed elections */}
      {isLeading && showActualVotes && (
        <div className="absolute -top-2 -right-2 bg-gradient-to-tr from-[#254192] to-[#192E69] text-white rounded-full p-2 shadow-lg">
          <Trophy size={16} />
        </div>
      )}

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
            {/* Name */}
            <h3 className="font-bold text-base text-gray-900 dark:text-white text-center">
              {candidate.name}
            </h3>

            {/* Matric Number */}
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
              {candidate.matricNumber}
            </p>
          </div>
        </div>

        <div className="">
          {electionStatus === "UPCOMING" && (
            <span className="inline-block px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
              Upcoming
            </span>
          )}
          {electionStatus === "ACTIVE" && (
            <span className="inline-block px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              Voting Open
            </span>
          )}
          {electionStatus === "COMPLETED" && isLeading && (
            <span className="inline-block px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border border-yellow-800/10">
              Winner
            </span>
          )}
        </div>
      </div>

      {/* Vote Count Section */}
      <div className="text-center flex justify-between items-center bg-[#D6DADD]/30 dark:bg-gray-700/50 rounded-lg p-2 px-4">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {showActualVotes ? "Final Vote Count" : "Vote Count"}
        </div>

        {showActualVotes ? (
          <div
            className={`text-2xl font-bold flex items-center justify-center gap-1 ${
              isLeading
                ? "text-yellow-600 dark:text-yellow-400"
                : "text-green-600 dark:text-green-400"
            }`}
          >
            {candidate.voteCount || 0}
            {isLeading && <TrendingUp size={16} className="text-yellow-500" />}
          </div>
        ) : (
          <div className="text-2xl font-bold text-gray-400 dark:text-gray-500">
            N/A
          </div>
        )}
      </div>
      {/* Status indicator */}
    </div>
  );
};

export default ElectionCandidateCard;
