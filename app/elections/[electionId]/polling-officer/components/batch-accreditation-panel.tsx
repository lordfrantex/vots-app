"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { Alert, AlertDescription } from "@/components/ui/alert";

import {
  Users,
  Zap,
  DollarSign,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Info,
} from "lucide-react";
import { useBatchAccreditVoters } from "@/hooks/use-batch-accreditation";
import { getFullMatricNumberForVoter } from "@/utils/contract-helpers";
import type { PollingOfficerVoterView } from "@/utils/contract-helpers";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";

interface BatchAccreditationPanelProps {
  voters: PollingOfficerVoterView[];
  electionId: string;
  onAccreditationComplete?: () => void;
  selectedVoters?: string[];
}

export function BatchAccreditationPanel({
  voters,
  electionId,
  onAccreditationComplete,
  selectedVoters,
}: BatchAccreditationPanelProps) {
  const [, setSelectedVoters] = useState<Set<string>>(new Set());
  const [showCostWarning, setShowCostWarning] = useState(false);

  const { batchAccreditVoters, isLoading, progress, error } =
    useBatchAccreditVoters();

  // Filter unaccredited voters
  const unaccreditedVoters = voters.filter((voter) => !voter.isAccredited);

  // Calculate estimated costs
  const selectedCount = selectedVoters.size;
  const estimatedGasPerTx = 50000; // Rough estimate
  const estimatedGasPriceGwei = 20; // Rough estimate for Sepolia
  const estimatedCostEth =
    (selectedCount * estimatedGasPerTx * estimatedGasPriceGwei) / 1e9;
  const estimatedCostUsd = estimatedCostEth * 2000; // Rough ETH price

  const handleVoterToggle = (voterId: string) => {
    setSelectedVoters((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(voterId)) {
        newSet.delete(voterId);
      } else {
        newSet.add(voterId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedVoters.size === unaccreditedVoters.length) {
      setSelectedVoters(new Set());
    } else {
      setSelectedVoters(new Set(unaccreditedVoters.map((v) => v.id)));
    }
  };

  const handleBatchAccredit = async () => {
    if (selectedVoters.size === 0) return;

    // Show cost warning for large batches
    if (selectedVoters.size > 10 && !showCostWarning) {
      setShowCostWarning(true);
      return;
    }

    try {
      // Get full matric numbers for selected voters
      const voterMatricNumbers: string[] = [];

      for (const voterId of selectedVoters) {
        const voter = unaccreditedVoters.find((v) => v.id === voterId);
        if (voter) {
          const fullMatricNo =
            voter.fullMatricNumber ||
            getFullMatricNumberForVoter(voter.name, electionId);
          if (fullMatricNo) {
            voterMatricNumbers.push(fullMatricNo);
          }
        }
      }

      if (voterMatricNumbers.length === 0) {
        console.error("No valid matric numbers found for selected voters");
        return;
      }

      const result = await batchAccreditVoters({
        voterMatricNumbers,
        electionTokenId: BigInt(electionId),
      });

      if (result.success) {
        setSelectedVoters(new Set());
        setShowCostWarning(false);
        onAccreditationComplete?.();
      }
    } catch (error) {
      console.error("Batch accreditation error:", error);
    }
  };

  if (unaccreditedVoters.length === 0) {
    return (
      <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-700/50">
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
            <p className="text-slate-300">All voters have been accredited!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-700/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-slate-100 flex items-center gap-2">
            <Users className="h-5 w-5" />
            Batch Accreditation
          </CardTitle>
          <Badge variant="outline" className="text-slate-300">
            {unaccreditedVoters.length} pending
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Cost Information */}
        <Alert className="bg-blue-900/20 border-blue-700/50">
          <Info className="h-4 w-4 text-blue-400" />
          <AlertDescription className="text-blue-300">
            <div className="space-y-2">
              <p>
                <strong>Gas Fee Reality:</strong> Each accreditation costs gas
                fees (~$0.50-$2.00 on Sepolia)
              </p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-blue-200">
                    Selected: {selectedCount} voters
                  </p>
                  <p className="text-blue-200">
                    Est. Cost: ~${estimatedCostUsd.toFixed(2)} USD
                  </p>
                </div>
                <div>
                  <p className="text-blue-200">
                    Gas per TX: ~{estimatedGasPerTx.toLocaleString()}
                  </p>
                  <p className="text-blue-200">
                    Total Gas: ~
                    {(selectedCount * estimatedGasPerTx).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </AlertDescription>
        </Alert>

        {/* Cost Warning */}
        {showCostWarning && (
          <Alert className="bg-yellow-900/20 border-yellow-700/50">
            <AlertTriangle className="h-4 w-4 text-yellow-400" />
            <AlertDescription className="text-yellow-300">
              <p className="font-medium mb-2">High Gas Cost Warning!</p>
              <p>
                You&#39;re about to accredit {selectedCount} voters, which will
                cost approximately{" "}
                <strong>${estimatedCostUsd.toFixed(2)} USD</strong> in gas fees.
              </p>
              <p className="mt-2 text-sm">
                Consider accrediting in smaller batches to manage costs.
              </p>
            </AlertDescription>
          </Alert>
        )}

        {/* Progress Bar */}
        {progress && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-300">Accrediting voters...</span>
              <span className="text-slate-400">
                {progress.current}/{progress.total}
              </span>
            </div>
            <Progress
              value={(progress.current / progress.total) * 100}
              className="bg-slate-800"
            />
            {progress.currentVoter && (
              <p className="text-xs text-slate-400">
                Current: {progress.currentVoter}
              </p>
            )}
          </div>
        )}

        {/* Voter Selection */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelectAll}
              className="bg-slate-800 border-slate-600 text-slate-300"
            >
              {selectedVoters.size === unaccreditedVoters.length
                ? "Deselect All"
                : "Select All"}
            </Button>
            <span className="text-sm text-slate-400">
              {selectedVoters.size} of {unaccreditedVoters.length} selected
            </span>
          </div>

          <div className="max-h-60 overflow-y-auto space-y-2">
            {unaccreditedVoters.map((voter) => (
              <div
                key={voter.id}
                className="flex items-center space-x-3 p-3 bg-slate-800/30 rounded-lg hover:bg-slate-800/50 transition-colors"
              >
                <Checkbox
                  checked={selectedVoters.has(voter.id)}
                  onCheckedChange={() => handleVoterToggle(voter.id)}
                />
                <div className="flex-1">
                  <p className="font-medium text-slate-200">{voter.name}</p>
                  <p className="text-sm text-slate-400 font-mono">
                    {voter.maskedMatricNumber}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className="text-yellow-400 border-yellow-600"
                >
                  Pending
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            onClick={handleBatchAccredit}
            disabled={selectedVoters.size === 0 || isLoading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : showCostWarning ? (
              <>
                <DollarSign className="h-4 w-4 mr-2" />
                Confirm & Pay Gas
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                Accredit Selected ({selectedVoters.size})
              </>
            )}
          </Button>

          {showCostWarning && (
            <Button
              variant="outline"
              onClick={() => setShowCostWarning(false)}
              className="bg-slate-800 border-slate-600 text-slate-300"
            >
              Cancel
            </Button>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <Alert className="bg-red-900/20 border-red-700/50">
            <AlertTriangle className="h-4 w-4 text-red-400" />
            <AlertDescription className="text-red-300">
              {error}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
