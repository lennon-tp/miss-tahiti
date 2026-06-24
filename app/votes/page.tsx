'use client';

import { useEffect, useState } from 'react';
import Header from '@/app/components/Header';

interface UserVoteDetail {
  prenom:                         string;
  miss_tahiti_candidate_id:       number | null;
  premiere_dauphine_candidate_id: number | null;
  deuxieme_dauphine_candidate_id: number | null;
  miss_heiva_candidate_id:        number | null;
}

interface UserScore {
  prenom: string;
  points: number;
  detail: { label: string; found: boolean; pts: number }[];
}

const CATEGORIES = [
  { key: 'miss_tahiti_candidate_id'       as keyof UserVoteDetail, label: 'Miss Tahiti',   juryKey: 'miss_tahiti',       pts: 3 },
  { key: 'premiere_dauphine_candidate_id' as keyof UserVoteDetail, label: '1ère Dauphine', juryKey: 'premiere_dauphine', pts: 2 },
  { key: 'deuxieme_dauphine_candidate_id' as keyof UserVoteDetail, label: '2ème Dauphine', juryKey: 'deuxieme_dauphine', pts: 1 },
  { key: 'miss_heiva_candidate_id'        as keyof UserVoteDetail, label: 'Miss Heiva',    juryKey: 'miss_heiva',        pts: 1 },
];

const MISE = 1000;

