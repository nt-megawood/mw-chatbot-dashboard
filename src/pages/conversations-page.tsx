import { ConversationHistory } from '@/components/conversations/conversation-history';
import { ConversationTable } from '@/components/conversations/conversation-table';
import type { ConversationHistoryItem, ConversationSummary } from '@/lib/types';

type ConversationsPageProps = {
  conversations: ConversationSummary[];
  totalCount: number;
  selectedId: string | null;
  selectedConversation: ConversationSummary | null;
  history: ConversationHistoryItem[];
  loading: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onSelect: (id: string) => void;
  onSendAdminMessage: (text: string, imageUrl: string) => Promise<boolean>;
};

export function ConversationsPage({
  conversations,
  totalCount,
  selectedId,
  selectedConversation,
  history,
  loading,
  error,
  currentPage,
  totalPages,
  onPageChange,
  onSelect,
  onSendAdminMessage,
}: ConversationsPageProps) {
  return (
    <main className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_1.2fr]">
      <ConversationTable
        conversations={conversations}
        totalCount={totalCount}
        selectedId={selectedId}
        loading={loading}
        error={error}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
        onSelect={onSelect}
      />

      <ConversationHistory
        selectedId={selectedId}
        selectedConversation={selectedConversation}
        history={history}
        loading={loading}
        onSendAdminMessage={onSendAdminMessage}
      />
    </main>
  );
}