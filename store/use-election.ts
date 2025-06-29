// store/electionStore.ts (renamed to avoid conflict, but content is same as use-election.ts for this example)

import { create } from "zustand";
import { Election } from "@/types/election";

interface ElectionState {
  elections: Election[];
  currentElection: Election | null;
  loading: boolean;
  error: string | null;
  searchQuery: string;
  filterStatus: "all" | "active" | "upcoming" | "ended";

  // Actions
  setElections: (elections: Election[]) => void;
  setCurrentElection: (election: Election | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSearchQuery: (query: string) => void;
  setFilterStatus: (status: "all" | "active" | "upcoming" | "ended") => void;
  addElection: (election: Election) => void;
  updateElection: (electionId: string, updates: Partial<Election>) => void;
  clearError: () => void;

  // Computed getters
  getElectionById: (id: string) => Election | undefined;
  getFilteredElections: () => Election[];
}

export const useElectionStore = create<ElectionState>((set, get) => ({
  elections: [],
  currentElection: null,
  loading: false,
  error: null,
  searchQuery: "",
  filterStatus: "all",

  setElections: (elections) => set({ elections }),
  setCurrentElection: (election) => set({ currentElection: election }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setFilterStatus: (status) => set({ filterStatus: status }),

  addElection: (election) =>
    set((state) => ({
      elections: [...state.elections, election],
    })),

  updateElection: (electionId, updates) =>
    set((state) => ({
      elections: state.elections.map((election) =>
        election.id === electionId ? { ...election, ...updates } : election,
      ),
      currentElection:
        state.currentElection?.id === electionId
          ? { ...state.currentElection, ...updates }
          : state.currentElection,
    })),

  clearError: () => set({ error: null }),

  // Computed getters
  getElectionById: (id: string) => {
    const state = get();
    return state.elections.find((election) => election.id === id);
  },

  getFilteredElections: () => {
    const state = get();
    let filtered = state.elections;
    const now = new Date(); // Get current time once for consistency

    // Filter by status
    if (state.filterStatus !== "all") {
      filtered = filtered.filter((election) => {
        // Ensure dates are valid before comparison
        const startDate = election.startDate
          ? new Date(election.startDate)
          : null;
        const endDate = election.endDate ? new Date(election.endDate) : null;

        switch (state.filterStatus) {
          case "active":
            // An election is active if now is on or after start and on or before end
            return startDate && endDate && now >= startDate && now <= endDate;
          case "upcoming":
            // An election is upcoming if start date exists and now is before start
            return startDate && now < startDate;
          case "ended":
            // An election is ended if end date exists and now is after end
            return endDate && now > endDate;
          default:
            return true;
        }
      });
    }

    // Filter by search query
    if (state.searchQuery) {
      const lowerCaseQuery = state.searchQuery.toLowerCase();
      filtered = filtered.filter(
        (election) =>
          election.name.toLowerCase().includes(lowerCaseQuery) ||
          election.description?.toLowerCase().includes(lowerCaseQuery),
      );
    }

    return filtered;
  },
}));
