import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function LandingPage() {
  const { user } = useAuth();

  return (
    <div className="landing-page">
      <section className="hero">
        <h1>LabTrack</h1>
        <p className="tagline">Understand your lab reports. Track trends over time.</p>
        <div className="hero-actions">
          <Link to={user ? '/dashboard' : '/auth'} className="btn btn-primary">
            {user ? 'Go to dashboard' : 'Get started'}
          </Link>
        </div>
      </section>

      <section className="steps container">
        <div className="step">
          <span className="step-num">1</span>
          <div>
            <h3>Upload</h3>
            <p>Add a PDF or photo of your blood test results.</p>
          </div>
        </div>
        <div className="step">
          <span className="step-num">2</span>
          <div>
            <h3>Understand</h3>
            <p>See your values explained in plain language.</p>
          </div>
        </div>
        <div className="step">
          <span className="step-num">3</span>
          <div>
            <h3>Track</h3>
            <p>Compare results across reports on your dashboard.</p>
          </div>
        </div>
      </section>

      <p className="landing-disclaimer container">
        For education and personal records only — not medical advice. Always consult a
        licensed clinician about your health.
      </p>
    </div>
  );
}
