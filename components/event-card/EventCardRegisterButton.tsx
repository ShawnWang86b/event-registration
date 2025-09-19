import { MoveRight } from "lucide-react";
import type { ButtonState } from "@/constants/eventCard";
import { useTranslations } from "next-intl";

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
  const t = useTranslations("EventsPage.eventCardButtons");

  const getButtonText = (): string => {
    switch (buttonState) {
      case "loading":
        return t("loading");
      case "view_details":
        return t("viewDetails");
      case "register":
      default:
        return t("register");
    }
  };

  const isDisabled =
    disabled || buttonState === "disabled" || buttonState === "loading";

  return (
    <div className="mt-4 pt-4">
      <button
        onClick={onClick}
        disabled={isDisabled}
        className="text-lg w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 disabled:bg-gray-100 disabled:cursor-not-allowed text-primary-foreground font-medium py-2 px-4 rounded-md border hover:cursor-pointer transition-colors"
      >
        <span>{getButtonText()}</span>
        <MoveRight className="w-4 h-4" />
      </button>
    </div>
  );
};
