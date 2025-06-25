"use client";

import React, { useEffect } from "react";
import { useMemo, useState } from "react";
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
import toast from "react-hot-toast";

const ElectionClient: React.FC = () => {
  const { address, isConnected } = useAccount();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch elections from contract
  const { elections, isLoading } = useContractElections();
  const setElections = useElectionStore((state) => state.setElections);

  useEffect(() => {
    if (elections && elections.length > 0) {
      setElections(elections);
    }
  }, [elections, setElections]);
  console.log("Elections:", elections);

  // Get wallet balance
  const {
    data: balance,
    isError: balanceError,
    isLoading: balanceLoading,
  } = useBalance({
    address: address,
  });

  // Filter elections based on search query
  const filteredElections = useMemo(() => {
    if (!elections) return [];
    return elections.filter((election) =>
      election.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [searchQuery, elections]);

  // Format balance for display
  const formattedBalance = balance
    ? `${Number.parseFloat(formatEther(balance.value)).toFixed(4)} ${balance.symbol}`
    : "0";

  return (
    <section className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-10">
        <Heading
          title="Elections"
          description="Browse through all available elections."
        />
      </div>

      {/* Wallet Information Display */}
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

      <div className="flex items-center justify-between mb-8">
        <Button
          onClick={() => router.push(`/create-election`)}
          className="cursor-pointer bg-gray-700 dark:bg-white hover:bg-gradient-to-tr hover:from-zinc-700 hover:via-55% hover:to-gray-500 hover:text-white"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add New
        </Button>

        <FilterButtons />
      </div>

      <div className="flex justify-center items-center py-5">
        <ElectionSearchInput
          placeholder="Search elections..."
          onChange={setSearchQuery}
          className="mx-auto mb-12"
        />
      </div>

      {/* Elections Grid or Loading Spinner */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="h-12 w-12 animate-spin text-gray-400 mb-4" />
          {/*<p className="text-gray-500 text-lg">Loading elections...</p>*/}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredElections.map((election) => (
            <ElectionCard key={election.id} election={election} />
          ))}
        </div>
      )}
    </section>
  );
};

export default ElectionClient;
