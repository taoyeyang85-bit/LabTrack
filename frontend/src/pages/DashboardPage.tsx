import { Link } from 'react-router-dom';
import DisclaimerBanner from '../components/DisclaimerBanner';
import ErrorState from '../components/ErrorState';
import LoadingState from '../components/LoadingState';
import ReportList from '../components/ReportList';
import TrendChart from '../components/TrendChart';
import { useReports, useTrends } from '../hooks/useReports';
import { TREND_BIOMARKERS } from '../types';

export default function DashboardPage() {
  const { reports, loading, error, reload } = useReports();
  const { trends, loading: trendsLoading } = useTrends();

  if (loading) return <LoadingState message="Loading your dashboard…" />;
  if (error) return <ErrorState message={error} onRetry={reload} />;

  const latest = reports[0];
  const totalBiomarkers = reports.reduce((sum, r) => sum + r.biomarkers.length, 0);
  const needsReview = reports.reduce(
    (sum, r) => sum + r.biomarkers.filter((b) => b.needs_review).length,
    0
  );

  const latestDate = latest
    ? latest.report_date || new Date(latest.uploaded_at).toLocaleDateString()
    : '—';

  return (
    <div className="dashboard-page container">
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p className="text-muted">Your lab reports and health trends</p>
        </div>
        <Link to="/upload" className="btn btn-primary">
          Upload report
        </Link>
      </div>

      <div className="stats-grid">
        <div className="card stat-card">
          <span className="stat-label">Reports uploaded</span>
          <span className="stat-value">{reports.length}</span>
        </div>
        <div className="card stat-card">
          <span className="stat-label">Most recent report</span>
          <span className="stat-value stat-value-sm">{latestDate}</span>
        </div>
        <div className="card stat-card">
          <span className="stat-label">Biomarkers extracted</span>
          <span className="stat-value">{totalBiomarkers}</span>
        </div>
        <div className="card stat-card">
          <span className="stat-label">Values needing review</span>
          <span className="stat-value">{needsReview}</span>
        </div>
      </div>

      {latest && (
        <section className="section">
          <h2>Latest report</h2>
          <div className="card">
            <p>
              <strong>{latest.original_filename}</strong>
            </p>
            <p className="text-muted">
              {latest.biomarkers.length} biomarkers ·{' '}
              {Math.round(latest.parser_confidence * 100)}% parser confidence
            </p>
            <Link to={`/reports/${latest.id}`} className="btn btn-secondary btn-sm">
              View details
            </Link>
          </div>
        </section>
      )}

      <section className="section">
        <h2>Trends</h2>
        {trendsLoading ? (
          <LoadingState message="Loading trends…" />
        ) : (
          <div className="trends-grid">
            {TREND_BIOMARKERS.map((name) => {
              const data = trends[name];
              if (!data || data.length < 2) return null;
              return <TrendChart key={name} canonicalName={name} data={data} />;
            })}
            {TREND_BIOMARKERS.every(
              (name) => !trends[name] || trends[name].length < 2
            ) && (
              <div className="card empty-state">
                <p>Upload at least two reports to see trend charts.</p>
              </div>
            )}
          </div>
        )}
      </section>

      <section className="section">
        <h2>All reports</h2>
        <ReportList reports={reports} />
      </section>

      <DisclaimerBanner />
    </div>
  );
}
