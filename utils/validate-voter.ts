// utils/validate-voter.ts
import { createPublicClient, createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { abi } from "@/contracts/abi";
import { getContractAddress } from "@/hooks/use-election-write-operations";
import type { ValidateVoterForVotingParams } from "@/hooks/use-election-write-operations";

// You'll need to configure these based on your chain
import { mainnet, polygon, sepolia } from "viem/chains"; // Import your specific chain

const getChain = (chainId: number) => {
  // Map your chainId to the appropriate chain
  switch (chainId) {
    case 1:
      return mainnet;
    case 137:
      return polygon;
    case 11155111:
      return sepolia;
    default:
      throw new Error(`Unsupported chain ID: ${chainId}`);
  }
};

export async function validateVoterForVoting(
  params: ValidateVoterForVotingParams,
  chainId: number = 1, // Default to mainnet, adjust as needed
  privateKey?: string, // Optional if you have a server-side private key
): Promise<{ success: boolean; message: string; hash?: string }> {
  try {
    const chain = getChain(chainId);
    const contractAddress = getContractAddress(chainId);

    if (!contractAddress) {
      throw new Error("Contract not deployed on this network");
    }

    const publicClient = createPublicClient({
      chain,
      transport: http(),
    });

    // If you have a server-side private key for transactions
    if (privateKey) {
      const account = privateKeyToAccount(privateKey as `0x${string}`);
      const walletClient = createWalletClient({
        account,
        chain,
        transport: http(),
      });

      const hash = await walletClient.writeContract({
        address: contractAddress,
        abi,
        functionName: "validateVoterForVoting",
        args: [params.voterMatricNo, params.voterName, params.electionTokenId],
      });

      const receipt = await publicClient.waitForTransactionReceipt({ hash });

      if (receipt.status === "success") {
        return {
          success: true,
          message: "Voter validated successfully",
          hash,
        };
      } else {
        throw new Error("Transaction failed");
      }
    }
  } catch (err: any) {
    console.error("Validate voter error:", err);
    let errorMessage = "Voter validation failed";

    if (err instanceof Error) {
      if (err.message.includes("VoterNotAccredited")) {
        errorMessage = "Voter has not been accredited yet";
      } else if (err.message.includes("VoterAlreadyVoted")) {
        errorMessage = "Voter has already voted";
      } else if (err.message.includes("VoterNotRegistered")) {
        errorMessage = "Voter not registered";
      } else if (err.message.includes("InvalidVoterDetails")) {
        errorMessage = "Invalid voter details provided";
      } else if (err.message.includes("ElectionNotActive")) {
        errorMessage = "Election is not currently active";
      } else {
        errorMessage = err.message;
      }
    }

    return { success: false, message: errorMessage };
  }
}
