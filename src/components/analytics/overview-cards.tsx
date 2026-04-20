import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { AnalyticsOverview } from '@/lib/types';

type OverviewCardsProps = {
  overview: AnalyticsOverview | null;
};

export function OverviewCards({ overview }: OverviewCardsProps) {
  const cards = [
    {
      title: 'Aktive Chats',
      value: overview?.active_conversation_count ?? 0,
      hint: 'derzeit aktiv (Status innerhalb 2 Minuten)',
    },
    {
      title: 'Nachrichten Gesamt',
      value: overview?.total_message_count ?? 0,
      hint: 'über alle ausgewerteten Konversationen',
    },
    {
      title: 'Unklare Antworten',
      value: overview?.unresolved_response_count ?? 0,
      hint: 'potenzielle Luecken im Bot-Wissen',
    },
    {
      title: 'Ø Nachrichten / Chat',
      value: overview?.average_messages_per_conversation ?? 0,
      hint: 'Durchschnitt über ausgewertete Chats',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title} className="animate-fade-up min-h-[148px] transition-transform duration-300 hover:-translate-y-0.5">
          <CardHeader>
            <CardTitle>{card.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <p className="text-4xl font-extrabold text-primary">{card.value}</p>
            <p className="text-sm text-muted-foreground">{card.hint}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
