"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  User,
  MapPin,
  CheckCircle,
  AlertCircle,
  Loader2,
  Shield,
  ExternalLink,
} from "lucide-react";
import type { PollingOfficerVoterView } from "@/utils/contract-helpers";

interface AccreditationInterfaceProps {
  selectedVoter: PollingOfficerVoterView | null;
  onAccredit: (
    voterId: string,
  ) => Promise<{ success: boolean; message: string }>;
  isAccrediting?: boolean;
  accreditationSuccess?: boolean;
}

export function AccreditationInterface({
  selectedVoter,
  onAccredit,
  isAccrediting = false,
  accreditationSuccess = false,
}: AccreditationInterfaceProps) {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [accreditationResult, setAccreditationResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const handleAccreditClick = () => {
    if (selectedVoter && !selectedVoter.isAccredited) {
      setShowConfirmModal(true);
    }
  };

  const handleConfirmAccreditation = async () => {
    if (!selectedVoter) return;

    setAccreditationResult(null);

    try {
      const result = await onAccredit(selectedVoter.id);
      setAccreditationResult(result);
      setShowConfirmModal(false);
    } catch (error) {
      setAccreditationResult({
        success: false,
        message:
          error instanceof Error ? error.message : "Accreditation failed",
      });
      setShowConfirmModal(false);
    }
  };

  const getStatusColor = (voter: PollingOfficerVoterView) => {
    if (voter.hasVoted) {
      return "bg-blue-500/20 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-700/50";
    } else if (voter.isAccredited) {
      return "bg-green-500/20 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-700/50";
    } else {
      return "bg-yellow-500/20 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-700/50";
    }
  };

  const getStatusText = (voter: PollingOfficerVoterView) => {
    if (voter.hasVoted) {
      return "Voted";
    } else if (voter.isAccredited) {
      return "Accredited";
    } else {
      return "Pending";
    }
  };

  if (!selectedVoter) {
    return (
      <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-700/50">
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <User className="h-12 w-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">
              Select a voter to view details and accredit
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="bg-white dark:bg-slate-900/50 dark:border-slate-700/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-slate-500">
              Voter Details (Polling Officer View)
            </CardTitle>
            <Badge className={getStatusColor(selectedVoter)}>
              {getStatusText(selectedVoter)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Security Notice */}
          <div className="bg-blue-300/20 dark:bg-blue-900/20 border border-blue-700/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <p className="font-medium text-blue-600 dark:text-blue-400">
                Trustless System
              </p>
            </div>
            <p className="text-sm text-blue-500 dark:text-slate-300">
              You can only see limited voter information for security. Full
              credentials are hidden to prevent vote buying and coercion.
            </p>
          </div>

          {/* Voter Information - LIMITED FOR POLLING OFFICERS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="bg-slate-400/30 dark:bg-slate-700/50 p-2 rounded-lg">
                  <User className="h-4 w-4 text-slate-500" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">Full Name</p>
                  <p className="font-medium  text-indigo-950dark:text-slate-100">
                    {selectedVoter.name}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="bg-slate-400/30 dark:bg-slate-700/50 p-2 rounded-lg">
                  <MapPin className="h-4 w-4 text-slate-500" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">Matriculation Number</p>
                  <p className="font-medium  text-indigo-950dark:text-slate-100 font-mono">
                    {selectedVoter.maskedMatricNumber}
                  </p>
                  <p className="text-xs text-slate-500">Masked for security</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="bg-slate-400/30 dark:bg-slate-700/50 p-2 rounded-lg">
                  <User className="h-4 w-4 text-slate-500" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">Photo ID</p>
                  <div className="w-12 h-12 bg-slate-700 rounded-lg flex items-center justify-center">
                    <User className="h-8 w-8 text-slate-500" />
                  </div>
                  <p className="text-xs text-slate-500">
                    For verification only
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Blockchain Status */}
          {isAccrediting && (
            <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Loader2 className="h-5 w-5 text-blue-400 animate-spin" />
                <p className="font-medium text-blue-400">
                  Processing Blockchain Transaction
                </p>
              </div>
              <p className="text-sm text-slate-300">
                Please wait while the accreditation is being recorded on the
                blockchain...
              </p>
            </div>
          )}

          {/* Accreditation Status */}
          {selectedVoter.isAccredited && (
            <div className="bg-green-500/20 dark:bg-green-900/20 border border-green-700/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <p className="font-medium text-green-400">Voter Accredited</p>
              </div>
              <p className="text-sm text-slate-300">
                This voter has been successfully accredited for voting.
              </p>
              {selectedVoter.hasVoted && (
                <p className="text-sm text-blue-300 mt-2">
                  ✓ Voter has already cast their vote.
                </p>
              )}
            </div>
          )}

          {/* Accreditation Result */}
          {accreditationResult && (
            <Alert
              className={
                accreditationResult.success
                  ? "bg-green-900/20 border-green-700/50"
                  : "bg-red-900/20 border-red-700/50"
              }
            >
              {accreditationResult.success ? (
                <CheckCircle className="h-4 w-4 text-green-400" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-400" />
              )}
              <AlertDescription
                className={
                  accreditationResult.success
                    ? "text-green-300"
                    : "text-red-300"
                }
              >
                {accreditationResult.message}
                {accreditationResult.success &&
                  accreditationResult.message.includes("Hash:") && (
                    <div className="mt-2">
                      <a
                        href={`https://etherscan.io/tx/${accreditationResult.message.split("Hash: ")[1]}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 text-sm"
                      >
                        View on Etherscan <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  )}
              </AlertDescription>
            </Alert>
          )}

          {/* Accreditation Button */}
          <div className="flex justify-end">
            <Button
              onClick={handleAccreditClick}
              disabled={selectedVoter.isAccredited || isAccrediting}
              className={`${
                !selectedVoter.isAccredited && !isAccrediting
                  ? "hover:bg-[#233D8A] bg-blue-900 text-white cursor-pointer"
                  : "bg-slate-700 text-slate-400 cursor-not-allowed"
              } px-6 py-2 rounded-lg font-medium transition-colors`}
            >
              {isAccrediting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing on Blockchain...
                </>
              ) : selectedVoter.isAccredited ? (
                "Already Accredited"
              ) : (
                "Accredit Voter"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Modal */}
      <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <DialogContent className="bg-white dark:bg-slate-900/95 backdrop-blur-3xl border-slate-700/50">
          <DialogHeader>
            <DialogTitle className="text-indigo-950 dark:text-slate-100 font-bold">
              Confirm Voter Accreditation
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-slate-500">
              Are you sure you want to accredit the following voter?
            </p>
            <div className="bg-slate-200/50 dark:bg-slate-800/50 rounded-lg p-4 space-y-2">
              <p className="font-medium  text-sldark:text-slate-100">
                {selectedVoter?.name}
              </p>
              <p className="text-sm text-slate-400">
                {selectedVoter?.maskedMatricNumber}
              </p>
              <p className="text-xs text-slate-500">
                Polling Officer View (Limited Info)
              </p>
            </div>
            <Alert className="bg-blue-900/20 border-blue-700/50">
              <AlertCircle className="h-4 w-4 text-blue-400" />
              <AlertDescription className="text-blue-300">
                This action will be recorded on the blockchain and cannot be
                undone. Gas fees will apply.
              </AlertDescription>
            </Alert>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowConfirmModal(false)}
              className="bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmAccreditation}
              disabled={isAccrediting}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isAccrediting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                "Confirm Accreditation"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
