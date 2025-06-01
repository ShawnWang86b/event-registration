import { useState } from "react";
import { useEndEvent } from "@/hooks";
import { Event } from "@/lib/types";

interface EndEventDialogProps {
  event: Event;
  isOpen: boolean;
  onClose: () => void;
}

const EndEventDialog = ({ event, isOpen, onClose }: EndEventDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const endEventMutation = useEndEvent();

  const handleEndEvent = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const result = await endEventMutation.mutateAsync(event.id);

      // Show success message with details
      const { summary, errors, deductionResults } = result;
      let message = `Event ended successfully!\n\n`;
      message += `• Total attendees: ${summary.totalAttendees}\n`;
      message += `• Successful deductions: ${summary.successfulDeductions}\n`;
      message += `• Total deducted: $${summary.totalDeducted.toFixed(2)}\n`;
      message += `• Transaction records created: ${summary.transactionsCreated}\n`;

      if (deductionResults.length > 0) {
        message += `\n✅ Successful transactions:\n`;
        deductionResults.forEach((result) => {
          message += `• ${result.userName}: $${result.deducted.toFixed(
            2
          )} (Transaction #${result.transactionId})\n`;
        });
      }

      if (errors.length > 0) {
        message += `\n⚠️ ${errors.length} users had insufficient balance:\n`;
        errors.forEach((error) => {
          message += `• ${error.userName}: needs $${error.deficit.toFixed(
            2
          )} more\n`;
        });
      }

      alert(message);
      onClose();
    } catch (error) {
      console.error("Error ending event:", error);
      alert("Failed to end event. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-50"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">End Event</h3>
          </div>

          {/* Content */}
          <div className="px-6 py-4">
            <div className="text-sm text-gray-600 mb-4">
              Are you sure you want to end this event?
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <h4 className="font-medium text-yellow-800 mb-2">
                Event Details:
              </h4>
              <p className="text-yellow-700">
                <strong>Title:</strong> {event.title}
              </p>
              <p className="text-yellow-700">
                <strong>Price:</strong> ${parseFloat(event.price).toFixed(2)}
              </p>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="font-medium text-red-800 mb-2">
                ⚠️ This action will:
              </h4>
              <ul className="text-red-700 text-sm space-y-1">
                <li>• Mark the event as ended (inactive)</li>
                <li>
                  • Deduct ${parseFloat(event.price).toFixed(2)} from each
                  registered attendee
                </li>
                <li>• Cannot be undone</li>
              </ul>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 flex gap-3 justify-end">
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={handleEndEvent}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Ending..." : "End Event"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default EndEventDialog;
