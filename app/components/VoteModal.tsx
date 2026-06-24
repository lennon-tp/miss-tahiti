'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Candidate, VoteCategory, UserVote } from '@/lib/types';

interface Props {
  candidate:  Candidate | null;
  onClose:    () => void;
  isLoggedIn: boolean;
}

const CATEGORIES: { key: VoteCategory; label: string; description: string }[] = [
  { key: 'miss_tahiti',       label: 'Miss Tahiti',   description: 'La plus haute distinction' },
  { key: 'premiere_dauphine', label: '1ère Dauphine', description: 'Première dauphine de Miss Tahiti' },
  { key: 'deuxieme_dauphine', label: '2ème Dauphine', description: 'Deuxième dauphine de Miss Tahiti' },
  { key: 'miss_heiva',        label: 'Miss Heiva',    description: 'Miss du Heiva i Tahiti' },
];

export default function VoteModal({ candidate, onClose, isLoggedIn }: Props) {
  const router = useRouter();
  const [userVote, setUserVote] = useState<UserVote | null>(null);
  const [loading,  setLoading]  = useState(false);
  const [message,  setMessage]  = useState<{ text: string; error: boolean } | null>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose(); }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  useEffect(() => {
    if (!isLoggedIn) return;
    fetch('/api/vote')
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { if (data) setUserVote(data); })
      .catch(() => {});
  }, [isLoggedIn]);

  if (!candidate) return null;

  const colKey = (cat: VoteCategory): keyof UserVote => `${cat}_candidate_id` as keyof UserVote;

  async function handleVote(category: VoteCategory) {
    if (!isLoggedIn) {
      router.push('/login?redirect=/');
      return;
    }
    setLoading(true);
    setMessage(null);

    // Si la candidate est déjà dans cette catégorie → on décoche (retrait)
    const alreadyVoted = isVotedForCategory(category);
    const candidateId  = alreadyVoted ? null : candidate!.id_candidate;

    const res  = await fetch('/api/vote', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ candidateId, category }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setMessage({ text: data.error || 'Erreur lors du vote.', error: true });
    } else {
      // Mettre à jour l'état local :
      // - retirer la candidate de toutes les catégories où elle était
      // - mettre la nouvelle valeur (ou null si décoché)
      setUserVote((prev: UserVote | null) => {
        const next = { ...prev };
        // Si on déplace, effacer l'ancienne catégorie
        for (const cat of ['miss_tahiti', 'premiere_dauphine', 'deuxieme_dauphine', 'miss_heiva'] as VoteCategory[]) {
          if (cat !== category && next[colKey(cat)] === candidate!.id_candidate) {
            next[colKey(cat)] = null;
          }
        }
        next[colKey(category)] = candidateId;
        return next;
      });

      const label = CATEGORIES.find(c => c.key === category)?.label;
      setMessage({
        text:  alreadyVoted ? `Vote retiré pour "${label}".` : `Vote enregistré pour "${label}".`,
        error: false,
      });
    }
  }

  function isVotedForCategory(category: VoteCategory): boolean {
    return userVote?.[colKey(category)] === candidate?.id_candidate;
  }

  return (
    <>
      <div style={styles.backdrop} onClick={onClose} />
      <div style={styles.modal}>
        <button style={styles.closeBtn} onClick={onClose}>✕</button>

        <div style={styles.candidateHeader}>
          <div style={styles.photoWrapper}>
            <Image
              src={candidate.photo_url}
              alt={`${candidate.prenom} ${candidate.nom}`}
              fill
              style={{ objectFit: 'cover', objectPosition: 'top' }}
              sizes="200px"
            />
          </div>
          <div>
            <h2 style={styles.candidateName}>{candidate.prenom} {candidate.nom}</h2>
            <p style={styles.candidateMeta}>{candidate.age} ans · {candidate.taille} cm</p>
            {!isLoggedIn && (
              <p style={styles.loginHint}>Connectez-vous pour voter.</p>
            )}
          </div>
        </div>

        <p style={styles.voteTitle}>Choisissez une catégorie</p>

        {message && (
          <div style={{
            ...styles.message,
            background:  message.error ? '#FFF0F0' : '#F0FFF4',
            borderColor: message.error ? '#ffaaaa' : '#C9A84C',
            color:       message.error ? '#cc0000' : '#8B6914',
          }}>
            {message.text}
          </div>
        )}

        <div style={styles.categories}>
          {CATEGORIES.map(({ key, label, description }) => {
            const voted = isVotedForCategory(key);
            return (
              <button
                key={key}
                style={{
                  ...styles.catBtn,
                  ...(voted ? styles.catBtnVoted : {}),
                  ...(loading ? { opacity: 0.6, pointerEvents: 'none' } : {}),
                }}
                onClick={() => handleVote(key)}
                disabled={loading}
              >
                <div style={styles.catLeft}>
                  <div style={{
                    ...styles.catDot,
                    background:  voted ? '#C9A84C' : 'transparent',
                    borderColor: voted ? '#C9A84C' : 'rgba(201,168,76,0.4)',
                  }}>
                    {voted && <span style={{ color: '#FFFFFF', fontSize: '0.7rem', fontWeight: 700 }}>✓</span>}
                  </div>
                  <div>
                    <div style={styles.catLabel}>{label}</div>
                    <div style={styles.catDesc}>{description}</div>
                  </div>
                </div>
                {voted && <span style={styles.votedBadge}>Votre choix</span>}
              </button>
            );
          })}
        </div>

        {!isLoggedIn && (
          <div style={styles.authZone}>
            <a href="/login" style={{ color: '#C9A84C' }}>Se connecter</a>
            <span style={{ color: '#888888' }}>ou</span>
            <a href="/register" style={styles.authLinkPrimary}>S&apos;inscrire</a>
          </div>
        )}
      </div>
    </>
  );
}

