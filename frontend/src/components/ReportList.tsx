import { Link } from 'react-router-dom';
import type { Report } from '../types';

type ReportListProps = {
  reports: Report[];
};

function formatDate(report: Report): string {
  if (report.report_date) return report.report_date;
  return new Date(report.uploaded_at).toLocaleDateString();
}

export default function ReportList({ reports }: ReportListProps) {
  if (reports.length === 0) {
    return (
      <div className="card empty-state compact">
        <p>No reports yet.</p>
        <Link to="/upload" className="btn btn-primary btn-sm">
          Upload your first report
        </Link>
      </div>
    );
  }

  return (
    <div className="report-list">
      {reports.map((report) => (
        <Link key={report.id} to={`/reports/${report.id}`} className="report-row">
          <div>
            <strong>{report.original_filename}</strong>
            <span className="text-muted">
              {report.biomarkers.length} values
            </span>
          </div>
          <span className="report-date">{formatDate(report)}</span>
        </Link>
      ))}
    </div>
  );
}
