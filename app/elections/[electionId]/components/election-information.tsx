"use client";

import React from "react";
import { Calendar, Lock, MapPin, Shield, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import ElectionResult from "@/app/elections/[electionId]/components/election-result";
import { formatDate } from "@/lib/utils";
import { useElectionStore } from "@/store/use-election";
import { useRouter } from "next/navigation";

interface ElectionInformationProps {
  electionId: string;
  onViewResults?: () => void;
}

const ElectionInformation: React.FC<ElectionInformationProps> = ({
  electionId,
  onViewResults,
}) => {
  const router = useRouter();
  const { getElectionById } = useElectionStore();
  const election = getElectionById(electionId);

  if (!election) {
    return null;
  }
  const canViewResults = election.status === "COMPLETED";
  const accessPolling = election.status === "ACTIVE";

  const handleViewResults = () => {
    if (canViewResults) {
      if (onViewResults) {
        onViewResults();
      }
    }
  };

  return (
    <div
      className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg shadow-xl
            dark:shadow-2xl mt-10"
    >
      <div className="flex items-center gap-2 mb-6">
        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
          <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
          Election Information
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Start Date */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-green-600 dark:text-green-400" />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Start Date
            </span>
          </div>
          <p className="text-lg font-semibold text-gray-900 dark:text-white pl-6">
            {formatDate(election.startDate)}
          </p>
        </div>

        {/* End Date */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-red-600 dark:text-red-400" />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              End Date
            </span>
          </div>
          <p className="text-lg font-semibold text-gray-900 dark:text-white pl-6">
            {formatDate(election.endDate)}
          </p>
        </div>

        {/* Total Registered Voters */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Total Registered Voters
            </span>
          </div>
          <p className="text-lg font-semibold text-gray-900 dark:text-white pl-6">
            {(election.totalVoters ?? 0).toLocaleString()} Students
          </p>
        </div>

        {/* Categories Available */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Categories Available
            </span>
          </div>
          <p className="text-lg font-semibold text-gray-900 dark:text-white pl-6">
            {election.categories.length} Positions
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Access Polling Officer Panel */}
        <Button
          size="lg"
          className="text-gray-500 dark:text-gray-400 p-4 text-center flex items-center bg-[#D6DADD]/30 hover:bg-[#D6DADD]/80 dark:bg-gray-700/50 rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl cursor-pointer"
          onClick={() =>
            router.push(`/elections/${electionId}/polling-officer`)
          }
          disabled={!accessPolling}
        >
          <Shield className="w-5 h-5" />
          <span className="font-medium">Access Polling Officer Panel</span>
        </Button>

        {/* Access Polling Unit */}
        <Button
          size="lg"
          className="text-gray-500 dark:text-gray-400 p-4 text-center flex items-center bg-[#D6DADD]/30 hover:bg-[#D6DADD]/80 dark:bg-gray-700/50 rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl cursor-pointer"
          onClick={() => router.push(`/elections/${electionId}/polling-unit`)}
          disabled={!accessPolling}
        >
          <MapPin className="w-5 h-5" />
          <span className="font-medium">Access Polling Unit</span>
        </Button>

        {/* View Results */}
        <ElectionResult
          election={election}
          handleViewResults={handleViewResults}
          canViewResults={canViewResults}
        />
      </div>

      {/* Results availability notice */}
      {!canViewResults && (
        <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <p className="text-sm text-yellow-800 dark:text-yellow-200 text-center">
            <Lock className="w-4 h-4 inline mr-1" />
            Results will be available once the election has ended
          </p>
        </div>
      )}
    </div>
  );
};

export default ElectionInformation;
