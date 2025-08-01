export interface PollingOfficer {
  id: string;
  address: string;
  name?: string;
  role: string;
}

export interface AccreditationStats {
  totalRegistered: number;
  totalAccredited: number;
  accreditationPercentage: number;
}

export interface VoterSearchResult {
  id: string;
  name: string;
  matricNumber: string;
  isAccredited: boolean;
  hasVoted: boolean;
}

export interface AccreditationTransaction {
  hash: string;
  status: "pending" | "confirmed" | "failed";
  timestamp: number;
  voterName: string;
  voterMatricNumber: string;
}
