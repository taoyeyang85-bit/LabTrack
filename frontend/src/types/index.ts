export type BiomarkerStatus = 'low' | 'normal' | 'high' | 'unknown';
export type ExtractionMethod = 'pdf_text' | 'ocr' | 'mixed';

export type Biomarker = {
  canonical_name: string;
  display_name: string;
  value: number | null;
  raw_value: string;
  unit: string | null;
  reference_low: number | null;
  reference_high: number | null;
  raw_reference_range: string | null;
  status: BiomarkerStatus;
  source_snippet: string | null;
  needs_review: boolean;
};

export type Explanation = {
  biomarker: string;
  status: BiomarkerStatus;
  message: string;
  trend_message?: string;
};

export type Report = {
  id: string;
  uid: string;
  original_filename: string;
  uploaded_at: string;
  report_date: string | null;
  extraction_method: ExtractionMethod;
  raw_text_preview: string;
  biomarkers: Biomarker[];
  explanations: Explanation[];
  doctor_questions: string[];
  warnings: string[];
  parser_confidence: number;
};

export type TrendPoint = {
  report_id: string;
  report_date: string;
  value: number;
  unit: string | null;
};

export type TrendsResponse = {
  trends: Record<string, TrendPoint[]>;
};

export const DISPLAY_NAMES: Record<string, string> = {
  glucose: 'Glucose',
  hemoglobin_a1c: 'Hemoglobin A1c',
  total_cholesterol: 'Total Cholesterol',
  hdl_cholesterol: 'HDL Cholesterol',
  ldl_cholesterol: 'LDL Cholesterol',
  triglycerides: 'Triglycerides',
  vitamin_d: 'Vitamin D',
  wbc: 'WBC',
  rbc: 'RBC',
  hemoglobin: 'Hemoglobin',
  hematocrit: 'Hematocrit',
  platelets: 'Platelets',
  sodium: 'Sodium',
  potassium: 'Potassium',
  calcium: 'Calcium',
  creatinine: 'Creatinine',
  bun: 'BUN',
  alt: 'ALT',
  ast: 'AST',
  tsh: 'TSH',
};

export const TREND_BIOMARKERS = [
  'glucose',
  'ldl_cholesterol',
  'hdl_cholesterol',
  'total_cholesterol',
  'triglycerides',
  'vitamin_d',
  'hemoglobin_a1c',
];
