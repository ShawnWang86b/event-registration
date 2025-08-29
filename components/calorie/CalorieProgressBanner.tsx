type CalorieProgressBannerProps = {
  totalCalories: number;
  caloriesPerEvent: number;
};

export const CalorieProgressBanner = ({
  totalCalories,
  caloriesPerEvent,
}: CalorieProgressBannerProps) => {
  return (
    <div className="text-center p-4 bg-gradient-to-r from-orange-100 to-red-100 rounded-lg border border-orange-200">
      <p className="text-lg font-semibold text-orange-800">
        You&apos;ve burned {totalCalories.toLocaleString()} calories since
        joining this club!
      </p>
      <p className="text-lg text-orange-600 mt-1">
        Keep up the great work! Each event you attend burns {caloriesPerEvent}{" "}
        calories.
      </p>
    </div>
  );
};
