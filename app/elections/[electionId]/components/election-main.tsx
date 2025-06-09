import React from "react";
import { Election } from "@/types/election";
import ElectionMainOverview from "@/app/elections/[electionId]/components/election-main-overview";

interface ElectionMainProps {
  election: Election;
}

const ElectionMain: React.FC<ElectionMainProps> = ({ election }) => {
  return (
    <div className="">
      <ElectionMainOverview election={election} />
    </div>
  );
};
export default ElectionMain;
