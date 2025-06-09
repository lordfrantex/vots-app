import React from "react";
import ElectionClient from "@/components/layouts/elections/election-client";
import mockElections from "@/constants/mock-elections";

const ElectionsPage = () => {
  return (
    <section
      id="elections"
      className="justify-center items-center min-h-screen relative pt-[5rem] lg:pt-[10rem] -mt-20"
    >
      <div className="flex-col">
        <div className="flex-1 space-y-4 p-8 pt-6">
          <ElectionClient data={mockElections} />
        </div>
      </div>
    </section>
  );
};
export default ElectionsPage;
