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
import type { ContractElectionParams } from "@/utils/contract-helpers";
import type { Address } from "viem";

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

// Types for voter data from smart contract
interface ElectionVoter {
  name: string;
  voterState: number; // 0: Registered, 1: Accredited, 2: Voted
}

// Helper function to get contract address for current chain
function getContractAddress(chainId: number): Address | null {
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
function useVoterData(electionTokenId: bigint, chainId: number) {
  const contractAddress = getContractAddress(chainId);

  // Read all voters
  const { data: allVoters, refetch: refetchAllVoters } = useReadContract({
    abi,
    address: contractAddress,
    functionName: "getAllVoters",
    args: [electionTokenId],
    query: {
      enabled: !!contractAddress && electionTokenId > 0n,
      staleTime: 1000 * 30, // 30 seconds
    },
  });

  // Read accredited voters
  const { data: accreditedVoters, refetch: refetchAccreditedVoters } =
    useReadContract({
      abi,
      address: contractAddress,
      functionName: "getAllAccreditedVoters",
      args: [electionTokenId],
      query: {
        enabled: !!contractAddress && electionTokenId > 0n,
        staleTime: 1000 * 30, // 30 seconds
      },
    });

  // Read voted voters
  const { data: votedVoters, refetch: refetchVotedVoters } = useReadContract({
    abi,
    address: contractAddress,
    functionName: "getAllVotedVoters",
    args: [electionTokenId],
    query: {
      enabled: !!contractAddress && electionTokenId > 0n,
      staleTime: 1000 * 30, // 30 seconds
    },
  });

  return {
    allVoters: allVoters as ElectionVoter[] | undefined,
    accreditedVoters: accreditedVoters as ElectionVoter[] | undefined,
    votedVoters: votedVoters as ElectionVoter[] | undefined,
    refetchAll: () => {
      refetchAllVoters();
      refetchAccreditedVoters();
      refetchVotedVoters();
    },
  };
}

// Helper function to check voter status
function checkVoterStatus(
  voterMatricNo: string,
  allVoters?: ElectionVoter[],
  accreditedVoters?: ElectionVoter[],
  votedVoters?: ElectionVoter[],
) {
  // Check if voter is registered
  const isRegistered =
    allVoters?.some(
      (voter) => voter.name.toLowerCase() === voterMatricNo.toLowerCase(),
    ) ?? false;

  // Check if voter is accredited
  const isAccredited =
    accreditedVoters?.some(
      (voter) => voter.name.toLowerCase() === voterMatricNo.toLowerCase(),
    ) ?? false;

  // Check if voter has voted
  const hasVoted =
    votedVoters?.some(
      (voter) => voter.name.toLowerCase() === voterMatricNo.toLowerCase(),
    ) ?? false;

  return {
    isRegistered,
    isAccredited,
    hasVoted,
  };
}

// Hook for creating elections - keeping original implementation
export function useCreateElection() {
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

  const createElection = useCallback(
    async (
      params: CreateElectionParams,
    ): Promise<{ success: boolean; message: string; hash?: string }> => {
      console.log("=== CREATE ELECTION START ===");
      console.log("Wallet connected:", !!address);
      console.log("Wallet address:", address);
      console.log("Chain ID:", chainId);
      console.log("Election params:", params);

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
        console.log("Calling writeContract with:");
        console.log("- Contract address:", contractAddress);
        console.log("- Chain ID:", chainId);
        console.log("- Function: createElection");
        console.log("- Args:", [params.electionParams]);

        writeContract({
          abi,
          address: contractAddress,
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
    [address, chainId, writeContract, hash, writeError],
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

// ENHANCED Hook for accrediting voters with validation
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
      console.log("=== ACCREDIT VOTER START ===");
      console.log("Wallet connected:", !!address);
      console.log("Wallet address:", address);
      console.log("Chain ID:", chainId);
      console.log("Params:", params);

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
        // Step 1: Read all voters to check if voter is registered
        console.log("Checking if voter is registered...");
        const allVotersResult = await fetch("/api/read-contract", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            abi,
            address: contractAddress,
            functionName: "getAllVoters",
            args: [params.electionTokenId],
            chainId,
          }),
        });

        if (!allVotersResult.ok) {
          throw new Error("Failed to fetch voter data");
        }

        const allVoters: ElectionVoter[] = await allVotersResult.json();

        // Check if voter is registered
        const isRegistered = allVoters.some(
          (voter) =>
            voter.name.toLowerCase() === params.voterMatricNo.toLowerCase(),
        );

        if (!isRegistered) {
          const errorMsg = `Voter with matric number "${params.voterMatricNo}" is not registered for this election. Please ensure the voter is registered first.`;
          setError(errorMsg);
          return { success: false, message: errorMsg };
        }

        console.log("Voter is registered. Checking accreditation status...");

        // Step 2: Read accredited voters to check if already accredited
        const accreditedVotersResult = await fetch("/api/read-contract", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            abi,
            address: contractAddress,
            functionName: "getAllAccreditedVoters",
            args: [params.electionTokenId],
            chainId,
          }),
        });

        if (!accreditedVotersResult.ok) {
          throw new Error("Failed to fetch accredited voters data");
        }

        const accreditedVoters: ElectionVoter[] =
          await accreditedVotersResult.json();

        // Check if voter is already accredited
        const isAlreadyAccredited = accreditedVoters.some(
          (voter) =>
            voter.name.toLowerCase() === params.voterMatricNo.toLowerCase(),
        );

        if (isAlreadyAccredited) {
          const errorMsg = `Voter "${params.voterMatricNo}" has already been accredited for this election.`;
          setError(errorMsg);
          return { success: false, message: errorMsg };
        }

        console.log("Voter is eligible for accreditation. Proceeding...");

        // Step 3: Proceed with accreditation
        console.log("Calling writeContract with:");
        console.log("- Contract address:", contractAddress);
        console.log("- Chain ID:", chainId);
        console.log("- Function: accrediteVoter");
        console.log("- Args:", [params.voterMatricNo, params.electionTokenId]);

        writeContract({
          abi,
          address: contractAddress,
          functionName: "accrediteVoter",
          args: [params.voterMatricNo, params.electionTokenId],
        });

        console.log("writeContract called successfully");
        console.log("Transaction hash:", hash);

        return {
          success: true,
          message: `Accreditation transaction submitted for voter ${params.voterMatricNo}! Please confirm in MetaMask and wait for blockchain confirmation.`,
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
          } else if (err.message.includes("not registered")) {
            errorMessage = err.message; // Use our custom error message
          } else if (err.message.includes("already been accredited")) {
            errorMessage = err.message; // Use our custom error message
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
      console.log("=== VALIDATE VOTER FOR VOTING START ===");
      console.log("Wallet connected:", !!address);
      console.log("Wallet address:", address);
      console.log("Chain ID:", chainId);
      console.log("Params:", params);

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
        console.log("Starting comprehensive voter validation...");

        // Step 1: Check if voter is registered
        console.log("Step 1: Checking voter registration...");
        const allVotersResult = await fetch("/api/read-contract", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            abi,
            address: contractAddress,
            functionName: "getAllVoters",
            args: [params.electionTokenId],
            chainId,
          }),
        });

        if (!allVotersResult.ok) {
          throw new Error("Failed to fetch registered voters data");
        }

        const allVoters: ElectionVoter[] = await allVotersResult.json();

        const isRegistered = allVoters.some(
          (voter) =>
            voter.name.toLowerCase() === params.voterMatricNo.toLowerCase(),
        );

        if (!isRegistered) {
          const errorMsg = `Voter with matric number "${params.voterMatricNo}" is not registered for this election. Please contact the election administrator.`;
          setError(errorMsg);
          return { success: false, message: errorMsg };
        }

        console.log("✓ Voter is registered");

        // Step 2: Check if voter is accredited
        console.log("Step 2: Checking voter accreditation...");
        const accreditedVotersResult = await fetch("/api/read-contract", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            abi,
            address: contractAddress,
            functionName: "getAllAccreditedVoters",
            args: [params.electionTokenId],
            chainId,
          }),
        });

        if (!accreditedVotersResult.ok) {
          throw new Error("Failed to fetch accredited voters data");
        }

        const accreditedVoters: ElectionVoter[] =
          await accreditedVotersResult.json();

        const isAccredited = accreditedVoters.some(
          (voter) =>
            voter.name.toLowerCase() === params.voterMatricNo.toLowerCase(),
        );

        if (!isAccredited) {
          const errorMsg = `Voter "${params.voterMatricNo}" has not been accredited yet. Please visit the polling officer to get accredited before voting.`;
          setError(errorMsg);
          return { success: false, message: errorMsg };
        }

        console.log("✓ Voter is accredited");

        // Step 3: Check if voter has already voted
        console.log("Step 3: Checking if voter has already voted...");
        const votedVotersResult = await fetch("/api/read-contract", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            abi,
            address: contractAddress,
            functionName: "getAllVotedVoters",
            args: [params.electionTokenId],
            chainId,
          }),
        });

        if (!votedVotersResult.ok) {
          throw new Error("Failed to fetch voted voters data");
        }

        const votedVoters: ElectionVoter[] = await votedVotersResult.json();

        const hasAlreadyVoted = votedVoters.some(
          (voter) =>
            voter.name.toLowerCase() === params.voterMatricNo.toLowerCase(),
        );

        if (hasAlreadyVoted) {
          const errorMsg = `Voter "${params.voterMatricNo}" has already cast their vote in this election. Each voter can only vote once.`;
          setError(errorMsg);
          return { success: false, message: errorMsg };
        }

        console.log("✓ Voter has not voted yet");
        console.log(
          "All validation checks passed. Proceeding with voter validation...",
        );

        // Step 4: Proceed with validation for voting
        console.log("Calling writeContract with:");
        console.log("- Contract address:", contractAddress);
        console.log("- Chain ID:", chainId);
        console.log("- Function: validateVoterForVoting");
        console.log("- Args:", [
          params.voterMatricNo,
          params.voterName,
          params.electionTokenId,
        ]);

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

        console.log("writeContract called successfully");
        console.log("Transaction hash:", hash);

        return {
          success: true,
          message: `Voter validation successful for ${params.voterMatricNo}! You are eligible to vote. Please confirm the transaction and proceed to cast your ballot.`,
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
            errorMessage = "Transaction failed: " + err.message;
          } else if (err.message.includes("not registered")) {
            errorMessage = err.message; // Use our custom error message
          } else if (err.message.includes("not been accredited")) {
            errorMessage = err.message; // Use our custom error message
          } else if (err.message.includes("already cast their vote")) {
            errorMessage = err.message; // Use our custom error message
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
      console.log("=== VALIDATE POLLING OFFICER START ===");
      console.log("Wallet connected:", !!address);
      console.log("Wallet address:", address);
      console.log("Chain ID:", chainId);
      console.log("Election Token ID:", electionTokenId);

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
        console.log("Calling writeContract with:");
        console.log("- Contract address:", contractAddress);
        console.log("- Chain ID:", chainId);
        console.log("- Function: validateAddressAsPollingOfficer");
        console.log("- Args:", [electionTokenId]);

        writeContract({
          abi,
          address: contractAddress,
          functionName: "validateAddressAsPollingOfficer",
          args: [electionTokenId],
        });

        console.log("writeContract called successfully");
        console.log("Transaction hash:", hash);

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
        console.log("=== VALIDATE POLLING OFFICER END ===");
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

  const validatePollingUnit = useCallback(
    async (
      electionTokenId: bigint,
    ): Promise<{ success: boolean; message: string; hash?: string }> => {
      console.log("=== VALIDATE POLLING UNIT START ===");
      console.log("Wallet connected:", !!address);
      console.log("Wallet address:", address);
      console.log("Chain ID:", chainId);
      console.log("Election Token ID:", electionTokenId);

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
        console.log("Calling writeContract with:");
        console.log("- Contract address:", contractAddress);
        console.log("- Chain ID:", chainId);
        console.log("- Function: validateAddressAsPollingUnit");
        console.log("- Args:", [electionTokenId]);

        writeContract({
          abi,
          address: contractAddress,
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
        console.log("=== VALIDATE POLLING UNIT END ===");
      }
    },
    [address, chainId, writeContract, hash, writeError],
  );

  return {
    validatePollingUnit,
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

// Hook for voting - UPDATED for chain-aware addresses
export function useVoteCandidates() {
  const { address } = useAccount();
  const chainId = useChainId();
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
        console.log("Voting for candidates:", params);
        console.log("Contract address:", contractAddress);
        console.log("Chain ID:", chainId);

        writeContract({
          abi,
          address: contractAddress,
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
    [address, chainId, writeContract, hash],
  );

  return {
    voteCandidates,
    isLoading: isLoading || isPending || isConfirming,
    isSuccess,
    error,
    hash,
    chainId,
    contractAddress: getContractAddress(chainId),
    isChainSupported: validateChainSupport(chainId).isSupported,
  };
}
