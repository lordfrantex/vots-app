export interface Candidate {
  id: string;
  name: string;
  matricNo: string; // Changed from matricNumber to matricNo for consistency
  category: string;
  voteCount?: number;
  photo?: string;
}

// Contract-specific candidate type
export interface ContractCandidateInfoDTO {
  readonly name: string;
  readonly matricNo: string;
  readonly category: string;
  readonly voteFor: bigint;
  readonly voteAgainst: bigint;
}
