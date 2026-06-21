import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthForm from '../components/AuthForm';
import LoadingState from '../components/LoadingState';
import { useAuth } from '../hooks/useAuth';

export default function AuthPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const { user, loading, login, signup } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  if (loading) return <LoadingState message="Checking session…" />;

  return (
    <div className="auth-page container">
      <div className="auth-header">
        <h1>{mode === 'login' ? 'Sign in' : 'Create account'}</h1>
        <p className="text-muted">Track your lab results securely.</p>
      </div>

      <div className="auth-tabs">
        <button
          type="button"
          className={mode === 'login' ? 'active' : ''}
          onClick={() => setMode('login')}
        >
          Sign in
        </button>
        <button
          type="button"
          className={mode === 'signup' ? 'active' : ''}
          onClick={() => setMode('signup')}
        >
          Sign up
        </button>
      </div>

      <AuthForm
        mode={mode}
        onSubmit={async (email, password) => {
          if (mode === 'login') {
            await login(email, password);
          } else {
            await signup(email, password);
          }
          navigate('/dashboard');
        }}
      />
    </div>
  );
}
