'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const [prenom,   setPrenom]   = useState('');
  const [password, setPassword] = useState('');
  const [confirm,  setConfirm]  = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    if (password !== confirm) { setError('Les mots de passe ne correspondent pas.'); return; }
    if (password.length < 6)  { setError('Le mot de passe doit faire au moins 6 caractères.'); return; }
    setLoading(true);
    const res  = await fetch('/api/register', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ prenom: prenom.trim(), password }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error || 'Erreur lors de l\'inscription.'); }
    else { router.push('/'); router.refresh(); }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logoZone}>
          <span style={{ display: 'block', fontSize: '2rem', color: '#C9A84C', marginBottom: '0.5rem' }}>&#10022;</span>
          <h1 style={styles.title}>Inscription</h1>
          <p style={styles.subtitle}>Miss Tahiti 2026</p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Prénom</label>
            <input type="text" value={prenom} onChange={(e) => setPrenom(e.target.value)}
              placeholder="Votre prénom" required autoFocus style={styles.input} />
            <p style={styles.hint}>Ce prénom servira d&apos;identifiant unique.</p>
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Mot de passe</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••" required style={styles.input} />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Confirmer le mot de passe</label>
            <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)}
              placeholder="••••••••" required style={styles.input} />
          </div>
          {error && <p style={styles.error}>{error}</p>}
          <button type="submit" className="btn-primary" disabled={loading}
            style={{ width: '100%', marginTop: '0.5rem', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Inscription...' : 'Créer mon compte'}
          </button>
        </form>

        <p style={styles.switchText}>
          Déjà inscrit ?{' '}
          <Link href="/login" style={{ color: '#C9A84C', fontWeight: 600 }}>Se connecter</Link>
        </p>
        <Link href="/" style={styles.backLink}>← Retour aux candidates</Link>
      </div>
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
  form:     { display: 'flex', flexDirection: 'column', gap: '1.1rem' },
  field:    { display: 'flex', flexDirection: 'column', gap: '0.4rem' },
  label:    { color: '#888888', fontSize: '0.85rem', letterSpacing: '0.05em' },
  hint:     { color: '#888888', fontSize: '0.78rem', marginTop: '0.2rem' },
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