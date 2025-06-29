"use client";

import {
  useWriteContract,
  useWaitForTransactionReceipt,
  useAccount,
} from "wagmi";
import { useState, useCallback } from "react";
import { abi } from "@/contracts/abi";
import { electionAddress } from "@/contracts/election-address";
import type { ContractElectionParams } from "@/utils/contract-helpers";

// Types for write operations - UPDATED for new ABI
export interface AccreditVoterParams {
  voterMatricNo: string;
  electionTokenId: bigint;
}

export interface ValidateVoterForVotingParams {
  voterMatricNo: string;
  voterName: string;
  electionTokenId: bigint;
}

export interface VoteCandidatesParams {
  voterMatricNo: string;
  voterName: string;
  candidatesList: Array<{
    name: string;
    matricNo: string;
    category: string;
    voteFor: bigint;
    voteAgainst: bigint;
  }>;
  electionTokenId: bigint;
}

export interface CreateElectionParams {
  electionParams: ContractElectionParams;
}

// Hook for creating elections - NEW for updated ABI
export function useCreateElection() {
  const { address } = useAccount();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    writeContract,
    data: hash,
    isPending,
    error: writeError,
  } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const createElection = useCallback(
    async (
      params: CreateElectionParams,
    ): Promise<{ success: boolean; message: string; hash?: string }> => {
      console.log("=== CREATE ELECTION START ===");
      console.log("Wallet connected:", !!address);
      console.log("Wallet address:", address);
      console.log("Election params:", params);

      if (!address) {
        return { success: false, message: "Please connect your wallet first" };
      }

      setIsLoading(true);
      setError(null);

      try {
        console.log("Calling writeContract with:");
        console.log("- Contract address:", electionAddress);
        console.log("- Function: createElection");
        console.log("- Args:", [params.electionParams]);

        writeContract({
          abi,
          address: electionAddress as `0x${string}`,
          functionName: "createElection",
          args: [params.electionParams],
        });

        console.log("writeContract called successfully");
        console.log("Transaction hash:", hash);

        return {
          success: true,
          message:
            "Election creation transaction submitted! Please confirm in MetaMask and wait for blockchain confirmation.",
          hash: hash,
        };
      } catch (err) {
        console.error("=== CREATE ELECTION ERROR ===");
        console.error("Error details:", err);
        console.error("Write error:", writeError);

        let errorMessage = "Failed to create election";

        if (err instanceof Error) {
          if (err.message.includes("User rejected")) {
            errorMessage = "Transaction was rejected by user";
          } else if (err.message.includes("insufficient funds")) {
            errorMessage = "Insufficient funds for gas fees";
          } else if (err.message.includes("execution reverted")) {
            errorMessage = "Transaction failed: " + err.message;
          } else {
            errorMessage = err.message;
          }
        }

        setError(errorMessage);
        return { success: false, message: errorMessage };
      } finally {
        setIsLoading(false);
        console.log("=== CREATE ELECTION END ===");
      }
    },
    [address, writeContract, hash],
  );

  return {
    createElection,
    isLoading: isLoading || isPending || isConfirming,
    isSuccess,
    error: error || writeError?.message,
    hash,
    isPending,
    isConfirming,
  };
}

