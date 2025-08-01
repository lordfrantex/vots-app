// src/utils/contract-helpers.ts

import type { ValidationData } from "@/types/validation-data";

// Core contract interfaces that match your ABI
export interface ContractCandidateInfoDTO {
  readonly name: string;
  readonly matricNo: string;
  readonly category: string;
  readonly voteFor: bigint;
  readonly voteAgainst: bigint;
}

export interface ContractVoterInfoDTO {
  readonly name: string;
  readonly matricNo: string;
  readonly department: string; // Added department field
  readonly level: bigint;
}

export interface ContractElectionVoterResponse {
  readonly name: string;
  readonly department: string; // Added department field
  readonly level: bigint;
  readonly voterState: number; // 0 = UNKNOWN, 1 = REGISTERED, 2 = ACCREDITED, 3 = VOTED
}

export interface ContractPollingUnitInfoDTO {
  readonly pollRoleName: string; // Changed from 'name' to 'pollRoleName'
  readonly pollAddress: `0x${string}`; // Changed from 'address' to 'pollAddress'
}

export interface ContractPollingOfficerInfoDTO {
  readonly pollRoleName: string; // Changed from 'name' to 'pollRoleName'
  readonly pollAddress: `0x${string}`; // Changed from 'address' to 'pollAddress'
}

// ElectionParams structure for the contract
export interface ContractElectionParams {
  startTimeStamp: bigint;
  endTimeStamp: bigint;
  electionName: string;
  description: string;
  candidatesList: readonly ContractCandidateInfoDTO[];
  votersList: readonly ContractVoterInfoDTO[];
  pollingUnits: readonly ContractPollingUnitInfoDTO[];
  pollingOfficers: readonly ContractPollingOfficerInfoDTO[];
  electionCategories: readonly string[];
}

// Frontend interfaces for extended functionality
export interface ExtendedCandidateInfo {
  // From blockchain
  name: string;
  matricNo: string;
  category: string;
  voteFor?: number;
  voteAgainst?: number;
  voteCount?: number;

  // Frontend-only fields
  id: string;
  photo?: string;
}

export interface ExtendedVoterInfo {
  // From blockchain
  name: string;
  matricNumber: string;
  department: string; // Added department field
  level: string;
  voterState: number;

  // Frontend-only fields
  id: string;
  // Computed fields
  isRegistered: boolean;
  isAccredited: boolean;
  hasVoted: boolean;
}

export interface ExtendedPollingUnitInfo {
  // From blockchain
  name: string;
  address: `0x${string}`;

  // Frontend-only fields
  id: string;
  description?: string;
  location?: string;
}

export interface ExtendedPollingOfficerInfo {
  // From blockchain
  name: string;
  address: `0x${string}`;

  // Frontend-only fields
  id: string;
}

// Helper functions
function validateAddress(address: string): `0x${string}` | null {
  if (!address) return null;
  const cleanAddress = address.trim();
  const prefixedAddress = cleanAddress.startsWith("0x")
    ? cleanAddress
    : `0x${cleanAddress}`;

  if (!/^0x[a-fA-F0-9]{40}$/.test(prefixedAddress)) {
    return null;
  }
  return prefixedAddress as `0x${string}`;
}

function safeString(value: any): string {
  if (value === null || value === undefined) return "";
  return String(value).trim();
}

function safeBigInt(value: any): bigint {
  if (value === null || value === undefined) return BigInt(0);
  if (typeof value === "bigint") return value;
  if (typeof value === "number") return BigInt(Math.floor(value));
  if (typeof value === "string") {
    const parsed = Number.parseInt(value, 10);
    return isNaN(parsed) ? BigInt(0) : BigInt(parsed);
  }
  return BigInt(0);
}

// Conversion functions
export function convertCandidateToContract(
  candidate: ExtendedCandidateInfo,
): ContractCandidateInfoDTO {
  return {
    name: safeString(candidate.name),
    matricNo: safeString(candidate.matricNo),
    category: safeString(candidate.category),
    voteFor: safeBigInt(candidate.voteFor || 0),
    voteAgainst: safeBigInt(candidate.voteAgainst || 0),
  } as const;
}

export function convertVoterToContract(
  voter: ExtendedVoterInfo,
): ContractVoterInfoDTO {
  return {
    name: safeString(voter.name),
    matricNo: safeString(voter.matricNumber),
    department: safeString(voter.department || "General"), // Default department if not provided
    level: safeBigInt(voter.level),
  } as const;
}

