type BalanceCellProps = {
  value: number;
  formatCurrency: (amount: number) => string;
  isPositive: (amount: number) => boolean;
};

export const BalanceCell = ({
  value,
  formatCurrency,
  isPositive,
}: BalanceCellProps) => {
  const balance = parseFloat(value.toString());
  const formatted = formatCurrency(balance);
  const colorClass = isPositive(balance) ? "text-primary" : "text-red-700";

  return <span className={`${colorClass} font-semibold`}>{formatted}</span>;
};
