export interface Voter {
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
export interface PollingOfficerVoterView {
  id: string;
  name: string;
  maskedMatricNumber: string; // Only partial matric like "CSC/25/****"
  photo?: string;
  isAccredited: boolean;
  hasVoted: boolean;
  // NO email, department, or full matric number for security
}

// Interface for voter login/voting (full credentials)
export interface VoterCredentials {
  name: string;
  matricNumber: string; // Full matric number for voting
  email?: string;
  department?: string;
}
