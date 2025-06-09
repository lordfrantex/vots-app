"use client";

import React, { useMemo, useState } from "react";
import { Election } from "@/types/election";
import Heading from "@/components/ui/heading";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import FilterButtons from "@/components/ui/filter-button";
import ElectionCard from "@/app/elections/components/election-cards";
import ElectionSearchInput from "@/app/elections/components/election-search";

interface ElectionClientProps {
  data: Election[];
}

const ElectionClient: React.FC<ElectionClientProps> = ({ data }) => {
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");

  const filteredElections = useMemo(() => {
    return data.filter((item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [searchQuery, data]);

  return (
    <section className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-10">
        <Heading
          title="Elections"
          description="Browse through all available elections."
        />
      </div>

      <div className="flex items-center justify-between mb-8">
        <Button
          onClick={() => router.push(`/elections/new`)}
          className="cursor-pointer bg-[#364153] dark:bg-white hover:bg-gradient-to-tr hover:from-zinc-700 hover:via-55% hover:to-gray-500 hover:text-white"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add New
        </Button>

        <FilterButtons />
      </div>

      <div className="flex justify-center items-center py-5">
        {/* Search Bar */}
        <ElectionSearchInput
          placeholder="Search elections..."
          onChange={setSearchQuery}
          className="mx-auto mb-12"
        />
      </div>
      {/*ELECTIONS CARDS MAPPED*/}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredElections.map((election) => (
          <ElectionCard key={election.id} election={election} />
        ))}
      </div>
    </section>
  );
};
export default ElectionClient;
