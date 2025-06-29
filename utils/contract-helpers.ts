// src/utils/contract-helpers.ts

import type { ValidationData } from "@/types/validation-data";

// These interfaces match exactly what your NEW ABI expects/returns
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
}

export interface ContractElectionVoterResponse {
  readonly name: string;
  readonly voterState: number; // 0 = UNKNOWN, 1 = REGISTERED, 2 = ACCREDITED, 3 = VOTED
}

// NEW: ElectionParams structure for the new ABI
export interface ContractElectionParams {
  startTimeStamp: bigint;
  endTimeStamp: bigint;
  electionName: string;
  description: string;
  candidatesList: readonly ContractCandidateInfoDTO[];
  votersList: readonly ContractVoterInfoDTO[];
  pollingUnitAddresses: readonly `0x${string}`[];
  pollingOfficerAddresses: readonly `0x${string}`[];
  electionCategories: readonly string[];
}

// Extended interfaces for frontend that combine blockchain + off-chain data
export interface ExtendedCandidateInfo {
  // From blockchain
  name: string;
  matricNo: string;
  category: string;
  voteFor?: number;
  voteAgainst?: number;

  // Frontend-only fields (stored separately)
  id: string;
  photo?: string;
  voteCount?: number;
  biography?: string;
  manifesto?: string;
}

// For polling officers - LIMITED INFO for trustless system
export interface PollingOfficerVoterView {
  id: string;
  name: string;
  maskedMatricNumber: string; // Only show partial matric number like "CSC/25/****"
  photo?: string; // For ID verification
  isAccredited: boolean;
  hasVoted: boolean;
  // NO email, department, or full matric number for security
}

// For voters - FULL INFO for voting
export interface ExtendedVoterInfo {
  // From blockchain
  name: string;
  matricNumber: string; // Full matric number for voting login

  // Frontend-only fields (stored separately - database/localStorage/etc)
  id: string;
  email?: string;
  department?: string;
  isAccredited?: boolean;
  hasVoted?: boolean;
  phoneNumber?: string;
  yearOfStudy?: number;
}

// Off-chain data storage interface - UPDATED for trustless system
export interface OffChainElectionData {
  electionId: string;

  // Additional candidate data not on blockchain
  candidatesMetadata: Record<
    string,
    {
      photo?: string;
      biography?: string;
      manifesto?: string;
      socialMedia?: {
        twitter?: string;
        instagram?: string;
      };
    }
  >;

  // Voter data for polling officers (LIMITED INFO)
  pollingOfficerVoterData: Record<
    string, // name as key (since that's what blockchain returns)
    {
      maskedMatricNumber: string; // Partial matric like "CSC/25/****"
      photo?: string;
      department?: string; // For ID verification only
    }
  >;

  // Full voter data for voting (COMPLETE INFO) - encrypted or secured
  voterCredentials: Record<
    string, // full matric number as key
    {
      name: string;
      email?: string;
      department?: string;
      phoneNumber?: string;
      yearOfStudy?: number;
      // This is what voters use to login and vote
    }
  >;

