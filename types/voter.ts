export interface Voter {
  name: string;
  matricNumber: string;
  isAccredited: boolean;
  hasVoted: boolean;
  id?: string;
  email?: string;
  department?: string;
}
