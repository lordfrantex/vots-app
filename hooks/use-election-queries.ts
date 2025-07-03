// hooks/useElectionQueries.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Election } from "@/types/election";
import mockElections, { fetchElectionById } from "@/constants/mock-elections";
import { useElectionStore } from "@/store/use-election";

// Mock API functions (replace with your actual smart contract calls)
const fetchElections = async (): Promise<Election[]> => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return mockElections;
};

const fetchElection = async (id: string): Promise<Election | null> => {
  return fetchElectionById(id);
};

// Query keys
export const electionKeys = {
  all: ["elections"] as const,
  lists: () => [...electionKeys.all, "list"] as const,
  list: (filters: string) => [...electionKeys.lists(), { filters }] as const,
  details: () => [...electionKeys.all, "detail"] as const,
  detail: (id: string) => [...electionKeys.details(), id] as const,
};

// Hook to fetch all elections
export const useElections = () => {
  const { setElections, setLoading, setError } = useElectionStore();

  const query = useQuery<Election[]>({
    queryKey: electionKeys.lists(),
    queryFn: fetchElections,
    staleTime: 0,
  });

  if (query.isLoading) {
    setLoading(true);
  } else if (query.isError) {
    setError((query.error as Error).message);
    setLoading(false);
  } else if (query.isSuccess) {
    setElections(query.data);
    setLoading(false);
    setError(null);
  }

  return query;
};

// Hook to fetch a specific election
export const useElection = (electionId: string) => {
  const { setCurrentElection, setLoading, setError } = useElectionStore();

  const query = useQuery<Election | null>({
    queryKey: electionKeys.detail(electionId),
    queryFn: () => fetchElection(electionId),
    enabled: !!electionId,
    staleTime: 0,
  });

  if (query.isLoading) {
    setLoading(true);
  } else if (query.isError) {
    setError((query.error as Error).message);
    setLoading(false);
  } else if (query.isSuccess) {
    setCurrentElection(query.data);
    setLoading(false);
    setError(null);
  }

  return query;
};

// Hook for voting mutation (example)
export const useVoteMutation = () => {
  const queryClient = useQueryClient();
  const { updateElection } = useElectionStore();

  return useMutation({
    mutationFn: async ({
      electionId,
      candidateId,
    }: {
      electionId: string;
      candidateId: string;
    }) => {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const election = mockElections.find((e) => e.id === electionId);
      if (election) {
        const candidate = (election?.candidates ?? []).find(
          (c) => c.id === candidateId,
        );
        if (candidate) {
          candidate.voteCount = (candidate.voteCount || 0) + 1;
          election.totalVotes = (election.totalVotes || 0) + 1;
        }
      }

      return election;
    },
    onSuccess: (data, variables) => {
      if (data) {
        updateElection(variables.electionId, data);
        queryClient.invalidateQueries({
          queryKey: electionKeys.detail(variables.electionId),
        });
        queryClient.invalidateQueries({ queryKey: electionKeys.lists() });
      }
    },
    onError: (error: Error) => {
      console.error("Voting failed:", error);
    },
  });
};

// Hook to get election from store (with fallback to server)
export const useElectionFromStore = (electionId: string) => {
  const { getElectionById } = useElectionStore();
  const electionQuery = useElection(electionId);

  const storeElection = getElectionById(electionId);

  return {
    election: storeElection || electionQuery.data,
    isLoading: electionQuery.isLoading,
    error: electionQuery.error,
    refetch: electionQuery.refetch,
  };
};
