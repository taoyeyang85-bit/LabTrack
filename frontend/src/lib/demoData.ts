import type { Report, TrendsResponse } from '../types';

export const DEMO_REPORTS: Report[] = [
  {
    id: 'demo-report-1',
    uid: 'demo',
    original_filename: 'Annual_Checkup_Jan2024.pdf',
    uploaded_at: '2024-01-20T10:00:00Z',
    report_date: '2024-01-15',
    extraction_method: 'pdf_text',
    raw_text_preview: 'Glucose 95 mg/dL ... LDL Cholesterol 118 mg/dL ...',
    parser_confidence: 0.92,
    warnings: [
      'Reference ranges vary by lab. Always verify values against your original report.',
    ],
    doctor_questions: [
      'Should I repeat any of these tests?',
      'Are any of these values concerning given my age and medical history?',
      'Which values should I monitor over time?',
      'Could diet or exercise changes affect these results?',
      'When should I schedule my next lab test?',
    ],
    biomarkers: [
      {
        canonical_name: 'glucose',
        display_name: 'Glucose',
        value: 95,
        raw_value: '95',
        unit: 'mg/dL',
        reference_low: 70,
        reference_high: 99,
        raw_reference_range: '70-99',
        status: 'normal',
        source_snippet: 'Glucose 95 mg/dL',
        needs_review: false,
      },
      {
        canonical_name: 'ldl_cholesterol',
        display_name: 'LDL Cholesterol',
        value: 118,
        raw_value: '118',
        unit: 'mg/dL',
        reference_low: null,
        reference_high: 100,
        raw_reference_range: '<100',
        status: 'high',
        source_snippet: 'LDL Cholesterol 118 mg/dL',
        needs_review: false,
      },
      {
        canonical_name: 'hdl_cholesterol',
        display_name: 'HDL Cholesterol',
        value: 52,
        raw_value: '52',
        unit: 'mg/dL',
        reference_low: 40,
        reference_high: null,
        raw_reference_range: '>40',
        status: 'normal',
        source_snippet: 'HDL Cholesterol 52 mg/dL',
        needs_review: false,
      },
      {
        canonical_name: 'hemoglobin_a1c',
        display_name: 'Hemoglobin A1c',
        value: 5.4,
        raw_value: '5.4',
        unit: '%',
        reference_low: 4.0,
        reference_high: 5.6,
        raw_reference_range: '4.0-5.6',
        status: 'normal',
        source_snippet: 'Hemoglobin A1c 5.4%',
        needs_review: false,
      },
    ],
    explanations: [
      {
        biomarker: 'Glucose',
        status: 'normal',
        message:
          'Your glucose is within the reference range shown on your report. This does not diagnose a condition, but it may be worth discussing with a licensed clinician.',
      },
      {
        biomarker: 'LDL Cholesterol',
        status: 'high',
        message:
          'Your LDL cholesterol is above the reference range shown on your report. LDL is often discussed with a clinician because it can relate to cardiovascular risk, but this result alone does not diagnose a condition.',
      },
      {
        biomarker: 'HDL Cholesterol',
        status: 'normal',
        message:
          'Your HDL cholesterol is within the reference range shown on your report. Discuss what this means for you with a licensed clinician.',
      },
      {
        biomarker: 'Hemoglobin A1c',
        status: 'normal',
        message:
          'Your Hemoglobin A1c is within the reference range shown on your report. This reflects average blood sugar over recent months.',
      },
    ],
  },
  {
    id: 'demo-report-2',
    uid: 'demo',
    original_filename: 'Followup_Labs_Jun2024.pdf',
    uploaded_at: '2024-06-22T14:30:00Z',
    report_date: '2024-06-20',
    extraction_method: 'pdf_text',
    raw_text_preview: 'Glucose 102 mg/dL ... LDL Cholesterol 105 mg/dL ...',
    parser_confidence: 0.89,
    warnings: [
      'Reference ranges vary by lab. Always verify values against your original report.',
    ],
    doctor_questions: [
      'Has my LDL improved enough since my last test?',
      'Should I adjust diet or exercise based on these trends?',
      'Do any values need a repeat test?',
      'Are there risk factors I should discuss given my history?',
      'When should I recheck these labs?',
    ],
    biomarkers: [
      {
        canonical_name: 'glucose',
        display_name: 'Glucose',
        value: 102,
        raw_value: '102',
        unit: 'mg/dL',
        reference_low: 70,
        reference_high: 99,
        raw_reference_range: '70-99',
        status: 'high',
        source_snippet: 'Glucose 102 mg/dL',
        needs_review: false,
      },
      {
        canonical_name: 'ldl_cholesterol',
        display_name: 'LDL Cholesterol',
        value: 105,
        raw_value: '105',
        unit: 'mg/dL',
        reference_low: null,
        reference_high: 100,
        raw_reference_range: '<100',
        status: 'high',
        source_snippet: 'LDL Cholesterol 105 mg/dL',
        needs_review: false,
      },
      {
        canonical_name: 'hdl_cholesterol',
        display_name: 'HDL Cholesterol',
        value: 55,
        raw_value: '55',
        unit: 'mg/dL',
        reference_low: 40,
        reference_high: null,
        raw_reference_range: '>40',
        status: 'normal',
        source_snippet: 'HDL Cholesterol 55 mg/dL',
        needs_review: false,
      },
      {
        canonical_name: 'vitamin_d',
        display_name: 'Vitamin D',
        value: 28,
        raw_value: '28',
        unit: 'ng/mL',
        reference_low: 30,
        reference_high: 100,
        raw_reference_range: '30-100',
        status: 'low',
        source_snippet: 'Vitamin D 28 ng/mL',
        needs_review: false,
      },
      {
        canonical_name: 'hemoglobin_a1c',
        display_name: 'Hemoglobin A1c',
        value: 5.5,
        raw_value: '5.5',
        unit: '%',
        reference_low: 4.0,
        reference_high: 5.6,
        raw_reference_range: '4.0-5.6',
        status: 'normal',
        source_snippet: 'Hemoglobin A1c 5.5%',
        needs_review: false,
      },
    ],
    explanations: [
      {
        biomarker: 'Glucose',
        status: 'high',
        message:
          'Your glucose is above the reference range shown on your report. A single result does not diagnose diabetes; discuss with a licensed clinician.',
        trend_message: 'Glucose increased from 95 to 102 since your January report.',
      },
      {
        biomarker: 'LDL Cholesterol',
        status: 'high',
        message:
          'Your LDL cholesterol is above the reference range shown on your report, though it has improved since your last test.',
        trend_message: 'LDL Cholesterol decreased from 118 to 105 since your January report.',
      },
      {
        biomarker: 'Vitamin D',
        status: 'low',
        message:
          'Your Vitamin D is below the reference range shown on your report. Many people discuss supplementation with a clinician.',
      },
      {
        biomarker: 'Hemoglobin A1c',
        status: 'normal',
        message:
          'Your Hemoglobin A1c remains within the reference range shown on your report.',
        trend_message: 'Hemoglobin A1c changed slightly from 5.4% to 5.5%.',
      },
    ],
  },
];

export function findDemoReport(reportId: string): Report | undefined {
  return DEMO_REPORTS.find((report) => report.id === reportId);
}

export function isDemoModeEnabled(): boolean {
  return import.meta.env.VITE_DEMO_MODE === 'true';
}

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