// Hook for accrediting voters - UPDATED for new ABI
export function useAccreditVoter() {
  const { address } = useAccount();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    writeContract,
    data: hash,
    isPending,
    error: writeError,
  } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const accreditVoter = useCallback(
    async (
      params: AccreditVoterParams,
    ): Promise<{ success: boolean; message: string; hash?: string }> => {
      console.log("=== ACCREDIT VOTER START ===");
      console.log("Wallet connected:", !!address);
      console.log("Wallet address:", address);
      console.log("Params:", params);

      if (!address) {
        return { success: false, message: "Please connect your wallet first" };
      }

      setIsLoading(true);
      setError(null);

      try {
        console.log("Calling writeContract with:");
        console.log("- Contract address:", electionAddress);
        console.log("- Function: accrediteVoter");
        console.log("- Args:", [params.voterMatricNo, params.electionTokenId]);

        writeContract({
          abi,
          address: electionAddress as `0x${string}`,
          functionName: "accrediteVoter",
          args: [params.voterMatricNo, params.electionTokenId],
        });

        console.log("writeContract called successfully");
        console.log("Transaction hash:", hash);

        return {
          success: true,
          message: `Transaction submitted for voter ${params.voterMatricNo}! Please confirm in MetaMask and wait for blockchain confirmation.`,
          hash: hash,
        };
      } catch (err) {
        console.error("=== ACCREDIT VOTER ERROR ===");
        console.error("Error details:", err);
        console.error("Write error:", writeError);

        let errorMessage = "Failed to accredit voter";

        if (err instanceof Error) {
          if (err.message.includes("User rejected")) {
            errorMessage = "Transaction was rejected by user";
          } else if (err.message.includes("insufficient funds")) {
            errorMessage = "Insufficient funds for gas fees";
          } else if (err.message.includes("execution reverted")) {
            errorMessage = "Transaction failed: " + err.message;
          } else {
            errorMessage = err.message;
          }
        }

        setError(errorMessage);
        return { success: false, message: errorMessage };
      } finally {
        setIsLoading(false);
        console.log("=== ACCREDIT VOTER END ===");
      }
    },
    [address, writeContract, hash],
  );

  return {
    accreditVoter,
    isLoading: isLoading || isPending || isConfirming,
    isSuccess,
    error: error || writeError?.message,
    hash,
    isPending,
    isConfirming,
  };
}

// Hook for validating polling units - NEW
export function useValidatePollingUnit() {
  const { address } = useAccount();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    writeContract,
    data: hash,
    isPending,
    error: writeError,
  } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const validatePollingUnit = useCallback(
    async (
      electionTokenId: bigint,
    ): Promise<{ success: boolean; message: string; hash?: string }> => {
      console.log("=== VALIDATE POLLING UNIT START ===");
      console.log("Wallet connected:", !!address);
      console.log("Wallet address:", address);
      console.log("Election Token ID:", electionTokenId);

      if (!address) {
        return { success: false, message: "Please connect your wallet first" };
      }

      setIsLoading(true);
      setError(null);

      try {
        console.log("Calling writeContract with:");
        console.log("- Contract address:", electionAddress);
        console.log("- Function: validateAddressAsPollingUnit");
        console.log("- Args:", [electionTokenId]);

        writeContract({
          abi,
          address: electionAddress as `0x${string}`,
          functionName: "validateAddressAsPollingUnit",
          args: [electionTokenId],
        });

        console.log("writeContract called successfully");
        console.log("Transaction hash:", hash);

        return {
          success: true,
          message:
            "Polling unit validation transaction submitted! Please confirm in MetaMask and wait for blockchain confirmation.",
          hash: hash,
        };
      } catch (err) {
        console.error("=== VALIDATE POLLING UNIT ERROR ===");
        console.error("Error details:", err);
        console.error("Write error:", writeError);

        let errorMessage = "Failed to validate polling unit";

        if (err instanceof Error) {
          if (err.message.includes("User rejected")) {
            errorMessage = "Transaction was rejected by user";
          } else if (err.message.includes("insufficient funds")) {
            errorMessage = "Insufficient funds for gas fees";
          } else if (err.message.includes("execution reverted")) {
            errorMessage = "Transaction failed: " + err.message;
          } else {
            errorMessage = err.message;
          }
        }

        setError(errorMessage);
        return { success: false, message: errorMessage };
      } finally {
        setIsLoading(false);
        console.log("=== VALIDATE POLLING UNIT END ===");
      }
    },
    [address, writeContract, hash],
  );

  return {
    validatePollingUnit,
    isLoading: isLoading || isPending || isConfirming,
    isSuccess,
    error: error || writeError?.message,
    hash,
    isPending,
    isConfirming,
  };
}

