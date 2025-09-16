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
  // All hooks must be called before any conditional returns
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isGuestRegistrationOpen, setIsGuestRegistrationOpen] = useState(false);
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
            <DropdownMenuLabel>Event</DropdownMenuLabel>
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={handleEditClick}>
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleSetPriceClick}>
                Set Price
              </DropdownMenuItem>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>Visibility</DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent>
                    <DropdownMenuRadioGroup
                      value={position}
                      onValueChange={handleVisibilityChange}
                    >
                      <DropdownMenuRadioItem value="public">
                        Public
                      </DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="admin-only">
                        Admin Only
                      </DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuLabel>Team</DropdownMenuLabel>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>Add Guest</DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem onClick={handleRegisterGuestClick}>
                      Register Guest
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => console.log("View Guests")}
                    >
                      View Guests
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
            </DropdownMenuGroup>
            <DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Danger Zone</DropdownMenuLabel>
              <DropdownMenuItem onClick={handleResetClick}>
                Reset Event
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
