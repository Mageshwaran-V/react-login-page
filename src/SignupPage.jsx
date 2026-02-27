import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register, login, getSession, isEmailTaken } from './auth';

// ── Validation rules ──────────────────────────────────────────────────────────
const EMAIL_RE    = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NAME_RE     = /^[a-zA-Z '-]{2,50}$/;
const UPPER_RE    = /[A-Z]/;
const LOWER_RE    = /[a-z]/;
const NUMBER_RE   = /[0-9]/;
const SPECIAL_RE  = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/;

function validateField(name, value, allValues) {
  switch (name) {
    case 'firstName':
      if (!value.trim())           return 'First name is required.';
      if (!NAME_RE.test(value))    return 'Only letters, spaces, hyphens and apostrophes allowed.';
      if (value.trim().length < 2) return 'Must be at least 2 characters.';
      return '';

    case 'lastName':
      if (!value.trim())           return 'Last name is required.';
      if (!NAME_RE.test(value))    return 'Only letters, spaces, hyphens and apostrophes allowed.';
      if (value.trim().length < 2) return 'Must be at least 2 characters.';
      return '';

    case 'email':
      if (!value.trim())                return 'Email address is required.';
      if (!EMAIL_RE.test(value))        return 'Enter a valid email address.';
      if (isEmailTaken(value.trim()))   return 'This email is already registered. Sign in instead.';
      return '';

    case 'password':
      if (!value)                       return 'Password is required.';
      if (value.length < 8)             return 'Must be at least 8 characters.';
      if (!UPPER_RE.test(value))        return 'Must include at least one uppercase letter.';
      if (!LOWER_RE.test(value))        return 'Must include at least one lowercase letter.';
      if (!NUMBER_RE.test(value))       return 'Must include at least one number.';
      if (!SPECIAL_RE.test(value))      return 'Must include at least one special character (!@#$…).';
      return '';

    case 'confirmPassword':
      if (!value)                       return 'Please confirm your password.';
      if (value !== allValues.password) return 'Passwords do not match.';
      return '';

    case 'terms':
      if (!value) return 'You must accept the terms to continue.';
      return '';

    default: return '';
  }
}

function validateAll(values) {
  const errors = {};
  Object.keys(values).forEach((key) => {
    const msg = validateField(key, values[key], values);
    if (msg) errors[key] = msg;
  });
  return errors;
}

// ── Password strength ─────────────────────────────────────────────────────────
function passwordStrength(pw) {
  if (!pw) return { score: 0, label: '', color: '' };
  let score = 0;
  if (pw.length >= 8)           score++;
  if (pw.length >= 12)          score++;
  if (UPPER_RE.test(pw))        score++;
  if (LOWER_RE.test(pw))        score++;
  if (NUMBER_RE.test(pw))       score++;
  if (SPECIAL_RE.test(pw))      score++;

  if (score <= 2) return { score, label: 'Weak',   color: '#ef4444' };
  if (score <= 3) return { score, label: 'Fair',   color: '#f97316' };
  if (score <= 4) return { score, label: 'Good',   color: '#eab308' };
  return             { score, label: 'Strong', color: '#22c55e' };
}

// ── Component ─────────────────────────────────────────────────────────────────
const INIT = { firstName: '', lastName: '', email: '', password: '', confirmPassword: '', terms: false };

export default function SignupPage() {
  const [values,   setValues]   = useState(INIT);
  const [errors,   setErrors]   = useState({});
  const [touched,  setTouched]  = useState({});
  const [showPw,   setShowPw]   = useState(false);
  const [showCPw,  setShowCPw]  = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [submitted, setSubmitted] = useState(false); // did user try to submit?
  const navigate = useNavigate();

  // Redirect if already signed in
  useEffect(() => {
    if (getSession()) navigate('/dashboard', { replace: true });
  }, [navigate]);

  // Re-validate changed fields live after first submit attempt
  useEffect(() => {
    if (!submitted) return;
    const errs = validateAll(values);
    setErrors(errs);
  }, [values, submitted]);

  const strength = passwordStrength(values.password);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setValues((p) => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
  }

  function handleBlur(e) {
    const { name, value, type, checked } = e.target;
    const fieldVal = type === 'checkbox' ? checked : value;
    setTouched((p) => ({ ...p, [name]: true }));
    const msg = validateField(name, fieldVal, values);
    setErrors((p) => ({ ...p, [name]: msg }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitted(true);
    const errs = validateAll(values);
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setLoading(true);
    await new Promise((r) => setTimeout(r, 800)); // simulate network

    const result = register({
      firstName: values.firstName.trim(),
      lastName:  values.lastName.trim(),
      email:     values.email.trim(),
      password:  values.password,
    });

    if (result.error === 'email_taken') {
      setErrors((p) => ({ ...p, email: 'This email is already registered. Sign in instead.' }));
      setLoading(false);
      return;
    }

    // Auto-login the new user and go to dashboard
    login(values.email.trim(), values.password);
    navigate('/dashboard');
  }

  // Helper: show error only if field is touched or form was submitted
  function fieldErr(name) {
    return (touched[name] || submitted) ? errors[name] : '';
  }

  function inputClass(name) {
    const err = fieldErr(name);
    const ok  = (touched[name] || submitted) && !errors[name] && values[name];
    if (err) return 'err';
    if (ok)  return 'ok';
    return '';
  }

  return (
    <div className="split-layout">
      {/* ── Left brand panel ── */}
      <aside className="brand-panel">
        <div className="brand-inner">
          <div className="brand-logo">
            <span className="brand-icon">⬡</span>
            <span className="brand-name">Nexus</span>
          </div>
          <h2 className="brand-headline">Join thousands of teams already using Nexus.</h2>
          <ul className="brand-features">
            {[
              ['✅', 'Free 14-day trial, no credit card'],
              ['🔒', 'SOC 2 Type II certified'],
              ['⚡', 'Setup in under 2 minutes'],
              ['🌍', 'Used in 80+ countries'],
            ].map(([icon, text]) => (
              <li key={text}>
                <span className="feat-icon">{icon}</span>
                <span>{text}</span>
              </li>
            ))}
          </ul>
          <div className="brand-quote">
            <p>"We went from chaos to clarity in a single afternoon."</p>
            <cite>— James T., CTO at Verveflow</cite>
          </div>
        </div>
        <div className="brand-orb orb1" />
        <div className="brand-orb orb2" />
      </aside>

      {/* ── Right form panel ── */}
      <main className="form-panel">
        <div className="form-inner">
          <div className="form-header">
            <h1>Create your account</h1>
            <p>Start your free trial — no credit card required</p>
          </div>

          <form onSubmit={handleSubmit} noValidate>

            {/* Name row */}
            <div className="field-row">
              <div className="field">
                <label htmlFor="firstName">
                  First name
                  {fieldErr('firstName')
                    ? <span className="lbl-err"> ✕</span>
                    : (touched.firstName && !errors.firstName && values.firstName)
                      ? <span className="lbl-ok"> ✓</span>
                      : null}
                </label>
                <input
                  id="firstName" name="firstName" type="text"
                  placeholder="Jane"
                  value={values.firstName}
                  autoComplete="given-name"
                  autoFocus
                  className={inputClass('firstName')}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                {fieldErr('firstName') && <span className="field-err">{fieldErr('firstName')}</span>}
              </div>

              <div className="field">
                <label htmlFor="lastName">
                  Last name
                  {fieldErr('lastName')
                    ? <span className="lbl-err"> ✕</span>
                    : (touched.lastName && !errors.lastName && values.lastName)
                      ? <span className="lbl-ok"> ✓</span>
                      : null}
                </label>
                <input
                  id="lastName" name="lastName" type="text"
                  placeholder="Smith"
                  value={values.lastName}
                  autoComplete="family-name"
                  className={inputClass('lastName')}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                {fieldErr('lastName') && <span className="field-err">{fieldErr('lastName')}</span>}
              </div>
            </div>

            {/* Email */}
            <div className="field">
              <label htmlFor="email">
                Work email
                {fieldErr('email')
                  ? <span className="lbl-err"> ✕</span>
                  : (touched.email && !errors.email && values.email)
                    ? <span className="lbl-ok"> ✓</span>
                    : null}
              </label>
              <input
                id="email" name="email" type="email"
                placeholder="jane@company.com"
                value={values.email}
                autoComplete="email"
                className={inputClass('email')}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              {fieldErr('email') && <span className="field-err">{fieldErr('email')}</span>}
            </div>

            {/* Password */}
            <div className="field">
              <label htmlFor="password">Password</label>
              <div className="pw-wrap">
                <input
                  id="password" name="password"
                  type={showPw ? 'text' : 'password'}
                  placeholder="Min. 8 characters"
                  value={values.password}
                  autoComplete="new-password"
                  className={inputClass('password')}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                <button type="button" className="pw-toggle"
                  onClick={() => setShowPw((v) => !v)}
                  aria-label={showPw ? 'Hide password' : 'Show password'}>
                  {showPw ? '🙈' : '👁️'}
                </button>
              </div>

              {/* Strength meter — shown as soon as user types */}
              {values.password && (
                <div className="strength-wrap">
                  <div className="strength-bar">
                    {[1,2,3,4].map((seg) => (
                      <div
                        key={seg}
                        className="strength-seg"
                        style={{
                          background: strength.score >= seg * 1.5
                            ? strength.color
                            : 'var(--border)',
                        }}
                      />
                    ))}
                  </div>
                  <span className="strength-label" style={{ color: strength.color }}>
                    {strength.label}
                  </span>
                </div>
              )}

              {/* Rule checklist */}
              {(touched.password || submitted) && (
                <ul className="pw-rules">
                  {[
                    [/.{8,}/,          'At least 8 characters'],
                    [UPPER_RE,         'One uppercase letter'],
                    [LOWER_RE,         'One lowercase letter'],
                    [NUMBER_RE,        'One number'],
                    [SPECIAL_RE,       'One special character'],
                  ].map(([re, label]) => {
                    const pass = re.test(values.password);
                    return (
                      <li key={label} className={pass ? 'rule-ok' : 'rule-fail'}>
                        {pass ? '✓' : '✕'} {label}
                      </li>
                    );
                  })}
                </ul>
              )}

              {fieldErr('password') && !touched.password && submitted &&
                <span className="field-err">{fieldErr('password')}</span>}
            </div>

            {/* Confirm password */}
            <div className="field">
              <label htmlFor="confirmPassword">
                Confirm password
                {fieldErr('confirmPassword')
                  ? <span className="lbl-err"> ✕</span>
                  : (touched.confirmPassword && !errors.confirmPassword && values.confirmPassword)
                    ? <span className="lbl-ok"> ✓</span>
                    : null}
              </label>
              <div className="pw-wrap">
                <input
                  id="confirmPassword" name="confirmPassword"
                  type={showCPw ? 'text' : 'password'}
                  placeholder="Repeat your password"
                  value={values.confirmPassword}
                  autoComplete="new-password"
                  className={inputClass('confirmPassword')}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                <button type="button" className="pw-toggle"
                  onClick={() => setShowCPw((v) => !v)}
                  aria-label={showCPw ? 'Hide' : 'Show'}>
                  {showCPw ? '🙈' : '👁️'}
                </button>
              </div>
              {fieldErr('confirmPassword') &&
                <span className="field-err">{fieldErr('confirmPassword')}</span>}
            </div>

            {/* Terms */}
            <label className={`terms-row ${fieldErr('terms') ? 'terms-err' : ''}`}>
              <input
                type="checkbox" name="terms"
                checked={values.terms}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              <span>
                I agree to the{' '}
                <a href="#terms" onClick={(e) => e.stopPropagation()}>Terms of Service</a>
                {' '}and{' '}
                <a href="#privacy" onClick={(e) => e.stopPropagation()}>Privacy Policy</a>
              </span>
            </label>
            {fieldErr('terms') && <span className="field-err" style={{marginTop:'-10px', display:'block'}}>{fieldErr('terms')}</span>}

            {/* Submit */}
            <button type="submit" className="btn-signin" disabled={loading} style={{marginTop:'20px'}}>
              {loading
                ? <><span className="spinner" /> Creating account…</>
                : 'Create Account'}
            </button>
          </form>

          <p className="signup-hint" style={{ marginTop: '20px' }}>
            Already have an account?{' '}
            <Link to="/">Sign in</Link>
          </p>
        </div>
      </main>
    </div>
  );
}
