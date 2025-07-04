import { useState } from "react";
import { PreAuthVotingManager } from "@/lib/auth/pre-auth-voting";

// React hook for pre-auth voting
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

  const executeVote = async (voteData: any) => {
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
