import { Link } from 'react-router-dom';
import ReportList from '../components/ReportList';
import TrendChart from '../components/TrendChart';
import { useDashboard } from '../hooks/useReports';
import { TREND_BIOMARKERS } from '../types';

export default function DashboardPage() {
  const { reports, trends, loading, apiError, reload } = useDashboard();

  const trendCharts = TREND_BIOMARKERS.filter(
    (name) => trends[name] && trends[name].length >= 2
  );

  return (
    <div className="dashboard-page container">
      <div className="page-header">
        <div>
          <h1>Your reports</h1>
          <p className="text-muted">
            {reports.length === 0
              ? 'Upload your first report to get started.'
              : `${reports.length} ${reports.length === 1 ? 'report' : 'reports'} saved`}
          </p>
        </div>
        <Link to="/upload" className="btn btn-primary">
          + Upload
        </Link>
      </div>

      {apiError && (
        <div className="banner banner-warn">
          <div>
            <strong>Could not load your reports</strong>
            <p>{apiError}</p>
          </div>
          <div className="banner-actions">
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => void reload()}>
              Retry
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="loading-inline">Loading…</div>
      ) : (
        <>
          {trendCharts.length > 0 && (
            <section className="section">
              <h2>Trends</h2>
              <div className="trends-grid">
                {trendCharts.slice(0, 2).map((name) => (
                  <TrendChart key={name} canonicalName={name} data={trends[name]} />
                ))}
              </div>
            </section>
          )}

          <section className="section">
            {reports.length > 0 && <h2>Recent</h2>}
            <ReportList reports={reports} />
          </section>
        </>
      )}
    </div>
  );
}
