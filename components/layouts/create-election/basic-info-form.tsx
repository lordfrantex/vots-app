"use client";

import {
  ChevronDown,
  ChevronRight,
  Vote,
  Clock,
  ChevronDownIcon,
  Calendar as CalendarIcon,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { UseFormReturn } from "react-hook-form";
import { BasicInfoFormData } from "@/lib/validation-schemas";
import { FormSectionWrapper } from "@/components/layouts/create-election/form-section-wrapper";

interface BasicInfoData {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  timezone: string;
}

interface BasicInfoFormProps {
  form: UseFormReturn<BasicInfoFormData>;
  isExpanded: boolean;
  onToggle: () => void;
  canAccess: boolean;
  isValid: boolean;
  onUpdateAction?: (field: keyof BasicInfoData, value: string) => void;
}

export function BasicInfoForm({
  form,
  isExpanded,
  onToggle,
  onUpdateAction,
  canAccess,
  isValid,
}: BasicInfoFormProps) {
  const {
    register,
    setValue,
    watch,
    trigger,
    formState: { errors },
  } = form;
  const watchedValues = watch();

  const errorMessages = Object.values(errors)
    .map((error) => error?.message)
    .filter(Boolean) as string[];

  // State for date/time pickers
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [startTime, setStartTime] = useState("10:30:00");

  const [endDateOpen, setEndDateOpen] = useState(false);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [endTime, setEndTime] = useState("10:30:00");

  // Initialize date/time states from form values
  useEffect(() => {
    if (watchedValues.startDate) {
      const startDateTime = new Date(watchedValues.startDate);
      setStartDate(startDateTime);
      setStartTime(startDateTime.toTimeString().slice(0, 8));
    }
    if (watchedValues.endDate) {
      const endDateTime = new Date(watchedValues.endDate);
      setEndDate(endDateTime);
      setEndTime(endDateTime.toTimeString().slice(0, 8));
    }
  }, [watchedValues.startDate, watchedValues.endDate]);

  // Helper function to create and validate datetime
  const createAndValidateDateTime = (
    date: Date,
    time: string,
    fieldName: "startDate" | "endDate",
  ) => {
    const [hours, minutes, seconds] = time.split(":").map(Number);
    const fullDateTime = new Date(date);
    fullDateTime.setHours(hours, minutes, seconds, 0);

    // Validate that the datetime is in the future
    const now = new Date();
    if (fullDateTime <= now) {
      // Set a custom error that will be caught by the form validation
      return null;
    }

    const isoString = fullDateTime.toISOString();
    setValue(fieldName, isoString, { shouldValidate: true });

    // Trigger validation for both start and end dates to check cross-field validation
    trigger(["startDate", "endDate"]);

    // Call the update action if provided
    if (onUpdateAction) {
      onUpdateAction(fieldName, isoString);
    }

    return fullDateTime;
  };

  // Function to handle start date selection
  const handleStartDateSelect = (selectedDate: Date | undefined) => {
    setStartDate(selectedDate);
    setStartDateOpen(false);

    if (selectedDate) {
      const result = createAndValidateDateTime(
        selectedDate,
        startTime,
        "startDate",
      );

      if (result) {
        console.log("Start Date Selected:", {
          date: selectedDate.toLocaleDateString(),
          time: startTime,
          fullTimestamp: result.toISOString(),
          unixTimestamp: result.getTime(),
        });
      }
    }
  };

  // Function to handle end date selection
  const handleEndDateSelect = (selectedDate: Date | undefined) => {
    setEndDate(selectedDate);
    setEndDateOpen(false);

    if (selectedDate) {
      const result = createAndValidateDateTime(
        selectedDate,
        endTime,
        "endDate",
      );

      if (result) {
        console.log("End Date Selected:", {
          date: selectedDate.toLocaleDateString(),
          time: endTime,
          fullTimestamp: result.toISOString(),
          unixTimestamp: result.getTime(),
        });
      }
    }
  };

  // Function to handle start time changes
  const handleStartTimeChange = (newTime: string) => {
    setStartTime(newTime);

    if (startDate) {
      const result = createAndValidateDateTime(startDate, newTime, "startDate");

      if (result) {
        console.log("Start Time Changed:", {
          date: startDate.toLocaleDateString(),
          time: newTime,
          fullTimestamp: result.toISOString(),
          unixTimestamp: result.getTime(),
        });
      }
    }
  };

  // Function to handle end time changes
  const handleEndTimeChange = (newTime: string) => {
    setEndTime(newTime);

    if (endDate) {
      const result = createAndValidateDateTime(endDate, newTime, "endDate");

      if (result) {
        console.log("End Time Changed:", {
          date: endDate.toLocaleDateString(),
          time: newTime,
          fullTimestamp: result.toISOString(),
          unixTimestamp: result.getTime(),
        });
      }
    }
  };

  // Get today's date for calendar min date
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Get current time for time input validation
  const getCurrentTime = () => {
    const now = new Date();
    return now.toTimeString().slice(0, 8);
  };

  // Check if selected date is today
  const isToday = (date: Date | undefined) => {
    if (!date) return false;
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };
  const getMinTime = (selectedDate: Date | undefined) => {
    if (!selectedDate) return undefined;

    // If the selected date is today, minimum time is current time
    if (isToday(selectedDate)) {
      return getCurrentTime();
    }

    // For future dates, no minimum time restriction
    return undefined;
  };

  return (
    <FormSectionWrapper
      isValid={isValid}
      canAccess={canAccess}
      errors={errorMessages}
      title="Election Basic Information"
    >
      <Card
        className="bg-gray-50 dark:bg-gray-900 py-6 rounded-lg shadow-xl
            dark:shadow-2xl/25"
      >
        <CardHeader className="cursor-pointer" onClick={onToggle}>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-3 text-xl ">
              <Vote className="w-5 h-5 text-blue-400" />
              <span>Election Basic Information</span>
            </CardTitle>
            {isExpanded ? (
              <ChevronDown className="w-5 h-5" />
            ) : (
              <ChevronRight className="w-5 h-5" />
            )}
          </div>
        </CardHeader>

        {isExpanded && (
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label
                  htmlFor="election-name"
                  className="text-gray-600 dark:text-gray-300"
                >
                  Election Name *
                </Label>
                <Input
                  id="election-name"
                  className={`bg-background/50 ${errors.name ? "border-red-500" : ""}`}
                  placeholder="Enter election name"
                  {...register("name")}
                />
                {errors.name && (
                  <p className="text-red-700 dark:text-red-400 text-sm">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="timezone"
                  className="text-gray-600 dark:text-gray-300"
                >
                  Timezone *
                </Label>
                <Select
                  onValueChange={(value) =>
                    setValue("timezone", value, { shouldValidate: true })
                  }
                  value={watchedValues.timezone}
                >
                  <SelectTrigger
                    className={`w-full bg-background/50 cursor-pointer ${errors.timezone ? "border-red-500" : ""}`}
                  >
                    <SelectValue placeholder="Select timezone" />
                  </SelectTrigger>
                  <SelectContent className="bg-background/20 backdrop-blur-2xl border-white/10 cursor-pointer">
                    <SelectItem className="cursor-pointer" value="UTC">
                      UTC
                    </SelectItem>
                    <SelectItem value="EST">Eastern Time</SelectItem>
                    <SelectItem value="PST">Pacific Time</SelectItem>
                    <SelectItem value="GMT">Greenwich Mean Time</SelectItem>
                  </SelectContent>
                </Select>
                {errors.timezone && (
                  <p className="text-red-700 dark:text-red-400 text-sm">
                    {errors.timezone.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="description"
                className="text-gray-600 dark:text-gray-300"
              >
                Description *
              </Label>
              <Textarea
                id="description"
                className={`bg-background/50 min-h-[100px] ${errors.description ? "border-red-500" : ""}`}
                placeholder="Describe the election purpose and details (max 100 characters)"
                {...register("description")}
              />
              {errors.description && (
                <p className="text-red-700 dark:text-red-400 text-sm">
                  {errors.description.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Start Date and time */}
              <div className="space-y-2">
                <Label
                  htmlFor="start-date"
                  className="text-gray-600 dark:text-gray-300 flex items-center space-x-2"
                >
                  <CalendarIcon className="w-4 h-4" />
                  <span>Start Date & Time *</span>
                </Label>
                <div className="flex gap-4">
                  <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        id="start-date"
                        className={`w-1/2 justify-between font-normal ${errors.startDate ? "border-red-500" : ""}`}
                      >
                        {startDate
                          ? startDate.toLocaleDateString()
                          : "Select date"}
                        <ChevronDownIcon />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-auto overflow-hidden p-0"
                      align="start"
                    >
                      <Calendar
                        mode="single"
                        selected={startDate}
                        captionLayout="dropdown"
                        onSelect={handleStartDateSelect}
                        disabled={(date) => date < today}
                        className="bg-white dark:bg-gray-800"
                      />
                    </PopoverContent>
                  </Popover>

                  <Input
                    type="time"
                    id="start-time"
                    step="1"
                    value={startTime}
                    min={getMinTime(startDate)}
                    onChange={(e) => handleStartTimeChange(e.target.value)}
                    className={`w-1/2 bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none ${errors.startDate ? "border-red-500" : ""}`}
                  />
                </div>
                {errors.startDate && (
                  <p className="text-red-700 dark:text-red-400 text-sm">
                    {errors.startDate.message}
                  </p>
                )}
              </div>

              {/* End date and time */}
              <div className="space-y-2">
                <Label
                  htmlFor="end-date"
                  className="text-gray-600 dark:text-gray-300 flex items-center space-x-2"
                >
                  <Clock className="w-4 h-4" />
                  <span>End Date & Time *</span>
                </Label>
                <div className="flex gap-4">
                  <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        id="end-date"
                        className={`w-1/2 justify-between font-normal ${errors.endDate ? "border-red-500" : ""}`}
                      >
                        {endDate ? endDate.toLocaleDateString() : "Select date"}
                        <ChevronDownIcon />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-auto overflow-hidden p-0"
                      align="start"
                    >
                      <Calendar
                        mode="single"
                        selected={endDate}
                        captionLayout="dropdown"
                        onSelect={handleEndDateSelect}
                        disabled={(date) => date < today}
                        className="bg-white dark:bg-gray-800"
                      />
                    </PopoverContent>
                  </Popover>

                  <Input
                    type="time"
                    id="end-time"
                    step="1"
                    value={endTime}
                    min={isToday(endDate) ? getCurrentTime() : undefined}
                    onChange={(e) => handleEndTimeChange(e.target.value)}
                    className={`w-1/2 bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none ${errors.endDate ? "border-red-500" : ""}`}
                  />
                </div>
                {errors.endDate && (
                  <p className="text-red-700 dark:text-red-400 text-sm">
                    {errors.endDate.message}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </FormSectionWrapper>
  );
}
