"use client";

import {
  useWriteContract,
  useWaitForTransactionReceipt,
  useAccount,
  useChainId,
  useReadContract,
} from "wagmi";
import { useState, useCallback } from "react";
import { abi } from "@/contracts/abi";
import {
  electionAddress,
  SUPPORTED_CHAINS,
} from "@/contracts/election-address";
import type {
  ContractElectionParams,
  ContractVoterInfoDTO,
} from "@/utils/contract-helpers";
import type { Address, PublicClient, WalletClient } from "viem";
import { Voter } from "@/types/voter";
import { usePollingUnitSession } from "./use-polling-unit-session";
import { sepolia } from "wagmi/chains";

// Types for write operations - UPDATED for new ABI
export interface AccreditVoterParams {
  voterMatricNo: string;
  electionTokenId: bigint;
}

interface ValidatePollingUnitParams {
  electionTokenId: string;
}

interface ValidatePollingUnitResult {
  success: boolean;
  hash?: string;
  message: string;
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

// Types for voter data from smart contract
interface ElectionVoter {
  name: string;
  voterState: number; // 0: Registered, 1: Accredited, 2: Voted
}

// Helper function to get contract address for current chain
export function getContractAddress(chainId: number): Address | null {
  const address = electionAddress[chainId as keyof typeof electionAddress];
  return address || null;
}

// Helper function to validate chain support
function validateChainSupport(chainId: number): {
  isSupported: boolean;
  message?: string;
} {
  if (!SUPPORTED_CHAINS.includes(chainId as any)) {
    return {
      isSupported: false,
      message: `Unsupported network. Please switch to one of: ${SUPPORTED_CHAINS.map(
        (id) => {
          if (id === 11155111) return "Sepolia";
          if (id === 43113) return "Avalanche Fuji";
          return `Chain ${id}`;
        },
      ).join(", ")}`,
    };
  }
  return { isSupported: true };
}

// Custom hook for reading voter data efficiently
// Hook for creating elections - keeping original implementation
export function useCreateElection() {
  const { address } = useAccount();
  const chainId = useChainId();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    writeContractAsync, // Use writeContractAsync instead of writeContract
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
      if (!address) {
        return { success: false, message: "Please connect your wallet first" };
      }

      // Validate chain support
      const chainValidation = validateChainSupport(chainId);
      if (!chainValidation.isSupported) {
        return { success: false, message: chainValidation.message! };
      }

      // Get contract address for current chain
      const contractAddress = getContractAddress(chainId);
      if (!contractAddress) {
        return {
          success: false,
          message: "Contract not deployed on this network",
        };
      }

      setIsLoading(true);
      setError(null);

      try {
        // Wait for the transaction to be submitted
        const transactionHash = await writeContractAsync({
          abi,
          address: contractAddress,
          functionName: "createElection",
          args: [params.electionParams],
        });

        return {
          success: true,
          message:
            "Election creation transaction submitted! Please wait for blockchain confirmation.",
          hash: transactionHash,
        };
      } catch (err) {
        console.error("=== CREATE ELECTION ERROR ===");
        console.error("Error details:", err);

        let errorMessage = "Failed to create election";

        if (err instanceof Error) {
          if (
            err.message.includes("User rejected") ||
            err.message.includes("user rejected")
          ) {
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
      }
    },
    [address, chainId, writeContractAsync], // Remove hash and writeError from dependencies
  );

  return {
    createElection,
    isLoading: isLoading || isPending || isConfirming,
    isSuccess,
    error: error || writeError?.message,
    hash,
    isPending,
    isConfirming,
    chainId,
    contractAddress: getContractAddress(chainId),
    isChainSupported: validateChainSupport(chainId).isSupported,
  };
}

// Add this hook to use-election-write-operations.ts
export function useAddVotersToElection() {
  const { address } = useAccount();
  const chainId = useChainId();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    writeContractAsync,
    data: hash,
    isPending,
    error: writeError,
  } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const addVotersToElection = useCallback(
    async (
      electionTokenId: bigint,
      votersList: ContractVoterInfoDTO[],
    ): Promise<{ success: boolean; message: string; hash?: string }> => {
      if (!address) {
        return { success: false, message: "Please connect your wallet first" };
      }

      // Validate input data
      if (!votersList || votersList.length === 0) {
        return { success: false, message: "No voters provided" };
      }

      if (votersList.length > 10000) {
        return {
          success: false,
          message: "Too many voters. Maximum is 10,000 per batch",
        };
      }

      // Validate chain support
      const chainValidation = validateChainSupport(chainId);
      if (!chainValidation.isSupported) {
        return { success: false, message: chainValidation.message! };
      }

      // Get contract address
      const contractAddress = getContractAddress(chainId);
      if (!contractAddress) {
        return {
          success: false,
          message: "Contract not deployed on this network",
        };
      }

      setIsLoading(true);
      setError(null);

      try {
        console.log("Adding voters to election:", {
          electionTokenId: electionTokenId.toString(),
          votersCount: votersList.length,
          contractAddress,
          chainId,
        });

        // Validate voter data structure
        for (const voter of votersList) {
          if (!voter.name || !voter.matricNo || !voter.department) {
            throw new Error("Invalid voter data: missing required fields");
          }
        }

        const transactionHash = await writeContractAsync({
          abi,
          address: contractAddress,
          functionName: "addVotersToElection",
          args: [electionTokenId, votersList],
        });

        console.log("Transaction submitted:", transactionHash);

        return {
          success: true,
          message: `Transaction submitted! Adding ${votersList.length} voters. Please wait for confirmation.`,
          hash: transactionHash,
        };
      } catch (err) {
        console.error("Add voters error:", err);

        let errorMessage = "Failed to add voters";

        if (err instanceof Error) {
          const errorMsg = err.message.toLowerCase();

          if (
            errorMsg.includes("user rejected") ||
            errorMsg.includes("user denied")
          ) {
            errorMessage = "Transaction was rejected by user";
          } else if (errorMsg.includes("insufficient funds")) {
            errorMessage = "Insufficient funds for gas fees";
          } else if (
            errorMsg.includes("electionnonfound") ||
            errorMsg.includes("election not found")
          ) {
            errorMessage = "Election not found";
          } else if (
            errorMsg.includes("unauthorized") ||
            errorMsg.includes("not authorized")
          ) {
            errorMessage =
              "You are not authorized to add voters to this election";
          } else if (
            errorMsg.includes("invalid voter") ||
            errorMsg.includes("duplicate")
          ) {
            errorMessage = "Invalid or duplicate voter data detected";
          } else if (errorMsg.includes("election state")) {
            errorMessage =
              "Election is not in a state that allows adding voters";
          } else if (errorMsg.includes("gas")) {
            errorMessage =
              "Transaction failed due to gas issues. Try increasing gas limit.";
          } else {
            // Log the full error for debugging
            console.error("Full error details:", err);
            errorMessage = `Transaction failed: ${err.message}`;
          }
        }

        setError(errorMessage);
        return { success: false, message: errorMessage };
      } finally {
        setIsLoading(false);
      }
    },
    [address, chainId, writeContractAsync],
  );

