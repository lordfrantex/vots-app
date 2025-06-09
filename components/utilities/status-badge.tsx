import React from "react";
import { cn } from "@/lib/utils";

// Utility functions
export const getStatusBadge = (status: string) => {
  const baseClasses =
    "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";

  switch (status) {
    case "ACTIVE":
      return `${baseClasses} bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border border-green-800/10`;
    case "UPCOMING":
      return `${baseClasses} bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-800/10`;
    case "COMPLETED":
      return `${baseClasses} bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border border-gray-800/10`;
    default:
      return `${baseClasses} bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border border-gray-800/10`;
  }
};

const StatusBadge: React.FC<{ status: string }> = ({ status }) => (
  <span
    className={cn(
      getStatusBadge(status),
      "flex items-center justify-center gap-6 text-base px-4 py-2 capitalize backdrop-blur-lg text-center  pointer-events-none  rounded-full font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 w-fit",
    )}
  >
    {status === "ACTIVE" && (
      <span className="size-2 bg-green-400 rounded-full animate-ping opacity-75" />
    )}

    {status === "COMPLETED" ? "Ended" : status.slice(0).toLowerCase()}
  </span>
);

export default StatusBadge;
