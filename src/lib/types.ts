export type ConversationSummary = {
  id: string;
  updated_at: string;
  last_seen_at?: string | null;
  is_active?: boolean;
};

export type ConversationHistoryItem = {
  role: 'user' | 'model' | 'assistant' | 'admin';
  text: string;
  sender?: string;
  message_type?: string;
  image_url?: string;
  created_at?: string;
};

export type ConversationResponse = {
  conversation_id: string;
  history: ConversationHistoryItem[];
};

export type ApiResponse<T> = {
  ok: boolean;
  status: number;
  data?: T;
  error?: string;
};

export type TimelineItem = {
  date: string;
  count: number;
};

export type HourlyActivityItem = {
  hour: string;
  count: number;
};

export type AnalyticsOverview = {
  conversation_count: number;
  active_conversation_count: number;
  total_message_count: number;
  average_messages_per_conversation: number;
  unresolved_response_count: number;
  conversations_with_unresolved_count: number;
};

export type AnalyticsOverviewResponse = {
  overview: AnalyticsOverview;
  conversation_activity_daily: TimelineItem[];
  conversation_activity_hourly: HourlyActivityItem[];
  message_activity_daily: TimelineItem[];
  message_activity_hourly: HourlyActivityItem[];
};

export type TopicItem = {
  topic: string;
  count: number;
};

export type FrequentQuestionItem = {
  question: string;
  count: number;
};

export type AnalyticsTopicsResponse = {
  top_topics: TopicItem[];
  frequent_questions: FrequentQuestionItem[];
};

export type GapItem = {
  question: string;
  bot_response: string;
  count: number;
};

export type AnalyticsGapsResponse = {
  gaps: GapItem[];
};