  return {
    addVotersToElection,
    isLoading: isLoading || isPending || isConfirming,
    isSuccess,
    error: error || writeError?.message,
    hash,
    isPending,
    isConfirming,
    // Helper methods for debugging
    isTransactionPending: isPending,
    isTransactionConfirming: isConfirming,
    isTransactionSuccess: isSuccess,
  };
}
// ENHANCED Hook for accrediting voters with validation
// Hook for accrediting voters - UPDATED for new ABI
// FIXED Hook for accrediting voters with proper validation
// SIMPLIFIED Hook for accrediting voters - just try and give basic feedback
export function useAccreditVoter() {
  const { address } = useAccount();
  const chainId = useChainId();
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
      if (!address) {
        return { success: false, message: "Please connect your wallet first" };
      }

      // Validate chain support
      const chainValidation = validateChainSupport(chainId);
      if (!chainValidation.isSupported) {
        return { success: false, message: chainValidation.message! };
      }

      // Get contract address for current chain
      const contractAddress = getContractAddress(chainId);
      if (!contractAddress) {
        return {
          success: false,
          message: "Contract not deployed on this network",
        };
      }

      setIsLoading(true);
      setError(null);

      try {
        writeContract({
          abi,
          address: contractAddress,
          functionName: "accrediteVoter",
          args: [params.voterMatricNo, params.electionTokenId], // voterMatricNo, pollingOfficerAddress
        });

        return {
          success: true,
          message: `Voter ${params.voterMatricNo} has been accredited! Please confirm the transaction.`,
          hash: hash,
        };
      } catch (err) {
        console.error("Accredit error:", err);

        let errorMessage = "Voter not registered";

        if (err instanceof Error) {
          if (err.message.includes("User rejected")) {
            errorMessage = "Transaction was rejected by user";
          } else if (err.message.includes("insufficient funds")) {
            errorMessage = "Insufficient funds for gas fees";
          } else if (err.message.includes("VoterAlreadyAccredited")) {
            errorMessage = "Voter has already been accredited";
          } else if (
            err.message.includes("VoterNotRegistered") ||
            err.message.includes("noUnknown")
          ) {
            errorMessage = "Voter not registered";
          } else {
            errorMessage = "Voter not registered";
          }
        }

        setError(errorMessage);
        return { success: false, message: errorMessage };
      } finally {
        setIsLoading(false);
      }
    },
    [address, chainId, writeContract, hash, writeError],
  );

  return {
    accreditVoter,
    isLoading: isLoading || isPending || isConfirming,
    isSuccess,
    error: error || writeError?.message,
    hash,
    isPending,
    isConfirming,
    chainId,
    contractAddress: getContractAddress(chainId),
    isChainSupported: validateChainSupport(chainId).isSupported,
  };
}

