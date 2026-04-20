import { useEffect, useMemo, useState } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { AnalyticsPage } from '@/pages/analytics-page';
import { ConversationsPage } from '@/pages/conversations-page';
import { DashboardFooter } from '@/components/layout/dashboard-footer';
import { DashboardHeader } from '@/components/layout/dashboard-header';
import { useAnalytics } from '@/hooks/use-analytics';
import { useConversations } from '@/hooks/use-conversations';
import { resolveApiUrl } from '@/lib/api';

export default function App() {
  const [isDark, setIsDark] = useState(false);
  const apiUrl = useMemo(() => resolveApiUrl(), []);
  const location = useLocation();
  const navigate = useNavigate();
  const {
    conversations,
    allConversations,
    selectedId,
    history,
    tableLoading,
    tableRefreshing,
    historyLoading,
    sendingAdminMessage,
    error,
    selectedConversation,
    currentPage,
    totalPages,
    goToPage,
    loadConversations,
    loadHistory,
    sendAdminMessage,
  } = useConversations(apiUrl);

  const {
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
  } = useAnalytics(apiUrl, isDark);

  const currentPageName = location.pathname.startsWith('/konversation') ? 'conversations' : 'analytics';

  useEffect(() => {
    const savedTheme = window.localStorage.getItem('mw-dashboard-theme');

    if (savedTheme === 'dark') {
      setIsDark(true);
      return;
    }

    if (savedTheme === 'light') {
      setIsDark(false);
      return;
    }

    setIsDark(window.matchMedia('(prefers-color-scheme: dark)').matches);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    window.localStorage.setItem('mw-dashboard-theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  useEffect(() => {
    loadConversations();
    loadAnalytics();

    const interval = setInterval(() => {
      loadConversations(true);
      loadAnalytics();
    }, 30000);

    return () => {
      clearInterval(interval);
    };
  }, [loadConversations, loadAnalytics]);

  const handleManualRefresh = () => {
    loadConversations(true);
    loadAnalytics();
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-8">
      <DashboardHeader
        loading={tableLoading || tableRefreshing || historyLoading || sendingAdminMessage || analyticsLoading || analyticsRefreshing}
        isDark={isDark}
        currentPage={currentPageName}
        onToggleTheme={() => setIsDark((current) => !current)}
        onRefresh={handleManualRefresh}
        onNavigate={(page) => navigate(page === 'analytics' ? '/statistiken' : '/konversationen')}
      />

      <div className="mb-4">
        <Routes>
          <Route path="/" element={<Navigate to="/statistiken" replace />} />
          <Route
            path="/statistiken"
            element={
              <AnalyticsPage
                overview={analyticsOverview}
                conversationDaily={conversationDaily}
                conversationHourly={conversationHourly}
                messageDaily={messageDaily}
                messageHourly={messageHourly}
                topics={topics}
                frequentQuestions={frequentQuestions}
                gaps={gaps}
                loading={analyticsLoading || analyticsRefreshing}
                hasLoaded={hasLoadedAnalytics}
                error={analyticsError}
                timeframe={timeframe}
                onTimeframeChange={setTimeframe}
                chartOptions={chartOptions}
              />
            }
          />
          <Route
            path="/konversationen"
            element={
              <ConversationsPage
                conversations={conversations}
                totalCount={allConversations.length}
                selectedId={selectedId}
                selectedConversation={selectedConversation}
                history={history}
                loading={tableLoading || tableRefreshing || historyLoading || sendingAdminMessage}
                error={error}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={goToPage}
                onSelect={loadHistory}
                onSendAdminMessage={sendAdminMessage}
              />
            }
          />
        </Routes>
      </div>

      <DashboardFooter />
    </div>
  );
}
