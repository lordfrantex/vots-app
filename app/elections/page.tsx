import ElectionClient from "@/components/layouts/elections/election-client";

const ElectionsPage = () => {
  return (
    <section
      id="elections"
      className="justify-center items-center min-h-screen relative pt-[5rem] lg:pt-[10rem] -mt-20"
    >
      <div className="flex-col">
        <div className="flex-1 space-y-4 p-8 pt-6">
          <ElectionClient />
        </div>
      </div>
    </section>
  );
};

export default ElectionsPage;
