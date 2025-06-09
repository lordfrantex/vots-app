import React, { useState } from "react";

const FilterButtons = () => {
  const [activeFilter, setActiveFilter] = useState(0);
  const filters = ["All", "Active", "Upcoming", "Completed"];

  const translateValues = [
    "translate-x-0",
    "translate-x-[100%]",
    "translate-x-[200%]",
    "translate-x-[300%]",
  ];

  return (
    <div
      className={`
        p-1 rounded-2xl
        bg-gray-100 dark:bg-[#10161F]
        shadow-[inset_8px_8px_16px_rgba(0,0,0,0.1),_inset_-8px_-8px_16px_rgba(255,255,255,0.5)]
        dark:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.4),_inset_-4px_-4px_8px_rgba(255,255,255,0.03)]
      `}
    >
      <div className="relative flex gap-4">
        {/* Indicator */}
        <div
          className={`
            absolute top-0 h-full rounded-xl transition-all duration-300 ease-out
            bg-gray-200 dark:bg-indigo-400/10
            ${translateValues[activeFilter]}
            shadow-[6px_6px_12px_rgba(0,0,0,0.2),_-6px_-6px_12px_rgba(255,255,255,0.4)]
            dark:shadow-[4px_4px_10px_rgba(0,0,0,0.5),_-4px_-4px_10px_rgba(255,255,255,0.02)]
          `}
          style={{
            width: `${100 / filters.length}%`,
          }}
        />

        {/* Buttons */}
        {filters.map((filter, index) => (
          <button
            key={filter}
            className={`relative z-10 w-[100px] flex-1 px-4 py-3 text-sm font-medium transition-colors duration-300 text-center focus:outline-none cursor-pointer
              ${
                activeFilter === index
                  ? "text-gray-800 dark:text-white"
                  : "text-gray-500 font-semibold hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            onClick={() => setActiveFilter(index)}
          >
            {filter}
          </button>
        ))}
      </div>
    </div>
  );
};

export default FilterButtons;
