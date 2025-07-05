"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  CheckCircle,
  AlertTriangle,
  Loader2,
  Vote,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";

interface VoteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  selections: {
    [category: string]: {
      candidateName: string;
      candidateMatricNo: string;
      voteType?: "for" | "against";
    };
  };
  voter: {
    name: string;
    matricNumber: string;
  };
  isSubmitting: boolean;
}

const VoteConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  selections,
  voter,
  isSubmitting,
}: VoteConfirmationModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-slate-200/70 dark:border-slate-700/50 text-slate-900 dark:text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl text-slate-900 dark:text-white">
            Confirm Your Vote
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Voter Info */}
          <div className="bg-slate-100/80 dark:bg-slate-800/50 p-4 rounded-lg">
            <h4 className="font-medium text-slate-600 dark:text-slate-300 mb-2">
              Voter Information
            </h4>
            <div className="space-y-1">
              <p className="text-sm">
                <span className="text-slate-500 dark:text-slate-400">
                  Name:
                </span>{" "}
                <span className="text-slate-800 dark:text-white">
                  {voter.name}
                </span>
              </p>
              <p className="text-sm">
                <span className="text-slate-500 dark:text-slate-400">ID:</span>{" "}
                <span className="text-slate-800 dark:text-white font-mono">
                  {voter.matricNumber}
                </span>
              </p>
            </div>
          </div>

          {/* Vote Summary */}
          <div className="bg-slate-100/80 dark:bg-slate-800/50 p-4 rounded-lg">
            <h4 className="font-medium text-slate-600 dark:text-slate-300 mb-3">
              Your Selections
            </h4>
            <div className="space-y-3">
              {Object.entries(selections).map(([category, selection]) => (
                <div
                  key={category}
                  className="flex justify-between items-center"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-800 dark:text-white">
                      {category}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {selection.candidateName}
                    </p>
                  </div>
                  {selection.voteType ? (
                    <Badge
                      className={`${
                        selection.voteType === "for"
                          ? "bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 border-green-300 dark:border-green-500/50"
                          : "bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400 border-red-300 dark:border-red-500/50"
                      }`}
                    >
                      {selection.voteType === "for" ? (
                        <ThumbsUp className="h-3 w-3 mr-1" />
                      ) : (
                        <ThumbsDown className="h-3 w-3 mr-1" />
                      )}
                      {selection.voteType.toUpperCase()}
                    </Badge>
                  ) : (
                    <Badge className="bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 border-green-300 dark:border-green-500/50">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Selected
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Warning */}
          <Alert className="bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-700/50">
            <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <AlertDescription className="text-amber-700 dark:text-amber-300">
              <strong>Final Warning:</strong> Once you submit your vote, it
              cannot be changed or undone.
            </AlertDescription>
          </Alert>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-2">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1 bg-transparent border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={onConfirm}
              disabled={isSubmitting}
              className="flex-1 bg-[#324278] hover:bg-blue-900 cursor-pointer text-white"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Vote className="mr-2 h-4 w-4" />
                  Submit Vote
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VoteConfirmationModal;
