import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ChevronDownIcon } from "lucide-react";
import {
  updateDateTimeDate,
  updateDateTimeTime,
  formatDisplayTime,
} from "@/utils/dateTime";
import { EVENT_FORM_CONSTANTS } from "@/constants/eventForm";
import { useTranslations } from "next-intl";

type DateTimePickerProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  defaultTime?: string;
  error?: string;
  dateId?: string;
  timeId?: string;
};

export const DateTimePicker = ({
  label,
  value,
  onChange,
  defaultTime = EVENT_FORM_CONSTANTS.DEFAULTS.DEFAULT_START_TIME,
  error,
  dateId = "date-picker",
  timeId = "time-picker",
}: DateTimePickerProps) => {
  const [isDateOpen, setIsDateOpen] = useState(false);
  const t = useTranslations("EventsPage.adminActions.modal.editModal");

  const currentDate = value ? new Date(value) : undefined;
  const currentTime = value ? formatDisplayTime(value) : defaultTime;

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      const newDateTime = updateDateTimeDate(value, date);
      onChange(newDateTime);
    }
    setIsDateOpen(false);
  };

  const handleTimeChange = (timeValue: string) => {
    const newDateTime = updateDateTimeTime(value, timeValue);
    onChange(newDateTime);
  };

  return (
    <div className="space-y-4">
      <Label className="text-card-foreground">{label}</Label>
      <div className="flex gap-4">
        <div className="flex flex-col gap-3">
          <Label htmlFor={dateId} className="px-1">
            {t("startDateAndTime.startDate")}
          </Label>
          <Popover open={isDateOpen} onOpenChange={setIsDateOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                id={dateId}
                className="w-40 justify-between font-normal bg-card text-card-foreground border-accent"
              >
                {currentDate
                  ? currentDate.toLocaleDateString()
                  : EVENT_FORM_CONSTANTS.BUTTONS.SELECT_DATE}
                <ChevronDownIcon className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-auto overflow-hidden p-0"
              align="start"
            >
              <Calendar
                mode="single"
                selected={currentDate}
                captionLayout="dropdown"
                onSelect={handleDateSelect}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex flex-col gap-3">
          <Label htmlFor={timeId} className="px-1">
            {t("startDateAndTime.time")}
          </Label>
          <Input
            type="time"
            id={timeId}
            value={currentTime}
            onChange={(e) => handleTimeChange(e.target.value)}
            className="w-32 appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
          />
        </div>
      </div>

      {error && <p className="text-sm font-medium text-destructive">{error}</p>}
    </div>
  );
};
