import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { EVENT_CARD_CONSTANTS } from "@/constants/eventCard";

type EventCardHeaderProps = {
  isExpanded: boolean;
  onClose?: () => void;
};

export const EventCardHeader = ({
  isExpanded,
  onClose,
}: EventCardHeaderProps) => {
  if (!isExpanded) return null;

  return (
    <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-blue-50">
      <h3 className="text-lg font-semibold text-primary">
        {EVENT_CARD_CONSTANTS.LABELS.EVENT_DETAILS}
      </h3>
      <Button
        variant="ghost"
        size="icon"
        className="cursor-pointer"
        onClick={onClose}
      >
        <X className="w-4 h-4" />
      </Button>
    </div>
  );
};
