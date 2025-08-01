import type React from "react";
import { useElectionStore } from "@/store/use-election";
import ElectionMainOverview from "@/app/elections/[electionId]/components/election-main-overview";
import { useElectionDetails } from "@/hooks/use-contract-address";

interface ElectionMainProps {
  electionId: string;
}

const ElectionMain: React.FC<ElectionMainProps> = ({ electionId }) => {
  const { election } = useElectionDetails(electionId);

  if (!election) {
    return null;
  }

  return (
    <div className="">
      <ElectionMainOverview election={election} />
    </div>
  );
};

export default ElectionMain;
