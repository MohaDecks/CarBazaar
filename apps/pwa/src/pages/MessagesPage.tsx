import { MessageCircle } from "lucide-react";
import { PageHeader } from "../components/BackButton";
import { EmptyState } from "../components/EmptyState";

export function MessagesPage() {
  return (
    <div className="screen">
      <PageHeader title="Messages" subtitle="Chat with sellers and dealers." />
      <EmptyState
        icon={MessageCircle}
        title="No messages yet"
        description="Conversations with sellers and dealers will appear here."
      />
    </div>
  );
}
