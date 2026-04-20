import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import type { ConversationSummary } from '@/lib/types';
import { formatDate } from '@/lib/api';

type ConversationTableProps = {
  conversations: ConversationSummary[];
  totalCount: number;
  selectedId: string | null;
  loading: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onSelect: (id: string) => void;
};

function StatusDot({ active }: { active?: boolean }) {
  return (
    <span
      className={cn(
        'inline-block h-2.5 w-2.5 rounded-full',
        active ? 'bg-emerald-500 shadow-[0_0_0_3px_rgba(31,170,89,0.2)]' : 'bg-slate-400'
      )}
    />
  );
}

export function ConversationTable({
  conversations,
  totalCount,
  selectedId,
  loading,
  error,
  currentPage,
  totalPages,
  onPageChange,
  onSelect,
}: ConversationTableProps) {
  return (
    <Card className="animate-fade-up">
      <CardHeader>
        <CardTitle>Aktuelle Konversationen</CardTitle>
      </CardHeader>
      <CardContent>
        {loading && !conversations.length && <p className="text-sm text-muted-foreground">Konversationen werden geladen...</p>}
        {error && <p className="text-sm text-destructive">{error}</p>}
        {(!loading || conversations.length > 0) && !error && (
          <div className="space-y-3">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead>ID</TableHead>
                  <TableHead>Letzte Aktivität</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {conversations.map((conversation) => (
                  <TableRow
                    key={conversation.id}
                    className={cn(
                      'cursor-pointer transition-colors',
                      conversation.id === selectedId ? 'bg-primary/10 hover:bg-primary/10' : undefined
                    )}
                    onClick={() => onSelect(conversation.id)}
                  >
                    <TableCell>
                      <StatusDot active={conversation.is_active} />
                    </TableCell>
                    <TableCell className="max-w-[220px] break-all font-mono text-xs">{conversation.id}</TableCell>
                    <TableCell>{formatDate(conversation.updated_at)}</TableCell>
                  </TableRow>
                ))}
                {!conversations.length && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-sm text-muted-foreground">
                      Keine Konversationen gefunden.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            {totalCount > 0 && (
              <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-3">
                <p className="text-xs text-muted-foreground">
                  Seite {currentPage} von {totalPages} ({totalCount} Einträge)
                </p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={currentPage === 1}
                    onClick={() => onPageChange(currentPage - 1)}
                  >
                    Zurück
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={currentPage >= totalPages}
                    onClick={() => onPageChange(currentPage + 1)}
                  >
                    Weiter
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
