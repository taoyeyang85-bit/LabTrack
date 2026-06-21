import { Link } from 'react-router-dom';
import ReportList from '../components/ReportList';
import TrendChart from '../components/TrendChart';
import { useDashboard } from '../hooks/useReports';
import { TREND_BIOMARKERS } from '../types';

export default function DashboardPage() {
  const {
    reports,
    trends,
    loading,
    apiError,
    usingSample,
    reload,
    loadSample,
    exitSample,
  } = useDashboard();

  const latest = reports[0];
  const latestDate = latest
    ? latest.report_date || new Date(latest.uploaded_at).toLocaleDateString()
    : '—';

  const trendCharts = TREND_BIOMARKERS.filter(
    (name) => trends[name] && trends[name].length >= 2
  );

  return (
    <div className="dashboard-page container">
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p className="text-muted">Your lab results at a glance</p>
        </div>
        <Link to="/upload" className="btn btn-primary">
          Upload
        </Link>
      </div>

      {usingSample && (
        <div className="banner banner-info">
          <span>Viewing sample data to preview the dashboard.</span>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => void exitSample()}>
            Use my data
          </button>
        </div>
      )}

      {apiError && !usingSample && (
        <div className="banner banner-warn">
          <div>
            <strong>Could not load your reports</strong>
            <p>{apiError}</p>
          </div>
          <div className="banner-actions">
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => void reload()}>
              Retry
            </button>
            <button type="button" className="btn btn-primary btn-sm" onClick={loadSample}>
              Preview sample
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="loading-inline">Loading…</div>
      ) : (
        <>
          <div className="stats-row">
            <div className="stat">
              <span className="stat-value">{reports.length}</span>
              <span className="stat-label">Reports</span>
            </div>
            <div className="stat">
              <span className="stat-value stat-value-sm">{latestDate}</span>
              <span className="stat-label">Latest</span>
            </div>
            <div className="stat">
              <span className="stat-value">{trendCharts.length}</span>
              <span className="stat-label">Trends</span>
            </div>
          </div>

          {latest && (
            <section className="section">
              <div className="section-header">
                <h2>Latest report</h2>
                <Link to={`/reports/${latest.id}`} className="text-link">
                  View all details →
                </Link>
              </div>
              <Link to={`/reports/${latest.id}`} className="card report-highlight">
                <strong>{latest.original_filename}</strong>
                <span className="text-muted">
                  {latest.biomarkers.length} values · {latestDate}
                </span>
              </Link>
            </section>
          )}

          <section className="section">
            <h2>Trends</h2>
            {trendCharts.length > 0 ? (
              <div className="trends-grid">
                {trendCharts.map((name) => (
                  <TrendChart key={name} canonicalName={name} data={trends[name]} />
                ))}
              </div>
            ) : (
              <div className="card empty-state compact">
                <p>Upload two or more reports to see trend charts.</p>
                {!usingSample && reports.length === 0 && (
                  <button type="button" className="btn btn-secondary btn-sm" onClick={loadSample}>
                    Preview with sample data
                  </button>
                )}
              </div>
            )}
          </section>

          <section className="section">
            <h2>All reports</h2>
            <ReportList reports={reports} />
          </section>
        </>
      )}
    </div>
  );
}
