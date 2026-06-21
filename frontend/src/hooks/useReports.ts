import { useCallback, useEffect, useMemo, useState } from 'react';
import { ApiError, fetchReport, fetchReports } from '../lib/api';
import {
  DEMO_REPORTS,
  computeTrendsFromReports,
  findDemoReport,
  isDemoModeEnabled,
} from '../lib/demoData';
import type { Report, TrendsResponse } from '../types';

export type DashboardState = {
  reports: Report[];
  trends: TrendsResponse['trends'];
  loading: boolean;
  apiError: string | null;
  usingSample: boolean;
  reload: () => Promise<void>;
  loadSample: () => void;
  exitSample: () => Promise<void>;
};

export function useDashboard(): DashboardState {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [usingSample, setUsingSample] = useState(isDemoModeEnabled());

  const loadReports = useCallback(async (sampleMode: boolean) => {
    if (sampleMode) {
      setReports(DEMO_REPORTS);
      setApiError(null);
      setLoading(false);
      return;
    }

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
    void loadReports(usingSample);
  }, [loadReports, usingSample]);

  const trends = useMemo(() => computeTrendsFromReports(reports), [reports]);

  const reload = useCallback(async () => {
    await loadReports(usingSample);
  }, [loadReports, usingSample]);

  const loadSample = useCallback(() => {
    setUsingSample(true);
  }, []);

  const exitSample = useCallback(async () => {
    setUsingSample(false);
    await loadReports(false);
  }, [loadReports]);

  return {
    reports,
    trends,
    loading,
    apiError,
    usingSample,
    reload,
    loadSample,
    exitSample,
  };
}

export function useReport(reportId: string | undefined) {
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usingSample, setUsingSample] = useState(false);

  useEffect(() => {
    if (!reportId) return;

    const demoReport = findDemoReport(reportId);
    if (isDemoModeEnabled() && demoReport) {
      setReport(demoReport);
      setUsingSample(true);
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    setUsingSample(false);

    fetchReport(reportId)
      .then(setReport)
      .catch((err) => {
        if (demoReport) {
          setReport(demoReport);
          setUsingSample(true);
          setError(null);
          return;
        }
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

  return { report, loading, error, usingSample };
}
