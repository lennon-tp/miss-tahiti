'use client';

import { useState, FormEvent, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function LoginForm() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const redirect     = searchParams.get('redirect') || '/';

  const [prenom,   setPrenom]   = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const res  = await fetch('/api/login', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ prenom: prenom.trim(), password }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || 'Erreur de connexion.');
    } else {
      router.push(redirect);
      router.refresh();
    }
  }

  return (
    <div style={styles.card}>
      <div style={styles.logoZone}>
        <span style={{ display: 'block', fontSize: '2rem', color: '#C9A84C', marginBottom: '0.5rem' }}>&#10022;</span>
        <h1 style={styles.title}>Connexion</h1>
        <p style={styles.subtitle}>Miss Tahiti 2026</p>
      </div>

      {searchParams.get('redirect') && (
        <div style={styles.infoBox}>
          Connectez-vous ou inscrivez-vous pour voter.
        </div>
      )}

      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.field}>
          <label style={styles.label}>Prénom</label>
          <input type="text" value={prenom} onChange={(e) => setPrenom(e.target.value)}
            placeholder="Votre prénom" required autoFocus style={styles.input} />
        </div>
        <div style={styles.field}>
          <label style={styles.label}>Mot de passe</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••" required style={styles.input} />
        </div>
        {error && <p style={styles.error}>{error}</p>}
        <button type="submit" className="btn-primary" disabled={loading}
          style={{ width: '100%', marginTop: '0.5rem', opacity: loading ? 0.7 : 1 }}>
          {loading ? 'Connexion...' : 'Se connecter'}
        </button>
      </form>

      <p style={styles.switchText}>
        Pas encore inscrit ?{' '}
        <Link href="/register" style={{ color: '#C9A84C', fontWeight: 600 }}>Créer un compte</Link>
      </p>
      <Link href="/" style={styles.backLink}>← Retour aux candidates</Link>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div style={styles.page}>
      <Suspense fallback={<div>Chargement...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight:      '100vh',
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    background:     'linear-gradient(180deg, #FBF8F2 0%, #FFFFFF 100%)',
    padding:        '2rem 1rem',
  },
  card: {
    background:   '#FFFFFF',
    border:       '1px solid rgba(201,168,76,0.25)',
    borderRadius: '20px',
    padding:      '2.5rem 2rem',
    width:        'min(420px, 100%)',
    boxShadow:    '0 8px 40px rgba(201,168,76,0.12)',
  },
  logoZone: { textAlign: 'center', marginBottom: '1.75rem' },
  title:    { fontSize: '1.75rem', fontWeight: 700, color: '#1A0A2E' },
  subtitle: { color: '#C9A84C', fontSize: '0.9rem', marginTop: '0.2rem' },
  infoBox: {
    background:   'rgba(201,168,76,0.08)',
    border:       '1px solid rgba(201,168,76,0.3)',
    borderRadius: '8px',
    padding:      '0.65rem 1rem',
    color:        '#8B6914',
    fontSize:     '0.9rem',
    marginBottom: '1.25rem',
    textAlign:    'center',
  },
  form:  { display: 'flex', flexDirection: 'column', gap: '1.1rem' },
  field: { display: 'flex', flexDirection: 'column', gap: '0.4rem' },
  label: { color: '#888888', fontSize: '0.85rem', letterSpacing: '0.05em' },
  input: {
    background:   '#FAFAFA',
    border:       '1px solid rgba(201,168,76,0.3)',
    borderRadius: '10px',
    color:        '#1A0A2E',
    padding:      '0.75rem 1rem',
    fontSize:     '0.95rem',
    outline:      'none',
    width:        '100%',
  },
  error:      { color: '#cc0000', fontSize: '0.9rem', textAlign: 'center' },
  switchText: { textAlign: 'center', color: '#888888', fontSize: '0.9rem', marginTop: '1.25rem' },
  backLink:   { display: 'block', textAlign: 'center', color: '#888888', fontSize: '0.85rem', marginTop: '1rem' },
};