// ENHANCED Hook for validating voter for voting with comprehensive checks
export function useValidateVoterForVoting() {
  const { address } = useAccount();
  const chainId = useChainId();
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
      if (!address) {
        return { success: false, message: "Please connect your wallet first" };
      }

      // Validate chain support
      const chainValidation = validateChainSupport(chainId);
      if (!chainValidation.isSupported) {
        return { success: false, message: chainValidation.message! };
      }

      // Get contract address for current chain
      const contractAddress = getContractAddress(chainId);
      if (!contractAddress) {
        return {
          success: false,
          message: "Contract not deployed on this network",
        };
      }

      setIsLoading(true);
      setError(null);

      try {
        writeContract({
          abi,
          address: contractAddress,
          functionName: "validateVoterForVoting",
          args: [
            params.voterMatricNo,
            params.voterName,
            params.electionTokenId,
          ],
        });

        // Don't return success immediately - let the transaction be processed
        // The success will be determined by the transaction receipt
        return {
          success: true,
          message: `Validation transaction submitted for ${params.voterName} (${params.voterMatricNo}). Please confirm the transaction.`,
          hash: hash,
        };
      } catch (err) {
        console.error("Validate voter error:", err);

        let errorMessage = "Voter validation failed";

        if (err instanceof Error) {
          if (err.message.includes("User rejected")) {
            errorMessage = "Transaction was rejected by user";
          } else if (err.message.includes("insufficient funds")) {
            errorMessage = "Insufficient funds for gas fees";
          } else if (err.message.includes("VoterNotAccredited")) {
            errorMessage = "Voter has not been accredited yet";
          } else if (err.message.includes("VoterAlreadyVoted")) {
            errorMessage = "Voter has already voted";
          } else if (
            err.message.includes("VoterNotRegistered") ||
            err.message.includes("noUnknown")
          ) {
            errorMessage = "Voter not registered";
          } else if (err.message.includes("InvalidVoterDetails")) {
            errorMessage = "Invalid voter details provided";
          } else if (err.message.includes("ElectionNotActive")) {
            errorMessage = "Election is not currently active";
          } else {
            errorMessage = "Voter validation failed";
          }
        }

        setError(errorMessage);
        return { success: false, message: errorMessage };
      } finally {
        setIsLoading(false);
      }
    },
    [address, chainId, writeContract, hash, writeError],
  );

  return {
    validateVoterForVoting,
    isLoading: isLoading || isPending || isConfirming,
    isSuccess,
    error: error || writeError?.message,
    hash,
    isPending,
    isConfirming,
    chainId,
    contractAddress: getContractAddress(chainId),
    isChainSupported: validateChainSupport(chainId).isSupported,
  };
}
// Hook for validating polling officers - keeping original implementation
export function useValidatePollingOfficer() {
  const { address } = useAccount();
  const chainId = useChainId();
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

  const validatePollingOfficer = useCallback(
    async (
      electionTokenId: bigint,
    ): Promise<{ success: boolean; message: string; hash?: string }> => {
      if (!address) {
        return { success: false, message: "Please connect your wallet first" };
      }

      // Validate chain support
      const chainValidation = validateChainSupport(chainId);
      if (!chainValidation.isSupported) {
        return { success: false, message: chainValidation.message! };
      }

      // Get contract address for current chain
      const contractAddress = getContractAddress(chainId);
      if (!contractAddress) {
        return {
          success: false,
          message: "Contract not deployed on this network",
        };
      }

      setIsLoading(true);
      setError(null);

      try {
        writeContract({
          abi,
          address: contractAddress,
          functionName: "validateAddressAsPollingOfficer",
          args: [electionTokenId],
        });

        return {
          success: true,
          message:
            "Polling officer validation transaction submitted! Please confirm in MetaMask and wait for blockchain confirmation.",
          hash: hash,
        };
      } catch (err) {
        console.error("=== VALIDATE POLLING OFFICER ERROR ===");
        console.error("Error details:", err);
        console.error("Write error:", writeError);

        let errorMessage = "Failed to validate polling officer";

        if (err instanceof Error) {
          if (err.message.includes("User rejected")) {
            errorMessage = "Transaction was rejected by user";
          } else if (err.message.includes("insufficient funds")) {
            errorMessage = "Insufficient funds for gas fees";
          } else if (err.message.includes("execution reverted")) {
            // Parse specific contract errors
            if (err.message.includes("Not authorized")) {
              errorMessage =
                "You are not authorized as a polling officer for this election.";
            } else if (err.message.includes("Invalid election")) {
              errorMessage = "Invalid election ID or election not found.";
            } else {
              errorMessage = "Transaction failed: " + err.message;
            }
          } else if (err.message.includes("invalid address")) {
            errorMessage =
              "Invalid contract address. Please check your configuration.";
          } else {
            errorMessage = err.message;
          }
        }

        setError(errorMessage);
        return { success: false, message: errorMessage };
      } finally {
        setIsLoading(false);
      }
    },
    [address, chainId, writeContract, hash, writeError],
  );

  return {
    validatePollingOfficer,
    isLoading: isLoading || isPending || isConfirming,
    isSuccess,
    error: error || writeError?.message,
    hash,
    isPending,
    isConfirming,
    chainId,
    contractAddress: getContractAddress(chainId),
    isChainSupported: validateChainSupport(chainId).isSupported,
  };
}
// Hook for validating polling units - UPDATED for chain-aware addresses
export function useValidatePollingUnit() {
  const chainId = useChainId();
  const { session, isInitializing } = usePollingUnitSession();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validatePollingUnit = async (
    walletClient: WalletClient,
    publicClient: PublicClient | null,
    params: ValidatePollingUnitParams,
  ): Promise<ValidatePollingUnitResult> => {
    if (isInitializing) {
      return {
        success: false,
        message: "Session is initializing, please wait",
      };
    }

    if (!walletClient || !publicClient) {
      const errorMsg = "Wallet client not initialized";
      setError(errorMsg);
      return {
        success: false,
        message: errorMsg,
      };
    }

    setIsLoading(true);
    setError(null);

    try {
      const electionTokenIdBigInt = BigInt(params.electionTokenId);

      const hash = await walletClient.writeContract({
        address: getContractAddress(chainId),
        abi,
        functionName: "validateAddressAsPollingUnit",
        args: [electionTokenIdBigInt],
        account: walletClient.account,
      });

      // Use publicClient to wait for receipt
      const receipt = await publicClient.waitForTransactionReceipt({
        hash,
      });

      if (receipt.status === "success") {
        return {
          success: true,
          hash,
          message: "Polling unit validated successfully",
        };
      } else {
        throw new Error("Validation transaction failed");
      }
    } catch (err: any) {
      console.error("Polling unit validation error:", err);
      let errorMessage = "Failed to validate polling unit";

      if (err.message.includes("Not authorized")) {
        errorMessage = "Not authorized as polling unit for this election";
      } else if (err.message.includes("insufficient funds")) {
        errorMessage = "Insufficient funds for gas fees";
      } else if (err.message.includes("User rejected")) {
        errorMessage = "Transaction rejected by user";
      }

      setError(errorMessage);
      return {
        success: false,
        message: errorMessage,
      };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    validatePollingUnit,
    isLoading,
    error,
  };
}
// Hook for voting - UPDATED for chain-aware addresses
export function useVoteCandidates() {
  const { address } = useAccount();
  const chainId = useChainId();
  const { session } = usePollingUnitSession();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const voteCandidates = async (
    params: VoteCandidatesParams,
  ): Promise<VoteCandidatesResult> => {
    if (!session.isValid || !session.walletClient) {
      const errorMsg =
        "No valid polling unit session. Please validate your polling unit first.";
      setError(errorMsg);
      return {
        success: false,
        message: errorMsg,
      };
    }

    setIsLoading(true);
    setError(null);

    try {
      // Submit the transaction
      const hash = await session.walletClient.writeContract({
        address: getContractAddress(chainId),
        abi,
        functionName: "voteCandidates",
        args: [
          params.voterMatricNo,
          params.voterName,
          params.candidatesList,
          params.electionTokenId,
        ],
        account: session.walletClient.account, // Add this line
      });

      // Wait for transaction confirmation
      const receipt = await session.walletClient.waitForTransactionReceipt({
        hash,
        timeout: 60000, // 1 minute timeout
      });

      if (receipt.status === "success") {
        return {
          success: true,
          hash,
          message: "Vote submitted successfully",
        };
      } else {
        throw new Error("Transaction failed");
      }
    } catch (err: any) {
      console.error("Vote submission error:", err);
      const errorMessage = err.message || "Failed to submit vote";
      setError(errorMessage);

      return {
        success: false,
        message: errorMessage,
      };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    voteCandidates,
    isLoading,
    error,
  };
}
