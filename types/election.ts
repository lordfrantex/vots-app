import { Candidate } from "@/types/candidate";
import { Voter } from "@/types/voter";

export interface Election {
  id: string;
  name: string;
  startTime: Date;
  endTime: Date;

  // Derived from contract data
  status: "ACTIVE" | "UPCOMING" | "COMPLETED";
  categories: string[];
  totalVoters?: number;
  totalVotes?: number;
  candidates?: Candidate[];
  voters: Voter[];

  // Contract arrays (addresses)
  pollingOfficers: string[];
  pollingUnits: string[];

  // Your additional frontend-only fields (not in contract)
  description?: string;
  bannerImage?: string;
  createdBy?: string;
  isPublished?: boolean;
  metadata?: Record<string, never>;
}
