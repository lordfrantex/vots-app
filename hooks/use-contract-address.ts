"use client";

import { useAccount, useReadContract, useReadContracts } from "wagmi";
import { useMemo, useEffect, useRef } from "react";
import { abi } from "@/contracts/abi";
import { electionAddress } from "@/contracts/election-address";
import type { Election } from "@/types/election";
import type { Candidate } from "@/types/candidate";
import type { Voter } from "@/types/voter";
import type { Category } from "@/types/category";
import type { PollingOfficer } from "@/types/polling-officer";
import type { PollingUnit } from "@/types/polling-unit";
import {
  convertCandidateFromContract,
  convertVoterFromContract,
  convertPollingOfficerFromContract,
  convertPollingUnitFromContract,
  type ContractCandidateInfoDTO,
  type ContractElectionVoterResponse,
  type ContractPollingOfficerInfoDTO,
  type ContractPollingUnitInfoDTO,
} from "@/utils/contract-helpers";
import { sepolia } from "wagmi/chains";

// Contract return type definitions - UPDATED for new ABI
interface ContractElectionSummary {
  electionId: bigint;
  electionName: string;
  electionDescription: string; // NEW: Added description field
  state: number;
  startTimestamp: bigint;
  endTimestamp: bigint;
  registeredVotersCount: bigint;
  accreditedVotersCount: bigint;
  votedVotersCount: bigint;
}

interface ContractElectionInfo {
  electionId: bigint;
  createdBy: `0x${string}`;
  electionName: string;
  electionDescription: string; // NEW: Added description field
  state: number;
  startTimestamp: bigint;
  endTimestamp: bigint;
  registeredVotersCount: bigint;
  accreditedVotersCount: bigint;
  votedVotersCount: bigint;
  electionCategories: readonly string[];
  pollingOfficers: readonly `0x${string}`[]; // NEW: Direct addresses array
  pollingUnits: readonly `0x${string}`[]; // NEW: Direct addresses array
  candidatesList: readonly ContractCandidateInfoDTO[];
}

// Helper: Convert timestamp to ISO string
const timestampToDateTimeString = (timestamp: bigint): string => {
  const date = new Date(Number(timestamp) * 1000);
  return date.toISOString();
};

// Election state enum mapping
const ELECTION_STATE_MAP = {
  0: "UPCOMING" as const,
  1: "ACTIVE" as const,
  2: "COMPLETED" as const,
} as const;

// Determine election status
const determineElectionStatus = (
  contractState: number,
  startTimestamp: bigint,
  endTimestamp: bigint,
): "UPCOMING" | "ACTIVE" | "COMPLETED" => {
  const now = Math.floor(Date.now() / 1000);
  const start = Number(startTimestamp);
  const end = Number(endTimestamp);

  if (contractState === 2) return "COMPLETED";
  if (now < start) return "UPCOMING";
  if (now >= start && now <= end) return "ACTIVE";
  if (now > end) return "COMPLETED";
  return (
    ELECTION_STATE_MAP[contractState as keyof typeof ELECTION_STATE_MAP] ||
    "UPCOMING"
  );
};

export function useContractAddress(chainId?: number) {
  const { chain } = useAccount();
  const targetChainId = chainId || chain?.id || sepolia.id;
  return (
    electionAddress[targetChainId as keyof typeof electionAddress] ||
    electionAddress[sepolia.id]
  );
}

// Custom hook for interval-based refetching
const usePolling = (
  refetch: () => void,
  interval: number = 10000,
  enabled: boolean = true,
) => {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const startPolling = () => {
      intervalRef.current = setInterval(() => {
        refetch();
      }, interval);
    };

    startPolling();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [refetch, interval, enabled]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);
};

