"use client";

import {
  useWriteContract,
  useWaitForTransactionReceipt,
  useAccount,
} from "wagmi";
import { useState, useCallback } from "react";
import { abi } from "@/contracts/abi";
import { electionAddress } from "@/contracts/election-address";

// Batch accreditation interface
export interface BatchAccreditationParams {
  voterMatricNumbers: string[];
  electionTokenId: bigint;
}

// Hook for batch accrediting multiple voters in one transaction
export function useBatchAccreditVoters() {
  const { address } = useAccount();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<{
    current: number;
    total: number;
    currentVoter?: string;
  } | null>(null);

  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  // Batch accredit multiple voters (if contract supports it)
  const batchAccreditVoters = useCallback(
    async (
      params: BatchAccreditationParams,
    ): Promise<{ success: boolean; message: string; hash?: string }> => {
      if (!address) {
        return { success: false, message: "Please connect your wallet" };
      }

      if (params.voterMatricNumbers.length === 0) {
        return {
          success: false,
          message: "No voters selected for accreditation",
        };
      }

      setIsLoading(true);
      setError(null);
      setProgress({ current: 0, total: params.voterMatricNumbers.length });

      try {
        console.log("Batch accrediting voters:", params);

        // If your contract has a batch function, use it
        // Otherwise, we'll need to do individual transactions
        // For now, let's assume we need individual transactions

        let successCount = 0;
        const failedVoters: string[] = [];

        for (let i = 0; i < params.voterMatricNumbers.length; i++) {
          const voterMatricNo = params.voterMatricNumbers[i];
          setProgress({
            current: i + 1,
            total: params.voterMatricNumbers.length,
            currentVoter: voterMatricNo,
          });

          try {
            writeContract({
              abi,
              address: electionAddress as `0x${string}`,
              functionName: "accrediteVoter",
              args: [voterMatricNo, params.electionTokenId],
            });

            // Wait a bit between transactions to avoid nonce issues
            await new Promise((resolve) => setTimeout(resolve, 1000));
            successCount++;
          } catch (err) {
            console.error(`Failed to accredit voter ${voterMatricNo}:`, err);
            failedVoters.push(voterMatricNo);
          }
        }

        const message = `Batch accreditation completed: ${successCount}/${params.voterMatricNumbers.length} successful`;
        if (failedVoters.length > 0) {
          console.warn("Failed voters:", failedVoters);
        }

        return {
          success: successCount > 0,
          message,
          hash: hash,
        };
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Batch accreditation failed";
        setError(errorMessage);
        console.error("Error in batch accreditation:", err);
        return { success: false, message: errorMessage };
      } finally {
        setIsLoading(false);
        setProgress(null);
      }
    },
    [address, writeContract, hash],
  );

  return {
    batchAccreditVoters,
    isLoading: isLoading || isPending || isConfirming,
    isSuccess,
    error,
    hash,
    progress,
  };
}

// Hook for optimistic accreditation (update UI immediately, rollback on failure)
export function useOptimisticAccreditation() {
  const [optimisticUpdates, setOptimisticUpdates] = useState<Set<string>>(
    new Set(),
  );
  const [failedUpdates, setFailedUpdates] = useState<Set<string>>(new Set());

  const addOptimisticUpdate = useCallback((voterId: string) => {
    setOptimisticUpdates((prev) => new Set([...prev, voterId]));
  }, []);

  const confirmUpdate = useCallback((voterId: string) => {
    setOptimisticUpdates((prev) => {
      const newSet = new Set(prev);
      newSet.delete(voterId);
      return newSet;
    });
  }, []);

  const rollbackUpdate = useCallback((voterId: string) => {
    setOptimisticUpdates((prev) => {
      const newSet = new Set(prev);
      newSet.delete(voterId);
      return newSet;
    });
    setFailedUpdates((prev) => new Set([...prev, voterId]));
  }, []);

  const isOptimisticallyAccredited = useCallback(
    (voterId: string) => {
      return optimisticUpdates.has(voterId);
    },
    [optimisticUpdates],
  );

  const hasFailed = useCallback(
    (voterId: string) => {
      return failedUpdates.has(voterId);
    },
    [failedUpdates],
  );

  return {
    addOptimisticUpdate,
    confirmUpdate,
    rollbackUpdate,
    isOptimisticallyAccredited,
    hasFailed,
  };
}
