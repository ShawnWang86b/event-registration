import { useTranslations } from "next-intl";

type JoinButtonProps = {
  onJoin: () => void;
  isJoining: boolean;
  userId: string | null | undefined;
  isUserRegistered: boolean;
};

export const JoinButton = ({
  onJoin,
  isJoining,
  userId,
  isUserRegistered,
}: JoinButtonProps) => {
  const t = useTranslations("EventsPage.registrationDetails.joinButton");
  if (isUserRegistered) return null;

  const getButtonText = () => {
    if (!userId) return "Sign in to join";
    if (isJoining) return t("isJoining");
    return t("joinThisEvent");
  };

  return (
    <div className="mb-6">
      <button
        onClick={onJoin}
        disabled={isJoining || !userId}
        className="flex items-center gap-2 cursor-pointer bg-primary hover:bg-primary/90 disabled:bg-gray-400 text-primary-foreground py-2 px-6 rounded-lg transition-colors w-full justify-center"
      >
        {getButtonText()}
      </button>
    </div>
  );
};
