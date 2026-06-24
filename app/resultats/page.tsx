'use client';

import { useEffect, useState } from 'react';
import Header from '@/app/components/Header';
import { VoteStats } from '@/lib/types';
import Image from 'next/image';

const CATEGORIES = [
  { key: 'miss_tahiti'       as keyof VoteStats, label: 'Miss Tahiti',   color: '#C9A84C' },
  { key: 'premiere_dauphine' as keyof VoteStats, label: '1ère Dauphine', color: '#8B6914' },
  { key: 'deuxieme_dauphine' as keyof VoteStats, label: '2ème Dauphine', color: '#8B6914' },
  { key: 'miss_heiva'        as keyof VoteStats, label: 'Miss Heiva',    color: '#C9A84C' },
];

interface Candidate {
  id_candidate: number;
  prenom:       string;
  nom:          string;
}

export default function ResultatsPage() {
  const [stats,      setStats]      = useState<VoteStats[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [selection,  setSelection]  = useState<Record<string, string>>({
    miss_tahiti:       '',
    premiere_dauphine: '',
    deuxieme_dauphine: '',
    miss_heiva:        '',
  });

  useEffect(() => {
    Promise.all([
      fetch('/api/votes').then((r) => r.json()),
      fetch('/api/candidates').then((r) => r.json()),
    ]).then(([v, c]) => {
      setStats(v);
      setCandidates(c);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  function getRanking(category: keyof VoteStats) {
    return [...stats]
      .sort((a, b) => (Number(b[category]) || 0) - (Number(a[category]) || 0))
      .slice(0, 3);
  }

  function getTotal(category: keyof VoteStats) {
    return stats.reduce((sum, s) => sum + (Number(s[category]) || 0), 0);
  }

  // Charger la sélection depuis le localStorage au démarrage
  useEffect(() => {
    const saved = localStorage.getItem('jury_selection');
    if (saved) setSelection(JSON.parse(saved));
  }, []);

  // Sauvegarder dans le localStorage à chaque changement
  function handleSelect(cat: string, value: string) {
    const next = { ...selection, [cat]: value };
    setSelection(next);
    localStorage.setItem('jury_selection', JSON.stringify(next));
  }

  const selectedCandidate = (cat: string) =>
    candidates.find((c) => String(c.id_candidate) === selection[cat]);

  return (
    <>
      <Header />

      <section style={styles.hero}>
        <div className="container" style={{ textAlign: 'center' }}>
          <p style={styles.heroSub}>Résultats en temps réel</p>
          <h1 style={styles.heroTitle}>Palmarès des votes</h1>
          <p style={styles.heroDesc}>Miss Tahiti 2026</p>
          <div style={styles.heroDivider} />
        </div>
      </section>

      <main className="container" style={styles.main}>

        {/* ── Bloc sélection du jury ── */}
        <section style={styles.juryBlock}>
          <div style={styles.juryHeader}>
            <span style={styles.blockDot} />
            <h2 style={styles.juryTitle}>Sélection du jury</h2>
            <span style={styles.jurySub}>Désignez les lauréates</span>
          </div>

          <div style={styles.juryGrid}>
            {CATEGORIES.map(({ key, label, color }) => {
              const cand = selectedCandidate(key as string);
              return (
                <div key={key} style={styles.juryCard}>
                  <p style={{ ...styles.juryLabel, color }}>{label}</p>
                  <select
                    value={selection[key as string]}
                    onChange={(e) => handleSelect(key as string, e.target.value)}
                    style={styles.select}
                  >
                    <option value="">— Choisir —</option>
                    {candidates.map((c) => (
                      <option key={c.id_candidate} value={String(c.id_candidate)}>
                        {c.prenom} {c.nom}
                      </option>
                    ))}
                  </select>
                  {cand && (
                    <div style={styles.juryPreview}>
                      <div style={styles.juryPhoto}>
                        <Image
                          src={`/candidates/candidate-${cand.id_candidate}.jpg`}
                          alt={`${cand.prenom} ${cand.nom}`}
                          fill
                          style={{ objectFit: 'cover', objectPosition: 'top' }}
                          sizes="60px"
                        />
                      </div>
                      <span style={{ ...styles.juryName, color }}>{cand.prenom} {cand.nom}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* ── Résultats par catégorie ── */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 0' }}>
            <p style={{ color: '#888888' }}>Chargement des résultats...</p>
          </div>
        ) : (
          CATEGORIES.map(({ key, label, color }) => {
            const ranking = getRanking(key);
            const total   = getTotal(key);
            return (
              <section key={key} style={styles.category}>
                <div style={styles.catHeader}>
                  <span style={{ ...styles.catDot, background: color }} />
                  <h2 style={{ ...styles.catTitle, color }}>{label}</h2>
                  <span style={styles.catTotal}>{total} vote{total !== 1 ? 's' : ''}</span>
                </div>

                <div style={styles.rankGrid}>
                  {ranking.map((s, idx) => {
                    const votes = Number(s[key]) || 0;
                    const pct   = total > 0 ? Math.round((votes / total) * 100) : 0;
                    return (
                      <div key={s.id_candidate} style={styles.rankCard}>
                        <div style={{ ...styles.rank, color: idx === 0 ? color : '#888888' }}>
                          #{idx + 1}
                        </div>
                        <div style={styles.rankPhoto}>
                          <Image
                            src={`/candidates/candidate-${s.id_candidate}.jpg`}
                            alt={`${s.prenom} ${s.nom}`}
                            fill
                            style={{ objectFit: 'cover', objectPosition: 'top' }}
                            sizes="80px"
                          />
                        </div>
                        <div style={{ flex: 1 }}>
                          <p style={styles.rankName}>{s.prenom} {s.nom}</p>
                          <div style={styles.bar}>
                            <div style={{ ...styles.barFill, width: `${pct}%`, background: color }} />
                          </div>
                          <p style={styles.rankVotes}>{votes} vote{votes !== 1 ? 's' : ''} · {pct}%</p>
                        </div>
                      </div>
                    );
                  })}
                  {ranking.length === 0 && (
                    <p style={{ color: '#888888', fontStyle: 'italic' }}>Aucun vote pour cette catégorie.</p>
                  )}
                </div>
              </section>
            );
          })
        )}
      </main>

      <footer style={styles.footer}>
        <div style={{ width: '60px', height: '1px', background: '#C9A84C', margin: '0 auto 1rem' }} />
        <p style={{ color: '#888888', fontSize: '0.85rem' }}>Miss Tahiti 2026 · Tous droits réservés</p>
      </footer>
    </>
  );
}

const styles: Record<string, React.CSSProperties> = {
  hero: {
    background:   'linear-gradient(180deg, #FBF8F2 0%, #FFFFFF 100%)',
    padding:      '3.5rem 1rem 2.5rem',
    textAlign:    'center',
    borderBottom: '1px solid rgba(201,168,76,0.15)',
  },
  heroSub: {
    color: '#C9A84C', fontSize: '0.8rem', letterSpacing: '0.25em',
    textTransform: 'uppercase', marginBottom: '0.5rem',
  },
  heroTitle:   { fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 700, color: '#1A0A2E' },
  heroDesc:    { color: '#C9A84C', fontSize: '1rem' },
  heroDivider: { width: '80px', height: '2px', background: 'linear-gradient(90deg, transparent, #C9A84C, transparent)', margin: '1.5rem auto 0' },
  main: {
    paddingTop: '3rem', paddingBottom: '4rem',
    display: 'flex', flexDirection: 'column', gap: '2rem',
  },

  // Jury
  juryBlock: {
    background:   '#FFFFFF',
    border:       '2px solid rgba(201,168,76,0.3)',
    borderRadius: '16px',
    padding:      '1.75rem',
    boxShadow:    '0 4px 24px rgba(201,168,76,0.12)',
  },
  juryHeader: {
    display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem',
  },
  blockDot:  { width: '10px', height: '10px', borderRadius: '50%', background: '#C9A84C', flexShrink: 0 },
  juryTitle: { fontSize: '1.15rem', fontWeight: 700, color: '#1A0A2E', flex: 1 },
  jurySub:   { color: '#888888', fontSize: '0.85rem' },
  juryGrid: {
    display:             'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap:                 '1.25rem',
  },
  juryCard: {
    display:       'flex',
    flexDirection: 'column',
    gap:           '0.6rem',
  },
  juryLabel: {
    fontWeight:    700,
    fontSize:      '0.85rem',
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
  },
  select: {
    background:   '#FAFAFA',
    border:       '1.5px solid rgba(201,168,76,0.3)',
    borderRadius: '10px',
    padding:      '0.6rem 0.9rem',
    fontSize:     '0.9rem',
    color:        '#1A0A2E',
    outline:      'none',
    width:        '100%',
    fontFamily:   'inherit',
    cursor:       'pointer',
  },
  juryPreview: {
    display:    'flex',
    alignItems: 'center',
    gap:        '0.6rem',
    marginTop:  '0.25rem',
  },
  juryPhoto: {
    position:     'relative',
    width:        '40px',
    height:       '50px',
    borderRadius: '8px',
    overflow:     'hidden',
    flexShrink:   0,
    border:       '1.5px solid rgba(201,168,76,0.3)',
  },
  juryName: { fontSize: '0.85rem', fontWeight: 600 },

  // Résultats
  category: {
    background:   '#FFFFFF',
    border:       '1px solid rgba(201,168,76,0.2)',
    borderRadius: '16px',
    padding:      '1.75rem',
    boxShadow:    '0 4px 16px rgba(201,168,76,0.08)',
  },
  catHeader:  { display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' },
  catDot:     { width: '10px', height: '10px', borderRadius: '50%', flexShrink: 0 },
  catTitle:   { fontSize: '1.15rem', fontWeight: 700, letterSpacing: '0.05em', flex: 1 },
  catTotal:   { color: '#888888', fontSize: '0.85rem' },
  rankGrid:   { display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  rankCard: {
    display: 'flex', alignItems: 'center', gap: '1rem',
    background: '#FAFAFA', borderRadius: '10px', padding: '0.75rem 1rem',
    border: '1px solid rgba(201,168,76,0.1)',
  },
  rank:     { fontWeight: 700, fontSize: '1rem', minWidth: '30px', textAlign: 'right' },
  rankPhoto: {
    position: 'relative', width: '48px', height: '60px',
    borderRadius: '8px', overflow: 'hidden', flexShrink: 0,
    border: '1px solid rgba(201,168,76,0.2)',
  },
  rankName:   { fontWeight: 600, fontSize: '0.95rem', color: '#1A0A2E', marginBottom: '0.4rem' },
  bar:        { height: '4px', background: 'rgba(201,168,76,0.15)', borderRadius: '4px', overflow: 'hidden', marginBottom: '0.3rem' },
  barFill:    { height: '100%', borderRadius: '4px', transition: 'width 0.6s ease' },
  rankVotes:  { color: '#888888', fontSize: '0.8rem' },
  footer:     { borderTop: '1px solid rgba(201,168,76,0.15)', textAlign: 'center', padding: '2rem' },
};