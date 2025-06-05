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
import { Search, Vote, Hash } from "lucide-react";
import React, { useState } from "react";

interface Election {
  id: string;
  name: string;
  type?: string;
  date?: string;
}

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
  elections = [
    {
      id: "2024-001",
      name: "Presidential Election 2024",
      type: "Presidential",
      date: "Nov 5, 2024",
    },
    {
      id: "2024-002",
      name: "Senate Elections",
      type: "Senate",
      date: "Nov 5, 2024",
    },
    {
      id: "2024-003",
      name: "House of Representatives",
      type: "House",
      date: "Nov 5, 2024",
    },
    {
      id: "2023-001",
      name: "Gubernatorial Election",
      type: "State",
      date: "Nov 7, 2023",
    },
    {
      id: "2023-002",
      name: "Local Municipal Elections",
      type: "Local",
      date: "May 15, 2023",
    },
  ],
}: GlassSearchInputProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredElections = elections.filter(
    (election) =>
      election.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      election.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      election.type?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleElectionSelect = (election: Election) => {
    onElectionSelect?.(election);
    setOpen(false);
    setSearchQuery("");
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
            placeholder="Search elections by name or ID..."
            value={searchQuery}
            onValueChange={setSearchQuery}
            className="border-none focus:ring-0"
          />
          <CommandList className="max-h-96">
            <CommandEmpty className="py-6 text-center text-sm">
              No elections found.
            </CommandEmpty>

            {filteredElections.length > 0 && (
              <CommandGroup heading="Elections">
                {filteredElections.map((election) => (
                  <CommandItem
                    key={election.id}
                    value={`${election.name} ${election.id}`}
                    onSelect={() => handleElectionSelect(election)}
                    className="flex items-center gap-3 p-3 cursor-pointer"
                  >
                    <Vote className="w-4 h-4 text-blue-500" />
                    <div className="flex-1">
                      <div className="font-medium">{election.name}</div>
                      <div className="text-sm text-muted-foreground flex items-center gap-2">
                        <Hash className="w-3 h-3" />
                        <span>{election.id}</span>
                        {election.type && (
                          <>
                            <span>•</span>
                            <span>{election.type}</span>
                          </>
                        )}
                        {election.date && (
                          <>
                            <span>•</span>
                            <span>{election.date}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {searchQuery && filteredElections.length === 0 && (
              <CommandGroup heading="Suggestions">
                <CommandItem disabled className="text-muted-foreground">
                  Try searching by election name or ID
                </CommandItem>
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
