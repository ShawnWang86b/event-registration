import { CardDescription, CardTitle } from "@/components/ui/card";

type ChartTab = "calories" | "events";

type ChartHeaderProps = {
  activeChart: ChartTab;
  totals: { calories: number; events: number };
  onTabChange: (chart: ChartTab) => void;
  caloriesPerEvent: number;
};

export const ChartHeader = ({
  activeChart,
  totals,
  onTabChange,
  caloriesPerEvent,
}: ChartHeaderProps) => {
  const tabs: { key: ChartTab; label: string; value: number }[] = [
    { key: "calories", label: "Calories", value: totals.calories },
    { key: "events", label: "Events", value: totals.events },
  ];

  return (
    <div className="flex flex-col items-stretch border-b !p-0 sm:flex-row">
      <div className="flex flex-1 flex-col justify-center gap-1 px-6 pb-3 sm:pb-0">
        <CardTitle className="flex items-center gap-2 text-foreground text-lg">
          Fitness Progress Over Time
        </CardTitle>
        <CardDescription className="text-primary text-md">
          Track your calorie consumption and event attendance by month (
          {caloriesPerEvent} calories per event)
        </CardDescription>
      </div>
      <div className="flex">
        {tabs.map((tab, index) => (
          <button
            key={tab.key}
            data-active={activeChart === tab.key}
            className="data-[active=true]:bg-muted/50 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l sm:border-t-0 sm:border-l sm:px-8 sm:py-6"
            onClick={() => onTabChange(tab.key)}
          >
            <span className="text-muted-foreground text-sm">{tab.label}</span>
            <span className="text-lg leading-none font-bold sm:text-3xl">
              {tab.value.toLocaleString()}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