// Main hook: get all elections with auto-refetch
export const useContractElections = (
  preferredChainId?: number,
  pollingConfig?: { enabled?: boolean; interval?: number },
) => {
  const { chain } = useAccount();
  const targetChainId = preferredChainId || chain?.id || sepolia.id;
  const contractAddress = useContractAddress(targetChainId);

  // Polling configuration
  const pollingEnabled = pollingConfig?.enabled ?? true;
  const pollingInterval = pollingConfig?.interval ?? 10000; // Default 10 seconds

  // Get all elections summary
  const {
    data: electionsData,
    isLoading: isLoadingSummary,
    error: summaryError,
    refetch: refetchSummary,
  } = useReadContract({
    abi,
    address: contractAddress,
    functionName: "getAllElectionsSummary",
    chainId: targetChainId,
  });

  // Get election IDs and their statuses
  const electionMetadata = useMemo(() => {
    if (!electionsData) return [];
    return (electionsData as any[]).map((election) => {
      const status = determineElectionStatus(
        election.state,
        election.startTimestamp,
        election.endTimestamp,
      );
      return {
        electionId: election.electionId,
        status,
        summary: election,
      };
    });
  }, [electionsData]);

  // Prepare contracts for batch reading with conditional candidate and accredited voters fetching
  const detailContracts = useMemo(() => {
    if (!electionMetadata.length) return [];
    return electionMetadata.flatMap(({ electionId, status }) => {
      const baseContracts = [
        {
          abi,
          address: contractAddress,
          functionName: "getElectionInfo",
          args: [electionId],
          chainId: targetChainId,
        },
        {
          abi,
          address: contractAddress,
          functionName: "getAllVoters",
          args: [electionId],
          chainId: targetChainId,
        },
        {
          abi,
          address: contractAddress,
          functionName: "getElectionStats",
          args: [electionId],
          chainId: targetChainId,
        },
      ];

      // Conditionally add the appropriate candidate function based on status
      if (status === "COMPLETED") {
        // For completed elections, use getAllCandidates
        baseContracts.push({
          abi,
          address: contractAddress,
          functionName: "getAllCandidates",
          args: [electionId],
          chainId: targetChainId,
        });
        // NEW: Add getAllAccreditedVoters for completed elections
        baseContracts.push({
          abi,
          address: contractAddress,
          functionName: "getAllAccreditedVoters",
          args: [electionId],
          chainId: targetChainId,
        });
      } else {
        // For upcoming/active elections, use getAllCandidatesInDto
        baseContracts.push({
          abi,
          address: contractAddress,
          functionName: "getAllCandidatesInDto",
          args: [electionId],
          chainId: targetChainId,
        });
        // Add placeholder for accredited voters to maintain array structure
        baseContracts.push({
          abi,
          address: contractAddress,
          functionName: "getAllCandidatesInDto", // Placeholder - won't be used
          args: [electionId],
          chainId: targetChainId,
        });
      }

      return baseContracts;
    });
  }, [electionMetadata, contractAddress, targetChainId]);

  // Batch read all detailed data
  const {
    data: detailsData,
    isLoading: isLoadingDetails,
    error: detailsError,
    refetch: refetchDetails,
  } = useReadContracts({
    contracts: detailContracts,
  });

  // Combined refetch function
  const refetch = useMemo(() => {
    return async () => {
      await Promise.all([refetchSummary(), refetchDetails()]);
    };
  }, [refetchSummary, refetchDetails]);

  // Set up polling
  usePolling(refetch, pollingInterval, pollingEnabled);

  // Transform and combine all data
  const elections = useMemo(() => {
    if (!electionsData || !detailsData || !electionMetadata.length) return [];

    const details = detailsData as Array<{ result?: unknown; error?: Error }>;

    // console.log("=== CONTRACT DATA DEBUG ===");
    // console.log("Election Metadata:", electionMetadata);
    // console.log("Details results:", details);

    return electionMetadata.map((meta, index) => {
      const { summary, status } = meta;
      const baseIndex = index * 5; // Now 5 contracts per election (added accredited voters)

      // Get individual results with error checking
      const electionInfoResult = details[baseIndex];
      const allVotersResult = details[baseIndex + 1];
      const electionStatsResult = details[baseIndex + 2];
      const candidatesResult = details[baseIndex + 3]; // This will be either getAllCandidates or getAllCandidatesInDto
      const accreditedVotersResult = details[baseIndex + 4]; // NEW: Accredited voters (only for completed elections)

      // console.log(
      //   `\n--- Election ${index} (ID: ${summary.electionId}, Status: ${status}) ---`,
      // );
      // console.log("Election Info Result:", electionInfoResult);
      // console.log("All Voters Result:", allVotersResult);
      // console.log("Candidates Result:", candidatesResult);
      // console.log("Accredited Voters Result:", accreditedVotersResult);

      // Check for errors
      if (electionInfoResult?.error) {
        console.error("Election Info Error:", electionInfoResult.error);
      }
      if (allVotersResult?.error) {
        console.error("Voters Error:", allVotersResult.error);
      }
      if (candidatesResult?.error) {
        console.error("Candidates Error:", candidatesResult.error);
      }
      if (accreditedVotersResult?.error && status === "COMPLETED") {
        console.error("Accredited Voters Error:", accreditedVotersResult.error);
      }

      const electionInfo = electionInfoResult?.result as any;
      const allVotersData = allVotersResult?.result as
        | ContractElectionVoterResponse[]
        | undefined;
      const candidatesData = candidatesResult?.result as
        | ContractCandidateInfoDTO[]
        | undefined;
      // NEW: Get accredited voters data only for completed elections
      const accreditedVotersData =
        status === "COMPLETED"
          ? (accreditedVotersResult?.result as
              | ContractElectionVoterResponse[]
              | undefined)
          : undefined;

      // console.log("Parsed Election Info:", electionInfo);
      // console.log("Parsed Voters Data:", allVotersData);
      // console.log("Parsed Candidates Data:", candidatesData);
      // console.log("Parsed Accredited Voters Data:", accreditedVotersData);
      // console.log("Voters Array Length:", allVotersData?.length || 0);
      // console.log("Candidates Array Length:", candidatesData?.length || 0);
      // console.log("Accredited Voters Array Length:", accreditedVotersData?.length || 0);

      // Categories
      const categories: Category[] = (
        electionInfo?.electionCategories || []
      ).map((name: string, idx: number) => ({
        id: `category-${idx}`,
        name,
      }));

      // Candidates - process the data from whichever function was called
      const candidates: Candidate[] = (candidatesData ?? []).map(
        (candidate, idx) => {
          return convertCandidateFromContract(candidate, idx);
        },
      );

      // Voters - with more detailed logging
      const voters: Voter[] = (allVotersData ?? []).map((voter, idx) => {
        return convertVoterFromContract(voter, idx);
      });

      // NEW: Accredited Voters - only for completed elections
      const accreditedVoters: Voter[] = (accreditedVotersData ?? []).map(
        (voter, idx) => {
          return convertVoterFromContract(voter, idx);
        },
      );

      // console.log("Final processed candidates:", candidates);
      // console.log("Final processed voters:", voters);
      // console.log("Final processed accredited voters:", accreditedVoters);

      // Polling Officers
      const pollingOfficers: PollingOfficer[] = (
        electionInfo?.pollingOfficers || []
      ).map((address: string, idx: number) =>
        convertPollingOfficerFromContract(
          {
            pollRoleName: `Officer ${idx + 1}`,
            pollAddress: address as `0x${string}`,
          },
          idx,
        ),
      );

      // Polling Units
      const pollingUnits: PollingUnit[] = (
        electionInfo?.pollingUnits || []
      ).map((address: string, idx: number) =>
        convertPollingUnitFromContract(
          {
            pollRoleName: `Unit ${idx + 1}`,
            pollAddress: address as `0x${string}`,
          },
          idx,
        ),
      );

      // Build election object
      const election: Election = {
        id: summary.electionId.toString(),
        name: summary.electionName,
        startDate: timestampToDateTimeString(summary.startTimestamp),
        endDate: timestampToDateTimeString(summary.endTimestamp),
        status,
        categories,
        totalVoters: Number(summary.registeredVotersCount ?? 0),
        totalVotes: Number(summary.votedVotersCount ?? 0),
        accreditedVotersCount: Number(summary.accreditedVotersCount ?? 0),
        candidates,
        voters,
        // NEW: Add accredited voters array to election object
        accreditedVoters: status === "COMPLETED" ? accreditedVoters : [],
        pollingOfficers,
        pollingUnits,
        createdBy: electionInfo?.createdBy,
        description: summary.electionDescription,
        isPublished: true,
        timezone: "UTC",
        metadata: {},
      };

      // console.log("Final election object:", election);
      // console.log("Final candidates count:", election.candidates.length);
      // console.log("Final voters count:", election.voters.length);
      // console.log("Final accredited voters count:", election.accreditedVoters?.length || 0);

      return election;
    });
  }, [electionsData, detailsData, electionMetadata]);

  const isLoading = isLoadingSummary || isLoadingDetails;
  const error = summaryError || detailsError;

  return {
    elections,
    isLoading,
    error,
    refetch,
  };
};

