import type React from "react";
import type { Election } from "@/types/election";
import StatusBadge from "@/components/utilities/status-badge";
import CountdownTimer from "@/components/ui/countdown-timer";
import StatCard from "@/app/elections/[electionId]/components/election-stat-card";
import { Separator } from "@/components/ui/separator";
import { FaUsers } from "react-icons/fa6";
import { FaCheck, FaVoteYea } from "react-icons/fa";
import { HiMiniChartBar } from "react-icons/hi2";
import { CheckmarkIcon } from "react-hot-toast";

interface ElectionMainOverviewProps {
  election: Election;
}

const ElectionMainOverview: React.FC<ElectionMainOverviewProps> = ({
  election,
}) => {
  if (!election) {
    return null;
  }

  const turnoutPercentage =
    (election?.totalVoters ?? 0) > 0
      ? (
          ((election?.totalVotes ?? 0) / (election.totalVoters ?? 1)) *
          100
        ).toFixed(1)
      : "0.0";

  // Convert string dates to Date objects
  const startDate = election.startDate
    ? new Date(election.startDate)
    : undefined;
  const endDate = election.endDate ? new Date(election.endDate) : undefined;

  // Determine target date based on election status
  const targetDate = election?.status === "UPCOMING" ? startDate : endDate;

  return (
    <div
      className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg shadow-xl
            dark:shadow-2xl"
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-[#364153] dark:text-white">
            {election.name}
          </h1>
          <p className="text-gray-400 dark:text-gray-500">
            {election.description}
          </p>
        </div>
        <StatusBadge status={election.status} />
      </div>
      <Separator />

      {/* Countdown Timer */}
      {targetDate && (
        <CountdownTimer
          targetDate={targetDate}
          status={election.status}
          isStartDate={election.status === "UPCOMING"}
        />
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
        <StatCard
          title="Registered Voters"
          value={(election?.totalVoters ?? 0).toLocaleString()}
          icon={<FaUsers />}
        />
        <StatCard
          title="Accredited Voters"
          value={(election?.accreditedVotersCount ?? 0).toLocaleString()}
          icon={<FaCheck />}
        />
        <StatCard
          title="Votes Cast"
          value={(election?.totalVotes ?? 0).toLocaleString()}
          icon={<FaVoteYea />}
        />
        <StatCard
          title="Turnout Percentage"
          value={`${turnoutPercentage}%`}
          icon={<HiMiniChartBar />}
        />
      </div>
    </div>
  );
};

export default ElectionMainOverview;
