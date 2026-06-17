import type { Biomarker } from '../types';

type BiomarkerTableProps = {
  biomarkers: Biomarker[];
};

function formatRange(b: Biomarker): string {
  if (b.raw_reference_range) return b.raw_reference_range;
  if (b.reference_low != null && b.reference_high != null) {
    return `${b.reference_low}–${b.reference_high}`;
  }
  if (b.reference_high != null) return `<${b.reference_high}`;
  if (b.reference_low != null) return `>${b.reference_low}`;
  return '—';
}

function StatusBadge({ status }: { status: Biomarker['status'] }) {
  return <span className={`badge badge-${status}`}>{status}</span>;
}

export default function BiomarkerTable({ biomarkers }: BiomarkerTableProps) {
  if (biomarkers.length === 0) {
    return (
      <div className="card">
        <p>No biomarkers were extracted from this report.</p>
      </div>
    );
  }

  return (
    <div className="card table-wrapper">
      <table className="biomarker-table">
        <thead>
          <tr>
            <th>Biomarker</th>
            <th>Value</th>
            <th>Unit</th>
            <th>Reference Range</th>
            <th>Status</th>
            <th>Needs Review</th>
          </tr>
        </thead>
        <tbody>
          {biomarkers.map((b) => (
            <tr key={b.canonical_name}>
              <td>{b.display_name}</td>
              <td>{b.value ?? b.raw_value}</td>
              <td>{b.unit ?? '—'}</td>
              <td>{formatRange(b)}</td>
              <td>
                <StatusBadge status={b.status} />
              </td>
              <td>{b.needs_review ? 'Yes' : 'No'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
