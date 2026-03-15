import { useEffect, useMemo, useState } from 'react';
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend,
  Filler
);

type ConversationSummary = {
  id: string;
  updated_at: string;
  last_seen_at?: string | null;
  is_active?: boolean;
};

type ConversationHistoryItem = {
  role: 'user' | 'model' | 'assistant' | 'admin';
  text: string;
  sender?: string;
  message_type?: string;
  image_url?: string;
  created_at?: string;
};

type ConversationResponse = {
  conversation_id: string;
  history: ConversationHistoryItem[];
};

type ApiResponse<T> = {
  ok: boolean;
  status: number;
  data?: T;
  error?: string;
};


type TimelineItem = {
  date: string;
  count: number;
};

type HourlyActivityItem = {
  hour: string;
  count: number;
};

type AnalyticsOverview = {
  conversation_count: number;
  active_conversation_count: number;
  total_message_count: number;
  average_messages_per_conversation: number;
  unresolved_response_count: number;
  conversations_with_unresolved_count: number;
};

type AnalyticsOverviewResponse = {
  overview: AnalyticsOverview;
  role_distribution: RoleDistributionItem[];
  conversation_activity_daily: TimelineItem[];
  conversation_activity_hourly: HourlyActivityItem[];
  message_activity_daily: TimelineItem[];
  message_activity_hourly: HourlyActivityItem[];
};

type TopicItem = {
  topic: string;
  count: number;
};

type FrequentQuestionItem = {
  question: string;
  count: number;
};

type AnalyticsTopicsResponse = {
  top_topics: TopicItem[];
  frequent_questions: FrequentQuestionItem[];
};

type GapItem = {
  question: string;
  bot_response: string;
  count: number;
};

type AnalyticsGapsResponse = {
  gaps: GapItem[];
};

const API_BASE = import.meta.env.VITE_API_URL || 'https://mw-chatbot-backend.vercel.app';
const API_TOKEN = import.meta.env.VITE_API_TOKEN || '';

function buildHeaders() {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (API_TOKEN) {
    headers.Authorization = `Bearer ${API_TOKEN}`;
  }
  return headers;
}

async function fetchJson<T>(input: RequestInfo, init?: RequestInit): Promise<ApiResponse<T>> {
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
  } catch (e) {
    return { ok: false, status: res.status, error: `Invalid JSON response: ${e}` };
  }
}

function formatDate(iso?: string) {
  if (!iso) return '-';
  const d = new Date(iso);
  return d.toLocaleString();
}

