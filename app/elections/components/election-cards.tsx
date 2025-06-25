"use client";
import type React from "react";
import { Calendar, Users } from "lucide-react";
import type { Election } from "@/types/election";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { getStatusBadge } from "@/components/utilities/status-badge";
import { formatDate } from "@/lib/utils";

interface ElectionCardProps {
  election: Election;
}

const ElectionCard: React.FC<ElectionCardProps> = ({ election }) => {
  const getActionButton = (status: string) => {
    const baseClasses =
      "w-full py-2 px-4 rounded-md text-sm font-medium transition-colors cursor-pointer";

    switch (status) {
      case "ACTIVE":
      case "UPCOMING":
        return `${baseClasses} bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30`;
      case "COMPLETED":
        return `${baseClasses} bg-purple-50 text-purple-700 hover:bg-purple-100 dark:bg-purple-900/20 dark:text-purple-400 dark:hover:bg-purple-900/30`;
      default:
        return `${baseClasses} bg-gray-50 text-gray-700 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700`;
    }
  };

  const getActionText = (status: string) => {
    switch (status) {
      case "ACTIVE":
      case "UPCOMING":
        return "View Election";
      case "COMPLETED":
        return "View Results";
      default:
        return "View Election";
    }
  };

  const { theme } = useTheme();
  const darkMode = theme === "dark";
  const router = useRouter();

  return (
    <div
      className={`
      relative rounded-lg border transition-all duration-200 group-hover:shadow-md
      ${
        darkMode
          ? "bg-gray-900 border-gray-800 shadow-lg shadow-black/20 hover:shadow-xl hover:shadow-black/30"
          : "bg-white/70 border-gray-200 shadow-2xl shadow-indigo-300/20 hover:shadow-gray-300/60"
      }
    `}
    >
      {/* Status Badge */}
      <div className="absolute top-4 right-4">
        <span className={getStatusBadge(election.status)}>
          {election.status === "COMPLETED"
            ? "Ended"
            : election.status.charAt(0) +
              election.status.slice(1).toLowerCase()}
        </span>
      </div>

      <div className="p-6">
        {/* Election Title */}
        <h3
          className={`text-lg font-semibold mb-4 pr-20 ${darkMode ? "text-white" : "text-gray-900"}`}
        >
          {election.name}
        </h3>

        {/* Date Information */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2">
            <Calendar
              className={`h-4 w-4 ${darkMode ? "text-gray-400" : "text-gray-500"}`}
            />
            <span
              className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}
            >
              Starts: {formatDate(election?.startDate)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar
              className={`h-4 w-4 ${darkMode ? "text-gray-400" : "text-gray-500"}`}
            />
            <span
              className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}
            >
              Ends: {formatDate(election.endDate)}
            </span>
          </div>
        </div>

        {/* Voter Count */}
        <div className="flex items-center gap-2 mb-6">
          <Users
            className={`h-4 w-4 ${darkMode ? "text-gray-400" : "text-gray-500"}`}
          />
          <span
            className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}
          >
            {election.totalVoters} Registered
          </span>
        </div>

        {/* Action Button */}
        <Button
          className={getActionButton(election.status)}
          onClick={() => router.push(`/elections/${election.id}`)}
        >
          {getActionText(election.status)}
        </Button>
      </div>
    </div>
  );
};

export default ElectionCard;
