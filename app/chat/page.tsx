import { Suspense } from "react";
import ChatPageClient from "./ChatPageClient";

export default function ChatPage({
  params,
  searchParams,
}: {
  params: { slug: string }
  searchParams: { [key: string]: string | string[] | undefined }
}) {
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