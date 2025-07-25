// components/ui/voter-search-filter.tsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Search,
  Filter,
  X,
  Users,
  UserCheck,
  Vote,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useVoterFilter } from "@/hooks/use-voter-filter";
import { EnhancedVoter } from "@/types/voter";

// Status type for better type safety
export type VoterStatus =
  | "registered"
  | "accredited"
  | "voted"
  | "unaccredited";

interface VoterSearchFilterProps {
  voters?: EnhancedVoter[];
  onFilter?: (filteredVoters: EnhancedVoter[]) => void;
  onVoterSelect?: (voter: EnhancedVoter) => void;
  showResults?: boolean;
  placeholder?: string;
  className?: string;
  compact?: boolean;
  availableStatuses?: VoterStatus[];
  showLevelFilter?: boolean;
  showDepartmentFilter?: boolean;
  defaultSelectedStatus?: VoterStatus;
  electionStatus?: string;
}

const VoterSearchFilter: React.FC<VoterSearchFilterProps> = ({
  voters = [],
  onFilter,
  onVoterSelect,
  showResults = true,
  placeholder = "Search by name, level, or department...",
  className = "",
  compact = false,
  availableStatuses = ["registered", "accredited", "voted", "unaccredited"],
  showLevelFilter = true,
  showDepartmentFilter = true,
  defaultSelectedStatus = "registered",
  electionStatus,
}) => {
  const {
    searchTerm,
    setSearchTerm,
    selectedStatus,
    setSelectedStatus,
    selectedLevel,
    setSelectedLevel,
    selectedDepartment,
    setSelectedDepartment,
    filteredVoters,
    statusCounts,
    levels,
    departments,
    clearFilters,
    getVoterStatus,
  } = useVoterFilter(voters);

  const [showFilters, setShowFilters] = useState(false);

  // Notify parent about filtered voters
  useEffect(() => {
    onFilter?.(filteredVoters);
  }, [filteredVoters, onFilter]);

  // Status button configuration - filter based on available statuses
  const statusButtons = useMemo(() => {
    const allButtons = [
      {
        key: "registered" as VoterStatus,
        label: "Registered",
        count: statusCounts.total,
        icon: Users,
      },
      {
        key: "accredited" as VoterStatus,
        label: "Accredited",
        count: statusCounts.accredited,
        icon: UserCheck,
      },
      {
        key: "voted" as VoterStatus,
        label: "Voted",
        count: statusCounts.voted,
        icon: Vote,
      },
      {
        key: "unaccredited" as VoterStatus,
        label: "Unaccredited",
        count: statusCounts.unaccredited,
        icon: XCircle,
      },
    ];

    // If election is ACTIVE, only show registered voters
    if (electionStatus === "ACTIVE") {
      return allButtons.filter((button) => button.key === "registered");
    }

    // If election is COMPLETED or UPCOMING, show all status buttons
    return allButtons;
  }, [statusCounts, electionStatus]);

  // Handle voter selection
  const handleVoterSelect = useCallback(
    (voter: EnhancedVoter) => {
      onVoterSelect?.(voter);
    },
    [onVoterSelect],
  );

  return (
    <Card
      className={`bg-white dark:bg-slate-900/50 dark:border-slate-700/50 ${className}`}
    >
      {/* Header */}
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Search className="h-5 w-5 text-slate-600 dark:text-slate-400" />
            <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Voter Search & Filter
            </CardTitle>
          </div>
          {(showLevelFilter || showDepartmentFilter) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
            >
              <Filter className="h-4 w-4 mr-2" />
              {showFilters ? "Hide" : "Show"} Filters
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            type="text"
            placeholder={placeholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100"
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSearchTerm("")}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Status Filter Buttons */}
        {statusButtons.length > 0 && (
          <div
            className={`flex flex-wrap ${compact ? "flex-wrap" : "flex-col sm:flex-row"} gap-2`}
          >
            {statusButtons.map(({ key, label, count, icon: Icon }) => (
              <Button
                key={key}
                variant={selectedStatus === key ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedStatus(key)}
                className={`flex items-center gap-2 cursor-pointer ${
                  selectedStatus === key
                    ? "bg-[#233D8A] hover:bg-[#233D8A]/80 text-white border-[#233D8A]"
                    : "border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 bg-white dark:bg-slate-800"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
                <Badge
                  variant="secondary"
                  className={`ml-1 ${
                    selectedStatus === key
                      ? "bg-white/20 text-white hover:bg-white/30"
                      : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                  }`}
                >
                  {count}
                </Badge>
              </Button>
            ))}
          </div>
        )}

        {/* Advanced Filters */}
        {showFilters && (showLevelFilter || showDepartmentFilter) && (
          <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Level Filter */}
              {showLevelFilter && levels.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Level
                  </label>
                  <Select
                    value={selectedLevel}
                    onValueChange={setSelectedLevel}
                  >
                    <SelectTrigger className="w-full bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100">
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600">
                      <SelectItem
                        value="all"
                        className="text-slate-900 dark:text-slate-100 focus:bg-slate-100 dark:focus:bg-slate-700"
                      >
                        All Levels
                      </SelectItem>
                      {levels.map((level) => (
                        <SelectItem
                          key={level}
                          value={level.toString()}
                          className="text-slate-900 dark:text-slate-100 focus:bg-slate-100 dark:focus:bg-slate-700"
                        >
                          {level} Level
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Department Filter */}
              {showDepartmentFilter && departments.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Department
                  </label>
                  <Select
                    value={selectedDepartment}
                    onValueChange={setSelectedDepartment}
                  >
                    <SelectTrigger className="w-full bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100">
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600">
                      <SelectItem
                        value="all"
                        className="text-slate-900 dark:text-slate-100 focus:bg-slate-100 dark:focus:bg-slate-700"
                      >
                        All Departments
                      </SelectItem>
                      {departments.map((dept) => (
                        <SelectItem
                          key={dept}
                          value={dept}
                          className="text-slate-900 dark:text-slate-100 focus:bg-slate-100 dark:focus:bg-slate-700"
                        >
                          {dept}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {/* Clear Filters Button */}
            <div className="mt-4 flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
              >
                <X className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            </div>
          </div>
        )}

        {/* Results Summary */}
        <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
          <span>
            Showing {filteredVoters.length} of {statusCounts[selectedStatus]}{" "}
            {selectedStatus} voters
          </span>
          {(selectedLevel !== "all" ||
            selectedDepartment !== "all" ||
            searchTerm) && (
            <span className="text-[#233D8A] dark:text-blue-400">
              Filters applied
            </span>
          )}
        </div>

        {/* Results List */}
        {showResults && filteredVoters.length > 0 && (
          <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
            <div className="max-h-64 overflow-y-auto">
              {filteredVoters.map((voter) => (
                <div
                  key={voter.id}
                  className="p-3 border-b border-slate-100 dark:border-slate-700 last:border-b-0 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer rounded-md transition-colors"
                  onClick={() => handleVoterSelect(voter)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-slate-900 dark:text-slate-100">
                        {voter.name}
                      </h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {voter.matricNumber}
                        {voter.level && ` • ${voter.level} Level`}
                        {voter.department && ` • ${voter.department}`}
                      </p>
                    </div>
                    <Badge
                      variant={
                        voter.hasVoted
                          ? "default"
                          : voter.isAccredited
                            ? "secondary"
                            : "outline"
                      }
                      className={
                        voter.hasVoted
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border border-green-800/10 capitalize"
                          : voter.isAccredited
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-800/10 capitalize"
                            : !voter.isAccredited
                              ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border border-red-800/10 capitalize"
                              : "bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-400 border border-slate-800/10 capitalize"
                      }
                    >
                      {getVoterStatus(voter)}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Results */}
        {showResults && filteredVoters.length === 0 && voters.length > 0 && (
          <div className="border-t border-slate-200 dark:border-slate-700 pt-8 pb-4 text-center">
            <div className="text-slate-400 dark:text-slate-500">
              <Search className="h-8 w-8 mx-auto mb-2" />
              <p>No {selectedStatus} voters found matching your criteria</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="mt-2 text-[#233D8A] dark:text-blue-400 hover:text-[#233D8A]/80 dark:hover:text-blue-300"
              >
                Clear filters to see all {selectedStatus} voters
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VoterSearchFilter;
