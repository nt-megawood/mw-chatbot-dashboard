import { useCallback, useMemo, useState } from 'react';
import {
  aggregateTimelineByTimeframe,
  buildTopicPhrasesFromQuestions,
  clusterFrequentQuestions,
  type AnalyticsTimeframe,
} from '@/lib/analytics-utils';
import { getAnalyticsGaps, getAnalyticsOverview, getAnalyticsTopics } from '@/lib/api';
import type {
  AnalyticsOverview,
  GapItem,
  FrequentQuestionItem,
  HourlyActivityItem,
  TimelineItem,
  TopicItem,
} from '@/lib/types';

export function useAnalytics(apiUrl: string, isDark: boolean) {
  const [analyticsOverview, setAnalyticsOverview] = useState<AnalyticsOverview | null>(null);
  const [rawConversationDaily, setRawConversationDaily] = useState<TimelineItem[]>([]);
  const [conversationHourly, setConversationHourly] = useState<HourlyActivityItem[]>([]);
  const [rawMessageDaily, setRawMessageDaily] = useState<TimelineItem[]>([]);
  const [messageHourly, setMessageHourly] = useState<HourlyActivityItem[]>([]);
  const [topics, setTopics] = useState<TopicItem[]>([]);
  const [frequentQuestions, setFrequentQuestions] = useState<FrequentQuestionItem[]>([]);
  const [gaps, setGaps] = useState<GapItem[]>([]);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [analyticsRefreshing, setAnalyticsRefreshing] = useState(false);
  const [hasLoadedAnalytics, setHasLoadedAnalytics] = useState(false);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState<AnalyticsTimeframe>('weekly');

  const loadAnalytics = useCallback(async () => {
    if (hasLoadedAnalytics) {
      setAnalyticsRefreshing(true);
    } else {
      setAnalyticsLoading(true);
    }
    setAnalyticsError(null);

    const [overviewResp, topicsResp, gapsResp] = await Promise.all([
      getAnalyticsOverview(apiUrl, timeframe),
      getAnalyticsTopics(apiUrl),
      getAnalyticsGaps(apiUrl),
    ]);

    if (hasLoadedAnalytics) {
      setAnalyticsRefreshing(false);
    } else {
      setAnalyticsLoading(false);
    }

    if (!overviewResp.ok || !topicsResp.ok || !gapsResp.ok) {
      setAnalyticsError(
        overviewResp.error || topicsResp.error || gapsResp.error || 'Analytics konnten nicht geladen werden.'
      );
      return;
    }

    const rawQuestions = topicsResp.data?.frequent_questions || [];
    const clusteredQuestions = clusterFrequentQuestions(rawQuestions, 0.9);

    setAnalyticsOverview(overviewResp.data?.overview || null);
    setRawConversationDaily(overviewResp.data?.conversation_activity_daily || []);
    setConversationHourly(overviewResp.data?.conversation_activity_hourly || []);
    setRawMessageDaily(overviewResp.data?.message_activity_daily || []);
    setMessageHourly(overviewResp.data?.message_activity_hourly || []);
    setTopics(buildTopicPhrasesFromQuestions(clusteredQuestions, topicsResp.data?.top_topics || []));
    setFrequentQuestions(clusteredQuestions);
    setGaps(gapsResp.data?.gaps || []);
    setHasLoadedAnalytics(true);
  }, [apiUrl, hasLoadedAnalytics, timeframe]);

  const conversationDaily = useMemo(
    () => aggregateTimelineByTimeframe(rawConversationDaily, timeframe),
    [rawConversationDaily, timeframe]
  );

  const messageDaily = useMemo(
    () => aggregateTimelineByTimeframe(rawMessageDaily, timeframe),
    [rawMessageDaily, timeframe]
  );

  const chartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            color: isDark ? '#d7d1d3' : '#5d5053',
          },
        },
      },
      scales: {
        x: {
          ticks: {
            color: isDark ? '#c5bec1' : '#6d5f63',
          },
          grid: {
            color: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
          },
        },
        y: {
          beginAtZero: true,
          ticks: {
            color: isDark ? '#c5bec1' : '#6d5f63',
            precision: 0,
          },
          grid: {
            color: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
          },
        },
      },
      animation: {
        duration: 420,
      },
    }),
    [isDark]
  );

  return {
    analyticsOverview,
    conversationDaily,
    conversationHourly,
    messageDaily,
    messageHourly,
    topics,
    frequentQuestions,
    gaps,
    analyticsLoading,
    analyticsRefreshing,
    hasLoadedAnalytics,
    analyticsError,
    timeframe,
    setTimeframe,
    loadAnalytics,
    chartOptions,
  };
}
