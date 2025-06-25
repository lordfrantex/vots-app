// store/electionStore.ts
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

    // Filter by status
    if (state.filterStatus !== "all") {
      filtered = filtered.filter((election) => {
        const now = new Date();

        // Safely parse dates only if defined
        const hasValidStart = !!election?.startDate;
        const hasValidEnd = !!election?.endDate;

        const startTime = hasValidStart ? new Date(election.startDate!) : null;
        const endTime = hasValidEnd ? new Date(election.endDate!) : null;

        switch (state.filterStatus) {
          case "active":
            return startTime && endTime && now >= startTime && now <= endTime;
          case "upcoming":
            return startTime && now < startTime;
          case "ended":
            return endTime && now > endTime;
          default:
            return true;
        }
      });
    }

    // Filter by search query
    if (state.searchQuery) {
      filtered = filtered.filter(
        (election) =>
          election.name
            .toLowerCase()
            .includes(state.searchQuery.toLowerCase()) ||
          election.description
            ?.toLowerCase()
            .includes(state.searchQuery.toLowerCase()),
      );
    }

    return filtered;
  },
}));
