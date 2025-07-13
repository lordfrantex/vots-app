// hooks/useVoterFilter.ts
import { useMemo, useState, useCallback, useEffect } from "react";
import { VoterStatus } from "@/components/ui/voter-search-filter";
import { EnhancedVoter } from "@/types/voter";

export const useVoterFilter = (voters: EnhancedVoter[] = []) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] =
    useState<VoterStatus>("registered");
  const [selectedLevel, setSelectedLevel] = useState<string>("all");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [filteredVoters, setFilteredVoters] = useState<EnhancedVoter[]>(voters);

  // Helper function to get voter status
  const getVoterStatus = useCallback((voter: EnhancedVoter): VoterStatus => {
    if (voter.hasVoted) return "voted";
    if (voter.isAccredited) return "accredited";
    if (voter.isRegistered && !voter.isAccredited) return "unaccredited";
    return "registered";
  }, []);

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

  // Status counts for display
  const statusCounts = useMemo(() => {
    const counts = {
      registered: voters.length, // all voters
      accredited: 0,
      voted: 0,
      unaccredited: 0,
      total: voters.length,
    };

    voters.forEach((voter) => {
      if (voter.hasVoted) {
        counts.voted++;
      }
      if (voter.isAccredited) {
        counts.accredited++; // Count ALL accredited voters (voted + not voted)
      }
      if (voter.isRegistered && !voter.isAccredited) {
        counts.unaccredited++;
      }
    });

    return counts;
  }, [voters]);
  // Filter voters based on search and filter criteria
  // Filter voters based on search and filter criteria
  useEffect(() => {
    const filtered = voters.filter((voter) => {
      // Search term matching
      const matchesSearch =
        !searchTerm ||
        voter.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        voter.matricNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        voter.level?.toString().includes(searchTerm) ||
        voter.department?.toLowerCase().includes(searchTerm.toLowerCase());

      // Status filter
      let matchesStatus = false;
      switch (selectedStatus) {
        case "registered":
          matchesStatus = voter.isRegistered;
          break;
        case "accredited":
          matchesStatus = voter.isAccredited;
          break;
        case "voted":
          matchesStatus = voter.hasVoted;
          break;
        case "unaccredited":
          matchesStatus = voter.isRegistered && !voter.isAccredited;
          break;
        default:
          matchesStatus = true;
      }

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

    setFilteredVoters(filtered);
  }, [voters, searchTerm, selectedStatus, selectedLevel, selectedDepartment]);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setSearchTerm("");
    setSelectedStatus("registered");
    setSelectedLevel("all");
    setSelectedDepartment("all");
  }, []);

  return {
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
  };
};
