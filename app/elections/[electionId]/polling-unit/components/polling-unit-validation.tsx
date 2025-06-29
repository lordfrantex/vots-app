"use client";

import { useMemo, useState, useEffect } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { injected } from "wagmi/connectors";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Wallet,
  MapPin,
  AlertCircle,
  CheckCircle,
  LogOut,
  Loader2,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useValidatePollingUnit } from "@/hooks/use-election-write-operations";

interface PollingUnitWalletModalProps {
  isOpen: boolean;
  onConnect: (walletAddress: string, isValid: boolean) => Promise<void>;
  electionId: string;
  electionName: string | undefined;
}

export function PollingUnitWalletModal({
  isOpen,
  onConnect,
  electionId,
  electionName,
}: PollingUnitWalletModalProps) {
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState("");
  const [validationResult, setValidationResult] = useState<boolean | null>(
    null,
  );

  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const { address, isConnected } = useAccount();

  // Convert electionId to BigInt for contract call
  const electionTokenId = useMemo(() => {
    // Handle different electionId formats
    if (electionId.startsWith("election-")) {
      return BigInt(electionId.replace("election-", ""));
    }
    return BigInt(electionId);
  }, [electionId]);

  // Use the polling unit validation hook
  const {
    validatePollingUnit,
    isLoading: isContractLoading,
    isSuccess: isValidationSuccess,
    error: contractError,
    hash: validationHash,
    isPending: isContractPending,
    isConfirming,
  } = useValidatePollingUnit();

  // Handle validation success
  useEffect(() => {
    if (isValidationSuccess && address) {
      console.log("Polling unit validation successful");
      setValidationResult(true);
      setIsValidating(false);
      onConnect(address, true);
    }
  }, [isValidationSuccess, address, onConnect]);

  // Handle contract errors
  useEffect(() => {
    if (contractError) {
      console.error("Polling unit validation error:", contractError);
      setError(
        contractError.includes("user rejected")
          ? "Transaction was rejected by user"
          : "Failed to validate polling unit. Please ensure you're connected to the correct network and have sufficient gas.",
      );
      setValidationResult(false);
      setIsValidating(false);
    }
  }, [contractError]);

  // Auto-validate when wallet connects
  useEffect(() => {
    if (isConnected && address && !isValidating && validationResult === null) {
      // Auto-validate after a short delay to ensure wallet is fully connected
      const timer = setTimeout(() => {
        handleValidateConnectedWallet();
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [isConnected, address, isValidating, validationResult]);

  const handleValidateConnectedWallet = async () => {
    if (!address) return;

    setIsValidating(true);
    setError("");
    setValidationResult(null);

    try {
      console.log("Validating polling unit wallet:", address);
      console.log("Election Token ID:", electionTokenId);

      // Call the validation function
      const result = await validatePollingUnit(electionTokenId);

      if (!result.success) {
        setError(result.message);
        setValidationResult(false);
        setIsValidating(false);
      }
      // Success will be handled by the useEffect above
    } catch (err) {
      console.error("Validation error:", err);
      setError("Failed to initiate polling unit validation");
      setValidationResult(false);
      setIsValidating(false);
    }
  };

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

  const isProcessing =
    isValidating || isContractPending || isConfirming || isContractLoading;

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md bg-white dark:bg-slate-900/95 backdrop-blur-xl border-slate-700/50">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20 backdrop-blur-sm">
            <MapPin className="h-8 w-8 text-green-700 dark:text-green-400" />
          </div>
          <DialogTitle className="text-xl font-semibold">
            Polling Unit Verification
          </DialogTitle>
          <p className="text-sm text-slate-500 mt-2">
            Connect your authorized polling unit wallet to access the voting
            interface for {electionName ? electionName : "this election"}.
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
                  You must connect the actual polling unit wallet. Manual
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

              {/* Transaction Status */}
              {validationHash && (
                <div className="p-4 bg-green-500/20 dark:bg-green-900/20 border border-green-700/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    {isConfirming ? (
                      <Loader2 className="h-4 w-4 animate-spin text-green-400" />
                    ) : (
                      <CheckCircle className="h-4 w-4 text-green-400" />
                    )}
                    <span className="text-sm text-green-700 dark:text-green-300 font-medium">
                      {isConfirming
                        ? "Confirming Transaction..."
                        : "Transaction Submitted"}
                    </span>
                  </div>
                  <p className="text-xs text-green-600 dark:text-green-400 font-mono break-all">
                    {validationHash}
                  </p>
                </div>
              )}

              {/* Validation Status */}
              {validationResult !== null && (
                <Alert
                  className={
                    validationResult
                      ? "bg-green-500/20 dark:bg-green-900/20 border-green-700/50"
                      : "bg-red-500/20 dark:bg-red-900/20 border-red-700/50"
                  }
                >
                  {validationResult ? (
                    <CheckCircle className="h-4 w-4 text-green-700 dark:text-green-400" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-700 dark:text-red-400" />
                  )}
                  <AlertDescription
                    className={
                      validationResult
                        ? "text-green-600 dark:text-green-300"
                        : "text-red-500 dark:text-red-300"
                    }
                  >
                    {validationResult
                      ? "✅ Wallet verified as authorized polling unit"
                      : "❌ Wallet not authorized as polling unit for this election"}
                  </AlertDescription>
                </Alert>
              )}

              {/* Error Display */}
              {error && (
                <Alert className="bg-red-500/10 border-red-500/20">
                  <AlertCircle className="h-4 w-4 text-red-400" />
                  <AlertDescription className="text-red-400">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              {/* Validate Button */}
              {validationResult === null && !validationHash && (
                <Button
                  onClick={handleValidateConnectedWallet}
                  disabled={isProcessing}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2.5"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {isContractPending && "Preparing Transaction..."}
                      {isConfirming && "Confirming Transaction..."}
                      {isValidating &&
                        !isContractPending &&
                        !isConfirming &&
                        "Validating..."}
                    </>
                  ) : (
                    <>
                      <MapPin className="mr-2 h-4 w-4" />
                      Validate as Polling Unit
                    </>
                  )}
                </Button>
              )}

              {/* Retry Button */}
              {validationResult === false && (
                <Button
                  onClick={handleValidateConnectedWallet}
                  variant="default"
                  className="w-full cursor-pointer bg-gray-700 dark:bg-white hover:bg-gradient-to-tr hover:from-zinc-700 hover:via-55% hover:to-gray-500 hover:text-white"
                  disabled={isProcessing}
                >
                  Try Again
                </Button>
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
