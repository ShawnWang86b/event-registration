import { Calendar, CalendarPlus, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  useDisplayMode,
  useSetDisplayMode,
  type EventDisplayMode,
} from "@/store";

type EventDisplayHeaderProps = {
  isAdmin: boolean;
  onCreateClick: () => void;
};

export const EventDisplayHeader = ({
  isAdmin,
  onCreateClick,
}: EventDisplayHeaderProps) => {
  const displayMode = useDisplayMode();
  const setDisplayMode = useSetDisplayMode();

  const handleModeClick = (mode: EventDisplayMode) => {
    setDisplayMode(mode);
  };

  return (
    <div className="flex items-center justify-start mb-8 gap-2">
      {isAdmin && (
        <Button
          onClick={onCreateClick}
          size="icon"
          className="flex items-center bg-primary hover:bg-primary/90 text-primary-foreground transition-colors hover:cursor-pointer"
          aria-label="Create new event"
        >
          <CalendarPlus size={16} />
        </Button>
      )}
      <div className="flex items-center gap-2">
        <Button
          variant={displayMode === "grid" ? "default" : "outline"}
          size="icon"
          className="cursor-pointer"
          onClick={() => handleModeClick("grid")}
          aria-label="Grid view"
        >
          <LayoutGrid size={16} />
        </Button>

        <Button
          variant={displayMode === "calendar" ? "default" : "outline"}
          size="icon"
          className="cursor-pointer"
          onClick={() => handleModeClick("calendar")}
          aria-label="Calendar view"
        >
          <Calendar size={16} />
        </Button>
      </div>
    </div>
  );
};
