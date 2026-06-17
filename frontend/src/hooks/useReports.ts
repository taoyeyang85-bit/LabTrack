import { useCallback, useEffect, useState } from 'react';
import { fetchReports, fetchReport, fetchTrends } from '../lib/api';
import type { Report, TrendsResponse } from '../types';

export function useReports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadReports = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchReports();
      setReports(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load reports.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  return { reports, loading, error, reload: loadReports };
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
      .catch((err) =>
        setError(err instanceof Error ? err.message : 'Failed to load report.')
      )
      .finally(() => setLoading(false));
  }, [reportId]);

  return { report, loading, error };
}

export function useTrends() {
  const [trends, setTrends] = useState<TrendsResponse['trends']>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetchTrends()
      .then((data) => setTrends(data.trends))
      .catch((err) =>
        setError(err instanceof Error ? err.message : 'Failed to load trends.')
      )
      .finally(() => setLoading(false));
  }, []);

  return { trends, loading, error };
}
