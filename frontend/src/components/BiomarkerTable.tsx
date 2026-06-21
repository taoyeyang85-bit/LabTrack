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
      <div className="card empty-state compact">
        <p>No values were found in this report.</p>
      </div>
    );
  }

  return (
    <div className="card table-wrapper">
      <table className="biomarker-table">
        <thead>
          <tr>
            <th>Test</th>
            <th>Value</th>
            <th>Range</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {biomarkers.map((b) => (
            <tr key={b.canonical_name}>
              <td>
                {b.display_name}
                {b.needs_review && <span className="review-dot" title="Needs review" />}
              </td>
              <td>
                {b.value ?? b.raw_value}
                {b.unit ? ` ${b.unit}` : ''}
              </td>
              <td>{formatRange(b)}</td>
              <td>
                <StatusBadge status={b.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
