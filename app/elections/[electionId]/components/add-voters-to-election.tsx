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
import { Loader2 } from "lucide-react";
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

export function AddVotersToElection({
  electionTokenId,
}: AddVotersToElectionProps) {
  const [open, setOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

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
      // Validate form data first
      const formData = form.getValues();
      const validationResult = votersBatchSchema.safeParse(formData);

      if (!validationResult.success) {
        toast.error("Please fix validation errors before submitting");
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

      const result = await addVotersToElection(electionTokenId, contractVoters);

      if (result.success) {
        toast.success(
          `Successfully added ${voters.length} voters to the election!`,
        );
        setOpen(false);
        setConfirmOpen(false);
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
      } else {
        toast.error(result.message || "Failed to add voters");
      }
    } catch (error) {
      console.error("Error adding voters:", error);
      toast.error("An unexpected error occurred");
    }
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

  const votersCount = form.watch("voters")?.length || 0;

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="cursor-pointer">
            Add Voters
          </Button>
        </DialogTrigger>
        <DialogContent
          className={cn(
            "bg-gray-50 dark:bg-gray-950 sm:max-w-full w-[70%] max-h-full overflow-hidden flex flex-col",
          )}
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
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleOpenConfirmDialog}
              disabled={isLoading || votersCount === 0}
              className="cursor-pointer"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Voters To Election
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent className={cn("bg-gray-50 dark:bg-gray-900")}>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Voter Addition</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to add <strong>{votersCount}</strong> voter
              {votersCount !== 1 ? "s" : ""} to this election? This action
              cannot be undone and the voters will be able to participate in the
              election.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading} className="cursor-pointer">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSubmit}
              disabled={isLoading}
              className="cursor-pointer"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirm Addition
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
