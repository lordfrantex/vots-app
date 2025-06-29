"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  UserCheck,
  Loader2,
  Hash,
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
} from "lucide-react";

interface InputAccreditationPanelProps {
  onAccredit: (
    matricNumber: string,
  ) => Promise<{ success: boolean; message: string; txHash?: string }>;
  isAccrediting: boolean;
  isConfirming: boolean;
  isSuccess: boolean;
  txHash?: string;
  electionId: string;
  voters: Array<{ matricNumber: string; isAccredited: boolean; name: string }>;
}

export function InputAccreditationPanel({
  onAccredit,
  isAccrediting,
  isConfirming,
  isSuccess,
  txHash,
  electionId,
  voters,
}: InputAccreditationPanelProps) {
  const [matricNumber, setMatricNumber] = useState("");
  const [accreditationHistory, setAccreditationHistory] = useState<
    Array<{
      matricNumber: string;
      timestamp: string;
      success: boolean;
      message: string;
      txHash?: string;
      status: "pending" | "confirmed" | "failed";
    }>
  >([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [currentTxHash, setCurrentTxHash] = useState<string | null>(null);

  // Check if voter is already accredited
  const isVoterAlreadyAccredited = (matric: string) => {
    return voters.find(
      (voter) =>
        voter.matricNumber.toLowerCase() === matric.toLowerCase().trim(),
    )?.isAccredited;
  };

  // Handle transaction confirmation
  useEffect(() => {
    if (isSuccess && currentTxHash) {
      setSuccess(`✅ Successfully accredited voter!`);

      // Update history entry to confirmed
      setAccreditationHistory((prev) =>
        prev.map((entry) =>
          entry.txHash === currentTxHash && entry.status === "pending"
            ? {
                ...entry,
                status: "confirmed",
                message: "Successfully accredited",
              }
            : entry,
        ),
      );

      setCurrentTxHash(null);

      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccess("");
      }, 5000);
    }
  }, [isSuccess, currentTxHash]);

  // Handle accreditation with proper transaction confirmation
  const handleAccredit = async () => {
    const trimmedMatric = matricNumber.trim();

    // Clear previous messages
    setError("");
    setSuccess("");

    // Only check if input is not empty
    if (!trimmedMatric) {
      setError("Please enter a matriculation number");
      return;
    }

    // Check for duplicate accreditation before sending to contract
    if (isVoterAlreadyAccredited(trimmedMatric)) {
      const voterName = voters.find(
        (voter) =>
          voter.matricNumber.toLowerCase() === trimmedMatric.toLowerCase(),
      )?.name;
      const errorMsg = `Error: Voter ${voterName ? `(${voterName}) ` : ""}is already accredited`;
      setError(errorMsg);

      // Add to history as failed
      setAccreditationHistory((prev) => [
        {
          matricNumber: trimmedMatric,
          timestamp: new Date().toISOString(),
          success: false,
          message: errorMsg,
          status: "failed",
        },
        ...prev.slice(0, 9),
      ]);
      return;
    }

    console.log("=== ATTEMPTING ACCREDITATION ===");
    console.log("Matric Number:", trimmedMatric);
    console.log("Election ID:", electionId);

    try {
      // Call the accreditation function
      const result = await onAccredit(trimmedMatric);

      console.log("=== ACCREDITATION RESULT ===");
      console.log("Success:", result.success);
      console.log("Message:", result.message);
      console.log("Transaction Hash:", result.txHash);

      if (result.success) {
        // Show pending message
        setSuccess(
          `Transaction submitted! Waiting for blockchain confirmation...`,
        );
        setCurrentTxHash(result.txHash || "");
        setMatricNumber(""); // Clear input for next voter

        // Add to history with pending status
        const historyEntry = {
          matricNumber: trimmedMatric,
          timestamp: new Date().toISOString(),
          success: true,
          message: "Transaction submitted",
          txHash: result.txHash,
          status: "pending" as const,
        };

        setAccreditationHistory((prev) => [historyEntry, ...prev.slice(0, 9)]);
      } else {
        setError(result.message);

        // Add failed attempt to history
        setAccreditationHistory((prev) => [
          {
            matricNumber: trimmedMatric,
            timestamp: new Date().toISOString(),
            success: false,
            message: result.message,
            status: "failed",
          },
          ...prev.slice(0, 9),
        ]);
      }
    } catch (error) {
      console.error("=== ACCREDITATION ERROR ===");
      console.error("Full error object:", error);
      console.error(
        "Error message:",
        error instanceof Error ? error.message : "Unknown error",
      );
      console.error(
        "Error stack:",
        error instanceof Error ? error.stack : "No stack trace",
      );

      // Try to extract more detailed error information
      if (error && typeof error === "object") {
        console.error("Error details:", JSON.stringify(error, null, 2));

        // Check for common error properties
        const errorObj = error as Record<string, unknown>;
        if (errorObj.cause) {
          console.error("Error cause:", errorObj.cause);
        }
        if (errorObj.reason) {
          console.error("Error reason:", errorObj.reason);
        }
        if (errorObj.data) {
          console.error("Error data:", errorObj.data);
        }
        if (errorObj.code) {
          console.error("Error code:", errorObj.code);
        }
      }

      const errorMessage =
        error instanceof Error ? error.message : "Failed to accredit voter";
      setError(`Contract Error: ${errorMessage}`);

      // Add failed attempt to history
      setAccreditationHistory((prev) => [
        {
          matricNumber: trimmedMatric,
          timestamp: new Date().toISOString(),
          success: false,
          message: errorMessage,
          status: "failed",
        },
        ...prev.slice(0, 9),
      ]);
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isAccrediting && matricNumber.trim()) {
      handleAccredit();
    }
  };

  // Clear input
  const handleClear = () => {
    setMatricNumber("");
    setError("");
    setSuccess("");
  };

  // Get status icon for history entries
  const getStatusIcon = (entry: (typeof accreditationHistory)[0]) => {
    switch (entry.status) {
      case "confirmed":
        return (
          <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
        );
      case "pending":
        return (
          <Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-400 animate-pulse" />
        );
      case "failed":
        return (
          <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
        );
      default:
        return (
          <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
        );
    }
  };

  // Get status color for history entries
  const getStatusColor = (entry: (typeof accreditationHistory)[0]) => {
    switch (entry.status) {
      case "confirmed":
        return "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700/50";
      case "pending":
        return "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700/50";
      case "failed":
        return "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700/50";
      default:
        return "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700/50";
    }
  };

  // Get status text color
  const getStatusTextColor = (entry: (typeof accreditationHistory)[0]) => {
    switch (entry.status) {
      case "confirmed":
        return "text-green-700 dark:text-green-300";
      case "pending":
        return "text-yellow-700 dark:text-yellow-300";
      case "failed":
        return "text-red-700 dark:text-red-300";
      default:
        return "text-red-700 dark:text-red-300";
    }
  };

  return (
    <div className="space-y-6">
      {/* Main Accreditation Panel */}
      <Card className="bg-white dark:bg-slate-900/50 dark:border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            Voter Accreditation
          </CardTitle>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Enter matriculation number to accredit voter instantly
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Input Section */}
          <div className="space-y-3">
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Enter matriculation number"
                value={matricNumber}
                onChange={(e) => setMatricNumber(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isAccrediting || isConfirming}
                className="pl-10 bg-slate-50 dark:bg-slate-800/50 border-slate-300 dark:border-slate-600 placeholder-slate-400 focus:border-blue-500 text-center font-mono text-lg"
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleAccredit}
                disabled={isAccrediting || isConfirming || !matricNumber.trim()}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5"
              >
                {isAccrediting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : isConfirming ? (
                  <>
                    <Clock className="mr-2 h-4 w-4 animate-pulse" />
                    Confirming...
                  </>
                ) : (
                  <>
                    <UserCheck className="mr-2 h-4 w-4" />
                    Accredit Voter
                  </>
                )}
              </Button>

              <Button
                onClick={handleClear}
                variant="outline"
                disabled={isAccrediting || isConfirming}
                className="px-4 bg-transparent"
              >
                Clear
              </Button>
            </div>
          </div>

          {/* Transaction Confirmation Status */}
          {isConfirming && txHash && (
            <Alert className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700/50">
              <Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-400 animate-pulse" />
              <AlertDescription className="text-yellow-800 dark:text-yellow-300">
                <div className="space-y-1">
                  <p>⏳ Waiting for blockchain confirmation...</p>
                  <p className="text-xs font-mono break-all">TX: {txHash}</p>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Success Message */}
          {success && (
            <Alert className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700/50">
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
              <AlertDescription className="text-green-800 dark:text-green-300">
                {success}
              </AlertDescription>
            </Alert>
          )}

          {/* Error Message */}
          {error && (
            <Alert className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700/50">
              <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
              <AlertDescription className="text-red-800 dark:text-red-300">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {/* Instructions */}
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700/50">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div className="space-y-2">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-300">
                  Smart Contract Accreditation Process:
                </p>
                <ul className="text-xs text-blue-800 dark:text-blue-400 space-y-1">
                  <li>• System checks for duplicate accreditation</li>
                  <li>• MetaMask prompts for transaction confirmation</li>
                  <li>• Transaction is submitted to blockchain</li>
                  <li>• Wait for blockchain confirmation</li>
                  <li>• Success confirmation after transaction is mined</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Accreditation History */}
      {accreditationHistory.length > 0 && (
        <Card className="bg-white dark:bg-slate-900/50 dark:border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-slate-900 dark:text-slate-100 text-lg">
              Recent Accreditations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {accreditationHistory.map((entry, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border ${getStatusColor(entry)}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(entry)}
                      <span className="font-mono text-sm font-medium">
                        {entry.matricNumber}
                      </span>
                      <span className="text-xs px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 capitalize">
                        {entry.status}
                      </span>
                    </div>
                    <span className="text-xs text-slate-500">
                      {new Date(entry.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className={`text-xs mt-1 ${getStatusTextColor(entry)}`}>
                    {entry.message}
                  </p>
                  {entry.txHash && (
                    <p className="text-xs mt-1 font-mono text-slate-500 break-all">
                      TX: {entry.txHash}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
