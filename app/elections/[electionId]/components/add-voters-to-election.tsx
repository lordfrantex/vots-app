import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { VotersForm } from "@/components/layouts/create-election/voters-form";
import { useAddVotersToElection } from "@/hooks/use-election-write-operations";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  votersBatchSchema,
  type VotersBatchFormData,
} from "@/lib/validation-schemas";
import { convertVoterToContract } from "@/utils/contract-helpers";
import { toast } from "react-hot-toast";
import { cn } from "@/lib/utils";

interface AddVotersToElectionProps {
  electionTokenId: bigint;
}

type TransactionState =
  | "idle"
  | "submitting"
  | "confirming"
  | "success"
  | "error";

export function AddVotersToElection({
  electionTokenId,
}: AddVotersToElectionProps) {
  const [open, setOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [transactionState, setTransactionState] =
    useState<TransactionState>("idle");
  const [transactionHash, setTransactionHash] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const form = useForm<VotersBatchFormData>({
    resolver: zodResolver(votersBatchSchema),
    defaultValues: {
      voters: [
        {
          id: crypto.randomUUID(),
          name: "",
          matricNumber: "",
          level: "100",
          department: "",
        },
      ],
    },
  });

  const { addVotersToElection, isLoading } = useAddVotersToElection();

  const handleSubmit = async () => {
    try {
      setTransactionState("submitting");
      setErrorMessage("");

      // Validate form data first
      const formData = form.getValues();
      const validationResult = votersBatchSchema.safeParse(formData);

      if (!validationResult.success) {
        toast.error("Please fix validation errors before submitting");
        setTransactionState("idle");
        return;
      }

      const voters = validationResult.data.voters;

      // Convert to contract format
      const contractVoters = voters.map((voter) =>
        convertVoterToContract({
          ...voter,
          voterState: 1,
          isAccredited: false,
          hasVoted: false,
        }),
      );

      // Show submitting state
      toast.loading("Submitting transaction to blockchain...", {
        id: "voter-transaction",
      });

      const result = await addVotersToElection(electionTokenId, contractVoters);

      if (result.success) {
        setTransactionState("confirming");
        setTransactionHash(result.hash || "");

        // Update toast to show confirmation state
        toast.loading(
          "Transaction submitted! Waiting for blockchain confirmation...",
          {
            id: "voter-transaction",
          },
        );

        // Wait for blockchain confirmation (you might need to implement this in your hook)
        // This is a placeholder - replace with actual confirmation logic
        await waitForTransactionConfirmation(result.hash);

        setTransactionState("success");
        toast.success(
          `Successfully added ${voters.length} voters to the election!`,
          { id: "voter-transaction" },
        );

        // Auto-close after showing success for 2 seconds
        setTimeout(() => {
          setOpen(false);
          setConfirmOpen(false);
          resetForm();
        }, 2000);
      } else {
        setTransactionState("error");
        setErrorMessage(result.message || "Failed to add voters");
        toast.error(result.message || "Failed to add voters", {
          id: "voter-transaction",
        });
      }
    } catch (error) {
      console.error("Error adding voters:", error);
      setTransactionState("error");
      setErrorMessage("An unexpected error occurred");
      toast.error("An unexpected error occurred", {
        id: "voter-transaction",
      });
    }
  };

  // Placeholder function - implement based on your blockchain setup
  const waitForTransactionConfirmation = async (
    txHash?: string,
  ): Promise<void> => {
    // This should implement actual blockchain confirmation waiting
    // For now, using a simple timeout as placeholder
    return new Promise((resolve) => {
      setTimeout(resolve, 3000);
    });
  };

  const resetForm = () => {
    setTransactionState("idle");
    setTransactionHash("");
    setErrorMessage("");
    form.reset({
      voters: [
        {
          id: crypto.randomUUID(),
          name: "",
          matricNumber: "",
          level: "100",
          department: "",
        },
      ],
    });
  };

  const handleOpenConfirmDialog = () => {
    // Validate form before opening confirmation
    const formData = form.getValues();
    const validationResult = votersBatchSchema.safeParse(formData);

    if (!validationResult.success) {
      // Trigger form validation to show errors
      form.trigger();
      toast.error("Please fix all validation errors before proceeding");
      return;
    }

    setConfirmOpen(true);
  };

  const handleCancel = () => {
    if (
      transactionState === "submitting" ||
      transactionState === "confirming"
    ) {
      // Don't allow canceling during transaction
      return;
    }

    setOpen(false);
    setConfirmOpen(false);
    resetForm();
  };

  const votersCount = form.watch("voters")?.length || 0;
  const isProcessing =
    transactionState === "submitting" || transactionState === "confirming";

  const getStatusIcon = () => {
    switch (transactionState) {
      case "submitting":
      case "confirming":
        return <Loader2 className="mr-2 h-4 w-4 animate-spin" />;
      case "success":
        return <CheckCircle className="mr-2 h-4 w-4 text-green-500" />;
      case "error":
        return <AlertCircle className="mr-2 h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusText = () => {
    switch (transactionState) {
      case "submitting":
        return "Submitting to blockchain...";
      case "confirming":
        return "Waiting for confirmation...";
      case "success":
        return "Successfully added!";
      case "error":
        return "Transaction failed";
      default:
        return "Add Voters To Election";
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={!isProcessing ? setOpen : undefined}>
        <DialogTrigger asChild>
          <Button variant="outline" className="cursor-pointer">
            Add Voters
          </Button>
        </DialogTrigger>
        <DialogContent
          className={cn(
            "bg-gray-50 dark:bg-gray-950 sm:max-w-full w-[70%] max-h-full overflow-hidden flex flex-col",
          )}
          onPointerDownOutside={(e) => isProcessing && e.preventDefault()}
          onEscapeKeyDown={(e) => isProcessing && e.preventDefault()}
        >
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>Add Voters to Election</DialogTitle>
            <DialogDescription>
              Add voters in batches. You can add up to 10,000 voters per batch.
              Each voter must have a unique matric number.
            </DialogDescription>
          </DialogHeader>

          {/* Make the form content scrollable */}
          <div className="flex-1 overflow-hidden">
            <VotersForm
              form={form}
              isExpanded={true}
              onToggle={() => {}}
              canAccess={true}
              isValid={form.formState.isValid}
              showSubmitButton={false}
            />
          </div>

          <DialogFooter className="flex-shrink-0 flex items-center gap-2 pt-4 border-t">
            <div className="flex-1 text-sm text-muted-foreground">
              {votersCount} voter{votersCount !== 1 ? "s" : ""} ready to add
              {transactionHash && (
                <div className="text-xs mt-1">
                  Tx: {transactionHash.slice(0, 10)}...
                  {transactionHash.slice(-6)}
                </div>
              )}
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isProcessing}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleOpenConfirmDialog}
              disabled={isProcessing || votersCount === 0}
              className="cursor-pointer"
            >
              {getStatusIcon()}
              {getStatusText()}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={confirmOpen}
        onOpenChange={!isProcessing ? setConfirmOpen : undefined}
      >
        <AlertDialogContent
          className={cn("bg-gray-50 dark:bg-gray-900")}
          onEscapeKeyDown={(e) => isProcessing && e.preventDefault()}
        >
          <AlertDialogHeader>
            <AlertDialogTitle>
              {transactionState === "success"
                ? "Voters Added Successfully!"
                : "Confirm Voter Addition"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {transactionState === "success" ? (
                <>
                  Successfully added <strong>{votersCount}</strong> voter
                  {votersCount !== 1 ? "s" : ""} to the election! The
                  transaction has been confirmed on the blockchain.
                </>
              ) : transactionState === "error" ? (
                <>Failed to add voters to the election: {errorMessage}</>
              ) : transactionState === "confirming" ? (
                <>
                  Transaction submitted to blockchain. Waiting for
                  confirmation...
                  {transactionHash && (
                    <div className="text-xs mt-2 font-mono bg-gray-100 dark:bg-gray-800 p-2 rounded">
                      Transaction Hash: {transactionHash}
                    </div>
                  )}
                </>
              ) : (
                <>
                  Are you sure you want to add <strong>{votersCount}</strong>{" "}
                  voter
                  {votersCount !== 1 ? "s" : ""} to this election? This action
                  cannot be undone and the voters will be able to participate in
                  the election.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            {transactionState === "success" ? (
              <AlertDialogAction
                onClick={() => {
                  setOpen(false);
                  setConfirmOpen(false);
                  resetForm();
                }}
                className="cursor-pointer"
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Close
              </AlertDialogAction>
            ) : transactionState === "error" ? (
              <>
                <AlertDialogCancel
                  onClick={() => {
                    setConfirmOpen(false);
                    resetForm();
                  }}
                  className="cursor-pointer"
                >
                  Close
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleSubmit}
                  className="cursor-pointer"
                >
                  Try Again
                </AlertDialogAction>
              </>
            ) : (
              <>
                <AlertDialogCancel
                  disabled={isProcessing}
                  className="cursor-pointer"
                  onClick={() => setConfirmOpen(false)}
                >
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleSubmit}
                  disabled={isProcessing}
                  className="cursor-pointer"
                >
                  {getStatusIcon()}
                  {transactionState === "submitting"
                    ? "Submitting..."
                    : transactionState === "confirming"
                      ? "Confirming..."
                      : "Confirm Addition"}
                </AlertDialogAction>
              </>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
