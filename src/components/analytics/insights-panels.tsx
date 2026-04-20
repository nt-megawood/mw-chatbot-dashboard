import { useEffect, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { FrequentQuestionItem, GapItem, TopicItem } from '@/lib/types';

type InsightsPanelsProps = {
  topics: TopicItem[];
  frequentQuestions: FrequentQuestionItem[];
  gaps: GapItem[];
};

export function InsightsPanels({ topics, frequentQuestions, gaps }: InsightsPanelsProps) {
  const [questionPage, setQuestionPage] = useState(1);
  const maxTopicCount = Math.max(...topics.map((topic) => topic.count), 1);
  const questionsPerPage = 10;

  const totalQuestionPages = Math.max(1, Math.ceil(frequentQuestions.length / questionsPerPage));

  useEffect(() => {
    setQuestionPage((current) => Math.min(current, totalQuestionPages));
  }, [totalQuestionPages]);

  const currentQuestions = useMemo(() => {
    const start = (questionPage - 1) * questionsPerPage;
    return frequentQuestions.slice(start, start + questionsPerPage);
  }, [frequentQuestions, questionPage]);

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
      <Card className="animate-fade-up">
        <CardHeader>
          <CardTitle>Top-Themen in Kundenfragen</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {topics.map((item) => {
            return (
              <div
                key={item.topic}
                className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] items-center gap-3 rounded-xl bg-muted/40 px-3 py-2 transition-colors hover:bg-muted"
              >
                <div className="text-sm font-medium">{item.topic}</div>
                <progress
                  className="h-2 w-full overflow-hidden rounded-full bg-muted [&::-moz-progress-bar]:bg-gradient-to-r [&::-moz-progress-bar]:from-primary [&::-moz-progress-bar]:to-secondary [&::-webkit-progress-bar]:bg-muted [&::-webkit-progress-value]:bg-gradient-to-r [&::-webkit-progress-value]:from-primary [&::-webkit-progress-value]:to-secondary"
                  max={maxTopicCount}
                  value={item.count}
                />
                <span className="text-xs font-bold text-muted-foreground">{item.count}</span>
              </div>
            );
          })}
          {!topics.length && <p className="text-sm text-muted-foreground">Derzeit liegen keine auswertbaren Themencluster vor.</p>}
        </CardContent>
      </Card>

      <Card className="animate-fade-up">
        <CardHeader>
          <CardTitle>Häufige Kundenfragen</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {currentQuestions.map((item, index) => (
            <div
              key={`${item.question}-${questionPage}-${index}`}
              className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-xl border bg-card px-3 py-2 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-soft"
            >
              <div className="text-sm leading-relaxed">{item.question || 'Unbekannte Frage'}</div>
              <Badge>{item.count}</Badge>
            </div>
          ))}
          {!frequentQuestions.length && (
            <p className="text-sm text-muted-foreground">Derzeit liegen keine priorisierbaren Kundenfragen vor.</p>
          )}

          {frequentQuestions.length > questionsPerPage && (
            <div className="mt-3 flex items-center justify-between gap-2 border-t pt-3">
              <p className="text-xs text-muted-foreground">
                Seite {questionPage} von {totalQuestionPages}
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={questionPage === 1}
                  onClick={() => setQuestionPage((current) => Math.max(1, current - 1))}
                >
                  Zurueck
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={questionPage >= totalQuestionPages}
                  onClick={() => setQuestionPage((current) => Math.min(totalQuestionPages, current + 1))}
                >
                  Weiter
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="animate-fade-up xl:col-span-2">
        <CardHeader>
          <CardTitle>Fragen mit möglicher Bot-Lücke</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {gaps.map((item, index) => (
            <div
              key={`${item.question}-${index}`}
              className="rounded-xl border bg-card p-3 text-sm leading-relaxed transition-colors hover:bg-muted/30"
            >
              <div>
                <strong>Frage:</strong> {item.question || 'Keine Frage erfasst'}
              </div>
              <div>
                <strong>Bot-Antwort:</strong> {item.bot_response || 'Keine Antwort erfasst'}
              </div>
              <div className="font-semibold text-primary">Anzahl vergleichbarer Fälle: {item.count}</div>
            </div>
          ))}
          {!gaps.length && <p className="text-sm text-muted-foreground">Aktuell wurden keine signifikanten Wissensluecken erkannt.</p>}
        </CardContent>
      </Card>
    </div>
  );
}
