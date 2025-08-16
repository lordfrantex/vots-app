import { createPublicClient, http } from "viem";
import { sepolia, avalancheFuji } from "viem/chains";
import { abi } from "@/contracts/abi";
import {
  electionAddress,
  SUPPORTED_CHAINS,
} from "@/contracts/election-address";

// Create clients for different chains
const clients = {
  [sepolia.id]: createPublicClient({
    chain: sepolia,
    transport: http(),
  }),
  [avalancheFuji.id]: createPublicClient({
    chain: avalancheFuji,
    transport: http(),
  }),
};

// Function to get contract address for specific chain
function getContractAddress(chainId?: number): `0x${string}` {
  const targetChainId = chainId || sepolia.id; // Default to sepolia

  const address =
    electionAddress[targetChainId as keyof typeof electionAddress];

  if (!address) {
    throw new Error(
      `Contract address not found for chain ID: ${targetChainId}`,
    );
  }

  return address;
}

// Function to get the appropriate client for the chain
function getPublicClient(chainId?: number) {
  const targetChainId = chainId || sepolia.id; // Default to sepolia

  const client = clients[targetChainId as keyof typeof clients];

  if (!client) {
    throw new Error(
      `Public client not configured for chain ID: ${targetChainId}`,
    );
  }

  return client;
}

export async function getBasicElectionInfo(
  electionId: string,
  chainId?: number,
) {
  try {
    const contractAddress = getContractAddress(chainId);
    const publicClient = getPublicClient(chainId);
    const id = BigInt(electionId);

    const electionInfo = await publicClient.readContract({
      address: contractAddress,
      abi,
      functionName: "getElectionInfo",
      args: [id],
    });

    return electionInfo;
  } catch (error) {
    console.error("Error fetching basic election info:", error);
    throw new Error(
      `Failed to fetch basic election info: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

// Enhanced function to get full election details
export async function getElectionDetailsServer(
  electionId: string,
  chainId?: number,
) {
  try {
    if (!electionId) return null;

    const contractAddress = getContractAddress(chainId);
    const publicClient = getPublicClient(chainId);
    const id = BigInt(electionId);

    // Step 1: Get basic election info to determine status
    const electionBasicInfo = (await publicClient.readContract({
      address: contractAddress,
      abi,
      functionName: "getElectionInfo",
      args: [id],
    })) as any;

    if (!electionBasicInfo) return null;

    // Step 2: Get additional data based on your needs
    const [allVotersResult, candidatesResult] = await Promise.allSettled([
      publicClient.readContract({
        address: contractAddress,
        abi,
        functionName: "getAllVoters",
        args: [id],
      }),
      publicClient.readContract({
        address: contractAddress,
        abi,
        functionName: "getAllCandidatesInDto",
        args: [id],
      }),
    ]);

    return {
      basicInfo: electionBasicInfo,
      voters:
        allVotersResult.status === "fulfilled" ? allVotersResult.value : null,
      candidates:
        candidatesResult.status === "fulfilled" ? candidatesResult.value : null,
    };
  } catch (error) {
    console.error("Error fetching election details:", error);
    throw new Error(
      `Failed to fetch election details: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

// Utility function to get supported chains
export function getSupportedChains() {
  return SUPPORTED_CHAINS;
}

// Utility function to check if chain is supported
export function isChainSupported(chainId: number): boolean {
  return SUPPORTED_CHAINS.includes(chainId as any);
}