  // Election metadata not on blockchain
  electionMetadata: {
    description?: string;
    bannerImage?: string;
    rules?: string[];
    instructions?: string;
  };
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

function convertToAddressArray(addresses: string[]): readonly `0x${string}`[] {
  return addresses
    .map(validateAddress)
    .filter(
      (address): address is `0x${string}` => address !== null,
    ) as readonly `0x${string}`[];
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

// Helper function to mask matriculation number for polling officers
function maskMatricNumber(fullMatricNo: string): string {
  if (!fullMatricNo) return "****";

  // For matric like "CSC/25/0001", show "CSC/25/****"
  const parts = fullMatricNo.split("/");
  if (parts.length >= 3) {
    return `${parts[0]}/${parts[1]}/****`;
  }

  // For other formats, mask last 4 characters
  if (fullMatricNo.length > 4) {
    return fullMatricNo.substring(0, fullMatricNo.length - 4) + "****";
  }

  return "****";
}

// Convert frontend candidate data to contract format (only blockchain fields)
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

// Convert frontend voter data to contract format (only blockchain fields)
export function convertVoterToContract(
  voter: ExtendedVoterInfo,
): ContractVoterInfoDTO {
  return {
    name: safeString(voter.name),
    matricNo: safeString(voter.matricNumber),
  } as const;
}

// Convert contract candidate data to frontend format (blockchain + defaults for frontend fields)
export function convertCandidateFromContract(
  contractCandidate: ContractCandidateInfoDTO,
  index: number,
  offChainData?: OffChainElectionData,
): ExtendedCandidateInfo {
  const candidateId = `candidate-${contractCandidate.matricNo}-${index}`;
  const metadata =
    offChainData?.candidatesMetadata?.[contractCandidate.matricNo] || {};

  return {
    // From blockchain
    name: contractCandidate.name,
    matricNo: contractCandidate.matricNo,
    category: contractCandidate.category,
    voteFor: Number(contractCandidate.voteFor),
    voteAgainst: Number(contractCandidate.voteAgainst),
    voteCount: Number(contractCandidate.voteFor),

    // Frontend fields (from off-chain data or defaults)
    id: candidateId,
    photo: metadata.photo || "/placeholder-user.jpg",
    biography: metadata.biography,
    manifesto: metadata.manifesto,
  };
}

// Convert blockchain voter response to POLLING OFFICER VIEW (LIMITED INFO)
export function convertVoterForPollingOfficer(
  voterResponse: ContractElectionVoterResponse,
  index: number,
  offChainData?: OffChainElectionData,
): PollingOfficerVoterView {
  const voterId = `voter-po-${index}`;
  const pollingData =
    offChainData?.pollingOfficerVoterData?.[voterResponse.name] || {};

  const convertedVoter: PollingOfficerVoterView = {
    // Limited info for polling officers
    id: voterId,
    name: voterResponse.name,
    maskedMatricNumber:
      pollingData.maskedMatricNumber || maskMatricNumber("UNKNOWN"),
    photo: pollingData.photo || "/placeholder-user.jpg",

    // Status from blockchain - UPDATED for new voter states
    isAccredited: voterResponse.voterState >= 2, // 2 = ACCREDITED, 3 = VOTED
    hasVoted: voterResponse.voterState === 3, // 3 = VOTED
  };

  return convertedVoter;
}

// Convert blockchain voter response to FULL VOTER INFO (for voting interface)
export function convertVoterForVoting(
  voterResponse: ContractElectionVoterResponse,
  fullMatricNo: string, // This comes from voter login
  index: number,
  offChainData?: OffChainElectionData,
): ExtendedVoterInfo {
  const voterId = `voter-full-${fullMatricNo}-${index}`;
  const voterCredentials = offChainData?.voterCredentials?.[fullMatricNo] || {};

  const convertedVoter: ExtendedVoterInfo = {
    // Full info for voting
    id: voterId,
    name: voterResponse.name,
    matricNumber: fullMatricNo,

    // Additional info from off-chain data
    email: voterCredentials.email,
    department: voterCredentials.department,
    phoneNumber: voterCredentials.phoneNumber,
    yearOfStudy: voterCredentials.yearOfStudy,

    // Status from blockchain - UPDATED for new voter states
    isAccredited: voterResponse.voterState >= 2, // 2 = ACCREDITED, 3 = VOTED
    hasVoted: voterResponse.voterState === 3, // 3 = VOTED
  };

  return convertedVoter;
}

// Service functions for managing off-chain data
export class OffChainDataService {
  private static storageKey = "election-offchain-data";

  // Get off-chain data for an election
  static getElectionOffChainData(
    electionId: string,
  ): OffChainElectionData | null {
    try {
      const data = localStorage.getItem(`${this.storageKey}-${electionId}`);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      return null;
    }
  }

  // Save off-chain data for an election
  static saveElectionOffChainData(
    electionId: string,
    data: OffChainElectionData,
  ): void {
    try {
      localStorage.setItem(
        `${this.storageKey}-${electionId}`,
        JSON.stringify(data),
      );
    } catch (error) {
      console.error("Error saving off-chain data:", error);
    }
  }

  // Update candidate metadata
  static updateCandidateMetadata(
    electionId: string,
    matricNo: string,
    metadata: OffChainElectionData["candidatesMetadata"][string],
  ): void {
    const existingData = this.getElectionOffChainData(electionId) || {
      electionId,
      candidatesMetadata: {},
      pollingOfficerVoterData: {},
      voterCredentials: {},
      electionMetadata: {},
    };

    existingData.candidatesMetadata[matricNo] = {
      ...existingData.candidatesMetadata[matricNo],
      ...metadata,
    };

    this.saveElectionOffChainData(electionId, existingData);
  }

  // Save election creation data - UPDATED for trustless system
  static saveElectionCreationData(
    electionId: string,
    validationData: ValidationData,
  ): void {
    const offChainData: OffChainElectionData = {
      electionId,
      candidatesMetadata: {},
      pollingOfficerVoterData: {},
      voterCredentials: {},
      electionMetadata: {
        description: validationData.basicInfo.description,
        bannerImage: "/placeholder.jpg",
      },
    };

    // Save candidate metadata
    validationData.candidates?.candidates?.forEach((candidate: any) => {
      if (candidate.matricNo) {
        offChainData.candidatesMetadata[candidate.matricNo] = {
          photo: candidate.photo || "/placeholder-user.jpg",
          biography: candidate.biography,
          manifesto: candidate.manifesto,
        };
      }
    });

    // Save voter data - SPLIT into polling officer view and full credentials
    validationData.voters?.voters?.forEach((voter: any) => {
      if (voter.matricNumber && voter.name) {
        // Limited data for polling officers (by name)
        offChainData.pollingOfficerVoterData[voter.name] = {
          maskedMatricNumber: maskMatricNumber(voter.matricNumber),
          photo: voter.photo || "/placeholder-user.jpg",
          department: voter.department, // For ID verification only
        };

        // Full credentials for voting (by matric number)
        offChainData.voterCredentials[voter.matricNumber] = {
          name: voter.name,
          email: voter.email,
          department: voter.department,
          phoneNumber: voter.phoneNumber,
          yearOfStudy: voter.yearOfStudy,
        };
      }
    });

    this.saveElectionOffChainData(electionId, offChainData);
  }

  // Verify voter credentials for voting (full matric + name)
  static verifyVoterCredentials(
    electionId: string,
    name: string,
    matricNo: string,
  ): boolean {
    const offChainData = this.getElectionOffChainData(electionId);
    if (!offChainData) return false;

    const credentials = offChainData.voterCredentials[matricNo];
    return credentials && credentials.name.toLowerCase() === name.toLowerCase();
  }
}

// Enhanced conversion functions that use off-chain data
export function convertCandidateFromContractEnhanced(
  contractCandidate: ContractCandidateInfoDTO,
  index: number,
  electionId: string,
): ExtendedCandidateInfo {
  const offChainData = OffChainDataService.getElectionOffChainData(electionId);
  return convertCandidateFromContract(contractCandidate, index, offChainData);
}

// For polling officers - limited voter info
export function convertVoterForPollingOfficerEnhanced(
  voterResponse: ContractElectionVoterResponse,
  index: number,
  electionId: string,
): PollingOfficerVoterView {
  const offChainData = OffChainDataService.getElectionOffChainData(electionId);
  return convertVoterForPollingOfficer(voterResponse, index, offChainData);
}

// For voting interface - full voter info
export function convertVoterForVotingEnhanced(
  voterResponse: ContractElectionVoterResponse,
  fullMatricNo: string,
  index: number,
  electionId: string,
): ExtendedVoterInfo {
  const offChainData = OffChainDataService.getElectionOffChainData(electionId);
  return convertVoterForVoting(
    voterResponse,
    fullMatricNo,
    index,
    offChainData,
  );
}

// NEW: Convert validation data to the new ElectionParams structure
export function convertToContractElectionParams(
  validationData: ValidationData,
): ContractElectionParams {
  console.log("Converting validation data to ElectionParams:", validationData);

  try {
    const basicInfo = validationData.basicInfo;
    const categories = validationData.categories?.categories || [];
    const candidates = validationData.candidates?.candidates || [];
    const voters = validationData.voters?.voters || [];
    const pollingUnits = validationData.polling?.pollingUnits || [];
    const pollingOfficers = validationData.polling?.pollingOfficers || [];

    const candidatesList: readonly ContractCandidateInfoDTO[] = candidates.map(
      (candidate: any, index: number) => {
        console.log(`Converting candidate ${index}:`, candidate);
        return convertCandidateToContract(candidate);
      },
    ) as readonly ContractCandidateInfoDTO[];

    const votersList: readonly ContractVoterInfoDTO[] = voters.map(
      (voter: any, index: number) => {
        return convertVoterToContract(voter);
      },
    ) as readonly ContractVoterInfoDTO[];

    const pollingUnitAddressStrings = pollingUnits
      .map((unit: any) => safeString(unit.address))
      .filter((address: string) => address.length > 0);

    const pollingUnitAddresses = convertToAddressArray(
      pollingUnitAddressStrings,
    );

    const pollingOfficerAddressStrings = pollingOfficers
      .map((officer: any) => safeString(officer.address))
      .filter((address: string) => address.length > 0);

    const pollingOfficerAddresses = convertToAddressArray(
      pollingOfficerAddressStrings,
    );

    const electionCategories: readonly string[] = categories.map(
      (category: any) => safeString(category.name),
    ) as readonly string[];

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
      pollingUnitAddresses,
      pollingOfficerAddresses,
      electionCategories,
    };

    console.log("Final ElectionParams:", {
      startTimeStamp: electionParams.startTimeStamp.toString(),
      endTimeStamp: electionParams.endTimeStamp.toString(),
      electionName: electionParams.electionName,
      description: electionParams.description,
      candidatesCount: electionParams.candidatesList.length,
      votersCount: electionParams.votersList.length,
      pollingUnitsCount: electionParams.pollingUnitAddresses.length,
      pollingOfficersCount: electionParams.pollingOfficerAddresses.length,
      categoriesCount: electionParams.electionCategories.length,
    });

    return electionParams;
  } catch (error) {
    console.error("Error in convertToContractElectionParams:", error);
    throw new Error(
      `Failed to convert to ElectionParams: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

export function validateContractElectionParams(
  params: ContractElectionParams,
): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  try {
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

    if (!params.votersList || params.votersList.length === 0) {
      errors.push("At least one voter is required");
    } else {
      params.votersList.forEach((voter, index) => {
        if (!voter.name || voter.name.trim().length === 0) {
          errors.push(`Voter ${index + 1}: Name is required`);
        }
        if (!voter.matricNo || voter.matricNo.trim().length === 0) {
          errors.push(`Voter ${index + 1}: Matric number is required`);
        }
      });
    }

    if (!params.electionCategories || params.electionCategories.length === 0) {
      errors.push("At least one category is required");
    }

    if (params.startTimeStamp >= params.endTimeStamp) {
      errors.push("End time must be after start time");
    }

    if (
      params.startTimeStamp <= BigInt(0) ||
      params.endTimeStamp <= BigInt(0)
    ) {
      errors.push("Invalid timestamp values");
    }

    params.pollingUnitAddresses.forEach((address, index) => {
      if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
        errors.push(`Polling unit ${index + 1}: Invalid address format`);
      }
    });

    params.pollingOfficerAddresses.forEach((address, index) => {
      if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
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
