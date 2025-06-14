import React from "react";
import ElectionMain from "@/app/elections/[electionId]/components/election-main";
import { fetchElectionById } from "@/constants/mock-elections";
import ElectionCandidates from "@/app/elections/[electionId]/components/election-candidates";
import ElectionInformation from "@/app/elections/[electionId]/components/election-information";

interface ElectionPageProps {
  params: Promise<{
    electionId: string;
  }>;
}

const ElectionPage: React.FC<ElectionPageProps> = async ({ params }) => {
  const { electionId } = await params;

  try {
    const election = await fetchElectionById(electionId);

    if (!election) {
      return null;
    }

    return (
      <section
        id="election-page"
        className="justify-center items-center min-h-screen relative pt-[7rem] lg:pt-[10rem] -mt-20"
      >
        <div className="max-w-[1400px] mx-auto">
          <ElectionMain election={election} />
          <ElectionCandidates election={election} />
          <ElectionInformation election={election} />
        </div>
      </section>
    );
  } catch (error) {
    console.error("Error loading election:", error);
    throw new Error("Failed to load election");
  }
};

export default ElectionPage;
