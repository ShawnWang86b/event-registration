"use client";

import BecomeOrganizerForm from "@/components/become-organizer/become-organizer-form";

const BecomeOrganizer = () => {
  return (
    <div className="min-h-screen min-w-[80vw] lg:w-auto p-16">
      <h1 className="text-3xl font-bold text-foreground">
        Become an Organizer
      </h1>
      <p>Become an organizer and help us organize events for the community.</p>
      <p>Please fill in the form below to become an organizer.</p>
      <BecomeOrganizerForm />
    </div>
  );
};

export default BecomeOrganizer;
