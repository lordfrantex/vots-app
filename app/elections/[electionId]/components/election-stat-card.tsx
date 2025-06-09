import React, { JSX } from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: JSX.Element;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon }) => (
  <div className="bg-[#D6DADD]/30 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-300 dark:border-gray-600">
    <div className="flex items-center gap-3">
      <div className="text-blue-400 bg-blue-300/20 dark:bg-[#243B60] p-4 rounded-full">
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-400 dark:text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-700 dark:text-gray-200">
          {value}
        </p>
      </div>
    </div>
  </div>
);

export default StatCard;
