import React, { useState } from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";

interface DateRange {
  from: Date | null;
  to: Date | null;
}

interface DateRangePickerProps {
  dateRange: DateRange;
  onDateRangeChange: (dateRange: DateRange) => void;
}

export function DateRangePicker({
  dateRange,
  onDateRangeChange,
}: DateRangePickerProps) {
  const [isFromOpen, setIsFromOpen] = useState(false);
  const [isToOpen, setIsToOpen] = useState(false);

  const handleFromSelect = (date: Date | undefined) => {
    if (date) {
      onDateRangeChange({ ...dateRange, from: date });
      setIsFromOpen(false);
    }
  };

  const handleToSelect = (date: Date | undefined) => {
    if (date) {
      onDateRangeChange({ ...dateRange, to: date });
      setIsToOpen(false);
    }
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="from-date">From Date</Label>
        <Popover open={isFromOpen} onOpenChange={setIsFromOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !dateRange.from && "text-muted-foreground",
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateRange.from
                ? format(dateRange.from, "MMM dd, yyyy")
                : "Select date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={dateRange.from || undefined}
              onSelect={handleFromSelect}
              disabled={(date) => {
                // Disable future dates and dates after the "to" date
                const today = new Date();
                today.setHours(23, 59, 59, 999);
                return date > today || (dateRange.to && date > dateRange.to);
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-2">
        <Label htmlFor="to-date">To Date</Label>
        <Popover open={isToOpen} onOpenChange={setIsToOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !dateRange.to && "text-muted-foreground",
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateRange.to
                ? format(dateRange.to, "MMM dd, yyyy")
                : "Select date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={dateRange.to || undefined}
              onSelect={handleToSelect}
              disabled={(date) => {
                // Disable future dates and dates before the "from" date
                const today = new Date();
                today.setHours(23, 59, 59, 999);
                return (
                  date > today || (dateRange.from && date < dateRange.from)
                );
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
