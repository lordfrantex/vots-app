import { BrowserProvider, Contract, Wallet } from "ethers";
import {
  electionAddress,
  SUPPORTED_CHAINS,
} from "@/contracts/election-address";
import { abi } from "@/contracts/abi";
import { sepolia } from "wagmi/chains";

interface PreAuthSession {
  sessionId: string;
  expires: number;
  userAddress: string;
  signature: string;
}

interface VoteData {
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

export class PreAuthVotingManager {
  private sessionData: PreAuthSession | null = null;
  private provider: BrowserProvider | null = null;

  constructor() {
    this.loadSession();
  }

  async initializeSession(durationMinutes: number = 30): Promise<boolean> {
    try {
      if (!window.ethereum) {
        throw new Error("MetaMask not found");
      }

      this.provider = new BrowserProvider(window.ethereum);
      const signer = await this.provider.getSigner();
      const userAddress = await signer.getAddress();

      // Generate random session ID using crypto API
      const sessionId = Array.from(crypto.getRandomValues(new Uint8Array(32)))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

      const expires = Math.floor(Date.now() / 1000) + durationMinutes * 60;

      const message = `I authorize this session to vote on my behalf.
Session ID: ${sessionId}
Valid until: ${new Date(expires * 1000).toISOString()}
Address: ${userAddress}`;

      const signature = await signer.signMessage(message);

      this.sessionData = {
        sessionId,
        expires,
        userAddress,
        signature,
      };

      this.saveSession();
      return true;
    } catch (error) {
      console.error("Failed to initialize session:", error);
      return false;
    }
  }

  isSessionValid(): boolean {
    if (!this.sessionData) return false;
    return Date.now() / 1000 < this.sessionData.expires;
  }

  async executeVote(
    voteData: VoteData,
  ): Promise<{ success: boolean; hash?: string }> {
    if (!this.isSessionValid()) {
      throw new Error("Session expired or not initialized");
    }

    try {
      if (!this.provider) {
        this.provider = new BrowserProvider(window.ethereum);
      }

      const signer = await this.provider.getSigner();
      const network = await this.provider.getNetwork();
      // First, add type for supported chain IDs
      type SupportedChainId = (typeof SUPPORTED_CHAINS)[number];
      // Convert chainId to number and validate
      const chainId = Number(network.chainId) as SupportedChainId;

      // Check if chain is supported
      if (!SUPPORTED_CHAINS.includes(chainId)) {
        throw new Error("Unsupported chain");
      }

      const contractAddress =
        electionAddress[chainId] || electionAddress[sepolia.id];

      const contract = new Contract(contractAddress, abi, signer);

      const tx = await contract.voteCandidates(
        voteData.voterMatricNo,
        voteData.voterName,
        voteData.candidatesList,
        voteData.electionTokenId,
        {
          value: BigInt(0),
          gasLimit: BigInt(500000),
        },
      );

      const receipt = await tx.wait();

      return {
        success: true,
        hash: receipt?.hash,
      };
    } catch (error) {
      console.error("Vote execution failed:", error);
      return { success: false };
    }
  }
  private saveSession(): void {
    // Keep session in memory only for security
  }

  private loadSession(): void {
    // Session is kept in memory only
  }

  clearSession(): void {
    this.sessionData = null;
  }
}

// React hook
import { useState } from "react";

export function usePreAuthVoting() {
  const [manager] = useState(() => new PreAuthVotingManager());
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const initializeSession = async (durationMinutes: number = 30) => {
    setIsLoading(true);
    try {
      const success = await manager.initializeSession(durationMinutes);
      setIsSessionActive(success);
      return success;
    } finally {
      setIsLoading(false);
    }
  };

  const executeVote = async (voteData: VoteData) => {
    if (!manager.isSessionValid()) {
      throw new Error("Please initialize voting session first");
    }

    setIsLoading(true);
    try {
      return await manager.executeVote(voteData);
    } finally {
      setIsLoading(false);
    }
  };

  const clearSession = () => {
    manager.clearSession();
    setIsSessionActive(false);
  };

  return {
    initializeSession,
    executeVote,
    clearSession,
    isSessionActive: isSessionActive && manager.isSessionValid(),
    isLoading,
  };
}
