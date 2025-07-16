// hooks/use-polling-unit-session.ts
import { useState, useEffect } from "react";
import {
  createWalletClient,
  http,
  WalletClient,
  publicActions,
  Hex,
  PublicClient,
  createPublicClient,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia, avalancheFuji } from "viem/chains";

interface PollingUnitSession {
  privateKey: string;
  isValid: boolean;
  walletClient: WalletClient | null;
  publicClient?: PublicClient | null;
}

export function usePollingUnitSession() {
  const [session, setSession] = useState<PollingUnitSession>({
    privateKey: "",
    isValid: false,
    walletClient: null,
  });
  const [isInitializing, setIsInitializing] = useState(false);

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
    setIsInitializing(true);
    try {
      const cleanPrivateKey = privateKey.trim().replace("0x", "");
      if (!cleanPrivateKey) {
        throw new Error("Empty private key");
      }

      const formattedPrivateKey = `0x${cleanPrivateKey}`;
      const account = privateKeyToAccount(<Hex>formattedPrivateKey);

      // Create both wallet client and public client
      const walletClient = createWalletClient({
        account,
        chain: sepolia,
        transport: http(),
      });

      const publicClient = createPublicClient({
        chain: sepolia,
        transport: http(),
      });

      // Store session
      const sessionData = {
        privateKey: formattedPrivateKey,
        isValid: true,
        walletClient,
        publicClient, // Add public client to session
      };

      setSession(sessionData);
      sessionStorage.setItem(
        "pollingUnitSession",
        JSON.stringify({ privateKey: formattedPrivateKey }),
      );

      return { walletClient, publicClient };
    } catch (error) {
      console.error("Failed to initialize polling unit session:", error);
      clearSession();
      throw error;
    } finally {
      setIsInitializing(false);
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
    isInitializing,
  };
}
