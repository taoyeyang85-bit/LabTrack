import type { Report, TrendsResponse } from '../types';

export function computeTrendsFromReports(
  reports: Report[]
): TrendsResponse['trends'] {
  const trends: TrendsResponse['trends'] = {};

  for (const report of [...reports].reverse()) {
    const date = report.report_date || report.uploaded_at.slice(0, 10);
    for (const biomarker of report.biomarkers) {
      if (biomarker.value == null) continue;
      trends[biomarker.canonical_name] ??= [];
      trends[biomarker.canonical_name].push({
        report_id: report.id,
        report_date: date,
        value: biomarker.value,
        unit: biomarker.unit,
      });
    }
  }

  for (const key of Object.keys(trends)) {
    trends[key].sort((a, b) => a.report_date.localeCompare(b.report_date));
  }

  return trends;
}
