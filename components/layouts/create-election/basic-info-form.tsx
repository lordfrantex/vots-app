"use client";

import {
  ChevronDown,
  ChevronRight,
  Vote,
  Clock,
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
import { Calendar } from "@/components/ui/calendar";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useState, useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { FormSectionWrapper } from "@/components/layouts/create-election/form-section-wrapper";

// Mock validation schemas and wrapper for demo
interface BasicInfoFormData {
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
  onUpdateAction?: (field: keyof BasicInfoFormData, value: string) => void;
}

// DateTime Picker Component
function DateTimePicker({
  value,
  onChange,
  placeholder = "Select date and time",
  disabled,
  error,
  minDate,
}: {
  value?: Date;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: (date: Date) => boolean;
  error?: boolean;
  minDate?: Date;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      // If we have an existing value, preserve the time
      if (value) {
        const newDate = new Date(date);
        newDate.setHours(value.getHours(), value.getMinutes(), 0, 0);
        onChange(newDate);
      } else {
        // Set default time to current time or next hour
        const now = new Date();
        const newDate = new Date(date);
        newDate.setHours(now.getHours() + 1, 0, 0, 0);
        onChange(newDate);
      }
    }
  };

  const handleTimeChange = (
    type: "hour" | "minute" | "ampm",
    timeValue: string,
  ) => {
    const currentDate = value || new Date();
    let newDate = new Date(currentDate);

    if (type === "hour") {
      const hour = parseInt(timeValue, 10);
      const currentHours = newDate.getHours();
      const isPM = currentHours >= 12;

      if (isPM && hour !== 12) {
        newDate.setHours(hour + 12);
      } else if (!isPM && hour === 12) {
        newDate.setHours(0);
      } else if (!isPM && hour !== 12) {
        newDate.setHours(hour);
      } else {
        newDate.setHours(hour);
      }
    } else if (type === "minute") {
      newDate.setMinutes(parseInt(timeValue, 10));
    } else if (type === "ampm") {
      const hours = newDate.getHours();
      if (timeValue === "AM" && hours >= 12) {
        newDate.setHours(hours - 12);
      } else if (timeValue === "PM" && hours < 12) {
        newDate.setHours(hours + 12);
      }
    }

    onChange(newDate);
  };

  const isTimeDisabled = (date: Date) => {
    if (!minDate) return false;

    // If the selected date is the same as minDate, check if time is in the past
    if (date.toDateString() === minDate.toDateString()) {
      return date <= minDate;
    }

    return false;
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full pl-3 text-left font-normal justify-start",
            !value && "text-muted-foreground",
            error && "border-red-500",
          )}
        >
          {value ? (
            format(value, "dd/MM/yyyy hh:mm aa")
          ) : (
            <span>{placeholder}</span>
          )}
          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="sm:flex dark:bg-gradient-to-tr dark:from-blue-700/10 dark:via-20% dark:to-blue-900/30 dark:shadow-lg">
          <Calendar
            mode="single"
            selected={value}
            onSelect={handleDateSelect}
            disabled={disabled}
            autoFocus
            className="rounded-md border-0"
          />
          <div className="flex flex-col sm:flex-row sm:h-[300px] divide-y sm:divide-y-0 sm:divide-x">
            {/* Hours */}
            <ScrollArea className="w-64 sm:w-auto">
              <div className="flex sm:flex-col p-2">
                {Array.from({ length: 12 }, (_, i) => i + 1).map((hour) => {
                  const isSelected =
                    value &&
                    (value.getHours() % 12 === hour % 12 ||
                      (value.getHours() % 12 === 0 && hour === 12));
                  const testDate = new Date(value || new Date());
                  testDate.setHours(
                    value && value.getHours() >= 12
                      ? hour === 12
                        ? 12
                        : hour + 12
                      : hour === 12
                        ? 0
                        : hour,
                  );
                  const isDisabled = isTimeDisabled(testDate);

                  return (
                    <Button
                      key={hour}
                      size="icon"
                      variant={isSelected ? "default" : "ghost"}
                      className="sm:w-full shrink-0 aspect-square"
                      disabled={isDisabled}
                      onClick={() => handleTimeChange("hour", hour.toString())}
                    >
                      {hour}
                    </Button>
                  );
                })}
              </div>
              <ScrollBar orientation="horizontal" className="sm:hidden" />
            </ScrollArea>

            {/* Minutes - Fixed to show all minutes 0-59 */}
            <ScrollArea className="w-64 sm:w-auto">
              <div className="flex sm:flex-col p-2">
                {Array.from({ length: 60 }, (_, i) => i).map((minute) => {
                  const isSelected = value && value.getMinutes() === minute;
                  const testDate = new Date(value || new Date());
                  testDate.setMinutes(minute);
                  const isDisabled = isTimeDisabled(testDate);

                  return (
                    <Button
                      key={minute}
                      size="icon"
                      variant={isSelected ? "default" : "ghost"}
                      className="sm:w-full shrink-0 aspect-square"
                      disabled={isDisabled}
                      onClick={() =>
                        handleTimeChange("minute", minute.toString())
                      }
                    >
                      {minute.toString().padStart(2, "0")}
                    </Button>
                  );
                })}
              </div>
              <ScrollBar orientation="horizontal" className="sm:hidden" />
            </ScrollArea>

            {/* AM/PM */}
            <ScrollArea className="">
              <div className="flex sm:flex-col p-2">
                {["AM", "PM"].map((ampm) => {
                  const isSelected =
                    value &&
                    ((ampm === "AM" && value.getHours() < 12) ||
                      (ampm === "PM" && value.getHours() >= 12));

                  return (
                    <Button
                      key={ampm}
                      size="icon"
                      variant={isSelected ? "default" : "ghost"}
                      className="sm:w-full shrink-0 aspect-square"
                      onClick={() => handleTimeChange("ampm", ampm)}
                    >
                      {ampm}
                    </Button>
                  );
                })}
              </div>
            </ScrollArea>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
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
  const [startDateTime, setStartDateTime] = useState<Date | undefined>();
  const [endDateTime, setEndDateTime] = useState<Date | undefined>();

  const errorMessages = Object.values(errors)
    .map((error) => error?.message)
    .filter(Boolean) as string[];

  // Initialize date/time states from form values
  useEffect(() => {
    if (watchedValues.startDate) {
      const startDate = new Date(watchedValues.startDate);
      setStartDateTime(startDate);
    }
    if (watchedValues.endDate) {
      const endDate = new Date(watchedValues.endDate);
      setEndDateTime(endDate);
    }
  }, [watchedValues.startDate, watchedValues.endDate]);

  const handleStartDateTimeChange = (date: Date | undefined) => {
    setStartDateTime(date);
    if (date) {
      const isoString = date.toISOString();
      setValue("startDate", isoString, { shouldValidate: true });

      // Trigger validation for both dates to check cross-field validation
      trigger(["startDate", "endDate"]);

      if (onUpdateAction) {
        onUpdateAction("startDate", isoString);
      }

      // If end date is before new start date, clear it
      if (endDateTime && endDateTime <= date) {
        setEndDateTime(undefined);
        setValue("endDate", "", { shouldValidate: true });
        if (onUpdateAction) {
          onUpdateAction("endDate", "");
        }
      }
    }
  };

  const handleEndDateTimeChange = (date: Date | undefined) => {
    setEndDateTime(date);
    if (date) {
      const isoString = date.toISOString();
      setValue("endDate", isoString, { shouldValidate: true });

      trigger(["startDate", "endDate"]);

      if (onUpdateAction) {
        onUpdateAction("endDate", isoString);
      }
    }
  };

  // Get current date for validation
  const now = new Date();

  // Disable dates in the past
  const isDateDisabled = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  // For end date, disable dates before start date
  const isEndDateDisabled = (date: Date) => {
    if (isDateDisabled(date)) return true;
    if (startDateTime) {
      const startDateOnly = new Date(startDateTime);
      startDateOnly.setHours(0, 0, 0, 0);
      return date < startDateOnly;
    }
    return false;
  };

  return (
    <FormSectionWrapper
      isValid={isValid}
      canAccess={canAccess}
      errors={errorMessages}
      title="Election Basic Information"
    >
      <Card className="bg-gray-50 dark:bg-gray-900 py-6 rounded-lg shadow-lg shadow-gray-400/10 dark:shadow-2xl/25">
        <CardHeader className="cursor-pointer" onClick={onToggle}>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-3 text-xl text-gray-700 dark:text-gray-200">
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
              {/* Start Date and Time */}
              <div className="space-y-2">
                <Label className="text-gray-600 dark:text-gray-300 flex items-center space-x-2">
                  <CalendarIcon className="w-4 h-4" />
                  <span>Start Date & Time *</span>
                </Label>
                <DateTimePicker
                  value={startDateTime}
                  onChange={handleStartDateTimeChange}
                  placeholder="Select start date and time"
                  disabled={isDateDisabled}
                  error={!!errors.startDate}
                  minDate={now}
                />
                {errors.startDate && (
                  <p className="text-red-700 dark:text-red-400 text-sm">
                    {errors.startDate.message}
                  </p>
                )}
              </div>

              {/* End Date and Time */}
              <div className="space-y-2">
                <Label className="text-gray-600 dark:text-gray-300 flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span>End Date & Time *</span>
                </Label>
                <DateTimePicker
                  value={endDateTime}
                  onChange={handleEndDateTimeChange}
                  placeholder="Select end date and time"
                  disabled={isEndDateDisabled}
                  error={!!errors.endDate}
                  minDate={startDateTime || now}
                />
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
