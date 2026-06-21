import { useCallback, useEffect, useMemo, useState } from 'react';
import { ApiError, fetchReport, fetchReports } from '../lib/api';
import { computeTrendsFromReports } from '../lib/trends';
import type { Report, TrendsResponse } from '../types';

export type DashboardState = {
  reports: Report[];
  trends: TrendsResponse['trends'];
  loading: boolean;
  apiError: string | null;
  reload: () => Promise<void>;
};

export function useDashboard(): DashboardState {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);

  const loadReports = useCallback(async () => {
    setLoading(true);
    setApiError(null);
    try {
      const data = await fetchReports();
      setReports(data);
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : 'Failed to load reports.';
      setApiError(message);
      setReports([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadReports();
  }, [loadReports]);

  const trends = useMemo(() => computeTrendsFromReports(reports), [reports]);

  const reload = useCallback(async () => {
    await loadReports();
  }, [loadReports]);

  return {
    reports,
    trends,
    loading,
    apiError,
    reload,
  };
}

export function useReport(reportId: string | undefined) {
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!reportId) return;

    setLoading(true);
    setError(null);

    fetchReport(reportId)
      .then(setReport)
      .catch((err) => {
        setError(
          err instanceof ApiError
            ? err.message
            : err instanceof Error
              ? err.message
              : 'Failed to load report.'
        );
      })
      .finally(() => setLoading(false));
  }, [reportId]);

  return { report, loading, error };
}
