import type { Explanation } from '../types';

type ExplanationCardProps = {
  explanation: Explanation;
};

export default function ExplanationCard({ explanation }: ExplanationCardProps) {
  return (
    <div className="card explanation-card">
      <div className="explanation-header">
        <h3>{explanation.biomarker}</h3>
        <span className={`badge badge-${explanation.status}`}>{explanation.status}</span>
      </div>
      <p>{explanation.message}</p>
      {explanation.trend_message && (
        <p className="trend-message">{explanation.trend_message}</p>
      )}
    </div>
  );
}
