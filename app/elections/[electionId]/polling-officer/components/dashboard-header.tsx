"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, CheckCircle, TrendingUp, Calendar, Clock } from "lucide-react";
import Heading from "@/components/ui/heading";
import type { Election } from "@/types/election";
import { formatDate } from "@/lib/utils";
import ElectionCountdownTimer from "@/components/ui/election-countdown-timer";

interface DashboardHeaderProps {
  election: Election;
  totalVoters: number;
  accreditedCount: number;
  votedCount: number;
}

export function DashboardHeader({
  election,
  totalVoters,
  accreditedCount,
  votedCount,
}: DashboardHeaderProps) {
  // Calculate stats
  const accreditationPercentage =
    totalVoters > 0 ? Math.round((accreditedCount / totalVoters) * 100) : 0;
  const turnoutPercentage =
    accreditedCount > 0 ? Math.round((votedCount / accreditedCount) * 100) : 0;

  const votersturnoutPercentage =
    (election?.totalVoters ?? 0) > 0
      ? (
          ((election?.totalVotes ?? 0) / (election.totalVoters ?? 1)) *
          100
        ).toFixed(1)
      : "0.0";

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case "ACTIVE":
        return "bg-green-500/20 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-700/50";
      case "UPCOMING":
        return "bg-yellow-500/20 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-700/50";
      case "COMPLETED":
        return "bg-blue-500/20 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-700/50";
      default:
        return "bg-slate-500/20 dark:bg-slate-900/30 text-slate-700 dark:text-slate-400 border-slate-700/50";
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}

      {/* Election Information Card */}
      <Card className="bg-white dark:bg-slate-900/50 dark:border-slate-700/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <CardTitle className="text-2xl">{election.name}</CardTitle>

              <div className="flex items-center gap-4 text-sm text-slate-500">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>Start: {formatDate(election.startDate)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>End: {formatDate(election.endDate)}</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end space-y-4">
              <Badge className={getStatusColor(election.status)}>
                {election.status}
              </Badge>
              <ElectionCountdownTimer endDate={election.endDate} />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Total Registered */}
            <div className="bg-[#D6DADD]/30 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-300 dark:border-gray-600">
              <div className="flex items-center gap-3">
                <div className="bg-blue-500/20 p-2 rounded-lg">
                  <Users className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">Total Registered</p>
                  <p className="text-2xl font-bold text-slate-500 dark:text-slate-300">
                    {totalVoters.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Accredited */}
            <div className="bg-[#D6DADD]/30 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-300 dark:border-gray-600">
              <div className="flex items-center gap-3">
                <div className="bg-green-500/20 p-2 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">Accredited</p>
                  <p className="text-2xl font-bold text-slate-500 dark:text-slate-300">
                    {accreditedCount.toLocaleString()}
                  </p>
                  <p className="text-xs text-slate-500">
                    {accreditationPercentage}% of total
                  </p>
                </div>
              </div>
            </div>

            {/* Voted */}
            <div className="bg-[#D6DADD]/30 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-300 dark:border-gray-600">
              <div className="flex items-center gap-3">
                <div className="bg-purple-500/20 p-2 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">Voted</p>
                  <p className="text-2xl font-bold text-slate-500 dark:text-slate-300">
                    {(election?.totalVotes ?? 0).toLocaleString()}
                  </p>
                  <p className="text-xs text-slate-500">
                    {votersturnoutPercentage}% turnout
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
