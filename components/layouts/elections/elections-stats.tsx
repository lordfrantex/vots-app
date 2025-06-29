"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Vote, Users, Calendar, TrendingUp } from "lucide-react";
import type { Election } from "@/types/election";

interface ElectionsStatsProps {
  elections: Election[];
  isLoading?: boolean;
}

export function ElectionsStats({ elections, isLoading }: ElectionsStatsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                <div className="h-4 bg-muted animate-pulse rounded" />
              </CardTitle>
              <div className="h-4 w-4 bg-muted animate-pulse rounded" />
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted animate-pulse rounded mb-1" />
              <div className="h-3 bg-muted animate-pulse rounded w-3/4" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const stats = {
    totalElections: elections.length,
    activeElections: elections.filter((e) => e.status === "ACTIVE").length,
    totalVoters: elections.reduce((sum, e) => sum + (e.totalVoters || 0), 0),
    totalVotes: elections.reduce((sum, e) => sum + (e.totalVotes || 0), 0),
  };

  const statCards = [
    {
      title: "Total Elections",
      value: stats.totalElections,
      description: "All elections on blockchain",
      icon: Calendar,
    },
    {
      title: "Active Elections",
      value: stats.activeElections,
      description: "Currently accepting votes",
      icon: TrendingUp,
    },
    {
      title: "Total Voters",
      value: stats.totalVoters,
      description: "Registered across all elections",
      icon: Users,
    },
    {
      title: "Total Votes",
      value: stats.totalVotes,
      description: "Cast across all elections",
      icon: Vote,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stat.value.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
