"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { LoadingState, ErrorState, EmptyState } from "@/components/states";
import {
  CalorieProgressBanner,
  ChartHeader,
  ChartContent,
} from "@/components/calorie";
import { useCalorieChart } from "@/hooks";

const CalorieChart = () => {
  const {
    calorieData,
    chartData,
    totals,
    isLoading,
    hasError,
    hasData,
    activeChart,
    setActiveChart,
    formatTooltipValue,
    formatTooltipLabel,
    CALORIES_PER_EVENT,
  } = useCalorieChart();

  if (isLoading) {
    return <LoadingState message="Loading calorie data..." />;
  }

  if (hasError) {
    return (
      <ErrorState message="Failed to load calorie data" errorType="server" />
    );
  }

  if (!hasData) {
    return (
      <EmptyState
        title="No data available"
        message="No event attendance data available"
      />
    );
  }

  return (
    <div className="space-y-6">
      <CalorieProgressBanner
        totalCalories={calorieData!.totalCalories}
        caloriesPerEvent={CALORIES_PER_EVENT}
      />

      <Card className="py-4 sm:py-0">
        <CardHeader>
          <ChartHeader
            activeChart={activeChart}
            totals={totals}
            onTabChange={setActiveChart}
            caloriesPerEvent={CALORIES_PER_EVENT}
          />
        </CardHeader>
        <CardContent className="px-2 sm:p-6">
          <ChartContent
            chartData={chartData}
            activeChart={activeChart}
            formatTooltipValue={formatTooltipValue}
            formatTooltipLabel={formatTooltipLabel}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default CalorieChart;
