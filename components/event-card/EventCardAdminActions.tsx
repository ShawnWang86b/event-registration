"use client";

import { Event } from "@/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { SquareMenu } from "lucide-react";
import { GuestRegistrationDialog } from "@/components/admin/GuestRegistrationDialog";
import { useTranslations } from "next-intl";
import { useCopyEvent } from "@/hooks/use-events";

type EventCardAdminActionsProps = {
  event: Event;
  isAdmin: boolean;
  onEditClick: () => void;
  onSetPriceClick: () => void;
  onResetClick: () => void;
  onPublicVisibilityChange: (isActive: boolean) => void;
};

export const EventCardAdminActions = ({
  event,
  isAdmin,
  onEditClick,
  onSetPriceClick,
  onResetClick,
  onPublicVisibilityChange,
}: EventCardAdminActionsProps) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isGuestRegistrationOpen, setIsGuestRegistrationOpen] = useState(false);
  const { mutate: copyEvent } = useCopyEvent();
  const t = useTranslations("EventsPage.adminActions");

  const [position, setPosition] = useState(
    event.isPublicVisible ? "public" : "admin-only"
  );

  // Keep position state in sync with event prop changes
  useEffect(() => {
    setPosition(event.isPublicVisible ? "public" : "admin-only");
  }, [event.isPublicVisible]);

  // Early return after all hooks
  if (!isAdmin) return null;

  const handleEditClick = () => {
    setIsDropdownOpen(false);
    onEditClick();
  };

  const handleSetPriceClick = () => {
    setIsDropdownOpen(false);
    onSetPriceClick();
  };

  const handleResetClick = () => {
    setIsDropdownOpen(false);
    onResetClick();
  };

  const handleCopyClick = () => {
    setIsDropdownOpen(false);
    copyEvent(
      {
        eventId: event.id,
      },
      {
        onSuccess: (copiedEvent) => {
          console.log("Event copied successfully:", copiedEvent);
          // You can add toast notification here if you have one set up
        },
        onError: (error) => {
          console.error("Failed to copy event:", error);
          // You can add toast notification here if you have one set up
        },
      }
    );
  };

  const handleVisibilityChange = (value: string) => {
    const isPublicVisible = value === "public";
    setPosition(value);
    onPublicVisibilityChange(isPublicVisible);
    setIsDropdownOpen(false);
  };

  const handleRegisterGuestClick = () => {
    setIsDropdownOpen(false);
    setIsGuestRegistrationOpen(true);
  };

  return (
    <>
      <div className="flex justify-end mb-3">
        <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="cursor-pointer p-5">
              <SquareMenu width={20} height={20} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="start">
            <DropdownMenuLabel>{t("event.title")}</DropdownMenuLabel>
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={handleEditClick}>
                {t("event.edit")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleCopyClick}>
                {t("event.copy")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleSetPriceClick}>
                {t("event.setPrice")}
              </DropdownMenuItem>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  {t("event.visibility.title")}
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent>
                    <DropdownMenuRadioGroup
                      value={position}
                      onValueChange={handleVisibilityChange}
                    >
                      <DropdownMenuRadioItem value="public">
                        {t("event.visibility.public")}
                      </DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="admin-only">
                        {t("event.visibility.adminOnly")}
                      </DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuLabel>{t("team.title")}</DropdownMenuLabel>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  {t("team.addGuest")}
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem onClick={handleRegisterGuestClick}>
                      {t("team.addGuest")}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => console.log("View Guests")}
                    >
                      {t("team.viewGuests")}
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
            </DropdownMenuGroup>
            <DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>{t("dangerZone.title")}</DropdownMenuLabel>
              <DropdownMenuItem onClick={handleResetClick}>
                {t("dangerZone.reset")}
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Guest Registration Dialog */}
      <GuestRegistrationDialog
        event={event}
        isOpen={isGuestRegistrationOpen}
        onClose={() => setIsGuestRegistrationOpen(false)}
      />
    </>
  );
};
