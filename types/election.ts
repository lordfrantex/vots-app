import { Candidate } from "@/types/candidate";
import { Voter } from "@/types/voter";
import { PollingOfficer } from "@/types/polling-officer";
import { PollingUnit } from "@/types/polling-unit";
import { Category } from "@/types/category";

export interface Election {
  id: string;
  name: string;
  startDate?: string;
  endDate?: string;
  timezone?: string;

  // Derived from contract data
  status: "ACTIVE" | "UPCOMING" | "COMPLETED";
  categories: Category[];
  totalVoters?: number;
  totalVotes?: number;
  accreditedVoters?: number;
  candidates?: Candidate[];
  voters: Voter[];

  // Contract arrays (addresses)
  pollingOfficers: PollingOfficer[];
  pollingUnits: PollingUnit[];

  // Your additional frontend-only fields (not in contract)
  description?: string;
  bannerImage?: string;
  createdBy?: string;
  isPublished?: boolean;
  metadata?: Record<string, never>;
}