export function convertPollingUnitToContract(
  unit: ExtendedPollingUnitInfo,
): ContractPollingUnitInfoDTO {
  const validatedAddress = validateAddress(unit.address);
  if (!validatedAddress) {
    console.error(`Invalid polling unit address: ${unit.address}`);
    throw new Error(`Invalid polling unit address: ${unit.address}`);
  }

  return {
    pollRoleName: safeString(unit.name), // Changed from 'name' to 'pollRoleName'
    pollAddress: validatedAddress, // Changed from 'address' to 'pollAddress'
  } as const;
}

export function convertPollingOfficerToContract(
  officer: ExtendedPollingOfficerInfo,
): ContractPollingOfficerInfoDTO {
  const validatedAddress = validateAddress(officer.address);
  if (!validatedAddress) {
    throw new Error(`Invalid polling officer address: ${officer.address}`);
  }

  return {
    pollRoleName: safeString(officer.name), // Changed from 'name' to 'pollRoleName'
    pollAddress: validatedAddress, // Changed from 'address' to 'pollAddress'
  } as const;
}

// Convert contract data back to frontend format
export function convertCandidateFromContract(
  contractCandidate: ContractCandidateInfoDTO,
  index: number,
): ExtendedCandidateInfo {
  const candidateId = `candidate-${contractCandidate.matricNo}-${index}`;

  return {
    // From blockchain
    name: contractCandidate.name,
    matricNo: contractCandidate.matricNo,
    category: contractCandidate.category,
    voteFor: Number(contractCandidate.voteFor),
    voteAgainst: Number(contractCandidate.voteAgainst),
    voteCount: Number(contractCandidate.voteFor),

    // Frontend defaults
    id: candidateId,
    photo: "/placeholder-user.jpg",
  };
}

export function convertVoterFromContract(
  contractVoter: ContractElectionVoterResponse,
  index: number,
): ExtendedVoterInfo {
  const voterId = `voter-${contractVoter.name}-${index}`;

  return {
    // From blockchain
    name: contractVoter.name,
    matricNumber: "", // This might need to be populated separately
    department: contractVoter.department,
    level: Number(contractVoter.level).toString(),
    voterState: contractVoter.voterState,

    // Frontend fields
    id: voterId,

    // Computed fields
    isRegistered: contractVoter.voterState >= 1,
    isAccredited: contractVoter.voterState >= 2,
    hasVoted: contractVoter.voterState === 3,
  };
}

export function convertPollingUnitFromContract(
  contractUnit: ContractPollingUnitInfoDTO,
  index: number,
): ExtendedPollingUnitInfo {
  const unitId = `polling-unit-${index}`;

  return {
    // From blockchain
    name: contractUnit.pollRoleName, // Changed from 'name' to 'pollRoleName'
    address: contractUnit.pollAddress, // Changed from 'address' to 'pollAddress'

    // Frontend fields
    id: unitId,
  };
}

export function convertPollingOfficerFromContract(
  contractOfficer: ContractPollingOfficerInfoDTO,
  index: number,
): ExtendedPollingOfficerInfo {
  const officerId = `polling-officer-${index}`;

  return {
    // From blockchain
    name: contractOfficer.pollRoleName, // Changed from 'name' to 'pollRoleName'
    address: contractOfficer.pollAddress, // Changed from 'address' to 'pollAddress'

    // Frontend fields
    id: officerId,
  };
}

