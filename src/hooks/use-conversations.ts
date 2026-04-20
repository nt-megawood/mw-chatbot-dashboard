import { useCallback, useMemo, useState } from 'react';
import { getConversation, getConversations, postAdminMessage } from '@/lib/api';
import type { ConversationHistoryItem, ConversationSummary } from '@/lib/types';

export function useConversations(apiUrl: string) {
  const [allConversations, setAllConversations] = useState<ConversationSummary[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [history, setHistory] = useState<ConversationHistoryItem[]>([]);
  const [tableLoading, setTableLoading] = useState(true);
  const [tableRefreshing, setTableRefreshing] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [sendingAdminMessage, setSendingAdminMessage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const conversationsPerPage = 15;

  const loadConversations = useCallback(async (background = false) => {
    if (background) {
      setTableRefreshing(true);
    } else {
      setTableLoading(true);
    }
    setError(null);
    const response = await getConversations(apiUrl);
    setTableLoading(false);
    setTableRefreshing(false);

    if (!response.ok) {
      setError(response.error || 'Fehler beim Laden der Konversationen');
      return;
    }

    const incoming = response.data?.conversations || [];
    setAllConversations(incoming);
    setCurrentPage((page) => {
      const totalPages = Math.max(1, Math.ceil(incoming.length / conversationsPerPage));
      return Math.min(page, totalPages);
    });
  }, [apiUrl]);

  const loadHistory = useCallback(async (id: string) => {
    setSelectedId(id);
    setHistoryLoading(true);
    setError(null);
    const response = await getConversation(apiUrl, id);
    setHistoryLoading(false);

    if (!response.ok) {
      setError(response.error || 'Fehler beim Laden der Konversation');
      return;
    }

    setHistory(response.data?.history || []);
  }, [apiUrl]);

  const sendAdminMessage = useCallback(async (text: string, imageUrl: string) => {
    if (!selectedId) {
      setError('Bitte zuerst eine Konversation auswählen.');
      return false;
    }

    const trimmedText = text.trim();
    const trimmedImageUrl = imageUrl.trim();
    if (!trimmedText && !trimmedImageUrl) {
      setError('Bitte Text und/oder Bild-URL eingeben.');
      return false;
    }

    setSendingAdminMessage(true);
    setError(null);

    const response = await postAdminMessage(apiUrl, selectedId, trimmedText, trimmedImageUrl);
    if (!response.ok) {
      setSendingAdminMessage(false);
      setError(response.error || 'Manuelle Nachricht konnte nicht gesendet werden.');
      return false;
    }

    await Promise.all([loadHistory(selectedId), loadConversations(true)]);
    setSendingAdminMessage(false);
    return true;
  }, [apiUrl, loadConversations, loadHistory, selectedId]);

  const selectedConversation = useMemo(
    () => allConversations.find((conversation) => conversation.id === selectedId) || null,
    [allConversations, selectedId]
  );

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(allConversations.length / conversationsPerPage)),
    [allConversations]
  );

  const conversations = useMemo(() => {
    const start = (currentPage - 1) * conversationsPerPage;
    return allConversations.slice(start, start + conversationsPerPage);
  }, [allConversations, currentPage]);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(totalPages, page)));
  };

  return {
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
    conversationsPerPage,
    loadConversations,
    loadHistory,
    sendAdminMessage,
    goToPage,
    setError,
  };
}