export default function App() {
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [history, setHistory] = useState<ConversationHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [adminText, setAdminText] = useState('');
  const [adminImageUrl, setAdminImageUrl] = useState('');
  const [sendingAdminMessage, setSendingAdminMessage] = useState(false);
  const [analyticsOverview, setAnalyticsOverview] = useState<AnalyticsOverview | null>(null);
  const [conversationDaily, setConversationDaily] = useState<TimelineItem[]>([]);
  const [conversationHourly, setConversationHourly] = useState<HourlyActivityItem[]>([]);
  const [messageDaily, setMessageDaily] = useState<TimelineItem[]>([]);
  const [messageHourly, setMessageHourly] = useState<HourlyActivityItem[]>([]);
  const [topics, setTopics] = useState<TopicItem[]>([]);
  const [frequentQuestions, setFrequentQuestions] = useState<FrequentQuestionItem[]>([]);
  const [gaps, setGaps] = useState<GapItem[]>([]);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);

  const apiUrl = useMemo(() => API_BASE.replace(/\/+$/, ''), []);

  const loadConversations = async () => {
    setLoading(true);
    setError(null);
    const resp = await fetchJson<{ conversations: ConversationSummary[] }>(
      `${apiUrl}/conversations?limit=50`,
      { headers: buildHeaders() }
    );
    setLoading(false);
    if (!resp.ok) {
      setError(resp.error || 'Fehler beim Laden der Konversationen');
      return;
    }
    setConversations(resp.data?.conversations || []);
  };

  const loadHistory = async (id: string) => {
    setLoading(true);
    setError(null);
    const resp = await fetchJson<ConversationResponse>(`${apiUrl}/conversation/${encodeURIComponent(id)}`, {
      headers: buildHeaders(),
    });
    setLoading(false);
    if (!resp.ok) {
      setError(resp.error || 'Fehler beim Laden der Konversation');
      return;
    }
    setSelectedId(id);
    setHistory(resp.data?.history || []);
  };

  const loadAnalytics = async () => {
    setAnalyticsLoading(true);
    setAnalyticsError(null);

    const [overviewResp, topicsResp, gapsResp] = await Promise.all([
      fetchJson<AnalyticsOverviewResponse>(`${apiUrl}/analytics/overview?limit=300`, {
        headers: buildHeaders(),
      }),
      fetchJson<AnalyticsTopicsResponse>(`${apiUrl}/analytics/topics?limit=300&top_n=12`, {
        headers: buildHeaders(),
      }),
      fetchJson<AnalyticsGapsResponse>(`${apiUrl}/analytics/gaps?limit=300&top_n=8`, {
        headers: buildHeaders(),
      }),
    ]);

    setAnalyticsLoading(false);

    if (!overviewResp.ok || !topicsResp.ok || !gapsResp.ok) {
      setAnalyticsError(
        overviewResp.error || topicsResp.error || gapsResp.error || 'Analytics konnten nicht geladen werden.'
      );
      return;
    }

    setAnalyticsOverview(overviewResp.data?.overview || null);
    setConversationDaily(overviewResp.data?.conversation_activity_daily || []);
    setConversationHourly(overviewResp.data?.conversation_activity_hourly || []);
    setMessageDaily(overviewResp.data?.message_activity_daily || []);
    setMessageHourly(overviewResp.data?.message_activity_hourly || []);
    setTopics(topicsResp.data?.top_topics || []);
    setFrequentQuestions(topicsResp.data?.frequent_questions || []);
    setGaps(gapsResp.data?.gaps || []);
  };

  const sendAdminMessage = async () => {
    if (!selectedId) {
      setError('Bitte zuerst eine Konversation auswählen.');
      return;
    }

    const trimmedText = adminText.trim();
    const trimmedImageUrl = adminImageUrl.trim();
    if (!trimmedText && !trimmedImageUrl) {
      setError('Bitte Text und/oder Bild-URL eingeben.');
      return;
    }

    setSendingAdminMessage(true);
    setError(null);
    const resp = await fetchJson<{ ok: boolean }>(
      `${apiUrl}/conversation/${encodeURIComponent(selectedId)}/admin-message`,
      {
        method: 'POST',
        headers: buildHeaders(),
        body: JSON.stringify({ text: trimmedText, image_url: trimmedImageUrl }),
      }
    );
    setSendingAdminMessage(false);

    if (!resp.ok) {
      setError(resp.error || 'Manuelle Nachricht konnte nicht gesendet werden.');
      return;
    }

    setAdminText('');
    setAdminImageUrl('');
    await Promise.all([loadHistory(selectedId), loadConversations()]);
  };

  const selectedConversation = useMemo(
    () => conversations.find((c) => c.id === selectedId) || null,
    [conversations, selectedId]
  );


  const conversationDailyData = useMemo(
    () => ({
      labels: conversationDaily.map((item) => item.date.slice(5)),
      datasets: [
        {
          label: 'Konversationen / Tag',
          data: conversationDaily.map((item) => item.count),
          borderColor: '#b4032f',
          backgroundColor: 'rgba(180, 3, 47, 0.14)',
          fill: true,
          tension: 0.25,
        },
      ],
    }),
    [conversationDaily]
  );

  const messageDailyData = useMemo(
    () => ({
      labels: messageDaily.map((item) => item.date.slice(5)),
      datasets: [
        {
          label: 'Nachrichten / Tag',
          data: messageDaily.map((item) => item.count),
          borderColor: '#7f102d',
          backgroundColor: 'rgba(127, 16, 45, 0.16)',
          fill: true,
          tension: 0.25,
        },
      ],
    }),
    [messageDaily]
  );

  const messageHourlyData = useMemo(
    () => ({
      labels: messageHourly.map((item) => item.hour),
      datasets: [
        {
          label: 'Nachrichten je Stunde',
          data: messageHourly.map((item) => item.count),
          backgroundColor: 'rgba(180, 3, 47, 0.75)',
          borderColor: '#b4032f',
          borderWidth: 1,
        },
      ],
    }),
    [messageHourly]
  );

  const conversationHourlyData = useMemo(
    () => ({
      labels: conversationHourly.map((item) => item.hour),
      datasets: [
        {
          label: 'Aktivität nach Uhrzeit',
          data: conversationHourly.map((item) => item.count),
          backgroundColor: 'rgba(141, 15, 50, 0.75)',
          borderColor: '#8d0f32',
          borderWidth: 1,
        },
      ],
    }),
    [conversationHourly]
  );

  const commonChartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            color: '#444',
          },
        },
      },
      scales: {
        x: {
          ticks: {
            color: '#666',
          },
          grid: {
            color: 'rgba(0,0,0,0.05)',
          },
        },
        y: {
          beginAtZero: true,
          ticks: {
            color: '#666',
            precision: 0,
          },
          grid: {
            color: 'rgba(0,0,0,0.05)',
          },
        },
      },
    }),
    []
  );

  useEffect(() => {
    loadConversations();
    loadAnalytics();
    const interval = setInterval(() => {
      loadConversations();
      loadAnalytics();
    }, 30000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="app">
      <header className="header">
        <div className="header-left">
          <img
            className="logo"
            src="https://assets.planungswelten.de/wp-content/uploads/2022/03/08172642/megawood_logo.png"
            alt="megawood logo"
          />
          <h1>megawood Chatbot Dashboard</h1>
        </div>
        <div className="header-actions">
          <button onClick={loadConversations} disabled={loading}>
            Aktualisieren
          </button>
        </div>
      </header>

      <section className="analytics-section">
        <div className="analytics-grid">
          <article className="panel analytics-card">
            <h2>Aktive Chats</h2>
            <p className="metric-value">{analyticsOverview?.active_conversation_count ?? 0}</p>
            <p className="hint">derzeit aktiv (Status innerhalb 2 Minuten)</p>
          </article>

          <article className="panel analytics-card">
            <h2>Nachrichten Gesamt</h2>
            <p className="metric-value">{analyticsOverview?.total_message_count ?? 0}</p>
            <p className="hint">über alle ausgewerteten Konversationen</p>
          </article>

          <article className="panel analytics-card">
            <h2>Unklare Antworten</h2>
            <p className="metric-value">{analyticsOverview?.unresolved_response_count ?? 0}</p>
            <p className="hint">potenzielle Lücken im Bot-Wissen</p>
          </article>

          <article className="panel analytics-card">
            <h2>Ø Nachrichten / Chat</h2>
            <p className="metric-value">{analyticsOverview?.average_messages_per_conversation ?? 0}</p>
            <p className="hint">Durchschnitt über ausgewertete Chats</p>
          </article>
        </div>

        {analyticsLoading && <p className="hint">Analytics werden geladen…</p>}
        {analyticsError && <p className="error">{analyticsError}</p>}

        {!analyticsLoading && !analyticsError && (
          <div className="analytics-grid analytics-grid-secondary">

            <article className="panel">
              <h2>Konversationen je Tag (Trend)</h2>
              <div className="chart-wrap">
                {!!conversationDaily.length && <Line options={commonChartOptions} data={conversationDailyData} />}
                {!conversationDaily.length && <p className="hint">Noch keine Zeitreihendaten vorhanden.</p>}
              </div>
            </article>

            <article className="panel">
              <h2>Nachrichten je Tag (Trend)</h2>
              <div className="chart-wrap">
                {!!messageDaily.length && <Line options={commonChartOptions} data={messageDailyData} />}
                {!messageDaily.length && <p className="hint">Noch keine Nachrichtendaten vorhanden.</p>}
              </div>
            </article>

            <article className="panel">
              <h2>Nachrichten nach Uhrzeit</h2>
              <div className="chart-wrap">
                {!!messageHourly.length && <Bar options={commonChartOptions} data={messageHourlyData} />}
                {!messageHourly.length && <p className="hint">Noch keine Stundenwerte vorhanden.</p>}
              </div>
            </article>

            <article className="panel">
              <h2>Konversationsaktivität nach Uhrzeit</h2>
              <div className="chart-wrap">
                {!!conversationHourly.length && <Bar options={commonChartOptions} data={conversationHourlyData} />}
                {!conversationHourly.length && <p className="hint">Noch keine Stundenwerte vorhanden.</p>}
              </div>
            </article>

            <article className="panel">
              <h2>Top-Themen in Kundenfragen</h2>
              <div className="bar-list">
                {topics.map((item) => {
                  const max = Math.max(...topics.map((v) => v.count), 1);
                  const width = Math.max((item.count / max) * 100, 4);
                  return (
                    <div key={item.topic} className="bar-row">
                      <div className="bar-row-label">{item.topic}</div>
                      <div className="bar-track">
                        <div className="bar-fill" style={{ width: `${width}%` }} />
                      </div>
                      <div className="bar-row-value">{item.count}</div>
                    </div>
                  );
                })}
                {!topics.length && <p className="hint">Noch keine Topic-Daten vorhanden.</p>}
              </div>
            </article>

            <article className="panel">
              <h2>Häufige Kundenfragen</h2>
              <div className="question-list">
                {frequentQuestions.map((item, idx) => (
                  <div key={`${item.question}-${idx}`} className="question-item">
                    <div className="question-text">{item.question || 'Unbekannte Frage'}</div>
                    <span className="question-count">{item.count}</span>
                  </div>
                ))}
                {!frequentQuestions.length && <p className="hint">Noch keine Fragenstatistik vorhanden.</p>}
              </div>
            </article>

            <article className="panel analytics-gaps-panel">
              <h2>Fragen mit möglicher Bot-Lücke</h2>
              <div className="gaps-list">
                {gaps.map((item, idx) => (
                  <div key={`${item.question}-${idx}`} className="gap-item">
                    <div>
                      <strong>Frage:</strong> {item.question || 'Keine Frage erfasst'}
                    </div>
                    <div>
                      <strong>Antwort:</strong> {item.bot_response || 'Keine Antwort erfasst'}
                    </div>
                    <div className="gap-count">Vorkommen: {item.count}</div>
                  </div>
                ))}
                {!gaps.length && <p className="hint">Aktuell keine klaren Lücken erkannt.</p>}
              </div>
            </article>
          </div>
        )}
      </section>

      <main className="layout">
        <section className="panel">
          <h2>Aktuelle Konversationen</h2>
          {loading && <p className="hint">Lade…</p>}
          {error && <p className="error">{error}</p>}
          {!loading && !error && (
            <table className="table">
              <thead>
                <tr>
                  <th>Status</th>
                  <th>ID</th>
                  <th>Letzte Aktivität</th>
                </tr>
              </thead>
              <tbody>
                {conversations.map((c) => (
                  <tr
                    key={c.id}
                    className={c.id === selectedId ? 'selected' : ''}
                    onClick={() => loadHistory(c.id)}
                  >
                    <td className="status-cell">
                      <span className={`status-dot ${c.is_active ? 'active' : 'inactive'}`} />
                    </td>
                    <td className="mono">{c.id}</td>
                    <td>{formatDate(c.updated_at)}</td>
                  </tr>
                ))}
                {!conversations.length && (
                  <tr>
                    <td colSpan={3} className="hint">
                      Keine Konversationen gefunden.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </section>

        <section className="panel">
          <h2>Konversations-Verlauf</h2>
          {!selectedId && <p className="hint">Wähle eine Konversation aus, um den Verlauf anzuzeigen.</p>}
          {selectedId && (
            <div>
              <p className="hint">
                Verlauf für <strong className="mono">{selectedId}</strong>
              </p>
              <p className="hint">
                Status: {' '}
                <span className={`status-dot ${selectedConversation?.is_active ? 'active' : 'inactive'}`} />
                {selectedConversation?.is_active
                  ? 'Kunde aktiv im Tab'
                  : 'Kunde derzeit nicht aktiv'}
                {selectedConversation?.last_seen_at
                  ? ` (letzter Status: ${formatDate(selectedConversation.last_seen_at)})`
                  : ''}
              </p>
              <div className="history">
                {history.map((item, idx) => (
                  <div key={idx} className={`history-item ${item.role}`}>
                    <div className="history-role">
                      {item.sender === 'admin' ? 'admin' : item.role}
                    </div>
                    <div className="history-text">{item.text}</div>
                    {item.image_url && (
                      <img className="history-image" src={item.image_url} alt="Support" loading="lazy" />
                    )}
                  </div>
                ))}
                {!history.length && <p className="hint">Keine Nachrichten gespeichert.</p>}
              </div>

              <div className="admin-composer">
                <h3>Manuelle Admin-Hilfe senden</h3>
                <textarea
                  value={adminText}
                  onChange={(e) => setAdminText(e.target.value)}
                  rows={4}
                  placeholder="Textnachricht an den Kunden..."
                />
                <input
                  type="url"
                  value={adminImageUrl}
                  onChange={(e) => setAdminImageUrl(e.target.value)}
                  placeholder="Optionale Bild-URL (https://...)"
                />
                <button onClick={sendAdminMessage} disabled={sendingAdminMessage || loading}>
                  {sendingAdminMessage ? 'Sende...' : 'Admin-Nachricht senden'}
                </button>
              </div>
            </div>
          )}
        </section>
      </main>

      <footer className="footer">
        <div>
          API: <code>{apiUrl}</code>
        </div>
        <div>Nutze <code>VITE_API_URL</code> und <code>VITE_API_TOKEN</code> in .env für Konfiguration.</div>
      </footer>
    </div>
  );
}
