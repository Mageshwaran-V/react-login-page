import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, getSession } from './auth';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(email, password) {
  const e = {};
  if (!email)                  e.email    = 'Email is required.';
  else if (!EMAIL_RE.test(email)) e.email = 'Enter a valid email address.';
  if (!password)               e.password = 'Password is required.';
  else if (password.length < 6) e.password = 'Password must be at least 6 characters.';
  return e;
}

// ── Demo credential chips ─────────────────────────────────────────────────────
const DEMO_ACCOUNTS = [
  { label: 'Admin',  email: 'admin@example.com', password: 'Admin@123'  },
  { label: 'User',   email: 'user@example.com',  password: 'User@1234'  },
  { label: 'Guest',  email: 'demo@example.com',  password: 'Demo@1234'  },
];

export default function LoginPage() {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [show,     setShow]     = useState(false);
  const [errors,   setErrors]   = useState({});
  const [authErr,  setAuthErr]  = useState('');
  const [loading,  setLoading]  = useState(false);
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (getSession()) navigate('/dashboard', { replace: true });
  }, [navigate]);

  function clearFieldError(field) {
    if (errors[field]) setErrors((p) => ({ ...p, [field]: undefined }));
  }

  function handleBlur(field) {
    const fe = validate(email, password);
    if (fe[field]) setErrors((p) => ({ ...p, [field]: fe[field] }));
  }

  function fillDemo(account) {
    setEmail(account.email);
    setPassword(account.password);
    setErrors({});
    setAuthErr('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setAuthErr('');
    const fe = validate(email, password);
    if (Object.keys(fe).length) { setErrors(fe); return; }

    setLoading(true);
    // Simulate network latency (replace with real fetch in production)
    await new Promise((r) => setTimeout(r, 900));

    const session = login(email, password, remember);
    setLoading(false);

    if (!session) {
      setAuthErr('Incorrect email or password. Try a demo account below.');
      return;
    }
    navigate('/dashboard');
  }

  return (
    <div className="split-layout">
      {/* ── Left panel: branding ── */}
      <aside className="brand-panel">
        <div className="brand-inner">
          <div className="brand-logo">
            <span className="brand-icon">⬡</span>
            <span className="brand-name">Nexus</span>
          </div>
          <h2 className="brand-headline">
            Everything your team needs, in one place.
          </h2>
          <ul className="brand-features">
            {[
              ['🔒', 'Enterprise-grade security'],
              ['⚡', 'Real-time collaboration'],
              ['📊', 'Advanced analytics'],
              ['🌍', 'Available in 40+ languages'],
            ].map(([icon, text]) => (
              <li key={text}>
                <span className="feat-icon">{icon}</span>
                <span>{text}</span>
              </li>
            ))}
          </ul>
          <div className="brand-quote">
            <p>"Nexus cut our onboarding time by 60%."</p>
            <cite>— Sarah K., Head of Engineering</cite>
          </div>
        </div>
        <div className="brand-orb orb1" />
        <div className="brand-orb orb2" />
      </aside>

      {/* ── Right panel: form ── */}
      <main className="form-panel">
        <div className="form-inner">
          <div className="form-header">
            <h1>Welcome back</h1>
            <p>Sign in to your Nexus account</p>
          </div>

          {/* Auth error */}
          {authErr && (
            <div className="alert alert-error" role="alert">
              <span>⚠</span> {authErr}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {/* Email */}
            <div className="field">
              <label htmlFor="email">Email address</label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                autoComplete="email"
                autoFocus
                onChange={(e) => { setEmail(e.target.value); clearFieldError('email'); setAuthErr(''); }}
                onBlur={() => handleBlur('email')}
                className={errors.email ? 'err' : ''}
                aria-describedby={errors.email ? 'email-err' : undefined}
              />
              {errors.email && <span id="email-err" className="field-err">{errors.email}</span>}
            </div>

            {/* Password */}
            <div className="field">
              <div className="label-row">
                <label htmlFor="password">Password</label>
                <a href="#forgot" className="forgot-link">Forgot password?</a>
              </div>
              <div className="pw-wrap">
                <input
                  id="password"
                  type={show ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  autoComplete="current-password"
                  onChange={(e) => { setPassword(e.target.value); clearFieldError('password'); setAuthErr(''); }}
                  onBlur={() => handleBlur('password')}
                  className={errors.password ? 'err' : ''}
                  aria-describedby={errors.password ? 'pw-err' : undefined}
                />
                <button
                  type="button"
                  className="pw-toggle"
                  onClick={() => setShow((v) => !v)}
                  aria-label={show ? 'Hide password' : 'Show password'}
                >
                  {show ? '🙈' : '👁️'}
                </button>
              </div>
              {errors.password && <span id="pw-err" className="field-err">{errors.password}</span>}
            </div>

            {/* Remember me */}
            <label className="remember-row">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              <span>Keep me signed in</span>
            </label>

            {/* Submit */}
            <button type="submit" className="btn-signin" disabled={loading}>
              {loading
                ? <><span className="spinner" /> Signing in…</>
                : 'Sign In'}
            </button>
          </form>

          {/* Divider */}
          <div className="divider"><span>or try a demo account</span></div>

          {/* Demo chips */}
          <div className="demo-chips">
            {DEMO_ACCOUNTS.map((a) => (
              <button
                key={a.label}
                type="button"
                className="chip"
                onClick={() => fillDemo(a)}
              >
                {a.label}
              </button>
            ))}
          </div>

          <p className="signup-hint">
            Don&apos;t have an account?{' '}
            <a href="#signup">Create one for free</a>
          </p>
        </div>
      </main>
    </div>
  );
}
