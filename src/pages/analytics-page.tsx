import { ChartsGrid } from '@/components/analytics/charts-grid';
import { InsightsPanels } from '@/components/analytics/insights-panels';
import { OverviewCards } from '@/components/analytics/overview-cards';
import type { AnalyticsTimeframe } from '@/lib/analytics-utils';
import type { GapItem, FrequentQuestionItem, HourlyActivityItem, AnalyticsOverview, TimelineItem, TopicItem } from '@/lib/types';

type AnalyticsPageProps = {
  overview: AnalyticsOverview | null;
  conversationDaily: TimelineItem[];
  conversationHourly: HourlyActivityItem[];
  messageDaily: TimelineItem[];
  messageHourly: HourlyActivityItem[];
  topics: TopicItem[];
  frequentQuestions: FrequentQuestionItem[];
  gaps: GapItem[];
  loading: boolean;
  hasLoaded: boolean;
  error: string | null;
  timeframe: AnalyticsTimeframe;
  onTimeframeChange: (value: AnalyticsTimeframe) => void;
  chartOptions: object;
};

export function AnalyticsPage({
  overview,
  conversationDaily,
  conversationHourly,
  messageDaily,
  messageHourly,
  topics,
  frequentQuestions,
  gaps,
  loading,
  hasLoaded,
  error,
  timeframe,
  onTimeframeChange,
  chartOptions,
}: AnalyticsPageProps) {
  return (
    <section className="space-y-4">
      <OverviewCards overview={overview} />

      {loading && !hasLoaded && <p className="text-sm text-muted-foreground">Analytics werden initial geladen...</p>}
      {error && <p className="text-sm text-destructive">{error}</p>}

      {hasLoaded && (
        <>
          <ChartsGrid
            conversationDaily={conversationDaily}
            messageDaily={messageDaily}
            conversationHourly={conversationHourly}
            messageHourly={messageHourly}
            chartOptions={chartOptions}
            timeframe={timeframe}
            onTimeframeChange={onTimeframeChange}
          />
          <InsightsPanels topics={topics} frequentQuestions={frequentQuestions} gaps={gaps} />
        </>
      )}
    </section>
  );
}