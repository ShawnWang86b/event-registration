// get all organizer requests
"use client";
import { OrganizerRequestCard } from "@/components/admin";
import { useAdminOrganizerRequests } from "@/hooks/use-organizer-requests";

const OrganizerRequests = () => {
  const {
    data: organizerRequestsData,
    isLoading,
    error,
  } = useAdminOrganizerRequests();
  const organizerRequests = organizerRequestsData?.organizerRequests || [];
  const pagination = organizerRequestsData?.pagination || {};

  return (
    <div className="space-y-4">
      {organizerRequests.map((organizerRequest) => (
        <OrganizerRequestCard
          key={organizerRequest.id}
          organizerRequest={organizerRequest}
        />
      ))}
    </div>
  );
};

export default OrganizerRequests;
