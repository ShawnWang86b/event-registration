import { Calendar, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

type EmptyStateProps = {
  title?: string;
  message?: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
    variant?: "default" | "outline" | "secondary";
  };
  fullHeight?: boolean;
  className?: string;
};

export const EmptyState = ({
  title = "No events found",
  message = "There are no events available at the moment. Check back later or create a new event.",
  icon,
  action,
  fullHeight = true,
  className = "",
}: EmptyStateProps) => {
  const heightClass = fullHeight ? "min-h-[100vh]" : "min-h-[200px]";
  const widthClass = fullHeight ? "min-w-[80vw]" : "";

  const defaultIcon = (
    <div className="bg-gray-100 p-4 rounded-full">
      <Calendar className="w-8 h-8 text-gray-400" />
    </div>
  );

  return (
    <div
      className={`flex justify-center items-center p-8 ${heightClass} ${widthClass} ${className}`}
      role="status"
      aria-label={title}
    >
      <div className="text-center max-w-md mx-auto">
        <div className="flex justify-center mb-4">{icon || defaultIcon}</div>

        <h3 className="text-xl font-semibold text-gray-800 mb-2">{title}</h3>

        <p className="text-gray-600 mb-6 leading-relaxed">{message}</p>

        {action && (
          <Button
            onClick={action.onClick}
            variant={action.variant || "default"}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            {action.label}
          </Button>
        )}
      </div>
    </div>
  );
};
