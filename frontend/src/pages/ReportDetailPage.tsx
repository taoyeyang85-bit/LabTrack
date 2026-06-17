import { Link, useParams } from 'react-router-dom';
import BiomarkerTable from '../components/BiomarkerTable';
import DisclaimerBanner from '../components/DisclaimerBanner';
import ErrorState from '../components/ErrorState';
import ExplanationCard from '../components/ExplanationCard';
import LoadingState from '../components/LoadingState';
import { useReport } from '../hooks/useReports';

export default function ReportDetailPage() {
  const { reportId } = useParams<{ reportId: string }>();
  const { report, loading, error } = useReport(reportId);

  if (loading) return <LoadingState message="Loading report…" />;
  if (error) return <ErrorState message={error} />;
  if (!report) return <ErrorState message="Report not found." />;

  const displayDate =
    report.report_date || new Date(report.uploaded_at).toLocaleDateString();

  return (
    <div className="report-detail-page container">
      <div className="page-header">
        <div>
          <Link to="/dashboard" className="back-link">
            ← Back to dashboard
          </Link>
          <h1>{report.original_filename}</h1>
          <p className="text-muted">
            Report date: {displayDate} · Uploaded:{' '}
            {new Date(report.uploaded_at).toLocaleString()}
          </p>
        </div>
      </div>

      <div className="meta-grid">
        <div className="card meta-card">
          <span className="meta-label">Extraction method</span>
          <span>{report.extraction_method}</span>
        </div>
        <div className="card meta-card">
          <span className="meta-label">Parser confidence</span>
          <span>{Math.round(report.parser_confidence * 100)}%</span>
        </div>
        <div className="card meta-card">
          <span className="meta-label">Biomarkers found</span>
          <span>{report.biomarkers.length}</span>
        </div>
      </div>

      {report.warnings.length > 0 && (
        <div className="alert alert-warning">
          <strong>Notes</strong>
          <ul>
            {report.warnings.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      <section className="section">
        <h2>Biomarkers</h2>
        <BiomarkerTable biomarkers={report.biomarkers} />
      </section>

      <section className="section">
        <h2>Explanations</h2>
        <div className="explanations-grid">
          {report.explanations.map((exp) => (
            <ExplanationCard key={exp.biomarker} explanation={exp} />
          ))}
        </div>
      </section>

      {report.doctor_questions.length > 0 && (
        <section className="section">
          <h2>Questions to ask your doctor</h2>
          <div className="card">
            <ol className="doctor-questions">
              {report.doctor_questions.map((q) => (
                <li key={q}>{q}</li>
              ))}
            </ol>
          </div>
        </section>
      )}

      {report.biomarkers.some((b) => b.source_snippet) && (
        <section className="section">
          <h2>Source snippets</h2>
          <div className="snippets">
            {report.biomarkers
              .filter((b) => b.source_snippet)
              .map((b) => (
                <div key={b.canonical_name} className="card snippet-card">
                  <strong>{b.display_name}</strong>
                  <code>{b.source_snippet}</code>
                </div>
              ))}
          </div>
        </section>
      )}

      <section className="section">
        <h2>Text preview</h2>
        <div className="card text-preview">
          <pre>{report.raw_text_preview}</pre>
        </div>
      </section>

      <DisclaimerBanner />
    </div>
  );
}