// Hook for getting a single election with full details and auto-refetch
export const useElectionDetails = (
  electionId: string | null,
  preferredChainId?: number,
  pollingConfig?: { enabled?: boolean; interval?: number },
) => {
  const { chain } = useAccount();
  const targetChainId = preferredChainId || chain?.id || sepolia.id;
  const contractAddress = useContractAddress(targetChainId);

  // Polling configuration
  const pollingEnabled = pollingConfig?.enabled ?? true;
  const pollingInterval = pollingConfig?.interval ?? 10000; // Default 10 seconds

  // First, get basic election info to determine status
  const {
    data: electionBasicInfo,
    isLoading: isLoadingBasicInfo,
    refetch: refetchBasicInfo,
  } = useReadContract({
    abi,
    address: contractAddress,
    functionName: "getElectionInfo",
    args: electionId ? [BigInt(electionId)] : undefined,
    chainId: targetChainId,
  });

  // Determine election status from basic info
  const electionStatus = useMemo(() => {
    if (!electionBasicInfo) return null;
    const info = electionBasicInfo as any;
    return determineElectionStatus(
      info.state,
      info.startTimestamp,
      info.endTimestamp,
    );
  }, [electionBasicInfo]);

  const contracts = useMemo(() => {
    if (!electionId || !electionStatus) return [];
    const id = BigInt(electionId);

    const baseContracts = [
      {
        abi,
        address: contractAddress,
        functionName: "getElectionInfo",
        args: [id],
        chainId: targetChainId,
      },
      {
        abi,
        address: contractAddress,
        functionName: "getAllVoters",
        args: [id],
        chainId: targetChainId,
      },
      {
        abi,
        address: contractAddress,
        functionName: "getElectionStats",
        args: [id],
        chainId: targetChainId,
      },
    ];

    // Add appropriate candidate function based on status
    if (electionStatus === "COMPLETED") {
      baseContracts.push({
        abi,
        address: contractAddress,
        functionName: "getAllCandidates",
        args: [id],
        chainId: targetChainId,
      });
      // NEW: Add getAllAccreditedVoters for completed elections
      baseContracts.push({
        abi,
        address: contractAddress,
        functionName: "getAllAccreditedVoters",
        args: [id],
        chainId: targetChainId,
      });
    } else {
      baseContracts.push({
        abi,
        address: contractAddress,
        functionName: "getAllCandidatesInDto",
        args: [id],
        chainId: targetChainId,
      });
    }

    return baseContracts;
  }, [electionId, electionStatus, contractAddress, targetChainId]);

  const {
    data: contractData,
    isLoading: isLoadingDetails,
    error,
    refetch: refetchContractData,
  } = useReadContracts({
    contracts,
  });

  // Combined refetch function
  const refetch = useMemo(() => {
    return async () => {
      await Promise.all([refetchBasicInfo(), refetchContractData()]);
    };
  }, [refetchBasicInfo, refetchContractData]);

  // Set up polling
  usePolling(refetch, pollingInterval, pollingEnabled);

  const election = useMemo(() => {
    if (!contractData || !electionId || !electionStatus) return null;

    // Handle different array lengths based on election status
    const isCompleted = electionStatus === "COMPLETED";
    const expectedLength = isCompleted ? 5 : 4;

    if (contractData.length < expectedLength) return null;

    const [
      electionInfoResult,
      allVotersResult,
      _electionStatsResult,
      candidatesResult,
      accreditedVotersResult, // This will be undefined for non-completed elections
    ] = contractData as Array<{ result?: unknown; error?: Error }>;

    const electionInfo = electionInfoResult?.result as any;
    const allVotersData = allVotersResult?.result as
      | ContractElectionVoterResponse[]
      | undefined;
    const candidatesData = candidatesResult?.result as
      | ContractCandidateInfoDTO[]
      | undefined;
    // NEW: Get accredited voters data only for completed elections
    const accreditedVotersData =
      isCompleted && accreditedVotersResult
        ? (accreditedVotersResult?.result as
            | ContractElectionVoterResponse[]
            | undefined)
        : undefined;

    console.log(`Single Election Detail (Status: ${electionStatus}):`, {
      electionInfo,
      allVotersData,
      candidatesData,
      accreditedVotersData,
    });

    // Categories
    const categories: Category[] = (electionInfo?.electionCategories || []).map(
      (name: string, idx: number) => ({
        id: `category-${idx}`,
        name,
      }),
    );

    // Candidates
    const candidates: Candidate[] = (candidatesData || []).map(
      (candidate, idx) => convertCandidateFromContract(candidate, idx),
    );

    // Voters
    const voters: Voter[] = (allVotersData || []).map((voter, idx) =>
      convertVoterFromContract(voter, idx),
    );

    // NEW: Accredited Voters - only for completed elections
    const accreditedVoters: Voter[] = (accreditedVotersData || []).map(
      (voter, idx) => convertVoterFromContract(voter, idx),
    );

    // Polling Officers
    const pollingOfficers: PollingOfficer[] = (
      electionInfo?.pollingOfficers || []
    ).map((address: string, idx: number) =>
      convertPollingOfficerFromContract(
        {
          pollRoleName: `Officer ${idx + 1}`,
          pollAddress: address as `0x${string}`,
        },
        idx,
      ),
    );

    // Polling Units
    const pollingUnits: PollingUnit[] = (electionInfo?.pollingUnits || []).map(
      (address: string, idx: number) =>
        convertPollingUnitFromContract(
          {
            pollRoleName: `Unit ${idx + 1}`,
            pollAddress: address as `0x${string}`,
          },
          idx,
        ),
    );

    // Build election object
    const election: Election = {
      id: electionId,
      name: electionInfo.electionName,
      startDate: timestampToDateTimeString(electionInfo.startTimestamp),
      endDate: timestampToDateTimeString(electionInfo.endTimestamp),
      status: electionStatus,
      categories,
      totalVoters: Number(electionInfo.registeredVotersCount),
      totalVotes: Number(electionInfo.votedVotersCount),
      accreditedVotersCount: Number(electionInfo.accreditedVotersCount),
      candidates,
      voters,
      // NEW: Add accredited voters array to election object
      accreditedVoters: isCompleted ? accreditedVoters : [],
      pollingOfficers,
      pollingUnits,
      createdBy: electionInfo?.createdBy,
      description: electionInfo.electionDescription,
      isPublished: true,
      timezone: "UTC",
      metadata: {},
    };

    return election;
  }, [contractData, electionId, electionStatus]);

  const isLoading = isLoadingBasicInfo || isLoadingDetails;

  return {
    election,
    isLoading,
    error,
    refetch,
  };
};
