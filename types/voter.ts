export interface Voter {
  voterState?: number;
  id: string;
  name: string;
  matricNumber: string; // For polling officers, this will be masked like "CSC/25/****"
  level: string; // e.g. "Undergraduate", "Postgraduate"
  department?: string; // e.g. "Computer Science"
  isAccredited?: boolean;
  hasVoted?: boolean;
  phoneNumber?: string;
  yearOfStudy?: number;
}

// New interface for polling officer view (limited info)
// Interface for voter login/voting (full credentials)
export interface EnhancedVoter {
  isRegistered: boolean;
  id: string;
  name: string;
  matricNumber: string;
  level?: number;
  department?: string;
  isAccredited?: boolean;
  hasVoted?: boolean;
  photo?: string;
  accreditedAt?: string;
  votedAt?: string;
  voterState?: number;
}
