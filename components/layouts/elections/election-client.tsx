"use client";

import React, { useMemo, useState } from "react";
import { Election } from "@/types/election";
import Heading from "@/components/ui/heading";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import FilterButtons from "@/components/ui/filter-button";
import ElectionCard from "@/app/elections/components/election-cards";
import ElectionSearchInput from "@/app/elections/components/election-search";
import { useAccount, useBalance, useReadContract } from "wagmi";
import { formatEther } from "viem";
import { abi } from "@/contracts/abi";

interface ElectionClientProps {
  data: Election[];
}

const ElectionClient: React.FC<ElectionClientProps> = ({ data }) => {
  const { address, isConnected } = useAccount();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  // Use the connected wallet's address instead of hardcoded address
  const {
    data: balance,
    isError,
    isLoading,
  } = useBalance({
    address: address, // Use the connected wallet address
    // You can also specify a token address for ERC-20 tokens:
    // token: '0x...' // For ERC-20 token balance
  });

  // Alternative: Get balance for a specific address (like your hardcoded one)
  const specificWalletBalance = useBalance({
    address: "0x46b3B1AeB48C4f019f2CdEee6d053f5f4b8059B9" as `0x${string}`,
  });

  const filteredElections = useMemo(() => {
    return data.filter((item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [searchQuery, data]);

  // Format balance for display
  const formattedBalance = balance
    ? `${parseFloat(formatEther(balance.value)).toFixed(4)} ${balance.symbol}`
    : "0";

  const formattedSpecificBalance = specificWalletBalance.data
    ? `${parseFloat(formatEther(specificWalletBalance.data.value)).toFixed(4)} ${specificWalletBalance.data.symbol}`
    : "0";

  const { data: electionData } = useReadContract({
    abi,
    address: "0x62D560937ee50E24138aB37c75281E4531bf729F",
    functionName: "getElectionInfo",
    args: [3n],
    // Pass the connected wallet address
  });

  console.log("Election Data", electionData);
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

            {isLoading ? (
              <p className="text-sm text-gray-500">Loading balance...</p>
            ) : isError ? (
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

      {/* Optional: Display specific wallet balance */}
      {specificWalletBalance.data && (
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-6">
          <p className="text-sm font-medium">
            <span className="text-gray-600 dark:text-gray-400">
              Specific Wallet Balance:
            </span>{" "}
            <span className="text-blue-600 dark:text-blue-400">
              {formattedSpecificBalance}
            </span>
          </p>
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredElections.map((election) => (
          <ElectionCard key={election.id} election={election} />
        ))}
      </div>
    </section>
  );
};

export default ElectionClient;
