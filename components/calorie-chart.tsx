"use client";

import * as React from "react";
import { CartesianGrid, Line, LineChart, XAxis } from "recharts";
import { useCalorieData } from "@/hooks";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Flame, Trophy, Calendar } from "lucide-react";
import { Spinner } from "./ui/shadcn-io/spinner";

const chartConfig = {
  views: {
    label: "Fitness Progress",
  },
  calories: {
    label: "Calories",
    color: "hsl(var(--chart-1))",
  },
  events: {
    label: "Events",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

const CalorieChart = () => {
  const { data: calorieData, isLoading, error } = useCalorieData();
  const [activeChart, setActiveChart] =
    React.useState<keyof typeof chartConfig>("calories");

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
  const total = React.useMemo(() => {
    if (!calorieData) return { calories: 0, events: 0 };

    return {
      calories: calorieData.totalCalories,
      events: calorieData.totalEvents,
    };
  }, [calorieData]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground text-lg">
            Calorie Consumption Progress
          </CardTitle>
          <CardDescription className="text-primary text-md">
            Track your fitness progress through event attendance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <Spinner variant="ellipsis" className="text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground text-lg">
            Calorie Consumption Progress
          </CardTitle>
          <CardDescription className="text-primary text-md">
            Track your fitness progress through event attendance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-primary text-lg">Error loading calorie data</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!calorieData || calorieData.calorieData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground text-lg">
            Calorie Consumption Progress
          </CardTitle>
          <CardDescription className="text-primary text-md">
            Track your fitness progress through event attendance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-primary text-lg">
              No event attendance data available
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Calorie Message */}
      <div className="text-center p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border border-orange-200">
        <p className="text-lg font-semibold text-orange-800">
          You&apos;ve burned {calorieData.totalCalories.toLocaleString()}{" "}
          calories since joining this club!
        </p>
        <p className="text-sm text-orange-600 mt-1">
          Keep up the great work! Each event you attend burns 500 calories.
        </p>
      </div>

      {/* Interactive Chart */}
      <Card className="py-4 sm:py-0">
        <CardHeader className="flex flex-col items-stretch border-b !p-0 sm:flex-row">
          <div className="flex flex-1 flex-col justify-center gap-1 px-6 pb-3 sm:pb-0">
            <CardTitle className="flex items-center gap-2">
              <Flame className="h-5 w-5" />
              Fitness Progress Over Time
            </CardTitle>
            <CardDescription>
              Track your calorie consumption and event attendance by month (500
              calories per event)
            </CardDescription>
          </div>
          <div className="flex">
            {["calories", "events"].map((key) => {
              const chart = key as keyof typeof chartConfig;
              return (
                <button
                  key={chart}
                  data-active={activeChart === chart}
                  className="data-[active=true]:bg-muted/50 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l sm:border-t-0 sm:border-l sm:px-8 sm:py-6"
                  onClick={() => setActiveChart(chart)}
                >
                  <span className="text-muted-foreground text-xs">
                    {chartConfig[chart].label}
                  </span>
                  <span className="text-lg leading-none font-bold sm:text-3xl">
                    {key === "calories"
                      ? total.calories.toLocaleString()
                      : total.events.toLocaleString()}
                  </span>
                </button>
              );
            })}
          </div>
        </CardHeader>
        <CardContent className="px-2 sm:p-6">
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[200px] w-full"
          >
            <LineChart
              accessibilityLayer
              data={chartData}
              margin={{
                left: 12,
                right: 12,
                top: 10,
                bottom: 10,
              }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="monthName"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                angle={-45}
                textAnchor="end"
                height={50}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    className="w-[200px]"
                    nameKey="views"
                    labelFormatter={(value, payload) => {
                      if (payload && payload[0]) {
                        return payload[0].payload.monthName;
                      }
                      return value;
                    }}
                    formatter={(value, name) => [
                      name === "calories"
                        ? `${value.toLocaleString()} cal`
                        : `${value} events`,
                      name === "calories"
                        ? "Calories Burned"
                        : "Events Attended",
                    ]}
                  />
                }
              />
              <Line
                dataKey={activeChart}
                type="monotone"
                stroke={`var(--color-${activeChart})`}
                strokeWidth={3}
                dot={{
                  fill: `var(--color-${activeChart})`,
                  strokeWidth: 2,
                  r: 4,
                }}
                activeDot={{
                  r: 6,
                  stroke: `var(--color-${activeChart})`,
                  strokeWidth: 2,
                }}
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default CalorieChart;
