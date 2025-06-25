// src/utils/contract-helpers.ts

import type { ValidationData } from "@/types/validation-data";

// These interfaces should match exactly what your ABI expects
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

// Helper function to validate and convert to proper address format
function validateAddress(address: string): `0x${string}` | null {
  if (!address) return null;

  // Remove any whitespace
  const cleanAddress = address.trim();

  // If it doesn't start with 0x, add it
  const prefixedAddress = cleanAddress.startsWith("0x")
    ? cleanAddress
    : `0x${cleanAddress}`;

  // Check if it's a valid Ethereum address format (42 characters total: 0x + 40 hex chars)
  if (!/^0x[a-fA-F0-9]{40}$/.test(prefixedAddress)) {
    console.warn(`Invalid address format: ${address} -> ${prefixedAddress}`);
    return null;
  }

  return prefixedAddress as `0x${string}`;
}

// Helper function to convert string array to address array
function convertToAddressArray(addresses: string[]): readonly `0x${string}`[] {
  return addresses
    .map(validateAddress)
    .filter(
      (address): address is `0x${string}` => address !== null,
    ) as readonly `0x${string}`[];
}

// Helper function to safely convert to string
function safeString(value: any): string {
  if (value === null || value === undefined) return "";
  return String(value).trim();
}

// Helper function to safely convert to bigint (for uint256)
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