// Hook for validating voter for voting - NEW
export function useValidateVoterForVoting() {
  const { address } = useAccount();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    writeContract,
    data: hash,
    isPending,
    error: writeError,
  } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const validateVoterForVoting = useCallback(
    async (
      params: ValidateVoterForVotingParams,
    ): Promise<{ success: boolean; message: string; hash?: string }> => {
      console.log("=== VALIDATE VOTER FOR VOTING START ===");
      console.log("Wallet connected:", !!address);
      console.log("Wallet address:", address);
      console.log("Params:", params);

      if (!address) {
        return { success: false, message: "Please connect your wallet first" };
      }

      setIsLoading(true);
      setError(null);

      try {
        console.log("Calling writeContract with:");
        console.log("- Contract address:", electionAddress);
        console.log("- Function: validateVoterForVoting");
        console.log("- Args:", [
          params.voterMatricNo,
          params.voterName,
          params.electionTokenId,
        ]);

        writeContract({
          abi,
          address: electionAddress as `0x${string}`,
          functionName: "validateVoterForVoting",
          args: [
            params.voterMatricNo,
            params.voterName,
            params.electionTokenId,
          ],
        });

        console.log("writeContract called successfully");
        console.log("Transaction hash:", hash);

        return {
          success: true,
          message: `Voter validation transaction submitted for ${params.voterMatricNo}! Please confirm in MetaMask and wait for blockchain confirmation.`,
          hash: hash,
        };
      } catch (err) {
        console.error("=== VALIDATE VOTER FOR VOTING ERROR ===");
        console.error("Error details:", err);
        console.error("Write error:", writeError);

        let errorMessage = "Failed to validate voter for voting";

        if (err instanceof Error) {
          if (err.message.includes("User rejected")) {
            errorMessage = "Transaction was rejected by user";
          } else if (err.message.includes("insufficient funds")) {
            errorMessage = "Insufficient funds for gas fees";
          } else if (err.message.includes("execution reverted")) {
            // Parse specific contract errors
            if (err.message.includes("Voter not accredited")) {
              errorMessage =
                "You are not accredited to vote. Please contact the polling officer.";
            } else if (err.message.includes("Voter has already voted")) {
              errorMessage = "You have already voted in this election.";
            } else if (err.message.includes("Voter not found")) {
              errorMessage =
                "Voter credentials not found. Please check your matriculation number and name.";
            } else {
              errorMessage = "Transaction failed: " + err.message;
            }
          } else {
            errorMessage = err.message;
          }
        }

        setError(errorMessage);
        return { success: false, message: errorMessage };
      } finally {
        setIsLoading(false);
        console.log("=== VALIDATE VOTER FOR VOTING END ===");
      }
    },
    [address, writeContract, hash],
  );

  return {
    validateVoterForVoting,
    isLoading: isLoading || isPending || isConfirming,
    isSuccess,
    error: error || writeError?.message,
    hash,
    isPending,
    isConfirming,
  };
}

// Hook for voting - UPDATED for new ABI
export function useVoteCandidates() {
  const { address } = useAccount();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { writeContract, data: hash, isPending } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const voteCandidates = useCallback(
    async (
      params: VoteCandidatesParams,
    ): Promise<{ success: boolean; message: string; hash?: string }> => {
      if (!address) {
        return { success: false, message: "Please connect your wallet" };
      }

      setIsLoading(true);
      setError(null);

      try {
        console.log("Voting for candidates:", params);

        writeContract({
          abi,
          address: electionAddress as `0x${string}`,
          functionName: "voteCandidates",
          args: [
            params.voterMatricNo,
            params.voterName,
            params.candidatesList,
            params.electionTokenId,
          ],
        });

        return {
          success: true,
          message: "Vote submitted. Please wait for confirmation...",
          hash: hash,
        };
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to vote";
        setError(errorMessage);
        console.error("Error voting:", err);
        return { success: false, message: errorMessage };
      } finally {
        setIsLoading(false);
      }
    },
    [address, writeContract, hash],
  );

  return {
    voteCandidates,
    isLoading: isLoading || isPending || isConfirming,
    isSuccess,
    error,
    hash,
  };
}
