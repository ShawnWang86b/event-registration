import * as React from "react";
import { useCalorieData } from "@/hooks";

const CALORIES_PER_EVENT = 500;

/**
 * Custom hook for CalorieChart component logic
 * Handles data fetching, transformation, and state management
 */
export const useCalorieChart = () => {
  const { data: calorieData, isLoading, error } = useCalorieData();
  const [activeChart, setActiveChart] = React.useState<"calories" | "events">(
    "calories"
  );

  // Transform data for the chart
  const chartData = React.useMemo(() => {
    if (!calorieData?.calorieData) return [];

    return calorieData.calorieData.map((item) => ({
      date: item.monthYear,
      monthName: item.monthName,
      calories: item.calories,
      events: item.events,
    }));
  }, [calorieData]);

  // Calculate totals
  const totals = React.useMemo(() => {
    if (!calorieData) return { calories: 0, events: 0 };

    return {
      calories: calorieData.totalCalories,
      events: calorieData.totalEvents,
    };
  }, [calorieData]);

  // Format chart tooltip values
  const formatTooltipValue = (
    value: unknown,
    name: unknown
  ): [string, string] => {
    const numValue = Number(value);
    const nameStr = String(name);
    return [
      nameStr === "calories"
        ? `${numValue.toLocaleString()} `
        : `${numValue} events`,
      nameStr === "calories" ? "Calories Burned" : "Events Attended",
    ];
  };

  // Format chart tooltip label
  const formatTooltipLabel = (value: unknown, payload: any) => {
    if (payload && payload[0]) {
      return payload[0].payload.monthName;
    }
    return value;
  };

  // Derived states
  const hasData = calorieData && calorieData.calorieData.length > 0;
  const hasError = !!error;

  return {
    // Data
    calorieData,
    chartData,
    totals,

    // States
    isLoading,
    hasError,
    hasData,
    activeChart,
    setActiveChart,

    // Formatters
    formatTooltipValue,
    formatTooltipLabel,

    // Constants
    CALORIES_PER_EVENT,
  };
};
