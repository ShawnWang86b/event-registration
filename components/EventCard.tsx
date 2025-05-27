interface Event {
  id: number;
  title: string;
  description: string;
  price: string;
  startDate: string;
  endDate: string;
  location?: string;
  isPeriodic: boolean;
  frequency?: string;
  maxAttendees: number;
  createdById: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface EventCardProps {
  event: Event;
  onRegister?: (eventId: number) => void;
}

const EventCard = ({ event, onRegister }: EventCardProps) => {
  const handleRegisterClick = () => {
    if (onRegister) {
      onRegister(event.id);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
      <h2 className="text-xl font-semibold mb-2 text-gray-800">
        {event.title}
      </h2>
      <p className="text-gray-600 mb-4 line-clamp-3">{event.description}</p>

      <div className="space-y-2 text-sm text-gray-500">
        <div className="flex justify-between">
          <span className="font-medium">Price:</span>
          <span className="text-green-600 font-semibold">
            ${parseFloat(event.price).toFixed(2)}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="font-medium">Start:</span>
          <span>{new Date(event.startDate).toLocaleDateString()}</span>
        </div>

        <div className="flex justify-between">
          <span className="font-medium">End:</span>
          <span>{new Date(event.endDate).toLocaleDateString()}</span>
        </div>

        {event.location && (
          <div className="flex justify-between">
            <span className="font-medium">Location:</span>
            <span>{event.location}</span>
          </div>
        )}

        <div className="flex justify-between">
          <span className="font-medium">Max Attendees:</span>
          <span>{event.maxAttendees}</span>
        </div>

        {event.isPeriodic && event.frequency && (
          <div className="flex justify-between">
            <span className="font-medium">Frequency:</span>
            <span className="capitalize">{event.frequency}</span>
          </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <button
          onClick={handleRegisterClick}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded transition-colors"
        >
          Register for Event
        </button>
      </div>
    </div>
  );
};

export default EventCard;