// Main conversion function for ValidationData to ContractElectionParams
export function convertToContractElectionParams(
  validationData: ValidationData,
): ContractElectionParams {
  try {
    const basicInfo = validationData.basicInfo;
    const categories = validationData.categories?.categories || [];
    const candidates = validationData.candidates?.candidates || [];
    const voters = validationData.voters?.voters || [];
    const pollingUnits = validationData.polling?.pollingUnits || [];
    const pollingOfficers = validationData.polling?.pollingOfficers || [];

    // Convert candidates
    const candidatesList: readonly ContractCandidateInfoDTO[] = candidates.map(
      (candidate: any, index: number) => {
        return convertCandidateToContract(candidate);
      },
    ) as readonly ContractCandidateInfoDTO[];

    // Convert voters with department and level
    const votersList: readonly ContractVoterInfoDTO[] = voters.map(
      (voter: any, index: number) => {
        return convertVoterToContract(voter);
      },
    ) as readonly ContractVoterInfoDTO[];

    // Convert polling units - check if they have valid addresses
    const pollingUnitsList: readonly ContractPollingUnitInfoDTO[] =
      pollingUnits.map((unit: any, index: number) => {
        return convertPollingUnitToContract(unit);
      }) as readonly ContractPollingUnitInfoDTO[];

    // Convert polling officers - check if they have valid addresses
    const pollingOfficersList: readonly ContractPollingOfficerInfoDTO[] =
      pollingOfficers.map((officer: any, index: number) => {
        return convertPollingOfficerToContract(officer);
      }) as readonly ContractPollingOfficerInfoDTO[];

    // Convert categories
    const electionCategories: readonly string[] = categories.map(
      (category: any) => safeString(category.name),
    ) as readonly string[];

    // Handle timestamps
    let startTimeStamp: bigint;
    let endTimeStamp: bigint;

    try {
      const startDate = new Date(basicInfo.startDate);
      const endDate = new Date(basicInfo.endDate);

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        throw new Error("Invalid date format");
      }

      startTimeStamp = BigInt(Math.floor(startDate.getTime() / 1000));
      endTimeStamp = BigInt(Math.floor(endDate.getTime() / 1000));

      if (endTimeStamp <= startTimeStamp) {
        throw new Error("End date must be after start date");
      }

      // Adjust if start time is in the past
      const now = BigInt(Math.floor(Date.now() / 1000));
      if (startTimeStamp <= now) {
        console.warn(
          "Start time is in the past, adjusting to 5 minutes from now",
        );
        startTimeStamp = now + BigInt(300);
        endTimeStamp = startTimeStamp + BigInt(3600);
      }
    } catch (error) {
      console.error("Date conversion error:", error);
      const now = BigInt(Math.floor(Date.now() / 1000));
      startTimeStamp = now + BigInt(300);
      endTimeStamp = now + BigInt(3900);
    }

    const electionParams: ContractElectionParams = {
      startTimeStamp,
      endTimeStamp,
      electionName: safeString(basicInfo.name || "Untitled Election"),
      description: safeString(basicInfo.description || ""),
      candidatesList,
      votersList,
      pollingUnits: pollingUnitsList,
      pollingOfficers: pollingOfficersList,
      electionCategories,
    };

    return electionParams;
  } catch (error) {
    console.error("Error in convertToContractElectionParams:", error);
    throw new Error(
      `Failed to convert to ElectionParams: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

// Validation function
export function validateContractElectionParams(
  params: ContractElectionParams,
): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  try {
    // Basic validation
    if (!params.electionName || params.electionName.trim().length === 0) {
      errors.push("Election name is required");
    }

    if (!params.candidatesList || params.candidatesList.length === 0) {
      errors.push("At least one candidate is required");
    } else {
      params.candidatesList.forEach((candidate, index) => {
        if (!candidate.name || candidate.name.trim().length === 0) {
          errors.push(`Candidate ${index + 1}: Name is required`);
        }
        if (!candidate.matricNo || candidate.matricNo.trim().length === 0) {
          errors.push(`Candidate ${index + 1}: Matric number is required`);
        }
        if (!candidate.category || candidate.category.trim().length === 0) {
          errors.push(`Candidate ${index + 1}: Category is required`);
        }
      });
    }

    // Validate individual voters ONLY if the list exists (even if empty)
    if (params.votersList) {
      params.votersList.forEach((voter, index) => {
        if (!voter.name || voter.name.trim().length === 0) {
          errors.push(`Voter ${index + 1}: Name is required`);
        }
        if (!voter.matricNo || voter.matricNo.trim().length === 0) {
          errors.push(`Voter ${index + 1}: Matric number is required`);
        }
        if (!voter.department || voter.department.trim().length === 0) {
          errors.push(`Voter ${index + 1}: Department is required`);
        }
      });
    }

    if (!params.electionCategories || params.electionCategories.length === 0) {
      errors.push("At least one category is required");
    }

    // Timestamp validation
    if (params.startTimeStamp >= params.endTimeStamp) {
      errors.push("End time must be after start time");
    }

    if (
      params.startTimeStamp <= BigInt(0) ||
      params.endTimeStamp <= BigInt(0)
    ) {
      errors.push("Invalid timestamp values");
    }

    // Address validation
    params.pollingUnits.forEach((unit, index) => {
      if (!/^0x[a-fA-F0-9]{40}$/.test(unit.pollAddress)) {
        errors.push(`Polling unit ${index + 1}: Invalid address format`);
      }
    });

    params.pollingOfficers.forEach((officer, index) => {
      if (!/^0x[a-fA-F0-9]{40}$/.test(officer.pollAddress)) {
        errors.push(`Polling officer ${index + 1}: Invalid address format`);
      }
    });
  } catch (error) {
    errors.push(
      `Validation error: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Utility functions for common operations
export function getVoterStateLabel(state: number): string {
  switch (state) {
    case 0:
      return "Unknown";
    case 1:
      return "Registered";
    case 2:
      return "Accredited";
    case 3:
      return "Voted";
    default:
      return "Unknown";
  }
}

export function formatAddress(address: string): string {
  if (!address) return "";
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
}

export function calculateVotePercentage(
  votes: number,
  totalVotes: number,
): number {
  if (totalVotes === 0) return 0;
  return Math.round((votes / totalVotes) * 100);
}
