import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/Button';
import { Loading } from '../../components/Loading';

export function Login() {
  const { user, signIn, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const from =
    (location.state as { from?: Location })?.from?.pathname ?? '/admin';

  useEffect(() => {
    if (user) navigate(from, { replace: true });
  }, [user, navigate, from]);

  if (loading) return <Loading fullscreen />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await signIn(email, password);
    } catch {
      setError('E-mail ou senha incorretos. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-card__header">
          <span className="login-card__icon" aria-hidden="true">♥</span>
          <h1 className="login-card__title">Área Administrativa</h1>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          {error && (
            <p className="form-error form-error--block" role="alert">
              {error}
            </p>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="login-email">E-mail</label>
            <input
              id="login-email"
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              disabled={submitting}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="login-password">Senha</label>
            <input
              id="login-password"
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              disabled={submitting}
              required
            />
          </div>

          <Button
            type="submit"
            loading={submitting}
            style={{ width: '100%', marginTop: '0.5rem' }}
          >
            Entrar
          </Button>
        </form>

        <p className="login-card__back">
          <a href="/">← Ver lista de presentes</a>
        </p>
      </div>
    </div>
  );
}
