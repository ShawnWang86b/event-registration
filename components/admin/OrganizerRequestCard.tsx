import { OrganizerRequest } from "@/types";

export const OrganizerRequestCard = ({
  organizerRequest,
}: {
  organizerRequest: OrganizerRequest;
}) => {
  return (
    <div className="border border-gray-200 rounded-md p-4">
      <div className="flex items-center justify-between">
        {JSON.stringify(organizerRequest)}
        <div className="text-lg font-bold">{organizerRequest.eventType}</div>
        <div className="text-sm text-gray-500">
          {new Date(organizerRequest.createdAt).toLocaleDateString()}
        </div>
      </div>
      <div className="text-sm text-gray-500">
        {organizerRequest.description}
      </div>
      <div className="text-sm text-gray-500">
        {organizerRequest.contactInfo}
      </div>
    </div>
  );
};
