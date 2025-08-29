import LoadingSpinner from "@/components/LoadingSpinner";
import { EVENT_DISPLAY_CONSTANTS } from "@/constants/eventDisplay";

type LoadingStateProps = {
  message?: string;
  size?: "sm" | "md" | "lg";
  fullHeight?: boolean;
  className?: string;
};

export const LoadingState = ({
  message = EVENT_DISPLAY_CONSTANTS.TEXT.LOADING,
  size = "lg",
  fullHeight = true,
  className = "",
}: LoadingStateProps) => {
  const heightClass = fullHeight ? "min-h-[100vh]" : "min-h-[200px]";
  const widthClass = fullHeight ? "min-w-[80vw]" : "";

  const sizeStyles = {
    sm: { width: 80, height: 80 },
    md: { width: 120, height: 120 },
    lg: { width: 150, height: 150 },
  };

  return (
    <div
      className={`flex justify-center items-center ${heightClass} ${widthClass} ${className}`}
      role="status"
      aria-label={message}
    >
      <div className="flex flex-col items-center gap-4">
        <div style={sizeStyles[size]}>
          <LoadingSpinner />
        </div>
        {message && (
          <p className="text-primary text-sm font-medium animate-pulse">
            {message}
          </p>
        )}
      </div>
    </div>
  );
};
