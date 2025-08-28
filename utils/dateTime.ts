import { format, parseISO, isValid } from "date-fns";
import { fromZonedTime, toZonedTime } from "date-fns-tz";

// Get user's timezone
const getUserTimezone = () => Intl.DateTimeFormat().resolvedOptions().timeZone;

// Helper function to parse and validate date input
const parseAndValidateDate = (dateInput: string | Date): Date | null => {
  try {
    const date =
      typeof dateInput === "string" ? parseISO(dateInput) : dateInput;
    return isValid(date) ? date : null;
  } catch {
    return null;
  }
};

// Helper function to convert UTC to local timezone
const convertToLocalTimezone = (utcDate: Date): Date => {
  const userTimezone = getUserTimezone();
  return toZonedTime(utcDate, userTimezone);
};

// Convert local date/time to UTC for storage
export const localToUTC = (dateStr: string, timeStr: string): string => {
  const userTimezone = getUserTimezone();
  const localDateTime = `${dateStr}T${timeStr}:00`;

  // Parse as local time in user's timezone
  const localDate = new Date(localDateTime);

  // Convert to UTC for consistent storage
  const utcDate = fromZonedTime(localDate, userTimezone);

  return utcDate.toISOString();
};

// Convert UTC date from storage to local for display
export const utcToLocal = (
  utcDateStr: string
): { date: string; time: string } => {
  const utcDate = parseAndValidateDate(utcDateStr);

  if (!utcDate) {
    throw new Error(`Invalid date: ${utcDateStr}`);
  }

  const localDate = convertToLocalTimezone(utcDate);

  return {
    date: format(localDate, "yyyy-MM-dd"),
    time: format(localDate, "HH:mm"),
  };
};

// Format datetime-local input value
export const formatDateTimeLocal = (utcDateInput: string | Date): string => {
  const utcDate = parseAndValidateDate(utcDateInput);

  if (!utcDate) {
    return "";
  }

  const localDate = convertToLocalTimezone(utcDate);
  return format(localDate, "yyyy-MM-dd'T'HH:mm");
};

// Parse datetime-local input to UTC
export const parseDateTimeLocal = (dateTimeLocal: string): string => {
  const userTimezone = getUserTimezone();
  const localDate = new Date(dateTimeLocal);
  const utcDate = fromZonedTime(localDate, userTimezone);

  return utcDate.toISOString();
};

// Combine date and time into datetime-local format
export const combineDateAndTime = (
  currentDateTime: string,
  newDate?: Date,
  newTime?: string
): string => {
  let date: Date;
  let time: string;

  if (currentDateTime) {
    const current = parseAndValidateDate(currentDateTime);
    if (!current) {
      date = newDate || new Date();
      time = newTime || "10:00";
    } else {
      date = newDate || current;
      time = newTime || format(current, "HH:mm");
    }
  } else {
    date = newDate || new Date();
    time = newTime || "10:00";
  }

  // Combine date and time
  const [hours, minutes] = time.split(":").map((num) => parseInt(num, 10));
  const combined = new Date(date);
  combined.setHours(hours, minutes, 0, 0);

  return format(combined, "yyyy-MM-dd'T'HH:mm");
};

// Update date component of datetime-local string
export const updateDateTimeDate = (
  currentDateTime: string,
  newDate: Date
): string => {
  return combineDateAndTime(currentDateTime, newDate);
};

// Update time component of datetime-local string
export const updateDateTimeTime = (
  currentDateTime: string,
  newTime: string
): string => {
  return combineDateAndTime(currentDateTime, undefined, newTime);
};

// Generic display formatter with fallback
const formatForDisplay = (
  dateInput: string | Date,
  formatString: string,
  fallback: string = "Invalid Date"
): string => {
  const utcDate = parseAndValidateDate(dateInput);

  if (!utcDate) {
    return fallback;
  }

  const localDate = convertToLocalTimezone(utcDate);
  return format(localDate, formatString);
};

// Format date for display (handles timezone conversion)
export const formatDisplayDate = (utcDateStr: string | Date): string => {
  return formatForDisplay(utcDateStr, "MMM d, yyyy");
};

// Format time for display (handles timezone conversion)
export const formatDisplayTime = (utcDateStr: string | Date): string => {
  return formatForDisplay(utcDateStr, "HH:mm", "Invalid Time");
};

// Format time range for display
export const formatDisplayTimeRange = (
  startDateStr: string | Date,
  endDateStr: string | Date
): string => {
  const startTime = formatDisplayTime(startDateStr);
  const endTime = formatDisplayTime(endDateStr);

  // Handle case where either time is invalid
  if (startTime === "Invalid Time" || endTime === "Invalid Time") {
    return "Invalid Time Range";
  }

  return `${startTime} - ${endTime}`;
};

// Format date with weekday for display (handles timezone conversion)
export const formatDisplayDateLong = (utcDateStr: string | Date): string => {
  return formatForDisplay(utcDateStr, "EEEE, MMM d, yyyy");
};

// Format time for display with 12-hour format (handles timezone conversion)
export const formatDisplayTime12Hour = (utcDateStr: string | Date): string => {
  return formatForDisplay(utcDateStr, "h:mm a", "Invalid Time");
};
