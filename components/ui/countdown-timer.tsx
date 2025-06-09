"use client";

import React, { useEffect, useState } from "react";
import {
  calculateTimeRemaining,
  formatNumber,
  TimeRemaining,
} from "@/lib/utils";

const CountdownTimer: React.FC<{
  targetDate: Date;
  status: string;
  isStartDate?: boolean;
}> = ({ targetDate, status, isStartDate = false }) => {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>(
    calculateTimeRemaining(targetDate, status),
  );

  useEffect(() => {
    if (status === "COMPLETED") {
      setTimeRemaining({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      return;
    }

    const timer = setInterval(() => {
      setTimeRemaining(calculateTimeRemaining(targetDate, status));
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate, status]);

  const getTimerLabel = () => {
    if (status === "COMPLETED") return "Election ended";
    if (status === "UPCOMING")
      return isStartDate ? "Election starts in:" : "Election ends in:";
    return "Election closes in:";
  };

  return (
    <div className="mt-6">
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        {getTimerLabel()}
      </p>
      <div className="flex gap-6">
        <div className="text-center">
          <div className="bg-indigo-200/20 shadow-[6px_6px_12px_rgba(0,0,0,0.2),_-6px_-6px_12px_rgba(255,255,255,0.4)] dark:shadow-[4px_4px_10px_rgba(0,0,0,0.3),_-4px_-4px_10px_rgba(255,255,255,0.02)] dark:bg-indigo-950 px-4 py-2 rounded-lg min-w-[60px]">
            <div className="text-2xl font-bold text-[#697AA1] dark:text-blue-400">
              {formatNumber(timeRemaining.days)}
            </div>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-wide">
            DAYS
          </div>
        </div>
        <div className="text-center">
          <div className="bg-indigo-200/20 shadow-[6px_6px_12px_rgba(0,0,0,0.2),_-6px_-6px_12px_rgba(255,255,255,0.2)] dark:shadow-[4px_4px_10px_rgba(0,0,0,0.3),_-4px_-4px_10px_rgba(255,255,255,0.02)] dark:bg-indigo-950 px-4 py-2 rounded-lg min-w-[60px]">
            <div className="text-2xl font-bold text-[#697AA1] dark:text-blue-400">
              {formatNumber(timeRemaining.hours)}
            </div>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-wide">
            HOURS
          </div>
        </div>
        <div className="text-center">
          <div className="bg-indigo-200/20 shadow-[6px_6px_12px_rgba(0,0,0,0.2),_-6px_-6px_12px_rgba(255,255,255,0.2)] dark:shadow-[4px_4px_10px_rgba(0,0,0,0.3),_-4px_-4px_10px_rgba(255,255,255,0.02)] dark:bg-indigo-950 px-4 py-2 rounded-lg min-w-[60px]">
            <div className="text-2xl font-bold text-[#697AA1] dark:text-blue-400">
              {formatNumber(timeRemaining.minutes)}
            </div>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-wide">
            MINS
          </div>
        </div>
        <div className="text-center">
          <div className="bg-indigo-200/20 shadow-[6px_6px_12px_rgba(0,0,0,0.2),_-6px_-6px_12px_rgba(255,255,255,0.2)] dark:shadow-[4px_4px_10px_rgba(0,0,0,0.3),_-4px_-4px_10px_rgba(255,255,255,0.02)] dark:bg-indigo-950 px-4 py-2 rounded-lg min-w-[60px]">
            <div className="text-2xl font-bold text-[#697AA1] dark:text-blue-400">
              {formatNumber(timeRemaining.seconds)}
            </div>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-wide">
            SECS
          </div>
        </div>
      </div>
    </div>
  );
};

export default CountdownTimer;
