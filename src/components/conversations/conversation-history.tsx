import { AdminComposer } from '@/components/conversations/admin-composer';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { formatDate } from '@/lib/api';
import { cn } from '@/lib/utils';
import type { ConversationHistoryItem, ConversationSummary } from '@/lib/types';

type ConversationHistoryProps = {
  selectedId: string | null;
  selectedConversation: ConversationSummary | null;
  history: ConversationHistoryItem[];
  loading: boolean;
  onSendAdminMessage: (text: string, imageUrl: string) => Promise<boolean>;
};

function MessageRole({ role, sender }: { role: ConversationHistoryItem['role']; sender?: string }) {
  const label = sender === 'admin' ? 'admin' : role;
  const variant =
    label === 'admin' ? 'default' : label === 'assistant' ? 'muted' : label === 'user' ? 'neutral' : 'default';

  return <Badge variant={variant}>{label}</Badge>;
}

function HistoryBubble({ item }: { item: ConversationHistoryItem }) {
  return (
    <div
      className={cn(
        'rounded-2xl border p-4',
        item.role === 'user' && 'border-primary/25 bg-primary/10',
        item.role === 'model' && 'border-primary/30 bg-primary/15',
        item.role === 'assistant' && 'bg-muted'
      )}
    >
      <div className="mb-2">
        <MessageRole role={item.role} sender={item.sender} />
      </div>
      <div className="whitespace-pre-wrap text-sm leading-relaxed">{item.text}</div>
      {item.image_url && (
        <img
          className="mt-3 w-full max-w-[280px] rounded-xl border object-cover"
          src={item.image_url}
          alt="Support"
          loading="lazy"
        />
      )}
    </div>
  );
}

export function ConversationHistory({
  selectedId,
  selectedConversation,
  history,
  loading,
  onSendAdminMessage,
}: ConversationHistoryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Konversations-Verlauf</CardTitle>
      </CardHeader>
      <CardContent>
        {!selectedId && <p className="text-sm text-muted-foreground">Wähle eine Konversation aus.</p>}

        {selectedId && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Verlauf für <strong className="font-mono text-xs">{selectedId}</strong>
            </p>
            <p className="text-sm text-muted-foreground">
              Kundenstatus: {selectedConversation?.is_active ? 'Kunde ist aktuell aktiv im Chat' : 'Kunde ist derzeit nicht aktiv'}
              {selectedConversation?.last_seen_at ? ` (letzter Status: ${formatDate(selectedConversation.last_seen_at)})` : ''}
            </p>
            <Separator />
            <ScrollArea className="h-[520px] pr-3">
              <div className="space-y-2">
                {loading && !history.length && <p className="text-sm text-muted-foreground">Verlauf wird geladen...</p>}
                {history.map((item, index) => (
                  <HistoryBubble key={index} item={item} />
                ))}
                {!history.length && !loading && (
                  <p className="text-sm text-muted-foreground">Keine Nachrichten gespeichert.</p>
                )}
              </div>
            </ScrollArea>
            <AdminComposer disabled={loading} onSend={onSendAdminMessage} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
