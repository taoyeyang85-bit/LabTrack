import { Link } from 'react-router-dom';
import DisclaimerBanner from '../components/DisclaimerBanner';

export default function LandingPage() {
  return (
    <div className="landing-page">
      <section className="hero">
        <h1>LabTrack</h1>
        <p className="tagline">Understand your lab reports. Track your health trends.</p>
        <p className="hero-description">
          Upload blood test PDFs or screenshots. LabTrack extracts common lab values, explains
          them in simple language, and helps you track changes over time — for education and
          personal organization, not diagnosis.
        </p>
        <div className="hero-actions">
          <Link to="/auth" className="btn btn-primary">
            Get started
          </Link>
          <Link to="/auth" className="btn btn-secondary">
            Sign in
          </Link>
        </div>
      </section>

      <section className="features container">
        <div className="feature-card card">
          <h3>Upload & parse</h3>
          <p>
            Upload PDFs or photos of lab reports. We extract glucose, cholesterol, vitamins,
            CBC values, and more.
          </p>
        </div>
        <div className="feature-card card">
          <h3>Plain-language explanations</h3>
          <p>
            Each value is explained based on the reference range on your report, with reminders
            to discuss results with your clinician.
          </p>
        </div>
        <div className="feature-card card">
          <h3>Track trends</h3>
          <p>
            Compare results across reports and see how biomarkers change over time with simple
            charts.
          </p>
        </div>
        <div className="feature-card card">
          <h3>Questions for your doctor</h3>
          <p>
            Get suggested questions to bring to your next appointment based on your extracted
            values.
          </p>
        </div>
      </section>

      <DisclaimerBanner />
    </div>
  );
}
