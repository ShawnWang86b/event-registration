import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EVENT_DISPLAY_CONSTANTS } from "@/constants/eventDisplay";
import type { EventDisplayErrorType } from "@/constants/eventDisplay";

type ErrorStateProps = {
  message?: string;
  errorType?: EventDisplayErrorType;
  onRetry?: () => void;
  fullHeight?: boolean;
  className?: string;
  showDetails?: boolean;
  details?: string;
};

export const ErrorState = ({
  message,
  errorType = "unknown",
  onRetry,
  fullHeight = true,
  className = "",
  showDetails = false,
  details,
}: ErrorStateProps) => {
  const heightClass = fullHeight ? "min-h-[100vh]" : "min-h-[200px]";
  const widthClass = fullHeight ? "min-w-[80vw]" : "";

  const getErrorMessage = (): string => {
    if (message) return message;

    switch (errorType) {
      case "network":
        return EVENT_DISPLAY_CONSTANTS.ERRORS.NETWORK_ERROR;
      case "server":
        return EVENT_DISPLAY_CONSTANTS.ERRORS.FETCH_FAILED;
      default:
        return EVENT_DISPLAY_CONSTANTS.ERRORS.GENERIC_ERROR;
    }
  };

  const errorMessage = getErrorMessage();
  //FIXME: Add a nice error state
  return (
    <div
      className={`flex justify-center items-center p-8 ${heightClass} ${widthClass} ${className}`}
      role="alert"
      aria-live="polite"
    >
      <div className="text-center max-w-md mx-auto">
        <div className="flex justify-center mb-4">
          <div className="bg-red-100 p-3 rounded-full">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
        </div>

        <h3 className="text-lg font-semibold text-red-800 mb-2">
          Something went wrong
        </h3>

        <p className="text-red-600 mb-4">{errorMessage}</p>

        {showDetails && details && (
          <details className="mb-4 text-left">
            <summary className="text-sm text-red-700 cursor-pointer hover:text-red-800">
              Technical details
            </summary>
            <pre className="text-xs text-red-600 mt-2 bg-red-50 p-2 rounded overflow-auto">
              {details}
            </pre>
          </details>
        )}

        {onRetry && (
          <Button
            onClick={onRetry}
            variant="outline"
            className="border-red-200 text-red-700 hover:bg-red-50"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try again
          </Button>
        )}
      </div>
    </div>
  );
};
