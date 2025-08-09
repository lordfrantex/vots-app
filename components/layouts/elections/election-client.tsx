"use client";

import type React from "react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import Heading from "@/components/ui/heading";
import FilterButtons from "@/components/ui/filter-button";
import ElectionCard from "@/app/elections/components/election-cards";
import ElectionSearchInput from "@/app/elections/components/election-search";
import { useAccount, useBalance } from "wagmi";
import { formatEther } from "viem";
import { useContractElections } from "@/hooks/use-contract-address";
import { useElectionStore } from "@/store/use-election";

const ElectionClient: React.FC = () => {
  const { address, isConnected } = useAccount();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState(0); // 0: All, 1: Active, 2: Upcoming, 3: Completed

  // Fetch elections from contract (works without wallet connection)
  const { elections, isLoading } = useContractElections();
  const setElections = useElectionStore((state) => state.setElections);

  console.log("Elections fetched:", elections);
  useEffect(() => {
    if (elections && elections.length > 0) {
      setElections(elections);
    }
  }, [elections, setElections]);

  // Get wallet balance (only when connected)
  const {
    data: balance,
    isError: balanceError,
    isLoading: balanceLoading,
  } = useBalance({
    address: address,
    query: {
      enabled: !!address && isConnected,
    },
  });

  // Filter elections based on search query and status filter
  const filteredElections = useMemo(() => {
    if (!elections) return [];

    // First filter: Only show elections with ID > 5
    let filtered = elections.filter((election) => {
      const electionId = parseInt(election.id);
      return electionId;
    });

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (election) =>
          election.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (election.description ?? "")
            .toLowerCase()
            .includes(searchQuery.toLowerCase()),
      );
    }

    // Apply status filter
    if (activeFilter !== 0) {
      // 0 is "All"
      const filterMap = {
        1: "ACTIVE",
        2: "UPCOMING",
        3: "COMPLETED",
      };
      const statusFilter = filterMap[activeFilter as keyof typeof filterMap];
      if (statusFilter) {
        filtered = filtered.filter(
          (election) => election.status === statusFilter,
        );
      }
    }

    return filtered;
  }, [searchQuery, elections, activeFilter]);

  // Format balance for display
  const formattedBalance = balance
    ? `${Number.parseFloat(formatEther(balance.value)).toFixed(4)} ${balance.symbol}`
    : "0";

  // Handle filter change
  const handleFilterChange = (filterIndex: number) => {
    setActiveFilter(filterIndex);
  };

  // Get filter counts for display (only for elections with ID > 7)
  const filterCounts = useMemo(() => {
    if (!elections) return { all: 0, active: 0, upcoming: 0, completed: 0 };

    // Filter elections with ID > 7 first
    const eligibleElections = elections.filter((election) => {
      const electionId = parseInt(election.id);
      return electionId;
    });

    return {
      all: eligibleElections.length,
      active: eligibleElections.filter((e) => e.status === "ACTIVE").length,
      upcoming: eligibleElections.filter((e) => e.status === "UPCOMING").length,
      completed: eligibleElections.filter((e) => e.status === "COMPLETED")
        .length,
    };
  }, [elections]);

  return (
    <section className="max-w-7xl mx-auto pb-24">
      <div className="flex items-center justify-between mb-10">
        <Heading
          title="Elections"
          description="Browse through all available elections."
        />
      </div>

      {/* Wallet Information Display - Only show when connected */}
      {isConnected && address && (
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mb-6">
          <div className="space-y-2">
            <p className="text-sm font-medium">
              <span className="text-gray-600 dark:text-gray-400">
                Connected Wallet:
              </span>{" "}
              <span className="font-mono text-sm">{address}</span>
            </p>

            {balanceLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                <p className="text-sm text-gray-500">Loading balance...</p>
              </div>
            ) : balanceError ? (
              <p className="text-sm text-red-500">Error loading balance</p>
            ) : (
              <p className="text-sm font-medium">
                <span className="text-gray-600 dark:text-gray-400">
                  Balance:
                </span>{" "}
                <span className="text-green-600 dark:text-green-400">
                  {formattedBalance}
                </span>
              </p>
            )}
          </div>
        </div>
      )}

      {/* Action Bar */}
      <div className="flex items-center justify-between mb-8">
        <Button
          onClick={() => router.push(`/create-election`)}
          className="cursor-pointer bg-gray-700 dark:bg-white hover:bg-gradient-to-tr hover:from-zinc-700 hover:via-55% hover:to-gray-500 hover:text-white"
          disabled={!isConnected} // Disable if wallet not connected
        >
          <Plus className="mr-2 h-4 w-4" />
          Add New {!isConnected && "(Connect Wallet)"}
        </Button>

        {/* Filter Buttons with counts */}
        <div className="flex flex-col items-end">
          <FilterButtons
            activeFilter={activeFilter}
            onFilterChange={handleFilterChange}
          />
          <div className="text-xs text-gray-500 mt-1">
            All: {filterCounts.all} | Active: {filterCounts.active} | Upcoming:{" "}
            {filterCounts.upcoming} | Completed: {filterCounts.completed}
          </div>
        </div>
      </div>

      {/* Search Input */}
      <div className="flex justify-center items-center py-5">
        <ElectionSearchInput
          placeholder="Search elections..."
          onChange={setSearchQuery}
          className="mx-auto mb-12"
        />
      </div>

      {/* Elections Grid or Loading/Empty States */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="h-12 w-12 animate-spin text-gray-400 mb-4" />
          <p className="text-gray-500 text-lg">Loading elections...</p>
        </div>
      ) : filteredElections.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="text-gray-400 mb-4">
            <svg
              className="w-16 h-16"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </div>
          <p className="text-gray-500 text-lg mb-2">
            {searchQuery || activeFilter !== 0
              ? "No elections found"
              : "No elections available"}
          </p>
          <p className="text-gray-400 text-sm">
            {searchQuery || activeFilter !== 0
              ? "Try adjusting your search or filter criteria"
              : "Be the first to create an election"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredElections.map((election) => (
            <ElectionCard key={election.id} election={election} />
          ))}
        </div>
      )}

      {/* Connection prompt for write operations */}
      {!isConnected && (
        <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>Note:</strong> Connect your wallet to create elections,
            vote, or perform other actions. You can browse elections without
            connecting.
          </p>
        </div>
      )}
    </section>
  );
};

export default ElectionClient;
