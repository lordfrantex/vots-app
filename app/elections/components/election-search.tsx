"use client";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";
import React, { useRef } from "react";

interface ElectionSearchInputProps {
  placeholder?: string;
  onChange?: (value: string) => void;
  className?: string;
}

export default function ElectionSearchInput({
  placeholder = "Search...",
  onChange,
  className,
}: ElectionSearchInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleContainerClick = () => {
    inputRef.current?.focus();
  };

  return (
    <div
      className={cn(
        "w-full relative max-w-xl flex items-center gap-2 p-2 md:p-6 rounded-2xl bg-white/10  dark:bg-[#10161F] backdrop-blur-lg border border-gray-500/20 shadow-inner cursor-text",
        "focus-within:ring-2 focus-within:ring-gray-500/50 focus-within:border-gray-500/50 transition-all duration-200",
        className,
      )}
      onClick={handleContainerClick}
    >
      <Search className="text-gray-500/70 w-5 h-5 ml-2" />
      <Input
        ref={inputRef}
        placeholder={placeholder}
        onChange={(e) => onChange?.(e.target.value)}
        className="bg-white/10  dark:bg-[#10161F] border-none focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:outline-none text-gray-500 placeholder:text-gray-500/50 font-bold text-xl md:text-2xl shadow-none"
      />
    </div>
  );
}
