export interface PollingOfficer {
  id: string;
  address: string;
  name?: string;
  role: string;
}
export interface AccreditationTransaction {
  hash: string;
  status: "pending" | "confirmed" | "failed";
  timestamp: number;
  voterName: string;
  voterMatricNumber: string;
}
