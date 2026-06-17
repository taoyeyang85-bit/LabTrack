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
      <div className="card empty-state">
        <p>No reports yet. Upload your first lab report to get started.</p>
        <Link to="/upload" className="btn btn-primary">
          Upload report
        </Link>
      </div>
    );
  }

  return (
    <div className="report-list">
      {reports.map((report) => (
        <Link key={report.id} to={`/reports/${report.id}`} className="card report-card">
          <div className="report-card-header">
            <strong>{report.original_filename}</strong>
            <span className="text-muted">{formatDate(report)}</span>
          </div>
          <div className="report-card-meta">
            <span>{report.biomarkers.length} biomarkers</span>
            <span>
              {report.biomarkers.filter((b) => b.needs_review).length} need review
            </span>
            <span className="badge badge-neutral">{report.extraction_method}</span>
          </div>
        </Link>
      ))}
    </div>
  );
}
