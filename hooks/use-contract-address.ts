"use client";

import { useAccount, useReadContract, useReadContracts } from "wagmi";
import { useMemo } from "react";
import { abi } from "@/contracts/abi";
import {
  electionAddress,
  SUPPORTED_CHAINS,
} from "@/contracts/election-address";
import type { Election } from "@/types/election";
import type { Candidate } from "@/types/candidate";
import type { Voter } from "@/types/voter";
import type { Category } from "@/types/category";
import type { PollingOfficer } from "@/types/polling-officer";
import type { PollingUnit } from "@/types/polling-unit";
import {
  convertCandidateFromContractEnhanced,
  convertVoterForPollingOfficerEnhanced,
  OffChainDataService,
  type ContractCandidateInfoDTO,
  type ContractElectionVoterResponse,
  type PollingOfficerVoterView,
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

// Election state enum mapping - UPDATED for new states
const ELECTION_STATE_MAP = {
  0: "UPCOMING" as const, // OPENED
  1: "ACTIVE" as const, // STARTED
  2: "COMPLETED" as const, // ENDED
} as const;

// Helper functions
const timestampToDateTimeString = (timestamp: bigint): string => {
  const date = new Date(Number(timestamp) * 1000);
  return date.toISOString();
};

// Determine election status based on timestamps and state
const determineElectionStatus = (
  contractState: number,
  startTimestamp: bigint,
  endTimestamp: bigint,
): "UPCOMING" | "ACTIVE" | "COMPLETED" => {
  const now = Math.floor(Date.now() / 1000);
  const start = Number(startTimestamp);
  const end = Number(endTimestamp);

  // If contract state is COMPLETED, respect that
  if (contractState === 2) return "COMPLETED";

  // Check timestamps for actual status
  if (now < start) return "UPCOMING";
  if (now >= start && now <= end) return "ACTIVE";
  if (now > end) return "COMPLETED";

  // Fallback to contract state
  return (
    ELECTION_STATE_MAP[contractState as keyof typeof ELECTION_STATE_MAP] ||
    "UPCOMING"
  );
};

// Updated useContractElections hook - Fixed to use votedVotersCount from electionInfo

export const useContractElections = (preferredChainId?) => {
  const { chain } = useAccount();
  const targetChainId = preferredChainId || chain?.id || sepolia.id;
  const contractAddress = useContractAddress(targetChainId);

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
    query: {
      enabled:
        !!contractAddress && SUPPORTED_CHAINS.includes(targetChainId as any),
    },
  });

  // Get detailed info for each election
  const electionIds = useMemo(() => {
    if (!electionsData) return [];
    return (electionsData as ContractElectionSummary[]).map(
      (election) => election.electionId,
    );
  }, [electionsData]);

  // Prepare contracts for batch reading
  const detailContracts = useMemo(() => {
    if (!electionIds.length) return [];

    return electionIds.flatMap((electionId) => [
      {
        abi,
        address: contractAddress,
        functionName: "getElectionInfo",
        args: [electionId],
      },
      {
        abi,
        address: contractAddress,
        functionName: "getAllVoters",
        args: [electionId],
      },
      {
        abi,
        address: contractAddress,
        functionName: "getElectionStats",
        args: [electionId],
      },
      {
        abi,
        address: contractAddress,
        functionName: "getAllCandidates",
        args: [electionId],
      },
    ]);
  }, [electionIds, contractAddress]);

  // Batch read all detailed data
  const {
    data: detailsData,
    isLoading: isLoadingDetails,
    error: detailsError,
  } = useReadContracts({
    contracts: detailContracts.map((contract) => ({
      ...contract,
      chainId: targetChainId,
    })),
    query: {
      enabled: detailContracts.length > 0,
    },
  });

  // Transform and combine all data - FIXED to use votedVotersCount from electionInfo
  const elections = useMemo(() => {
    if (!electionsData || !detailsData) return [];

    const summaries = electionsData as ContractElectionSummary[];
    const details = detailsData as Array<{ result?: unknown; error?: Error }>;

    return summaries.map((summary, index) => {
      const baseIndex = index * 4;
      const electionId = summary.electionId.toString();

      // Extract data from batch results
      const electionInfoResult = details[baseIndex];
      const allVotersResult = details[baseIndex + 1];
      const electionStatsResult = details[baseIndex + 2];
      const allCandidatesResult = details[baseIndex + 3];

      const electionInfo = electionInfoResult?.result as
        | ContractElectionInfo
        | undefined;
      const allVotersData = allVotersResult?.result as
        | ContractElectionVoterResponse[]
        | undefined;
      const electionStats = electionStatsResult?.result as
        | [bigint, bigint, bigint, bigint, bigint, bigint]
        | undefined;

      // FIXED: Get votedVotersCount from electionInfo, not summary
      const getVotedVotersCount = (): number => {
        // First try from electionInfo (this is where it actually exists)
        if (
          electionInfo?.votedVotersCount !== undefined &&
          electionInfo?.votedVotersCount !== null
        ) {
          const count = Number(electionInfo.votedVotersCount);
          if (!isNaN(count)) return count;
        }

        // Fallback: try from summary (if it exists)
        if (
          summary.votedVotersCount !== undefined &&
          summary.votedVotersCount !== null
        ) {
          const count = Number(summary.votedVotersCount);
          if (!isNaN(count)) return count;
        }

        // Final fallback: count from voters array
        if (allVotersData) {
          const votedCount = allVotersData.filter((voter) => {
            return voter.hasVoted === true;
          }).length;
          return votedCount;
        }

        return 0;
      };

      const getRegisteredVotersCount = (): number => {
        // Try from electionInfo first (more reliable)
        if (
          electionInfo?.registeredVotersCount !== undefined &&
          electionInfo?.registeredVotersCount !== null
        ) {
          const count = Number(electionInfo.registeredVotersCount);
          if (!isNaN(count)) return count;
        }

        // Fallback to summary
        if (
          summary.registeredVotersCount !== undefined &&
          summary.registeredVotersCount !== null
        ) {
          const count = Number(summary.registeredVotersCount);
          if (!isNaN(count)) return count;
        }

        return 0;
      };

      const getAccreditedVotersCount = (): number => {
        // Try from electionInfo first (more reliable)
        if (
          electionInfo?.accreditedVotersCount !== undefined &&
          electionInfo?.accreditedVotersCount !== null
        ) {
          const count = Number(electionInfo.accreditedVotersCount);
          if (!isNaN(count)) return count;
        }

        // Fallback to summary
        if (
          summary.accreditedVotersCount !== undefined &&
          summary.accreditedVotersCount !== null
        ) {
          const count = Number(summary.accreditedVotersCount);
          if (!isNaN(count)) return count;
        }

        return 0;
      };

      console.log(`Election ${electionId} vote counts:`, {
        electionInfo: electionInfo ? "loaded" : "missing",
        votedVotersCountFromElectionInfo: electionInfo?.votedVotersCount,
        accreditedVotersCountFromElectionInfo:
          electionInfo?.accreditedVotersCount,
        registeredVotersCountFromElectionInfo:
          electionInfo?.registeredVotersCount,
        votedVotersCountFromSummary: summary.votedVotersCount,
        accreditedVotersCountFromSummary: summary.accreditedVotersCount,
        registeredVotersCountFromSummary: summary.registeredVotersCount,
        calculatedVotedCount: getVotedVotersCount(),
        calculatedRegisteredCount: getAccreditedVotersCount(),
        calculatedRegisteredCount: getRegisteredVotersCount(),
      });

      // Convert categories from blockchain data
      const categories: Category[] =
        electionInfo?.electionCategories.map((categoryName, idx) => ({
          id: `${electionId}-cat-${idx}`,
          name: categoryName,
        })) || [];

      // Convert candidates using enhanced function
      const allCandidates = allCandidatesResult?.result as
        | ContractElectionInfo[]
        | undefined;

      const candidates: Candidate[] =
        allCandidates?.map((candidate, idx) =>
          convertCandidateFromContractEnhanced(candidate, idx, electionId),
        ) || [];

      // Convert voters for POLLING OFFICERS (LIMITED INFO)
      const pollingOfficerVoters: PollingOfficerVoterView[] =
        allVotersData?.map((voterResponse, idx) => {
          return convertVoterForPollingOfficerEnhanced(
            voterResponse,
            idx,
            electionId,
          );
        }) || [];

      // Convert to standard Voter interface for compatibility
      const voters: Voter[] = pollingOfficerVoters.map((pollingVoter) => ({
        id: pollingVoter.id,
        name: pollingVoter.name,
        matricNumber: pollingVoter.maskedMatricNumber,
        isAccredited: pollingVoter.isAccredited,
        hasVoted: pollingVoter.hasVoted,
      }));

      // Create polling officers and units from the new direct address arrays
      const pollingOfficers: PollingOfficer[] = (
        electionInfo?.pollingOfficers || []
      ).map((address, idx) => ({
        id: `${electionId}-po-${idx}`,
        address: address,
        role: `Polling Officer ${idx + 1}`,
      }));

      const pollingUnits: PollingUnit[] = (
        electionInfo?.pollingUnits || []
      ).map((address, idx) => ({
        id: `${electionId}-pu-${idx}`,
        address: address,
        name: `Polling Unit ${idx + 1}`,
      }));

      // Calculate total votes from candidates
      const totalVotes = candidates.reduce(
        (sum, candidate) => sum + (candidate.voteCount || 0),
        0,
      );

      // Get off-chain election metadata
      const offChainData =
        OffChainDataService.getElectionOffChainData(electionId);

      // Determine accurate election status
      const actualStatus = determineElectionStatus(
        summary.state,
        summary.startTimestamp,
        summary.endTimestamp,
      );

      // FIXED: Use the proper vote counts
      const totalVoters = getRegisteredVotersCount();
      const votedVotersCount = getVotedVotersCount();
      const accreditedVotersCount = getAccreditedVotersCount();

      // Build complete election object
      const election: Election = {
        id: electionId,
        name: summary.electionName,
        startDate: timestampToDateTimeString(summary.startTimestamp),
        endDate: timestampToDateTimeString(summary.endTimestamp),
        status: actualStatus,
        categories,
        totalVoters, // From registeredVotersCount
        totalVotes: votedVotersCount,
        accreditedVoters: accreditedVotersCount,
        candidates,
        voters,
        pollingOfficers,
        pollingUnits,
        createdBy: electionInfo?.createdBy,
        description:
          summary.electionDescription ||
          offChainData?.electionMetadata?.description ||
          `Election for ${summary.electionName}`,
        bannerImage:
          offChainData?.electionMetadata?.bannerImage || "/placeholder.jpg",
        isPublished: true,
        timezone: "UTC",
        metadata: {},
      };

      return election;
    });
  }, [electionsData, detailsData]);

  const isLoading = isLoadingSummary || isLoadingDetails;
  const error = summaryError || detailsError;

  return {
    elections,
    isLoading,
    error,
    refetch: refetchSummary,
  };
};
// Hook for getting a single election with full details - UPDATED for new ABI
// Updated useElectionDetails hook - Fixed to use votedVotersCount from electionInfo

