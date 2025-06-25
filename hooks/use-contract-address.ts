"use client";

import { useReadContract, useReadContracts } from "wagmi";
import { useMemo } from "react";
import { abi } from "@/contracts/abi";
import { electionAddress } from "@/contracts/election-address";
import type { Election } from "@/types/election";
import type { Candidate } from "@/types/candidate";
import type { Voter } from "@/types/voter";
import type { Category } from "@/types/category";
import type { PollingOfficer } from "@/types/polling-officer";
import type { PollingUnit } from "@/types/polling-unit";

// Contract return type definitions
interface ContractElectionSummary {
  electionId: bigint;
  electionName: string;
  state: number;
  startTimestamp: bigint;
  endTimestamp: bigint;
  registeredVotersCount: bigint;
}

interface ContractElectionInfo {
  electionId: bigint;
  createdBy: `0x${string}`;
  electionName: string;
  state: number;
  startTimestamp: bigint;
  endTimestamp: bigint;
  registeredVotersCount: bigint;
  accreditedVotersCount: bigint;
  votedVotersCount: bigint;
  electionCategories: readonly string[];
  candidatesList: readonly {
    name: string;
    matricNo: string;
    category: string;
    voteFor: bigint;
    voteAgainst: bigint;
  }[];
}

interface ContractElectionVoter {
  name: string;
  voterState: number;
}

// Election state enum mapping
const ELECTION_STATE_MAP = {
  0: "UPCOMING" as const,
  1: "ACTIVE" as const,
  2: "COMPLETED" as const,
} as const;

// Helper functions - FIXED to preserve time information
const timestampToDateTimeString = (timestamp: bigint): string => {
  // Convert to milliseconds and create Date object
  const date = new Date(Number(timestamp) * 1000);

  // Return ISO string which preserves full date and time
  // Format: "2024-12-25T14:30:00.000Z"
  return date.toISOString();
};

