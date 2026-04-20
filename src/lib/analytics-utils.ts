import type { FrequentQuestionItem, TimelineItem, TopicItem } from '@/lib/types';

export type AnalyticsTimeframe = 'daily' | 'weekly' | 'monthly' | 'yearly';

type Cluster = {
  representative: string;
  count: number;
  topMemberCount: number;
};

const GERMAN_STOPWORDS = new Set([
  'der',
  'die',
  'das',
  'den',
  'dem',
  'des',
  'ein',
  'eine',
  'einer',
  'eines',
  'und',
  'oder',
  'mit',
  'ohne',
  'fuer',
  'für',
  'von',
  'im',
  'in',
  'am',
  'an',
  'auf',
  'ist',
  'sind',
  'ich',
  'du',
  'wir',
  'ihr',
  'sie',
  'zu',
  'wie',
  'welche',
  'welcher',
  'welches',
  'kann',
  'moechte',
  'möchte',
]);

function normalizeQuestion(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9äöüß\s]/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function levenshtein(a: string, b: string) {
  const rows = a.length + 1;
  const cols = b.length + 1;
  const matrix: number[][] = Array.from({ length: rows }, () => Array(cols).fill(0));

  for (let i = 0; i < rows; i += 1) {
    matrix[i][0] = i;
  }

  for (let j = 0; j < cols; j += 1) {
    matrix[0][j] = j;
  }

  for (let i = 1; i < rows; i += 1) {
    for (let j = 1; j < cols; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }

  return matrix[rows - 1][cols - 1];
}

function textSimilarity(a: string, b: string) {
  if (!a || !b) {
    return 0;
  }

  if (a === b) {
    return 1;
  }

  const distance = levenshtein(a, b);
  const maxLength = Math.max(a.length, b.length);

  if (!maxLength) {
    return 1;
  }

  return 1 - distance / maxLength;
}

export function clusterFrequentQuestions(
  questions: FrequentQuestionItem[],
  threshold = 0.9
): FrequentQuestionItem[] {
  const sorted = [...questions].sort((a, b) => b.count - a.count);
  const clusters: Cluster[] = [];

  sorted.forEach((entry) => {
    const normalized = normalizeQuestion(entry.question);
    const cluster = clusters.find((item) => textSimilarity(normalized, normalizeQuestion(item.representative)) >= threshold);

    if (cluster) {
      cluster.count += entry.count;
      if (entry.count > cluster.topMemberCount) {
        cluster.topMemberCount = entry.count;
        cluster.representative = entry.question;
      }
      return;
    }

    clusters.push({ representative: entry.question, count: entry.count, topMemberCount: entry.count });
  });

  return clusters
    .map((cluster) => ({
      question: cluster.representative,
      count: cluster.count,
    }))
    .sort((a, b) => b.count - a.count);
}

function getWeekKey(date: Date) {
  const utc = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNumber = utc.getUTCDay() || 7;
  utc.setUTCDate(utc.getUTCDate() + 4 - dayNumber);
  const yearStart = new Date(Date.UTC(utc.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((utc.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);

  return `${utc.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

export function aggregateTimelineByTimeframe(items: TimelineItem[], timeframe: AnalyticsTimeframe): TimelineItem[] {
  const grouped = new Map<string, number>();

  items.forEach((item) => {
    const date = new Date(item.date);
    if (Number.isNaN(date.getTime())) {
      return;
    }

    let key = item.date;
    if (timeframe === 'daily') {
      key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    }

    if (timeframe === 'weekly') {
      key = getWeekKey(date);
    }

    if (timeframe === 'monthly') {
      key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    }

    if (timeframe === 'yearly') {
      key = String(date.getFullYear());
    }

    grouped.set(key, (grouped.get(key) || 0) + item.count);
  });

  return [...grouped.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({ date, count }));
}

export function buildTopicPhrasesFromQuestions(
  questions: FrequentQuestionItem[],
  fallbackTopics: TopicItem[],
  limit = 12
): TopicItem[] {
  const phraseCounts = new Map<string, number>();

  questions.forEach((questionItem) => {
    const normalized = normalizeQuestion(questionItem.question);
    const tokens = normalized
      .split(' ')
      .filter((token) => token.length >= 3 && !GERMAN_STOPWORDS.has(token));

    if (tokens.length < 2) {
      return;
    }

    for (let index = 0; index < tokens.length - 1; index += 1) {
      const phrase = `${tokens[index]} ${tokens[index + 1]}`;
      phraseCounts.set(phrase, (phraseCounts.get(phrase) || 0) + questionItem.count);
    }
  });

  const phrases = [...phraseCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([topic, count]) => ({ topic, count }));

  if (phrases.length >= Math.min(4, limit)) {
    return phrases;
  }

  return fallbackTopics.slice(0, limit);
}