export default function VotesPage() {
  const [votes,          setVotes]          = useState<UserVoteDetail[]>([]);
  const [jurySelection,  setJurySelection]  = useState<Record<string, string>>({});
  const [loading,        setLoading]        = useState(true);
  const [juryReady,      setJuryReady]      = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('jury_selection');
    if (saved) {
      const parsed = JSON.parse(saved);
      setJurySelection(parsed);
      // Jury prêt si au moins une catégorie est remplie
      setJuryReady(Object.values(parsed).some((v) => v !== ''));
    }

    fetch('/api/votes-detail')
      .then((r) => r.json())
      .then((data) => { setVotes(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  function getScores(): UserScore[] {
    return votes.map((v) => {
      let points = 0;
      const detail = CATEGORIES.map(({ key, label, juryKey, pts }) => {
        const userVote  = v[key] as number | null;
        const juryVote  = jurySelection[juryKey];
        const found     = !!userVote && !!juryVote && String(userVote) === juryVote;
        if (found) points += pts;
        return { label, found, pts };
      });
      return { prenom: v.prenom, points, detail };
    }).sort((a, b) => b.points - a.points);
  }

  const scores             = getScores();
  const cagnotte           = votes.length * MISE;
  const maxPoints          = scores[0]?.points ?? 0;
  const winners            = maxPoints > 0 ? scores.filter((s) => s.points === maxPoints) : [];
  const gainParGagnant     = winners.length > 0 ? Math.floor(cagnotte / winners.length) : 0;

  function exportVotes() {
    const lines: string[] = [];
    lines.push('VOTES MISS TAHITI 2026');
    lines.push('='.repeat(40));
    lines.push('');

    (votes as (UserVoteDetail & {
      miss_tahiti_prenom: string | null; miss_tahiti_nom: string | null;
      premiere_dauphine_prenom: string | null; premiere_dauphine_nom: string | null;
      deuxieme_dauphine_prenom: string | null; deuxieme_dauphine_nom: string | null;
      miss_heiva_prenom: string | null; miss_heiva_nom: string | null;
    })[]).forEach((v) => {
      lines.push(`Utilisateur : ${v.prenom}`);
      lines.push(`  Miss Tahiti    : ${v.miss_tahiti_candidate_id    ? `${v.miss_tahiti_prenom} ${v.miss_tahiti_nom}`       : 'Non voté'}`);
      lines.push(`  1ère Dauphine  : ${v.premiere_dauphine_candidate_id ? `${v.premiere_dauphine_prenom} ${v.premiere_dauphine_nom}` : 'Non voté'}`);
      lines.push(`  2ème Dauphine  : ${v.deuxieme_dauphine_candidate_id ? `${v.deuxieme_dauphine_prenom} ${v.deuxieme_dauphine_nom}` : 'Non voté'}`);
      lines.push(`  Miss Heiva     : ${v.miss_heiva_candidate_id     ? `${v.miss_heiva_prenom} ${v.miss_heiva_nom}`         : 'Non voté'}`);
      lines.push('');
    });

    lines.push('='.repeat(40));
    lines.push(`Total participants : ${votes.length}`);
    lines.push(`Cagnotte totale    : ${(votes.length * MISE).toLocaleString('fr-FR')} XPF`);

    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `votes-miss-tahiti-2026-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <Header />

      <section style={styles.hero}>
        <div className="container" style={{ textAlign: 'center' }}>
          <p style={styles.heroSub}>Transparence des votes</p>
          <h1 style={styles.heroTitle}>Votes du public</h1>
          <p style={styles.heroDesc}>Miss Tahiti 2026</p>
          <div style={styles.heroDivider} />
        </div>
      </section>

      <main className="container" style={styles.main}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 0' }}>
            <p style={{ color: '#888888' }}>Chargement...</p>
          </div>
        ) : (
          <>
            {/* ── Cagnotte ── */}
            <div style={styles.cagnotteBar}>
              <div>
                <p style={styles.cagnotteLabel}>Cagnotte totale</p>
                <p style={styles.cagnotteAmount}>{cagnotte.toLocaleString('fr-FR')} XPF</p>
              </div>
              <div style={styles.cagnotteSep} />
              <div>
                <p style={styles.cagnotteLabel}>Participants</p>
                <p style={styles.cagnotteAmount}>{votes.length}</p>
              </div>
              <div style={styles.cagnotteSep} />
              <div>
                <p style={styles.cagnotteLabel}>Mise par participant</p>
                <p style={styles.cagnotteAmount}>{MISE.toLocaleString('fr-FR')} XPF</p>
              </div>
              {winners.length > 0 && (
                <>
                  <div style={styles.cagnotteSep} />
                  <div>
                    <p style={styles.cagnotteLabel}>
                      {winners.length > 1 ? `${winners.length} ex-aequo` : 'Gain du gagnant'}
                    </p>
                    <p style={styles.cagnotteAmount}>{gainParGagnant.toLocaleString('fr-FR')} XPF {winners.length > 1 ? 'chacun' : ''}</p>
                  </div>
                </>
              )}
            </div>

            {!juryReady && (
              <div style={styles.notice}>
                Les résultats du jury ne sont pas encore saisis. Rendez-vous sur la page{' '}
                <a href="/resultats" style={{ color: '#C9A84C', fontWeight: 600 }}>Résultats</a>{' '}
                pour saisir la décision du jury.
              </div>
            )}

            {/* ── Classement des utilisateurs ── */}
            <section style={styles.block}>
              <div style={styles.blockHeader}>
                <span style={styles.blockDot} />
                <h2 style={styles.blockTitle}>Classement des participants</h2>
                <span style={styles.blockSub}>
                  {juryReady ? 'Basé sur la décision du jury' : 'En attente de la décision du jury'}
                </span>
              </div>

              <div style={styles.scoreList}>
                {scores.map((s, idx) => {
                  const isWinner = juryReady && s.points === maxPoints && maxPoints > 0;
                  return (
                    <div key={s.prenom} style={{
                      ...styles.scoreCard,
                      ...(isWinner ? styles.scoreCardWinner : {}),
                    }}>
                      {/* Rang + nom */}
                      <div style={styles.scoreLeft}>
                        <span style={{ ...styles.scoreRank, color: idx === 0 && juryReady ? '#C9A84C' : '#888888' }}>
                          #{idx + 1}
                        </span>
                        <div>
                          <p style={styles.scoreName}>{s.prenom}</p>
                          {juryReady && (
                            <div style={styles.scoreDetail}>
                              {s.detail.map(({ label, found, pts }) => (
                                <span key={label} style={{
                                  ...styles.scoreTag,
                                  background: found ? 'rgba(201,168,76,0.15)' : '#F5F5F5',
                                  color:      found ? '#8B6914' : '#BBBBBB',
                                }}>
                                  {found ? '✓' : '✗'} {label} {found ? `+${pts}pt` : ''}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Points + gain */}
                      <div style={styles.scoreRight}>
                        {juryReady && (
                          <p style={styles.scorePoints}>{s.points} pt{s.points > 1 ? 's' : ''}</p>
                        )}
                        {isWinner && (
                          <div style={styles.gainBadge}>
                            {gainParGagnant.toLocaleString('fr-FR')} XPF
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                {scores.length === 0 && (
                  <p style={{ color: '#888888', fontStyle: 'italic' }}>Aucun vote pour le moment.</p>
                )}
              </div>
            </section>

            {/* ── Votes détaillés ── */}
            <section style={styles.block}>
              <div style={styles.blockHeader}>
                <span style={styles.blockDot} />
                <h2 style={styles.blockTitle}>Votes par utilisateur</h2>
                <span style={styles.blockSub}>{votes.length} votant{votes.length > 1 ? 's' : ''}</span>
              </div>

              <div style={styles.tableWrapper}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Utilisateur</th>
                      <th style={styles.th}>Miss Tahiti</th>
                      <th style={styles.th}>1ère Dauphine</th>
                      <th style={styles.th}>2ème Dauphine</th>
                      <th style={styles.th}>Miss Heiva</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(votes as (UserVoteDetail & {
                      miss_tahiti_prenom: string | null; miss_tahiti_nom: string | null;
                      premiere_dauphine_prenom: string | null; premiere_dauphine_nom: string | null;
                      deuxieme_dauphine_prenom: string | null; deuxieme_dauphine_nom: string | null;
                      miss_heiva_prenom: string | null; miss_heiva_nom: string | null;
                    })[]).map((v, idx) => (
                      <tr key={idx} style={idx % 2 === 0 ? styles.trEven : styles.trOdd}>
                        <td style={{ ...styles.td, fontWeight: 600, color: '#1A0A2E' }}>{v.prenom}</td>
                        <td style={styles.td}>
                          {v.miss_tahiti_candidate_id
                            ? <span style={styles.chip}>{v.miss_tahiti_prenom} {v.miss_tahiti_nom}</span>
                            : <span style={styles.empty}>—</span>}
                        </td>
                        <td style={styles.td}>
                          {v.premiere_dauphine_candidate_id
                            ? <span style={styles.chip}>{v.premiere_dauphine_prenom} {v.premiere_dauphine_nom}</span>
                            : <span style={styles.empty}>—</span>}
                        </td>
                        <td style={styles.td}>
                          {v.deuxieme_dauphine_candidate_id
                            ? <span style={styles.chip}>{v.deuxieme_dauphine_prenom} {v.deuxieme_dauphine_nom}</span>
                            : <span style={styles.empty}>—</span>}
                        </td>
                        <td style={styles.td}>
                          {v.miss_heiva_candidate_id
                            ? <span style={styles.chip}>{v.miss_heiva_prenom} {v.miss_heiva_nom}</span>
                            : <span style={styles.empty}>—</span>}
                        </td>
                      </tr>
                    ))}
                    {votes.length === 0 && (
                      <tr>
                        <td colSpan={5} style={{ ...styles.td, textAlign: 'center', color: '#888888', fontStyle: 'italic' }}>
                          Aucun vote pour le moment.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}

        {/* ── Export ── */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={exportVotes}
            className="btn-primary"
            style={{ fontSize: '0.9rem' }}
          >
            Exporter les votes
          </button>
        </div>
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
  notice: {
    background:   'rgba(201,168,76,0.08)',
    border:       '1px solid rgba(201,168,76,0.25)',
    borderRadius: '12px',
    padding:      '1rem 1.5rem',
    color:        '#888888',
    fontSize:     '0.9rem',
  },
  cagnotteBar: {
    display:      'flex',
    alignItems:   'center',
    gap:          '2rem',
    flexWrap:     'wrap',
    background:   '#FFFFFF',
    border:       '1px solid rgba(201,168,76,0.2)',
    borderRadius: '16px',
    padding:      '1.5rem 2rem',
    boxShadow:    '0 4px 24px rgba(201,168,76,0.1)',
  },
  cagnotteLabel:  { color: '#888888', fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.2rem' },
  cagnotteAmount: { color: '#C9A84C', fontSize: '1.3rem', fontWeight: 700 },
  cagnotteSep:    { width: '1px', height: '40px', background: 'rgba(201,168,76,0.2)', flexShrink: 0 },
  block: {
    background:   '#FFFFFF',
    border:       '1px solid rgba(201,168,76,0.2)',
    borderRadius: '16px',
    padding:      '1.75rem',
    boxShadow:    '0 4px 16px rgba(201,168,76,0.08)',
  },
  blockHeader: {
    display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap',
  },
  blockDot:   { width: '10px', height: '10px', borderRadius: '50%', background: '#C9A84C', flexShrink: 0 },
  blockTitle: { fontSize: '1.15rem', fontWeight: 700, color: '#1A0A2E', flex: 1 },
  blockSub:   { color: '#888888', fontSize: '0.8rem' },
  scoreList:  { display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  scoreCard: {
    display:      'flex',
    alignItems:   'center',
    justifyContent: 'space-between',
    gap:          '1rem',
    background:   '#FAFAFA',
    border:       '1px solid rgba(201,168,76,0.1)',
    borderRadius: '12px',
    padding:      '0.9rem 1.25rem',
  },
  scoreCardWinner: {
    background:  'rgba(201,168,76,0.06)',
    borderColor: '#C9A84C',
    boxShadow:   '0 4px 16px rgba(201,168,76,0.12)',
  },
  scoreLeft:   { display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 },
  scoreRank:   { fontWeight: 700, fontSize: '1rem', minWidth: '30px' },
  scoreName:   { fontWeight: 600, fontSize: '0.95rem', color: '#1A0A2E', marginBottom: '0.3rem' },
  scoreDetail: { display: 'flex', flexWrap: 'wrap', gap: '0.35rem' },
  scoreTag: {
    fontSize: '0.75rem', fontWeight: 600,
    padding: '0.15rem 0.5rem', borderRadius: '50px',
  },
  scoreRight:  { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.35rem' },
  scorePoints: { fontWeight: 700, fontSize: '1rem', color: '#C9A84C' },
  gainBadge: {
    background:   'linear-gradient(135deg, #C9A84C, #8B6914)',
    color:        '#FFFFFF',
    fontWeight:   700,
    fontSize:     '0.8rem',
    padding:      '0.25rem 0.75rem',
    borderRadius: '50px',
    whiteSpace:   'nowrap',
  },
  tableWrapper: { overflowX: 'auto' },
  table:        { width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' },
  th: {
    textAlign: 'left', padding: '0.75rem 1rem',
    color: '#8B6914', fontWeight: 600, fontSize: '0.8rem',
    letterSpacing: '0.08em', textTransform: 'uppercase',
    borderBottom: '2px solid rgba(201,168,76,0.2)', whiteSpace: 'nowrap',
  },
  td:     { padding: '0.75rem 1rem', color: '#444444', verticalAlign: 'middle' },
  trEven: { background: '#FFFFFF' },
  trOdd:  { background: '#FAFAFA' },
  chip: {
    background: 'rgba(201,168,76,0.12)', color: '#8B6914',
    fontWeight: 600, fontSize: '0.82rem',
    padding: '0.2rem 0.6rem', borderRadius: '50px', whiteSpace: 'nowrap',
  },
  empty:  { color: '#CCCCCC' },
  footer: { borderTop: '1px solid rgba(201,168,76,0.15)', textAlign: 'center', padding: '2rem' },
};