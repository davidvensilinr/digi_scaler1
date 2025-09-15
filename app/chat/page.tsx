import { Suspense } from "react";
import { notFound } from "next/navigation";
import ChatPageClient from "./ChatPageClient";

export default function ChatPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const name = searchParams.name;
  const profileId = searchParams.profile_id || searchParams.public_id;

  if (!name || !profileId) {
    // Show a user-friendly error message
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center p-6 max-w-md mx-auto bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Error: Missing Required Information</h2>
          <p className="text-gray-700 mb-4">
            {!name && !profileId 
              ? "Name and profile ID are required to start a chat."
              : !name 
                ? "Name is required to start a chat."
                : "Profile ID is required to start a chat."
            }
          </p>
          <p className="text-sm text-gray-500">
            Please go back and try again with the correct information.
          </p>
        </div>
      </div>
    );
  }

  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">Loading chat...</div>
      </div>
    }>
      <ChatPageClient />
    </Suspense>
  );
}