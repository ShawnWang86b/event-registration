import { MoveRight } from "lucide-react";
import { EVENT_CARD_CONSTANTS } from "@/constants/eventCard";
import type { ButtonState } from "@/constants/eventCard";

type EventCardRegisterButtonProps = {
  buttonState: ButtonState;
  onClick: () => void;
  disabled?: boolean;
};

export const EventCardRegisterButton = ({
  buttonState,
  onClick,
  disabled = false,
}: EventCardRegisterButtonProps) => {
  const getButtonText = (): string => {
    switch (buttonState) {
      case "loading":
        return EVENT_CARD_CONSTANTS.BUTTONS.LOADING;
      case "view_details":
        return EVENT_CARD_CONSTANTS.BUTTONS.VIEW_DETAILS;
      case "register":
      default:
        return EVENT_CARD_CONSTANTS.BUTTONS.REGISTER;
    }
  };

  const isDisabled =
    disabled || buttonState === "disabled" || buttonState === "loading";

  return (
    <div className="mt-4 pt-4">
      <button
        onClick={onClick}
        disabled={isDisabled}
        className="text-lg w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 disabled:bg-gray-100 disabled:cursor-not-allowed text-popover font-medium py-2 px-4 rounded-md border hover:cursor-pointer transition-colors"
      >
        <span>{getButtonText()}</span>
        <MoveRight className="w-4 h-4" />
      </button>
    </div>
  );
};
