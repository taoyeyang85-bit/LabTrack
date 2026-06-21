import { Link, useParams } from 'react-router-dom';
import BiomarkerTable from '../components/BiomarkerTable';
import ExplanationCard from '../components/ExplanationCard';
import LoadingState from '../components/LoadingState';
import { useReport } from '../hooks/useReports';

export default function ReportDetailPage() {
  const { reportId } = useParams<{ reportId: string }>();
  const { report, loading, error, usingSample } = useReport(reportId);

  if (loading) return <LoadingState message="Loading report…" />;
  if (error) {
    return (
      <div className="container report-detail-page">
        <div className="card empty-state compact">
          <p>{error}</p>
          <Link to="/dashboard" className="btn btn-secondary btn-sm">
            Back to dashboard
          </Link>
        </div>
      </div>
    );
  }
  if (!report) {
    return (
      <div className="container report-detail-page">
        <div className="card empty-state compact">
          <p>Report not found.</p>
          <Link to="/dashboard" className="btn btn-secondary btn-sm">
            Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  const displayDate =
    report.report_date || new Date(report.uploaded_at).toLocaleDateString();

  return (
    <div className="report-detail-page container">
      <div className="page-header">
        <div>
          <Link to="/dashboard" className="back-link">
            ← Dashboard
          </Link>
          <h1>{report.original_filename}</h1>
          <p className="text-muted">{displayDate}</p>
        </div>
      </div>

      {usingSample && (
        <div className="banner banner-info">
          Sample report for preview purposes only.
        </div>
      )}

      {report.warnings.length > 0 && (
        <div className="banner banner-warn compact">
          {report.warnings[0]}
        </div>
      )}

      <section className="section">
        <h2>Results</h2>
        <BiomarkerTable biomarkers={report.biomarkers} />
      </section>

      {report.explanations.length > 0 && (
        <section className="section">
          <h2>What this means</h2>
          <div className="explanations-list">
            {report.explanations.map((exp) => (
              <ExplanationCard key={exp.biomarker} explanation={exp} />
            ))}
          </div>
        </section>
      )}

      {report.doctor_questions.length > 0 && (
        <section className="section">
          <h2>Ask your doctor</h2>
          <div className="card">
            <ol className="doctor-questions">
              {report.doctor_questions.map((q) => (
                <li key={q}>{q}</li>
              ))}
            </ol>
          </div>
        </section>
      )}
    </div>
  );
}
