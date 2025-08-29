type DateCellProps = {
  value: string;
  formatDate: (dateString: string) => string;
};

export const DateCell = ({ value, formatDate }: DateCellProps) => {
  return <span>{formatDate(value)}</span>;
};
