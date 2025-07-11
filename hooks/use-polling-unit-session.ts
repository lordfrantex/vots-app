// hooks/use-polling-unit-session.ts
import { useState, useEffect } from "react";
import {
  createWalletClient,
  http,
  WalletClient,
  publicActions,
  Hex,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia, avalancheFuji } from "viem/chains";

interface PollingUnitSession {
  privateKey: string;
  isValid: boolean;
  walletClient: WalletClient | null;
}

export function usePollingUnitSession() {
  const [session, setSession] = useState<PollingUnitSession>({
    privateKey: "",
    isValid: false,
    walletClient: null,
  });

  // Initialize session from sessionStorage on mount
  useEffect(() => {
    const storedSession = sessionStorage.getItem("pollingUnitSession");
    if (storedSession) {
      try {
        const { privateKey } = JSON.parse(storedSession);
        if (privateKey) {
          initializeSession(privateKey);
        }
      } catch (error) {
        console.error("Failed to restore session:", error);
        clearSession();
      }
    }
  }, []);

  const initializeSession = async (privateKey: string) => {
    try {
      // Clean the private key (remove 0x prefix if present, then add it back)
      const cleanPrivateKey = privateKey.replace("0x", "");
      const formattedPrivateKey = `0x${cleanPrivateKey}`;

      // Create account from private key
      const account = privateKeyToAccount(<Hex>formattedPrivateKey);

      // Initialize wallet client with public actions for transaction receipts
      const client = createWalletClient({
        account,
        chain: sepolia, // Explicitly specify chain
        transport: http(),
      }).extend(publicActions);

      // Store session
      const sessionData = {
        privateKey: formattedPrivateKey,
        isValid: true,
        walletClient: client,
      };

      setSession(sessionData);

      if (sessionStorage.getItem("pollingUnitSession")) {
        sessionStorage.removeItem("pollingUnitSession");
      }
      sessionStorage.setItem(
        "pollingUnitSession",
        JSON.stringify({ privateKey: formattedPrivateKey }),
      );

      console.log("Polling unit session initialized successfully");
      return client;
    } catch (error) {
      console.error("Failed to initialize polling unit session:", error);
      clearSession();
      return null;
    }
  };

  const clearSession = () => {
    setSession({
      privateKey: "",
      isValid: false,
      walletClient: null,
    });
    sessionStorage.removeItem("pollingUnitSession");
  };

  const isSessionValid = () => {
    return session.isValid && session.walletClient !== null;
  };

  return {
    session,
    initializeSession,
    clearSession,
    isSessionValid,
  };
}
