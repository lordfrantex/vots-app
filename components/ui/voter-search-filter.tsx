import React, { useState, useMemo, useCallback } from "react";
import { Search, Filter, X, Users, UserCheck, Vote } from "lucide-react";
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

// Enhanced Voter interface that matches your existing structure
interface Voter {
  id: string;
  name: string;
  matricNumber: string;
  level?: number;
  department?: string;
  isAccredited?: boolean;
  hasVoted?: boolean;
  // Additional fields for compatibility
  photo?: string;
  accreditedAt?: string;
  votedAt?: string;
}

// Status type for better type safety
type VoterStatus = "registered" | "accredited" | "voted";

interface VoterSearchFilterProps {
  voters?: Voter[];
  onFilter?: (filteredVoters: Voter[]) => void;
  onVoterSelect?: (voter: Voter) => void;
  showResults?: boolean;
  placeholder?: string;
  className?: string;
  compact?: boolean;
  electionStatus?: "ACTIVE" | "COMPLETED" | "UPCOMING"; // Add election status prop
}

const VoterSearchFilter: React.FC<VoterSearchFilterProps> = ({
  voters = [],
  onFilter,
  onVoterSelect,
  showResults = true,
  placeholder = "Search by name, level, or department...",
  className = "",
  compact = false,
  electionStatus = "UPCOMING", // Default to UPCOMING
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] =
    useState<VoterStatus>("registered"); // Default to registered
  const [selectedLevel, setSelectedLevel] = useState<string>("all");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);

  // Helper function to get voter status
  const getVoterStatus = (voter: Voter): VoterStatus => {
    if (voter.hasVoted) return "voted";
    if (voter.isAccredited) return "accredited";
    return "registered";
  };

  // Get unique levels and departments for filter options
  const { levels, departments } = useMemo(() => {
    const uniqueLevels = [
      ...new Set(voters.map((v) => v.level).filter(Boolean)),
    ].sort();
    const uniqueDepartments = [
      ...new Set(voters.map((v) => v.department).filter(Boolean)),
    ].sort();
    return {
      levels: uniqueLevels,
      departments: uniqueDepartments,
    };
  }, [voters]);

  // Filter voters based on search and filter criteria
  const filteredVoters = useMemo(() => {
    return voters.filter((voter) => {
      // Search term matching
      const matchesSearch =
        !searchTerm ||
        voter.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        voter.matricNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        voter.level?.toString().includes(searchTerm) ||
        voter.department?.toLowerCase().includes(searchTerm.toLowerCase());

      // Status filter
      const voterStatus = getVoterStatus(voter);
      const matchesStatus = voterStatus === selectedStatus;

      // Level filter
      const matchesLevel =
        selectedLevel === "all" || voter.level?.toString() === selectedLevel;

      // Department filter
      const matchesDepartment =
        selectedDepartment === "all" || voter.department === selectedDepartment;

      return (
        matchesSearch && matchesStatus && matchesLevel && matchesDepartment
      );
    });
  }, [voters, searchTerm, selectedStatus, selectedLevel, selectedDepartment]);

  // Trigger callback whenever filters change
  React.useEffect(() => {
    onFilter?.(filteredVoters);
  }, [filteredVoters, onFilter]);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setSearchTerm("");
    setSelectedStatus("registered"); // Reset to registered instead of "all"
    setSelectedLevel("all");
    setSelectedDepartment("all");
  }, []);

  // Handle voter selection
  const handleVoterSelect = (voter: Voter) => {
    onVoterSelect?.(voter);
  };

  // Status counts for display
  const statusCounts = useMemo(() => {
    const counts = {
      registered: 0,
      accredited: 0,
      voted: 0,
      total: voters.length,
    };

    voters.forEach((voter) => {
      const status = getVoterStatus(voter);
      counts[status]++;
    });

    return counts;
  }, [voters]);

  // Status button configuration - filter based on election status
  const statusButtons = useMemo(() => {
    const allButtons = [
      {
        key: "registered" as VoterStatus,
        label: "Registered",
        count: statusCounts.registered,
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
    ];

    // If election is ACTIVE, only show registered voters
    if (electionStatus === "ACTIVE") {
      return allButtons.filter((button) => button.key === "registered");
    }

    // If election is COMPLETED or UPCOMING, show all status buttons
    return allButtons;
  }, [statusCounts, electionStatus]);

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
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
          >
            <Filter className="h-4 w-4 mr-2" />
            {showFilters ? "Hide" : "Show"} Filters
          </Button>
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
        <div
          className={`flex ${compact ? "flex-wrap" : "flex-col sm:flex-row"} gap-2`}
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

        {/* Advanced Filters */}
        {showFilters && (
          <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Level Filter */}
              {levels.length > 0 && (
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
              {departments.length > 0 && (
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
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 capitalize"
                          : voter.isAccredited
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 capitalize"
                            : "bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200 capitalize"
                      }
                    >
                      {getVoterStatus(voter)}
                    </Badge>
                  </div>
                </div>
              ))}
              {/*{filteredVoters.length > 10 && (*/}
              {/*  <div className="p-3 text-center text-sm text-slate-500 dark:text-slate-400">*/}
              {/*    And {filteredVoters.length - 10} more voters...*/}
              {/*  </div>*/}
              {/*)}*/}
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
