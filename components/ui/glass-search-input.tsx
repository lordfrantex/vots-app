"use client";

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { Search, Vote, Hash, Calendar } from "lucide-react";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useContractElections } from "@/hooks/use-contract-address";
import { Election } from "@/types/election";
import { getStatusBadge } from "@/components/utilities/status-badge";

interface GlassSearchInputProps {
  placeholder?: string;
  onElectionSelect?: (election: Election) => void;
  className?: string;
  elections?: Election[];
}

export default function GlassSearchInput({
  placeholder = "Find elections",
  onElectionSelect,
  className,
}: GlassSearchInputProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const { elections, isLoading } = useContractElections();

  const filteredElections = elections.filter(
    (election) =>
      election.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      election.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      election.status?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleElectionSelect = (election: Election) => {
    // Call the optional callback first
    onElectionSelect?.(election);

    // Navigate to the election page
    router.push(`/elections/${election.id}`);

    // Close dialog and reset search
    setOpen(false);
    setSearchQuery("");
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div
          className={cn(
            "w-full relative max-w-xl flex items-center gap-2 p-2 rounded-2xl bg-background/40 backdrop-blur-lg border border-gray-500/20 shadow-inner cursor-pointer",
            "hover:ring-2 hover:ring-gray-500/30 hover:border-gray-500/40 transition-all duration-200",
            className,
          )}
        >
          <Search className="text-gray-500/70 w-5 h-5 ml-2" />
          <div className="flex-1 text-gray-500 pl-2">{placeholder}</div>
        </div>
      </DialogTrigger>

      <DialogContent className="p-0 max-w-2xl">
        <DialogTitle className="sr-only">Search Elections</DialogTitle>
        <Command className="rounded-lg border shadow-md">
          <CommandInput
            placeholder="Search elections by name, ID, or status..."
            value={searchQuery}
            onValueChange={setSearchQuery}
            className="border-none focus:ring-0"
          />
          <CommandList className="max-h-96">
            <CommandEmpty className="py-6 text-center text-sm">
              {isLoading ? "Loading elections..." : "No elections found."}
            </CommandEmpty>

            {filteredElections.length > 0 && (
              <CommandGroup heading="Elections">
                {filteredElections.map((election) => (
                  <CommandItem
                    key={election.id}
                    value={`${election.name} ${election.id} ${election.status}`}
                    onSelect={() => handleElectionSelect(election)}
                    className="flex items-center gap-3 p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                  >
                    <Vote className="w-5 h-5 text-blue-500 flex-shrink-0" />

                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm mb-1 truncate">
                        {election.name}
                      </div>

                      <div className="flex space-x-3 items-center">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Hash className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">{election.id}</span>
                        </div>

                        <div className="flex items-center space-x-6 flex-wrap">
                          {/* Status Badge */}
                          {election.status && (
                            <span
                              className={cn(
                                getStatusBadge(election.status),
                                "text-xs px-2 py-1 capitalize",
                              )}
                            >
                              {election.status === "ACTIVE" && (
                                <span className="size-1.5 bg-green-400 rounded-full animate-ping opacity-75 mr-1.5" />
                              )}
                              {election.status === "COMPLETED"
                                ? "Ended"
                                : election.status.toLowerCase()}
                            </span>
                          )}

                          {/* Start Date */}
                          {election.startDate && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Calendar className="w-3 h-3" />
                              <span>{formatDate(election.startDate)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {searchQuery && filteredElections.length === 0 && !isLoading && (
              <CommandGroup heading="Suggestions">
                <CommandItem disabled className="text-muted-foreground py-3">
                  <div className="text-center w-full">
                    <p className="text-sm mb-1">
                      No elections match your search
                    </p>
                    <p className="text-xs">
                      Try searching by election name, ID, or status
                    </p>
                  </div>
                </CommandItem>
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
