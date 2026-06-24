'use client';

import { useEffect, useState, useCallback } from 'react';
import Header from '@/app/components/Header';
import CandidateCard from '@/app/components/CandidateCard';
import VoteModal from '@/app/components/VoteModal';
import { Candidate } from '@/lib/types';

export default function HomePage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selected,   setSelected]   = useState<Candidate | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading,    setLoading]    = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/candidates').then((r) => r.json()),
      fetch('/api/me').then((r) => r.ok),
    ]).then(([cands, logged]) => {
      setCandidates(cands);
      setIsLoggedIn(logged);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleClose = useCallback(() => setSelected(null), []);

  return (
    <>
      <Header />

      <section style={styles.hero}>
        <div className="container">
          <p style={styles.heroSub}>Election officielle</p>
          <h1 style={styles.heroTitle}>
            Miss <span style={{ color: '#C9A84C' }}>Tahiti</span>
          </h1>
          <p style={styles.heroYear}>2026</p>
          <p style={styles.heroDesc}>Votez pour vos favorites parmi les 10 candidates en lice</p>
          <div style={styles.heroDivider} />
        </div>
      </section>

      <main className="container" style={styles.main}>
        <h2 style={styles.sectionTitle}>
          <span style={styles.titleLine} />
          Les 10 candidates
          <span style={styles.titleLine} />
        </h2>

        {loading ? (
          <div style={styles.loadingWrapper}>
            <p style={{ color: '#888888' }}>Chargement des candidates...</p>
          </div>
        ) : (
          <div style={styles.grid}>
            {candidates.map((c) => (
              <CandidateCard key={c.id_candidate} candidate={c} onClick={setSelected} />
            ))}
          </div>
        )}
      </main>

      <footer style={styles.footer}>
        <div style={styles.footerGold} />
        <p style={{ color: '#888888', fontSize: '0.85rem' }}>Miss Tahiti 2026 · Tous droits réservés</p>
      </footer>

      {selected && (
        <VoteModal candidate={selected} onClose={handleClose} isLoggedIn={isLoggedIn} />
      )}
    </>
  );
}

const styles: Record<string, React.CSSProperties> = {
  hero: {
    background: 'linear-gradient(180deg, #FBF8F2 0%, #FFFFFF 100%)',
    textAlign:  'center',
    padding:    '4rem 1rem 3rem',
    borderBottom: '1px solid rgba(201,168,76,0.15)',
  },
  heroSub: {
    color:         '#C9A84C',
    fontSize:      '0.8rem',
    letterSpacing: '0.25em',
    textTransform: 'uppercase',
    marginBottom:  '0.75rem',
  },
  heroTitle: {
    fontSize:      'clamp(3rem, 8vw, 5rem)',
    fontWeight:    700,
    color:         '#1A0A2E',
    lineHeight:    1.05,
  },
  heroYear: {
    fontSize:      'clamp(1.5rem, 4vw, 2.5rem)',
    fontWeight:    300,
    color:         '#888888',
    letterSpacing: '0.3em',
    marginTop:     '0.25rem',
  },
  heroDesc: {
    color:     '#888888',
    fontSize:  '1rem',
    marginTop: '1rem',
    fontStyle: 'italic',
  },
  heroDivider: {
    width:      '80px',
    height:     '2px',
    background: 'linear-gradient(90deg, transparent, #C9A84C, transparent)',
    margin:     '2rem auto 0',
  },
  main: {
    paddingTop:    '3rem',
    paddingBottom: '4rem',
  },
  sectionTitle: {
    display:       'flex',
    alignItems:    'center',
    gap:           '1rem',
    fontSize:      '0.85rem',
    fontWeight:    600,
    color:         '#C9A84C',
    letterSpacing: '0.2em',
    textTransform: 'uppercase',
    marginBottom:  '2rem',
  },
  titleLine: {
    flex:       1,
    height:     '1px',
    background: 'rgba(201,168,76,0.25)',
    display:    'block',
  },
  grid: {
    display:             'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    gap:                 '1.25rem',
  },
  loadingWrapper: {
    display:        'flex',
    justifyContent: 'center',
    padding:        '6rem 0',
  },
  footer: {
    borderTop: '1px solid rgba(201,168,76,0.15)',
    textAlign: 'center',
    padding:   '2rem 1rem',
  },
  footerGold: {
    width:      '60px',
    height:     '1px',
    background: '#C9A84C',
    margin:     '0 auto 1rem',
  },
};