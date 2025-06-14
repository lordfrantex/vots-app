// store/electionStore.ts
import { create } from 'zustand';
import { Election } from '@/types/election';

interface ElectionState {
    elections: Election[];
    currentElection: Election | null;
    loading: boolean;
    error: string | null;
    searchQuery: string;
    filterStatus: 'all' | 'active' | 'upcoming' | 'ended';

    // Actions
    setElections: (elections: Election[]) => void;
    setCurrentElection: (election: Election | null) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    setSearchQuery: (query: string) => void;
    setFilterStatus: (status: 'all' | 'active' | 'upcoming' | 'ended') => void;
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
    searchQuery: '',
    filterStatus: 'all',

    setElections: (elections) => set({ elections }),
    setCurrentElection: (election) => set({ currentElection: election }),
    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error }),
    setSearchQuery: (query) => set({ searchQuery: query }),
    setFilterStatus: (status) => set({ filterStatus: status }),

    addElection: (election) => set((state) => ({
        elections: [...state.elections, election]
    })),

    updateElection: (electionId, updates) => set((state) => ({
        elections: state.elections.map(election =>
            election.id === electionId ? { ...election, ...updates } : election
        ),
        currentElection: state.currentElection?.id === electionId
            ? { ...state.currentElection, ...updates }
            : state.currentElection
    })),

    clearError: () => set({ error: null }),

    // Computed getters
    getElectionById: (id: string) => {
        const state = get();
        return state.elections.find(election => election.id === id);
    },

    getFilteredElections: () => {
        const state = get();
        let filtered = state.elections;

        // Filter by status
        if (state.filterStatus !== 'all') {
            filtered = filtered.filter(election => {
                const now = new Date();
                const startTime = new Date(election.startTime);
                const endTime = new Date(election.endTime);

                switch (state.filterStatus) {
                    case 'active':
                        return now >= startTime && now <= endTime;
                    case 'upcoming':
                        return now < startTime;
                    case 'ended':
                        return now > endTime;
                    default:
                        return true;
                }
            });
        }

        // Filter by search query
        if (state.searchQuery) {
            filtered = filtered.filter(election =>
                election.name.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
                election.description?.toLowerCase().includes(state.searchQuery.toLowerCase())
            );
        }

        return filtered;
    },
}));