export const useElectionDetails = (
  electionId: string | null,
  preferredChainId?,
) => {
  const { chain } = useAccount();
  const targetChainId = preferredChainId || chain?.id || sepolia.id;
  const contractAddress = useContractAddress(targetChainId);

  const contracts = useMemo(() => {
    if (!electionId) return [];

    const id = BigInt(electionId);
    return [
      {
        abi,
        address: contractAddress,
        functionName: "getElectionInfo",
        args: [id],
        chainId: targetChainId,
        query: {
          enabled: !!contractAddress && id > 0n,
          staleTime: 0,
        },
      },
      {
        abi,
        address: contractAddress,
        functionName: "getAllVoters",
        args: [id],
        chainId: targetChainId,
        query: {
          enabled: !!contractAddress && id > 0n,
          staleTime: 0,
        },
      },
      {
        abi,
        address: contractAddress,
        functionName: "getElectionStats",
        args: [id],
        chainId: targetChainId,
        query: {
          enabled: !!contractAddress && id > 0n,
          staleTime: 0,
        },
      },
    ];
  }, [electionId, contractAddress]);

  const {
    data: contractData,
    isLoading,
    error,
    refetch,
  } = useReadContracts({
    contracts,
    query: {
      enabled: !!electionId,
    },
  });

  const election = useMemo(() => {
    if (!contractData || !electionId) return null;

    const [electionInfoResult, allVotersResult, electionStatsResult] =
      contractData as Array<{
        result?: unknown;
        error?: Error;
      }>;

    const electionInfo = electionInfoResult?.result as
      | ContractElectionInfo
      | undefined;
    const allVotersData = allVotersResult?.result as
      | ContractElectionVoterResponse[]
      | undefined;
    const electionStats = electionStatsResult?.result as
      | [bigint, bigint, bigint, bigint, bigint, bigint]
      | undefined;

    if (!electionInfo) return null;

    // FIXED: Helper functions to get vote counts
    const getVotedVotersCount = (): number => {
      if (
        electionInfo.votedVotersCount !== undefined &&
        electionInfo.votedVotersCount !== null
      ) {
        const count = Number(electionInfo.votedVotersCount);
        if (!isNaN(count)) return count;
      }

      // Fallback: count from voters array
      if (allVotersData) {
        const votedCount = allVotersData.filter((voter) => {
          return voter.hasVoted === true;
        }).length;
        return votedCount;
      }

      return 0;
    };

    const getRegisteredVotersCount = (): number => {
      if (
        electionInfo.registeredVotersCount !== undefined &&
        electionInfo.registeredVotersCount !== null
      ) {
        const count = Number(electionInfo.registeredVotersCount);
        if (!isNaN(count)) return count;
      }

      return 0;
    };

    console.log(`Single election ${electionId} data:`, {
      votersCount: allVotersData?.length || 0,
      stats: electionStats ? "loaded" : "missing",
      votedVotersCount: electionInfo.votedVotersCount,
      registeredVotersCount: electionInfo.registeredVotersCount,
      calculatedVotedCount: getVotedVotersCount(),
      calculatedRegisteredCount: getRegisteredVotersCount(),
    });

    // Convert all data from blockchain
    const categories: Category[] = electionInfo.electionCategories.map(
      (categoryName, idx) => ({
        id: `${electionId}-cat-${idx}`,
        name: categoryName,
      }),
    );

    const candidates: Candidate[] = electionInfo.candidatesList.map(
      (candidate, idx) =>
        convertCandidateFromContractEnhanced(candidate, idx, electionId),
    );

    // Convert voters for POLLING OFFICERS (LIMITED INFO)
    const pollingOfficerVoters: PollingOfficerVoterView[] =
      allVotersData?.map((voterResponse, idx) => {
        return convertVoterForPollingOfficerEnhanced(
          voterResponse,
          idx,
          electionId,
        );
      }) || [];

    // Convert to standard Voter interface for compatibility
    const voters: Voter[] = pollingOfficerVoters.map((pollingVoter) => ({
      id: pollingVoter.id,
      name: pollingVoter.name,
      matricNumber: pollingVoter.maskedMatricNumber,
      isAccredited: pollingVoter.isAccredited,
      hasVoted: pollingVoter.hasVoted,
    }));

    // Create polling officers and units from direct address arrays
    const pollingOfficers: PollingOfficer[] = electionInfo.pollingOfficers.map(
      (address, idx) => ({
        id: `${electionId}-po-${idx}`,
        address: address,
        role: `Polling Officer ${idx + 1}`,
      }),
    );

    const pollingUnits: PollingUnit[] = electionInfo.pollingUnits.map(
      (address, idx) => ({
        id: `${electionId}-pu-${idx}`,
        address: address,
        name: `Polling Unit ${idx + 1}`,
      }),
    );

    const totalVotes = candidates.reduce(
      (sum, candidate) => sum + (candidate.voteCount || 0),
      0,
    );

    // Get off-chain election metadata
    const offChainData =
      OffChainDataService.getElectionOffChainData(electionId);

    // Determine accurate election status
    const actualStatus = determineElectionStatus(
      electionInfo.state,
      electionInfo.startTimestamp,
      electionInfo.endTimestamp,
    );

    // FIXED: Use the proper vote counts
    const totalVoters = getRegisteredVotersCount();
    const votedVotersCount = getVotedVotersCount();

    const election: Election = {
      id: electionId,
      name: electionInfo.electionName,
      startDate: timestampToDateTimeString(electionInfo.startTimestamp),
      endDate: timestampToDateTimeString(electionInfo.endTimestamp),
      status: actualStatus,
      categories,
      totalVoters, // From registeredVotersCount
      totalVotes: votedVotersCount, // FIXED: Use votedVotersCount from electionInfo
      candidates,
      voters,
      pollingOfficers,
      pollingUnits,
      createdBy: electionInfo.createdBy,
      description:
        electionInfo.electionDescription ||
        offChainData?.electionMetadata?.description ||
        `Election for ${electionInfo.electionName}`,
      bannerImage:
        offChainData?.electionMetadata?.bannerImage || "/placeholder.jpg",
      isPublished: true,
      timezone: "UTC",
      metadata: {},
    };

    return election;
  }, [contractData, electionId]);

  return {
    election,
    isLoading,
    error,
    refetch,
  };
};

export function useContractAddress(chainId?: number) {
  const { chain } = useAccount();
  const targetChainId = chainId || chain?.id || sepolia.id; // Default to Sepolia

  return (
    electionAddress[targetChainId as keyof typeof electionAddress] ||
    electionAddress[sepolia.id]
  );
}
