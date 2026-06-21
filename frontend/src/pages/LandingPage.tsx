import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function LandingPage() {
  const { user } = useAuth();

  return (
    <div className="landing-page">
      <section className="hero">
        <span className="eyebrow">Personal health records</span>
        <h1>Your lab results,<br />made clear.</h1>
        <p className="tagline">
          Upload reports, understand the numbers, and follow what changes over time.
        </p>
        <div className="hero-actions">
          <Link to={user ? '/dashboard' : '/auth'} className="btn btn-primary">
            {user ? 'Open dashboard' : 'Get started'}
          </Link>
        </div>
        <p className="hero-note">Private by default. Not a substitute for medical advice.</p>
      </section>
    </div>
  );
}