// Alternative: If you prefer local date-time format
const timestampToLocalDateTime = (timestamp: bigint): string => {
  const date = new Date(Number(timestamp) * 1000);

  // Format as YYYY-MM-DDTHH:mm for datetime-local input compatibility
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

// For backward compatibility, keep the date-only function
const timestampToDateOnly = (timestamp: bigint): string => {
  return new Date(Number(timestamp) * 1000).toISOString().split("T")[0];
};

const generateId = () => Math.random().toString(36).substr(2, 9);

const generateEmail = (name: string, matricNumber: string): string => {
  const cleanName = name.toLowerCase().replace(/\s+/g, ".");
  const cleanMatric = matricNumber.toLowerCase().replace(/[^a-z0-9]/g, "");
  return `${cleanName}.${cleanMatric}@university.edu`;
};

const generateDepartment = (matricNumber: string): string => {
  const parts = matricNumber.split("/");
  if (parts.length >= 2) {
    const deptCode = parts[0].toUpperCase();
    const deptMap: Record<string, string> = {
      CSC: "Computer Science",
      ENG: "Engineering",
      MED: "Medicine",
      LAW: "Law",
      BUS: "Business Administration",
      EDU: "Education",
      ART: "Arts",
      SCI: "Sciences",
      AGR: "Agriculture",
      SOC: "Social Sciences",
    };
    return deptMap[deptCode] || `${deptCode} Department`;
  }
  return "General Studies";
};

export const useContractElections = () => {
  // Step 1: Get all elections summary
  const {
    data: electionsData,
    isLoading: isLoadingSummary,
    error: summaryError,
    refetch: refetchSummary,
  } = useReadContract({
    abi,
    address: electionAddress,
    functionName: "getAllElectionsSummary",
  });

  // Step 2: Get detailed info for each election
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
      // Get election info
      {
        abi,
        address: electionAddress,
        functionName: "getElectionInfo",
        args: [electionId],
      },
      // Get all voters with their current states
      {
        abi,
        address: electionAddress,
        functionName: "getAllVoters",
        args: [electionId],
      },
      // Get all accredited voters
      {
        abi,
        address: electionAddress,
        functionName: "getAllAccreditedVoters",
        args: [electionId],
      },
      // Get all voted voters
      {
        abi,
        address: electionAddress,
        functionName: "getAllVotedVoters",
        args: [electionId],
      },
      // Get election stats
      {
        abi,
        address: electionAddress,
        functionName: "getElectionStats",
        args: [electionId],
      },
      // Get polling officer count
      {
        abi,
        address: electionAddress,
        functionName: "getPollingOfficerCount",
        args: [electionId],
      },
      // Get polling unit count
      {
        abi,
        address: electionAddress,
        functionName: "getPollingUnitCount",
        args: [electionId],
      },
    ]);
  }, [electionIds]);

  // Batch read all detailed data
  const {
    data: detailsData,
    isLoading: isLoadingDetails,
    error: detailsError,
  } = useReadContracts({
    contracts: detailContracts,
    query: {
      enabled: detailContracts.length > 0,
    },
  });

  // Step 3: Transform and combine all data
  const elections = useMemo(() => {
    if (!electionsData || !detailsData) return [];

    const summaries = electionsData as ContractElectionSummary[];
    const details = detailsData as any[];

    return summaries.map((summary, index) => {
      const baseIndex = index * 7; // Each election has 7 contract calls

      // Extract data from batch results
      const electionInfoResult = details[baseIndex];
      const allVotersResult = details[baseIndex + 1];
      const accreditedVotersResult = details[baseIndex + 2];
      const votedVotersResult = details[baseIndex + 3];
      const statsResult = details[baseIndex + 4];
      const pollingOfficerCountResult = details[baseIndex + 5];
      const pollingUnitCountResult = details[baseIndex + 6];

      // Get election info
      const electionInfo = electionInfoResult?.result as
        | ContractElectionInfo
        | undefined;
      const allVotersData = allVotersResult?.result as
        | ContractElectionVoter[]
        | undefined;
      const accreditedVotersData = accreditedVotersResult?.result as
        | ContractElectionVoter[]
        | undefined;
      const votedVotersData = votedVotersResult?.result as
        | ContractElectionVoter[]
        | undefined;
      const statsData = statsResult?.result as
        | [bigint, bigint, bigint, bigint, bigint, bigint]
        | undefined;
      const pollingOfficerCount = pollingOfficerCountResult?.result as
        | bigint
        | undefined;
      const pollingUnitCount = pollingUnitCountResult?.result as
        | bigint
        | undefined;

      // Convert categories
      const categories: Category[] =
        electionInfo?.electionCategories.map((categoryName, idx) => ({
          id: `${summary.electionId}-cat-${idx}`,
          name: categoryName,
        })) || [];

      // Convert candidates
      const candidates: Candidate[] =
        electionInfo?.candidatesList.map((candidate, idx) => ({
          id: `${candidate.matricNo}-${idx}`,
          name: candidate.name,
          matricNo: candidate.matricNo,
          category: candidate.category,
          voteCount: Number(candidate.voteFor),
          photo: "/placeholder-user.jpg",
        })) || [];

      // Create sets for quick lookup of voter states
      const accreditedVoterNames = new Set(
        accreditedVotersData?.map((v) => v.name) || [],
      );
      const votedVoterNames = new Set(
        votedVotersData?.map((v) => v.name) || [],
      );

      // Convert voters with full details
      const voters: Voter[] =
        allVotersData?.map((voter, idx) => {
          const matricNumber = `STU/${new Date().getFullYear()}/${String(idx + 1).padStart(4, "0")}`;
          const isAccredited = accreditedVoterNames.has(voter.name);
          const hasVoted = votedVoterNames.has(voter.name);

          return {
            id: generateId(),
            name: voter.name,
            matricNumber: matricNumber,
            isAccredited,
            hasVoted,
            email: generateEmail(voter.name, matricNumber),
            department: generateDepartment(matricNumber),
          };
        }) || [];

      // Create polling officers and units based on count
      const pollingOfficers: PollingOfficer[] = Array.from(
        { length: Number(pollingOfficerCount || 0) },
        (_, idx) => ({
          id: `${summary.electionId}-po-${idx}`,
          address:
            `0x${Math.random().toString(16).substr(2, 40)}` as `0x${string}`,
          role: `Polling Officer ${idx + 1}`,
        }),
      );

      const pollingUnits: PollingUnit[] = Array.from(
        { length: Number(pollingUnitCount || 0) },
        (_, idx) => ({
          id: `${summary.electionId}-pu-${idx}`,
          address:
            `0x${Math.random().toString(16).substr(2, 40)}` as `0x${string}`,
          name: `Polling Unit ${idx + 1}`,
        }),
      );

      // Calculate total votes
      const totalVotes = candidates.reduce(
        (sum, candidate) => sum + (candidate.voteCount || 0),
        0,
      );

      // Build complete election object with FIXED date/time handling
      const election: Election = {
        id: summary.electionId.toString(),
        name: summary.electionName,
        // ✅ FIXED: Now preserves the actual time you specified
        startDate: timestampToDateTimeString(summary.startTimestamp),
        endDate: timestampToDateTimeString(summary.endTimestamp),
        status:
          ELECTION_STATE_MAP[
            summary.state as keyof typeof ELECTION_STATE_MAP
          ] || "UPCOMING",
        categories,
        totalVoters: Number(summary.registeredVotersCount),
        totalVotes,
        candidates,
        voters,
        pollingOfficers,
        pollingUnits,
        createdBy: electionInfo?.createdBy,
        description: `Election for ${summary.electionName}`,
        bannerImage: "/placeholder.jpg",
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

// Hook for getting a single election with full details
export const useElectionDetails = (electionId: string | null) => {
  const contracts = useMemo(() => {
    if (!electionId) return [];

    const id = BigInt(electionId);
    return [
      {
        abi,
        address: electionAddress,
        functionName: "getElectionInfo",
        args: [id],
      },
      {
        abi,
        address: electionAddress,
        functionName: "getAllVoters",
        args: [id],
      },
      {
        abi,
        address: electionAddress,
        functionName: "getAllAccreditedVoters",
        args: [id],
      },
      {
        abi,
        address: electionAddress,
        functionName: "getAllVotedVoters",
        args: [id],
      },
      {
        abi,
        address: electionAddress,
        functionName: "getElectionStats",
        args: [id],
      },
      {
        abi,
        address: electionAddress,
        functionName: "getPollingOfficerCount",
        args: [id],
      },
      {
        abi,
        address: electionAddress,
        functionName: "getPollingUnitCount",
        args: [id],
      },
    ];
  }, [electionId]);

  const {
    data: contractData,
    isLoading,
    error,
  } = useReadContracts({
    contracts,
    query: {
      enabled: !!electionId,
    },
  });

  const election = useMemo(() => {
    if (!contractData || !electionId) return null;

    const [
      electionInfoResult,
      allVotersResult,
      accreditedVotersResult,
      votedVotersResult,
      statsResult,
      pollingOfficerCountResult,
      pollingUnitCountResult,
    ] = contractData;

    const electionInfo = electionInfoResult?.result as
      | ContractElectionInfo
      | undefined;
    const allVotersData = allVotersResult?.result as
      | ContractElectionVoter[]
      | undefined;
    const accreditedVotersData = accreditedVotersResult?.result as
      | ContractElectionVoter[]
      | undefined;
    const votedVotersData = votedVotersResult?.result as
      | ContractElectionVoter[]
      | undefined;
    const pollingOfficerCount = pollingOfficerCountResult?.result as
      | bigint
      | undefined;
    const pollingUnitCount = pollingUnitCountResult?.result as
      | bigint
      | undefined;

    if (!electionInfo) return null;

    // Convert all data similar to above
    const categories: Category[] = electionInfo.electionCategories.map(
      (categoryName, idx) => ({
        id: `${electionId}-cat-${idx}`,
        name: categoryName,
      }),
    );

    const candidates: Candidate[] = electionInfo.candidatesList.map(
      (candidate, idx) => ({
        id: `${candidate.matricNo}-${idx}`,
        name: candidate.name,
        matricNo: candidate.matricNo,
        category: candidate.category,
        voteCount: Number(candidate.voteFor),
        photo: "/placeholder-user.jpg",
      }),
    );

    const accreditedVoterNames = new Set(
      accreditedVotersData?.map((v) => v.name) || [],
    );
    const votedVoterNames = new Set(votedVotersData?.map((v) => v.name) || []);

    const voters: Voter[] =
      allVotersData?.map((voter, idx) => {
        const matricNumber = `STU/${new Date().getFullYear()}/${String(idx + 1).padStart(4, "0")}`;
        const isAccredited = accreditedVoterNames.has(voter.name);
        const hasVoted = votedVoterNames.has(voter.name);

        return {
          id: generateId(),
          name: voter.name,
          matricNumber: matricNumber,
          isAccredited,
          hasVoted,
          email: generateEmail(voter.name, matricNumber),
          department: generateDepartment(matricNumber),
        };
      }) || [];

    const pollingOfficers: PollingOfficer[] = Array.from(
      { length: Number(pollingOfficerCount || 0) },
      (_, idx) => ({
        id: `${electionId}-po-${idx}`,
        address:
          `0x${Math.random().toString(16).substr(2, 40)}` as `0x${string}`,
        role: `Polling Officer ${idx + 1}`,
      }),
    );

    const pollingUnits: PollingUnit[] = Array.from(
      { length: Number(pollingUnitCount || 0) },
      (_, idx) => ({
        id: `${electionId}-pu-${idx}`,
        address:
          `0x${Math.random().toString(16).substr(2, 40)}` as `0x${string}`,
        name: `Polling Unit ${idx + 1}`,
      }),
    );

    const totalVotes = candidates.reduce(
      (sum, candidate) => sum + (candidate.voteCount || 0),
      0,
    );

    const election: Election = {
      id: electionId,
      name: electionInfo.electionName,
      // ✅ FIXED: Now preserves the actual time you specified
      startDate: timestampToDateTimeString(electionInfo.startTimestamp),
      endDate: timestampToDateTimeString(electionInfo.endTimestamp),
      status:
        ELECTION_STATE_MAP[
          electionInfo.state as keyof typeof ELECTION_STATE_MAP
        ] || "UPCOMING",
      categories,
      totalVoters: Number(electionInfo.registeredVotersCount),
      totalVotes,
      candidates,
      voters,
      pollingOfficers,
      pollingUnits,
      createdBy: electionInfo.createdBy,
      description: `Election for ${electionInfo.electionName}`,
      bannerImage: "/placeholder.jpg",
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
  };
};
