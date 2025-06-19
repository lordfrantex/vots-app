export interface Voter {
  id: string; // Make id required
  name: string;
  matricNumber: string;
  isAccredited?: boolean;
  hasVoted?: boolean;
  email?: string;
  department?: string;
}
