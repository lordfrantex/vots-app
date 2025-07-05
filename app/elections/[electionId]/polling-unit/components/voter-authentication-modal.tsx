"use client";

import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  CheckCircle,
  AlertTriangle,
  Loader2,
  User,
  CreditCard,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import { useValidateVoterForVoting } from "@/hooks/use-election-write-operations";
import { useSessionValidateVoter } from "@/hooks/use-session-validate-voter";

interface VoterAuthenticationModalProps {
  electionId: string;
  pollingUnit: {
    unitId: string;
    unitName: string;
    address: string;
  };
  onAuthenticated: (voter: {
    name: string;
    matricNumber: string;
    isAccredited: boolean;
  }) => void;
  onBack: () => void;
}

const VoterAuthenticationModal = ({
  electionId,
  pollingUnit,
  onAuthenticated,
  onBack,
}: VoterAuthenticationModalProps) => {
  const [matricNumber, setMatricNumber] = useState("");
  const [fullName, setFullName] = useState("");
  const [authenticationResult, setAuthenticationResult] = useState<{
    success: boolean;
    voter?: {
      name: string;
      matricNumber: string;
      isAccredited: boolean;
      hasVoted: boolean;
    };
    error?: string;
  } | null>(null);

  // Convert electionId to BigInt for contract call
  const electionTokenId = useMemo(() => {
    if (electionId.startsWith("election-")) {
      return BigInt(electionId.replace("election-", ""));
    }
    return BigInt(electionId);
  }, [electionId]);

  // Use the session-based hook
  const {
    validateVoterForVoting,
    isLoading: isSessionValidating,
    isSuccess: isValidationSuccess,
    error: contractError,
    hash: validationHash,
    isConfirming: isSessionConfirming,
  } = useSessionValidateVoter();

  const isProcessing = isSessionValidating || isSessionConfirming;

  // Handle validation success
  useEffect(() => {
    if (isValidationSuccess && validationHash) {
      console.log("Voter validation successful");
      setAuthenticationResult({
        success: true,
        voter: {
          name: fullName,
          matricNumber: matricNumber,
          isAccredited: true,
          hasVoted: false,
        },
      });
    }
  }, [isValidationSuccess, validationHash, fullName, matricNumber]);

  // Handle contract errors
  useEffect(() => {
    if (contractError) {
      console.error("Voter validation error:", contractError);
      let errorMessage = contractError;

      // Map contract errors to user-friendly messages
      if (contractError.includes("VoterNotAccredited")) {
        errorMessage =
          "Voter has not been accredited yet. Please contact election officials.";
      } else if (contractError.includes("VoterAlreadyVoted")) {
        errorMessage = "Voter has already voted in this election.";
      } else if (contractError.includes("VoterNotRegistered")) {
        errorMessage = "Voter is not registered for this election.";
      } else if (contractError.includes("InvalidVoterDetails")) {
        errorMessage =
          "Invalid voter details. Please check your name and matriculation number.";
      } else if (contractError.includes("ElectionNotActive")) {
        errorMessage = "Election is not currently active.";
      }

      setAuthenticationResult({
        success: false,
        error: errorMessage,
      });
    }
  }, [contractError]);

  const handleAuthenticate = async () => {
    if (!matricNumber.trim() || !fullName.trim()) {
      setAuthenticationResult({
        success: false,
        error: "Please enter both your name and matriculation number.",
      });
      return;
    }

    // Clear previous results
    setAuthenticationResult(null);

    try {
      console.log("Validating voter for voting:", {
        matricNumber: matricNumber.trim(),
        fullName: fullName.trim(),
        electionTokenId: electionTokenId.toString(),
      });

      // Call the blockchain validation function with CORRECT parameter names
      const result = await validateVoterForVoting({
        voterName: fullName.trim(),
        voterMatricNo: matricNumber.trim(),
        electionTokenId: electionTokenId,
      });

      if (!result.success) {
        setAuthenticationResult({
          success: false,
          error: result.message,
        });
      }
      // Success will be handled by the useEffect above when transaction confirms
    } catch (err) {
      console.error("Authentication error:", err);
      setAuthenticationResult({
        success: false,
        error:
          "Authentication failed. Please check your details and try again.",
      });
    }
  };

  const handleProceedToVote = () => {
    if (authenticationResult?.success && authenticationResult.voter) {
      onAuthenticated({
        name: authenticationResult.voter.name,
        matricNumber: authenticationResult.voter.matricNumber,
        isAccredited: authenticationResult.voter.isAccredited,
      });
    }
  };

  // Reset authentication result when form is cleared
  useEffect(() => {
    if (!matricNumber.trim() && !fullName.trim()) {
      setAuthenticationResult(null);
    }
  }, [matricNumber, fullName]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Voter Authentication</h1>
          <p className="text-slate-400">
            Enter your details to authenticate and proceed to vote
          </p>
        </div>

        {/* Polling Unit Info */}
        <Card className="bg-white dark:bg-slate-900/95 backdrop-blur-xl border-slate-700/20 dark:border-slate-700/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="">Polling Unit Information</CardTitle>
              <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/50">
                Unit ID: {pollingUnit.unitId}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <p className="text-sm text-slate-400">Unit Name:</p>
                <p className="text-sm font-medium">{pollingUnit.unitName}</p>
              </div>
              <div className="flex justify-start items-center space-x-2">
                <p className="text-sm text-slate-400">Status</p>
                <Badge className="bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/50">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Active Voting Session
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Authentication Form */}
        <Card className="bg-white dark:bg-slate-900/95 backdrop-blur-xl border-slate-700/20 dark:border-slate-700/50">
          <CardHeader>
            <CardTitle className="">Voter Authentication</CardTitle>
            <p className="text-slate-400 text-sm">
              Enter your details to authenticate and proceed to vote
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label
                htmlFor="matricNumber"
                className="text-slate-700 dark:text-slate-300"
              >
                Matriculation Number
              </Label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="matricNumber"
                  type="text"
                  placeholder="Enter your matriculation number"
                  value={matricNumber}
                  onChange={(e) => setMatricNumber(e.target.value)}
                  className="pl-10 bg-slate-300/20 dark:bg-slate-800/50 dark:border-slate-600 placeholder-slate-400"
                  disabled={isProcessing}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="fullName"
                className="text-slate-700 dark:text-slate-300"
              >
                Full Name
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="pl-10 bg-slate-300/20 dark:bg-slate-800/50 dark:border-slate-600 placeholder-slate-400"
                  disabled={isProcessing}
                />
              </div>
            </div>

            {/* Transaction Status */}
            {validationHash && (
              <div className="p-4 bg-blue-500/20 dark:bg-blue-900/20 border border-blue-700/50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  {isProcessing ? (
                    <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
                  ) : (
                    <CheckCircle className="h-4 w-4 text-blue-400" />
                  )}
                  <span className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                    {isProcessing
                      ? "Confirming Authentication..."
                      : "Authentication Transaction Submitted"}
                  </span>
                </div>
                <p className="text-xs text-blue-600 dark:text-blue-400 font-mono break-all">
                  {validationHash}
                </p>
              </div>
            )}

            {authenticationResult?.error && (
              <Alert className="bg-red-900/20 border-red-700/50">
                <AlertTriangle className="h-4 w-4 text-red-400" />
                <AlertDescription className="text-red-300">
                  {authenticationResult.error}
                </AlertDescription>
              </Alert>
            )}

            <div className="flex space-x-3">
              <Button
                onClick={onBack}
                variant="outline"
                className="flex-1 bg-transparent"
                disabled={isProcessing}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button
                onClick={handleAuthenticate}
                disabled={
                  !matricNumber.trim() || !fullName.trim() || isProcessing
                }
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {validationHash ? "Confirming..." : "Preparing..."}
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Authenticate
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Authentication Success Dialog */}
        <Dialog
          open={authenticationResult?.success && !!authenticationResult.voter}
          onOpenChange={() => {
            // Prevent closing the dialog by clicking outside or escape
            // User must click "Proceed to Vote" button
          }}
        >
          <DialogContent className="sm:max-w-md bg-white dark:bg-slate-900 border-green-500/50">
            <DialogHeader>
              <div className="text-center">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-8 w-8 text-green-700 dark:text-green-400" />
                </div>
                <DialogTitle className="text-green-700 dark:text-green-400 text-xl">
                  Authentication Successful
                </DialogTitle>
                <p className="text-green-600 dark:text-green-400 text-sm mt-2">
                  You have been verified and can now proceed to vote
                </p>
              </div>
            </DialogHeader>

            <div className="space-y-4 mt-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-400">Name:</span>
                  <span className="font-medium">
                    {authenticationResult?.voter?.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Matriculation:</span>
                  <span className="font-mono">
                    {authenticationResult?.voter?.matricNumber}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Status:</span>
                  <Badge className="bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/50">
                    Accredited & Verified
                  </Badge>
                </div>
              </div>

              <Button
                onClick={handleProceedToVote}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 h-12 cursor-pointer"
              >
                <ArrowRight className="mr-2 h-4 w-4" />
                Proceed to Vote
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <div className="text-center">
          <p className="text-xs text-slate-500">
            Your credentials will be verified against the blockchain election
            contract
          </p>
        </div>
      </div>
    </div>
  );
};

export default VoterAuthenticationModal;
