"use client";

import { useState } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useValidatePollingUnit } from "@/hooks/use-election-write-operations";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  Loader2,
  LogOut,
  Shield,
  Wallet,
} from "lucide-react";
import { usePollingUnitSession } from "@/hooks/use-polling-unit-session";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { CustomConnectButton } from "@/components/ui/custom-connect-button";
import { injected } from "wagmi/connectors";
import { privateKeyToAccount } from "viem/accounts";
import { Hex } from "viem";

interface PollingUnitWalletModalProps {
  isOpen: boolean;
  onClose?: () => void;
  electionId: string;
  electionName: string;
}

export function PollingUnitValidationModal({
  isOpen,
  onClose,
  electionId,
  electionName,
}: PollingUnitWalletModalProps) {
  const { address, isConnected } = useAccount();
  const [privateKey, setPrivateKey] = useState("");
  const [, setError] = useState("");
  const [validationResult, setValidationResult] = useState<boolean | null>(
    null,
  );

  const [validationHash, setValidationHash] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const { initializeSession } = usePollingUnitSession();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();

  const {
    validatePollingUnit,
    isLoading: isProcessing,
    error,
  } = useValidatePollingUnit();

  const handleConnectMetaMask = async () => {
    try {
      setError("");
      setValidationResult(null);
      connect({ connector: injected() });
    } catch (err) {
      console.error("Connection error:", err);
      setError("Failed to connect to MetaMask");
    }
  };

  const handleDisconnect = () => {
    disconnect();
    setValidationResult(null);
    setError("");
  };

  const handleValidatePollingUnit = async () => {
    if (!privateKey.trim()) {
      setValidationResult(false);
      setError("Please enter a private key");
      return;
    }

    setIsValidating(true);
    setValidationResult(null);
    setValidationHash(null);
    setError("");

    try {
      // Initialize session and get both clients
      const { walletClient, publicClient } = await initializeSession(
        privateKey.trim(),
      );

      if (!walletClient || !publicClient) {
        throw new Error("Failed to initialize polling unit session");
      }

      // Derive address from private key
      const cleanPrivateKey = privateKey.trim().replace("0x", "");
      const formattedPrivateKey = `0x${cleanPrivateKey}`;
      const account = privateKeyToAccount(formattedPrivateKey as Hex);
      const derivedAddress = account.address;

      // Check if connected wallet matches derived address
      if (isConnected && address !== derivedAddress) {
        throw new Error("Private key does not match connected wallet");
      }

      // Validate using both clients
      const result = await validatePollingUnit(walletClient, publicClient, {
        electionTokenId: electionId,
      });

      if (result.success) {
        setValidationResult(true);
        setValidationHash(result.hash || null);

        setTimeout(() => {
          if (onClose) onClose();
        }, 1000);
      } else {
        setValidationResult(false);
        setError(result.message || "Validation failed");
      }
    } catch (err: any) {
      // Error handling remains the same
    } finally {
      setIsValidating(false);
    }
  };
  const handleRetry = () => {
    setValidationResult(null);
    setValidationHash(null);
    setPrivateKey("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md bg-white dark:bg-slate-900/95 backdrop-blur-xl border-slate-700/50">
        <DialogHeader>
          <DialogTitle>Polling Unit Validation</DialogTitle>
          <p className="text-sm text-slate-500 mt-2">
            Connect your authorized wallet to access the polling officer
            dashboard for {electionName ? electionName : "this election"}.
          </p>
        </DialogHeader>
        <div className="space-y-4 mt-6">
          {/* Wallet Connection Status */}
          {!isConnected ? (
            <div className="space-y-4">
              <Button
                onClick={handleConnectMetaMask}
                size="lg"
                className="w-full hover:bg-[#233D8A] bg-[#111E42]/80 text-white cursor-pointer"
                disabled={isProcessing}
              >
                <Wallet className="mr-2 h-4 w-4" />
                Connect Wallet
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-slate-600" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-slate-500 rounded-full px-2 text-white">
                    Important
                  </span>
                </div>
              </div>

              <Alert className="bg-amber-500/20 dark:bg-amber-900/20 border-amber-700/50">
                <AlertCircle className="h-4 w-4 text-amber-400" />
                <AlertDescription className="text-amber-700 dark:text-amber-300 text-sm">
                  You must connect the actual polling officer unit. Manual
                  address entry is not supported for security reasons.
                </AlertDescription>
              </Alert>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Connected Wallet Display */}
              <div className="p-4 bg-slate-100/50 dark:bg-slate-800/50 border border-background/50 shadow-sm rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-400" />
                      <span className="text-sm text-green-500 dark:text-green-300 font-medium">
                        Wallet Connected
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 font-mono mt-1">
                      {address?.slice(0, 10)}...{address?.slice(-8)}
                    </p>
                  </div>
                  <Button
                    onClick={handleDisconnect}
                    variant="outline"
                    size="sm"
                    disabled={isProcessing}
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Error Display */}
              {error && (
                <Alert className="bg-red-500/10 border-red-500/20">
                  <AlertCircle className="h-4 w-4 text-red-400" />
                  <AlertDescription className="text-red-400">
                    {error}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </div>

        <div className="grid gap-4 py-4 w-full">
          <div className="space-y-2">
            <Input
              type="password"
              placeholder="Enter polling unit private key"
              value={privateKey}
              onChange={(e) => setPrivateKey(e.target.value)}
              className="bg-slate-100 dark:bg-slate-800"
              disabled={isValidating || isProcessing}
            />
          </div>

          {error && (
            <div className="text-sm text-red-500 dark:text-red-400">
              {error}
            </div>
          )}

          {/* Validation Button */}
          {validationResult === null && (
            <Button
              onClick={handleValidatePollingUnit}
              disabled={!privateKey.trim() || isValidating || isProcessing}
              className="w-full"
            >
              {isValidating || isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Validating...
                </>
              ) : (
                "Validate Polling Unit"
              )}
            </Button>
          )}

          {/* Result States */}
          {validationResult !== null && (
            <div className="space-y-2">
              {/* Success State */}
              {validationResult && (
                <div className="text-center space-y-2">
                  <div className="text-green-600 dark:text-green-400 text-sm">
                    ✅ Polling unit validated successfully!
                  </div>
                  {validationHash && (
                    <div className="text-xs text-gray-500 break-all">
                      Transaction: {validationHash}
                    </div>
                  )}
                  <Button
                    onClick={onClose}
                    variant="default"
                    className="w-full cursor-pointer bg-green-600 hover:bg-green-700"
                  >
                    Proceed to Authentication
                  </Button>
                </div>
              )}

              {/* Failure State */}
              {!validationResult && (
                <div className="text-center space-y-2">
                  <div className="text-red-600 dark:text-red-400 text-sm">
                    ❌ Validation failed
                  </div>
                  <Button
                    onClick={handleRetry}
                    variant="default"
                    className="w-full cursor-pointer bg-gray-700 dark:bg-white hover:bg-gradient-to-tr hover:from-zinc-700 hover:via-55% hover:to-gray-500 hover:text-white"
                  >
                    Try Again
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="mt-6 p-4 bg-slate-500/10 rounded-lg border border-slate-700/30">
          <p className="text-xs text-slate-600 dark:text-slate-300 text-center">
            🗳️ Your wallet will be validated against the election smart
            contract. This requires a blockchain transaction to verify your
            polling unit status.
          </p>
          {isConnected && validationResult === null && !validationHash && (
            <p className="text-xs text-amber-700 dark:text-amber-400 text-center mt-2">
              ⚠️ A small gas fee will be required for validation
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