const styles: Record<string, React.CSSProperties> = {
  backdrop: {
    position:       'fixed',
    inset:          0,
    background:     'rgba(0,0,0,0.4)',
    zIndex:         200,
    backdropFilter: 'blur(4px)',
  },
  modal: {
    position:     'fixed',
    top:          '50%',
    left:         '50%',
    transform:    'translate(-50%, -50%)',
    zIndex:       201,
    background:   '#FFFFFF',
    border:       '1px solid rgba(201,168,76,0.3)',
    borderRadius: '20px',
    padding:      '2rem',
    width:        'min(520px, 95vw)',
    maxHeight:    '90vh',
    overflowY:    'auto',
    boxShadow:    '0 24px 80px rgba(201,168,76,0.15)',
  },
  closeBtn: {
    position:       'absolute',
    top:            '1rem',
    right:          '1rem',
    background:     '#F5F5F5',
    color:          '#888888',
    border:         'none',
    borderRadius:   '50%',
    width:          '2rem',
    height:         '2rem',
    fontSize:       '0.9rem',
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
  },
  candidateHeader: {
    display:      'flex',
    alignItems:   'center',
    gap:          '1.25rem',
    marginBottom: '1.5rem',
  },
  photoWrapper: {
    position:     'relative',
    width:        '80px',
    height:       '100px',
    borderRadius: '12px',
    overflow:     'hidden',
    flexShrink:   0,
    border:       '2px solid rgba(201,168,76,0.3)',
  },
  candidateName: {
    fontSize:      '1.25rem',
    fontWeight:    700,
    color:         '#1A0A2E',
    marginBottom:  '0.25rem',
  },
  candidateMeta: {
    color:    '#C9A84C',
    fontSize: '0.9rem',
  },
  loginHint: {
    color:     '#888888',
    fontSize:  '0.85rem',
    marginTop: '0.5rem',
    fontStyle: 'italic',
  },
  voteTitle: {
    color:         '#888888',
    fontSize:      '0.8rem',
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    marginBottom:  '0.75rem',
  },
  message: {
    border:       '1px solid',
    borderRadius: '8px',
    padding:      '0.65rem 1rem',
    fontSize:     '0.9rem',
    marginBottom: '0.75rem',
  },
  categories: {
    display:       'flex',
    flexDirection: 'column',
    gap:           '0.6rem',
  },
  catBtn: {
    display:         'flex',
    alignItems:      'center',
    justifyContent:  'space-between',
    background:      '#FAFAFA',
    borderWidth:     '1px',
    borderStyle:     'solid',
    borderColor:     'rgba(201,168,76,0.2)',
    borderRadius:    '12px',
    padding:         '0.9rem 1rem',
    color:           '#1A0A2E',
    width:           '100%',
    textAlign:       'left',
    transition:      'all 0.2s ease',
  },
  catBtnVoted: {
    background:  'rgba(201,168,76,0.08)',
    borderColor: '#C9A84C',
  },
  catLeft: {
    display:    'flex',
    alignItems: 'center',
    gap:        '0.75rem',
  },
  catDot: {
    width:          '22px',
    height:         '22px',
    borderRadius:   '50%',
    border:         '2px solid',
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    flexShrink:     0,
  },
  catLabel: {
    fontWeight: 600,
    fontSize:   '0.95rem',
    color:      '#1A0A2E',
  },
  catDesc: {
    color:     '#888888',
    fontSize:  '0.8rem',
    marginTop: '0.1rem',
  },
  votedBadge: {
    background:   'rgba(201,168,76,0.15)',
    color:        '#8B6914',
    fontSize:     '0.75rem',
    fontWeight:   600,
    padding:      '0.2rem 0.6rem',
    borderRadius: '50px',
    whiteSpace:   'nowrap',
  },
  authZone: {
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    gap:            '0.75rem',
    marginTop:      '1.5rem',
    fontSize:       '0.95rem',
  },
  authLinkPrimary: {
    background:   '#C9A84C',
    color:        '#FFFFFF',
    fontWeight:   700,
    padding:      '0.4rem 1rem',
    borderRadius: '50px',
  },
};