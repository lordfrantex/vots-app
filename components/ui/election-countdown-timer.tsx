import React, { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";

interface CountdownTimerProps {
  startDate?: string | Date;
  endDate: string | Date;
  status: string;
  onTimeEnd?: () => void;
  className?: string;
  showLabel?: boolean;
  customLabel?: string;
  size?: "sm" | "md" | "lg";
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
}

const ElectionCountdownTimer: React.FC<CountdownTimerProps> = ({
  startDate,
  endDate,
  status,
  onTimeEnd,
  className,
  showLabel = true,
  customLabel = "",
  size = "md",
}) => {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    total: 0,
  });
  const [hasEnded, setHasEnded] = useState(false);

  const calculateTimeRemaining = useCallback((): TimeRemaining => {
    const now = new Date().getTime();
    let targetTime: number;

    // Determine which date to count down to based on status
    if (status === "UPCOMING" && startDate) {
      targetTime = new Date(startDate).getTime();
    } else {
      targetTime = new Date(endDate).getTime();
    }

    const difference = targetTime - now;

    if (difference <= 0) {
      return {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        total: 0,
      };
    }

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
    );
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);

    return {
      days,
      hours,
      minutes,
      seconds,
      total: difference,
    };
  }, [startDate, endDate, status]);

  useEffect(() => {
    if (status === "COMPLETED") {
      setTimeRemaining({ days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 });
      setHasEnded(true);
      return;
    }

    const updateTimer = () => {
      const newTimeRemaining = calculateTimeRemaining();
      setTimeRemaining(newTimeRemaining);

      if (newTimeRemaining.total <= 0 && !hasEnded) {
        setHasEnded(true);
        if (onTimeEnd) {
          onTimeEnd();
        }
      }
    };

    // Update immediately
    updateTimer();

    // Set up interval to update every second
    const interval = setInterval(updateTimer, 1000);

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, [calculateTimeRemaining, hasEnded, onTimeEnd, status]);

  // Format number with leading zero
  const formatNumber = (num: number): string => {
    return num.toString().padStart(2, "0");
  };

  // Get timer label based on status
  const getTimerLabel = () => {
    if (status === "COMPLETED") return "Election has ended";
    if (status === "UPCOMING") return "Election starts in:";
    return "Election closes in:";
  };

  // Get size classes
  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return {
          container: "text-sm",
          label: "text-sm font-medium",
          timer: "text-lg font-bold",
          unit: "text-xs",
        };
      case "lg":
        return {
          container: "text-lg",
          label: "text-lg font-semibold",
          timer: "text-3xl font-bold",
          unit: "text-sm",
        };
      default: // md
        return {
          container: "text-base",
          label: "text-base font-medium",
          timer: "text-2xl font-bold",
          unit: "text-sm",
        };
    }
  };

  const sizeClasses = getSizeClasses();

  // If time has ended
  if (hasEnded || status === "COMPLETED") {
    return (
      <div className={cn("text-center", sizeClasses.container, className)}>
        {showLabel && (
          <p className={cn("text-muted-foreground", sizeClasses.label)}>
            {getTimerLabel()}
          </p>
        )}
        <div className={cn("text-blue-500", sizeClasses.timer)}>
          00:00:00:00
        </div>
      </div>
    );
  }

  return (
    <div className={cn("text-center", sizeClasses.container, className)}>
      <div className={cn("font-mono tracking-wider flex", sizeClasses.timer)}>
        <span className="text-primary flex flex-col">
          {formatNumber(timeRemaining.days)}
          <span
            className={
              "text-muted-foreground text-xs text-[10px] uppercase font-normal"
            }
          >
            Days
          </span>
        </span>
        <span className="text-muted-foreground mx-1">:</span>
        <span className="text-primary flex flex-col">
          {formatNumber(timeRemaining.hours)}
          <span
            className={
              "text-muted-foreground text-[10px] uppercase font-normal"
            }
          >
            Hours
          </span>
        </span>
        <span className="text-muted-foreground mx-1">:</span>
        <span className="text-primary flex flex-col">
          {formatNumber(timeRemaining.minutes)}
          <span
            className={
              "text-muted-foreground text-[10px] uppercase font-normal"
            }
          >
            Mins
          </span>
        </span>
        <span className="text-muted-foreground mx-1">:</span>
        <span className="text-primary flex flex-col">
          {formatNumber(timeRemaining.seconds)}
          <span
            className={
              "text-muted-foreground text-[10px] uppercase font-normal"
            }
          >
            Secs
          </span>
        </span>
      </div>
    </div>
  );
};

export default ElectionCountdownTimer;
