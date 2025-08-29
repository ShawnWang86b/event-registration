import { CartesianGrid, Line, LineChart, XAxis } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

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

type ChartData = {
  date: string;
  monthName: string;
  calories: number;
  events: number;
};

type ChartContentProps = {
  chartData: ChartData[];
  activeChart: "calories" | "events";
  formatTooltipValue: (value: unknown, name: unknown) => [string, string];
  formatTooltipLabel: (value: unknown, payload: any) => string;
};

export const ChartContent = ({
  chartData,
  activeChart,
  formatTooltipValue,
  formatTooltipLabel,
}: ChartContentProps) => {
  return (
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
              labelFormatter={formatTooltipLabel}
              formatter={formatTooltipValue}
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
  );
};
