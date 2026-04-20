import {
  type AnalyticsGapsResponse,
  type AnalyticsOverviewResponse,
  type AnalyticsTopicsResponse,
  type ApiResponse,
  type ConversationResponse,
  type ConversationSummary,
} from '@/lib/types';
import type { AnalyticsTimeframe } from '@/lib/analytics-utils';

const API_BASE = import.meta.env.VITE_API_URL || 'https://mw-chatbot-backend.vercel.app';
const API_TOKEN = import.meta.env.VITE_API_TOKEN || '';

export function resolveApiUrl() {
  return API_BASE.replace(/\/+$/, '');
}

function buildHeaders() {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (API_TOKEN) {
    headers.Authorization = `Bearer ${API_TOKEN}`;
  }

  return headers;
}

export async function fetchJson<T>(input: RequestInfo, init?: RequestInit): Promise<ApiResponse<T>> {
  const res = await fetch(input, init);
  const text = await res.text();

  if (!res.ok) {
    return {
      ok: false,
      status: res.status,
      error: text || res.statusText,
    };
  }

  try {
    const data = JSON.parse(text);
    return { ok: true, status: res.status, data };
  } catch (error) {
    return { ok: false, status: res.status, error: `Invalid JSON response: ${error}` };
  }
}

export function formatDate(iso?: string) {
  if (!iso) {
    return '-';
  }

  return new Date(iso).toLocaleString();
}

export function getConversations(apiUrl: string) {
  return fetchJson<{ conversations: ConversationSummary[] }>(`${apiUrl}/conversations?limit=50`, {
    headers: buildHeaders(),
  });
}

export function getConversation(apiUrl: string, id: string) {
  return fetchJson<ConversationResponse>(`${apiUrl}/conversation/${encodeURIComponent(id)}`, {
    headers: buildHeaders(),
  });
}

export function postAdminMessage(apiUrl: string, conversationId: string, text: string, imageUrl: string) {
  return fetchJson<{ ok: boolean }>(`${apiUrl}/conversation/${encodeURIComponent(conversationId)}/admin-message`, {
    method: 'POST',
    headers: buildHeaders(),
    body: JSON.stringify({ text, image_url: imageUrl }),
  });
}

export function getAnalyticsOverview(apiUrl: string, timeframe?: AnalyticsTimeframe) {
  const params = new URLSearchParams({
    limit: '300',
  });

  if (timeframe) {
    params.set('timeframe', timeframe);
  }

  return fetchJson<AnalyticsOverviewResponse>(`${apiUrl}/analytics/overview?${params.toString()}`, {
    headers: buildHeaders(),
  });
}

export function getAnalyticsTopics(apiUrl: string) {
  return fetchJson<AnalyticsTopicsResponse>(`${apiUrl}/analytics/topics?limit=300&top_n=12`, {
    headers: buildHeaders(),
  });
}

export function getAnalyticsGaps(apiUrl: string) {
  return fetchJson<AnalyticsGapsResponse>(`${apiUrl}/analytics/gaps?limit=300&top_n=8`, {
    headers: buildHeaders(),
  });
}