export function convertToContractArgs(validationData: ValidationData) {
  console.log("Converting validation data:", validationData);

  try {
    // Handle the nested structure from your validation data
    const basicInfo = validationData.basicInfo;
    const categories = validationData.categories?.categories || [];
    const candidates = validationData.candidates?.candidates || [];
    const voters = validationData.voters?.voters || [];
    const pollingUnits = validationData.polling?.pollingUnits || [];
    const pollingOfficers = validationData.polling?.pollingOfficers || [];

    // Convert candidates to contract format with proper type conversion
    const candidatesList: readonly ContractCandidateInfoDTO[] = candidates.map(
      (candidate: any, index: number) => {
        console.log(`Converting candidate ${index}:`, candidate);

        return {
          name: safeString(candidate.name),
          matricNo: safeString(candidate.matricNo), // Form uses matricNo
          category: safeString(candidate.category),
          voteFor: safeBigInt(candidate.voteFor || 0),
          voteAgainst: safeBigInt(candidate.voteAgainst || 0),
        } as const;
      },
    ) as readonly ContractCandidateInfoDTO[];

    // Convert voters to contract format with proper type conversion
    const votersList: readonly ContractVoterInfoDTO[] = voters.map(
      (voter: any, index: number) => {
        console.log(`Converting voter ${index}:`, voter);

        return {
          name: safeString(voter.name),
          matricNo: safeString(voter.matricNumber), // Form uses matricNumber for voters
        } as const;
      },
    ) as readonly ContractVoterInfoDTO[];

    // Extract and validate polling unit addresses
    const pollingUnitAddressStrings = pollingUnits
      .map((unit: any) => safeString(unit.address))
      .filter((address: string) => address.length > 0);

    const pollingUnitAddresses = convertToAddressArray(
      pollingUnitAddressStrings,
    );
    console.log("Polling unit addresses:", pollingUnitAddresses);

    // Extract and validate polling officer addresses
    const pollingOfficerAddressStrings = pollingOfficers
      .map((officer: any) => safeString(officer.address))
      .filter((address: string) => address.length > 0);

    const pollingOfficerAddresses = convertToAddressArray(
      pollingOfficerAddressStrings,
    );
    console.log("Polling officer addresses:", pollingOfficerAddresses);

    // Extract category names
    const electionCategories: readonly string[] = categories.map(
      (category: any) => safeString(category.name),
    ) as readonly string[];

    // Convert dates to Unix timestamps (bigint for uint256) with proper error handling
    let startTimeStamp: bigint;
    let endTimeStamp: bigint;

    try {
      const startDate = new Date(basicInfo.startDate);
      const endDate = new Date(basicInfo.endDate);

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        throw new Error("Invalid date format");
      }

      // Convert to Unix timestamp (seconds, not milliseconds) as bigint for uint256
      startTimeStamp = BigInt(Math.floor(startDate.getTime() / 1000));
      endTimeStamp = BigInt(Math.floor(endDate.getTime() / 1000));

      // Validate that end date is after start date
      if (endTimeStamp <= startTimeStamp) {
        throw new Error("End date must be after start date");
      }

      // Ensure start date is in the future (at least 1 minute from now)
      const now = BigInt(Math.floor(Date.now() / 1000));
      if (startTimeStamp <= now) {
        console.warn(
          "Start time is in the past, adjusting to 5 minutes from now",
        );
        startTimeStamp = now + BigInt(300); // 5 minutes from now
        endTimeStamp = startTimeStamp + BigInt(3600); // 1 hour duration
      }
    } catch (error) {
      console.error("Date conversion error:", error);
      // Fallback to safe future dates
      const now = BigInt(Math.floor(Date.now() / 1000));
      startTimeStamp = now + BigInt(300); // 5 minutes from now
      endTimeStamp = now + BigInt(3900); // 65 minutes from now
    }

    // Prepare the final arguments with proper types matching ABI
    const contractArgs = [
      startTimeStamp, // uint256 -> bigint
      endTimeStamp, // uint256 -> bigint
      safeString(basicInfo.name || "Untitled Election"), // string
      candidatesList, // CandidateInfoDTO[]
      votersList, // VoterInfoDTO[]
      pollingUnitAddresses, // address[]
      pollingOfficerAddresses, // address[]
      electionCategories, // string[]
    ] as const;

    // Log the converted data for debugging
    console.log("Final contract arguments:", {
      startTimeStamp: startTimeStamp.toString(),
      endTimeStamp: endTimeStamp.toString(),
      electionName: safeString(basicInfo.name),
      candidatesCount: candidatesList.length,
      votersCount: votersList.length,
      pollingUnitsCount: pollingUnitAddresses.length,
      pollingOfficersCount: pollingOfficerAddresses.length,
      categoriesCount: electionCategories.length,
      candidates: candidatesList,
      voters: votersList,
    });

    return contractArgs;
  } catch (error) {
    console.error("Error in convertToContractArgs:", error);
    throw new Error(
      `Failed to convert contract arguments: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

// Helper function to validate contract arguments before submission
export function validateContractArgs(
  args: ReturnType<typeof convertToContractArgs>,
): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  try {
    const [
      startTimeStamp,
      endTimeStamp,
      electionName,
      candidatesList,
      votersList,
      pollingUnitAddresses,
      pollingOfficerAddresses,
      electionCategories,
    ] = args;

    // Validate election name
    if (!electionName || electionName.trim().length === 0) {
      errors.push("Election name is required");
    }

    // Validate candidates
    if (!candidatesList || candidatesList.length === 0) {
      errors.push("At least one candidate is required");
    } else {
      candidatesList.forEach((candidate, index) => {
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

    // Validate voters
    if (!votersList || votersList.length === 0) {
      errors.push("At least one voter is required");
    } else {
      votersList.forEach((voter, index) => {
        if (!voter.name || voter.name.trim().length === 0) {
          errors.push(`Voter ${index + 1}: Name is required`);
        }
        if (!voter.matricNo || voter.matricNo.trim().length === 0) {
          errors.push(`Voter ${index + 1}: Matric number is required`);
        }
      });
    }

    // Validate categories
    if (!electionCategories || electionCategories.length === 0) {
      errors.push("At least one category is required");
    }

    // Validate timestamps (now bigint)
    if (startTimeStamp >= endTimeStamp) {
      errors.push("End time must be after start time");
    }

    // Validate that timestamps are positive bigint values
    if (startTimeStamp <= BigInt(0) || endTimeStamp <= BigInt(0)) {
      errors.push("Invalid timestamp values");
    }

    // Validate addresses format
    pollingUnitAddresses.forEach((address, index) => {
      if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
        errors.push(`Polling unit ${index + 1}: Invalid address format`);
      }
    });

    pollingOfficerAddresses.forEach((address, index) => {
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
