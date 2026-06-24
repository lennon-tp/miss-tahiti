'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Header() {
  const [prenom, setPrenom] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/me')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => { if (data?.prenom) setPrenom(data.prenom); })
      .catch(() => {});
  }, []);

  async function handleLogout() {
    await fetch('/api/logout', { method: 'POST' });
    setPrenom(null);
    router.push('/');
    router.refresh();
  }

  return (
    <header style={styles.header}>
      <div className="container" style={styles.inner}>
        <Link href="/" style={styles.logo}>
          <span style={{ color: '#C9A84C', fontSize: '1.5rem' }}>&#10022;</span>
          <span style={{ color: '#1A0A2E', fontWeight: 700 }}>Miss</span>
          <span style={{ color: '#C9A84C', fontWeight: 700 }}> Tahiti</span>
          <span style={{ color: '#888888', fontSize: '1rem' }}> 2026</span>
        </Link>

        <nav style={styles.nav}>
          <Link href="/" style={styles.navLink}>Candidates</Link>
          <Link href="/resultats" style={styles.navLink}>Résultats</Link>
          <Link href="/votes" style={styles.navLink}>Votes</Link>

          {prenom ? (
            <div style={styles.userZone}>
              <span style={{ color: '#C9A84C', fontSize: '0.9rem', fontStyle: 'italic' }}>
                Bonjour, {prenom}
              </span>
              <button className="btn-secondary" onClick={handleLogout}
                style={{ fontSize: '0.85rem', padding: '0.5rem 1.25rem' }}>
                Déconnexion
              </button>
            </div>
          ) : (
            <div style={styles.authLinks}>
              <Link href="/login" className="btn-secondary"
                style={{ fontSize: '0.85rem', padding: '0.5rem 1.25rem', display: 'inline-block' }}>
                Connexion
              </Link>
              <Link href="/register" className="btn-primary"
                style={{ fontSize: '0.85rem', padding: '0.5rem 1.25rem', display: 'inline-block' }}>
                Inscription
              </Link>
            </div>
          )}
        </nav>
      </div>
      <div style={styles.goldLine} />
    </header>
  );
}

const styles: Record<string, React.CSSProperties> = {
  header: {
    background:   '#FFFFFF',
    borderBottom: '1px solid rgba(201,168,76,0.3)',
    position:     'sticky',
    top:          0,
    zIndex:       100,
    boxShadow:    '0 2px 12px rgba(201,168,76,0.1)',
  },
  inner: {
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'space-between',
    padding:        '1rem 1.5rem',
  },
  logo: {
    display:       'flex',
    alignItems:    'center',
    gap:           '0.4rem',
    fontSize:      '1.3rem',
    letterSpacing: '0.02em',
    color:         '#1A0A2E',
  },
  nav: {
    display:    'flex',
    alignItems: 'center',
    gap:        '1.5rem',
  },
  navLink: {
    color:         '#888888',
    fontSize:      '0.95rem',
    letterSpacing: '0.04em',
  },
  userZone: {
    display:    'flex',
    alignItems: 'center',
    gap:        '1rem',
  },
  authLinks: {
    display:    'flex',
    alignItems: 'center',
    gap:        '0.75rem',
  },
  goldLine: {
    height:     '2px',
    background: 'linear-gradient(90deg, transparent, #C9A84C, transparent)',
  },
};