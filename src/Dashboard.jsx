import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSession, logout } from './auth';

const STATS = [
  { label: 'Projects',      value: '12',   icon: '📁', change: '+2 this month'  },
  { label: 'Team Members',  value: '8',    icon: '👥', change: '+1 this week'   },
  { label: 'Tasks Done',    value: '94',   icon: '✅', change: '+18 today'      },
  { label: 'Uptime',        value: '99.9%',icon: '📡', change: 'Last 30 days'   },
];

const ACTIVITY = [
  { user: 'Sarah K.',  action: 'deployed version 2.4.1',     time: '2 min ago',  dot: '#22c55e' },
  { user: 'Mike L.',   action: 'opened pull request #214',    time: '15 min ago', dot: '#6366f1' },
  { user: 'Priya R.',  action: 'closed 5 issues',             time: '1 hr ago',   dot: '#f59e0b' },
  { user: 'You',       action: 'signed in',                   time: 'just now',   dot: '#06b6d4' },
];

export default function Dashboard() {
  const [session, setSession] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const s = getSession();
    if (!s) { navigate('/', { replace: true }); return; }
    setSession(s);
  }, [navigate]);

  function handleLogout() {
    logout();
    navigate('/', { replace: true });
  }

  if (!session) return null;

  const loginDate = new Date(session.loginTime);

  return (
    <div className="db-root">
      {/* ── Top nav ── */}
      <nav className="db-nav">
        <div className="db-brand">
          <span className="brand-icon small">⬡</span> Nexus
        </div>
        <div className="db-nav-right">
          <span className="db-role-badge">{session.role}</span>
          <div className="db-avatar" title={session.name}>{session.avatar}</div>
          <span className="db-username">{session.name}</span>
          <button className="db-logout" onClick={handleLogout}>Sign out</button>
        </div>
      </nav>

      {/* ── Content ── */}
      <div className="db-content">
        {/* Hero */}
        <div className="db-hero">
          <div>
            <h1>Good {greeting()}, {session.name.split(' ')[0]}! 👋</h1>
            <p>
              Signed in as <strong>{session.email}</strong> ·{' '}
              {loginDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          <div className="db-hero-badges">
            <span className="hbadge green">✓ Authenticated</span>
            <span className="hbadge blue">🔐 Secure session</span>
          </div>
        </div>

        {/* Stats */}
        <div className="db-stats">
          {STATS.map((s) => (
            <div className="stat-card" key={s.label}>
              <div className="stat-icon">{s.icon}</div>
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
              <div className="stat-change">{s.change}</div>
            </div>
          ))}
        </div>

        {/* Lower grid */}
        <div className="db-grid">
          {/* Activity feed */}
          <div className="db-card">
            <h3>Recent Activity</h3>
            <ul className="activity-list">
              {ACTIVITY.map((a, i) => (
                <li key={i}>
                  <span className="act-dot" style={{ background: a.dot }} />
                  <div className="act-body">
                    <span className="act-user">{a.user}</span>{' '}
                    <span className="act-action">{a.action}</span>
                  </div>
                  <span className="act-time">{a.time}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Session info */}
          <div className="db-card">
            <h3>Session Details</h3>
            <table className="info-table">
              <tbody>
                <tr><td>Email</td><td>{session.email}</td></tr>
                <tr><td>Role</td><td>{session.role}</td></tr>
                <tr><td>Login time</td><td>{loginDate.toLocaleTimeString()}</td></tr>
                <tr><td>Login date</td><td>{loginDate.toLocaleDateString(undefined, { dateStyle: 'medium' })}</td></tr>
                <tr>
                  <td>Persistence</td>
                  <td>
                    {localStorage.getItem('__session__')
                      ? 'Remember me (localStorage)'
                      : 'Session only (sessionStorage)'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}
