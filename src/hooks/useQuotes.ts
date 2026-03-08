import { usePolling } from "./usePolling";
import { listQuotes } from "../api/quotes";
import type { QuoteSummary } from "../types";

interface UseQuotesReturn {
  quotes: QuoteSummary[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useQuotes(pollingInterval = 60000): UseQuotesReturn {
  const { data, loading, error, refetch } = usePolling<QuoteSummary[]>(
    listQuotes,
    pollingInterval
  );

  return {
    quotes: data ?? [],
    loading,
    error,
    refetch,
  };
}
