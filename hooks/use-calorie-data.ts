import { useQuery } from "@tanstack/react-query";

export interface CalorieDataPoint {
  monthYear: string;
  monthName: string;
  year: number;
  month: number;
  calories: number;
  events: number;
}

export interface CalorieDataResponse {
  calorieData: CalorieDataPoint[];
  totalCalories: number;
  totalEvents: number;
  joinDate: string;
}

export const useCalorieData = () => {
  return useQuery<CalorieDataResponse>({
    queryKey: ["calorie-data"],
    queryFn: async () => {
      const response = await fetch("/api/user/calorie-data");

      if (!response.ok) {
        throw new Error("Failed to fetch calorie data");
      }

      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};
