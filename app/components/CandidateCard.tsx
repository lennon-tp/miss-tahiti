'use client';

import Image from 'next/image';
import { Candidate } from '@/lib/types';

interface Props {
  candidate: Candidate;
  onClick:   (candidate: Candidate) => void;
}

export default function CandidateCard({ candidate, onClick }: Props) {
  return (
    <div style={styles.card} onClick={() => onClick(candidate)}>
      <div style={styles.imageWrapper}>
        <Image
          src={candidate.photo_url}
          alt={`${candidate.prenom} ${candidate.nom}`}
          fill
          style={{ objectFit: 'cover', objectPosition: 'top' }}
          sizes="(max-width: 640px) 50vw, 20vw"
        />
        <div style={styles.overlay}>
          <span style={styles.overlayText}>Voter</span>
        </div>
        <div style={styles.number}>{String(candidate.id_candidate).padStart(2, '0')}</div>
      </div>

      <div style={styles.info}>
        <p style={styles.nom}>{candidate.prenom} {candidate.nom}</p>
        <div style={styles.details}>
          <span style={styles.detail}>{candidate.age} ans</span>
          <span style={{ color: '#888888', fontSize: '0.85rem' }}>·</span>
          <span style={styles.detail}>{candidate.taille} cm</span>
        </div>
        {candidate.profession && (
          <p style={styles.profession}>{candidate.profession}</p>
        )}
        {candidate.langues && (
          <p style={styles.langues}>{candidate.langues}</p>
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    cursor:       'pointer',
    borderRadius: '12px',
    overflow:     'hidden',
    background:   '#FFFFFF',
    border:       '1px solid rgba(201,168,76,0.25)',
    boxShadow:    '0 4px 16px rgba(201,168,76,0.1)',
    transition:   'transform 0.25s ease, box-shadow 0.25s ease',
  },
  imageWrapper: {
    position:      'relative',
    width:         '100%',
    paddingBottom: '130%',
  },
  overlay: {
    position:       'absolute',
    inset:          0,
    background:     'linear-gradient(to top, rgba(201,168,76,0.8) 0%, transparent 60%)',
    display:        'flex',
    alignItems:     'flex-end',
    justifyContent: 'center',
    paddingBottom:  '1.25rem',
    opacity:        0,
    transition:     'opacity 0.25s ease',
  },
  overlayText: {
    color:         '#FFFFFF',
    fontWeight:    700,
    fontSize:      '1rem',
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
  },
  number: {
    position:     'absolute',
    top:          '0.75rem',
    left:         '0.75rem',
    background:   'rgba(201,168,76,0.95)',
    color:        '#FFFFFF',
    fontWeight:   700,
    fontSize:     '0.8rem',
    borderRadius: '50px',
    padding:      '0.2rem 0.6rem',
  },
  info: {
    padding: '0.85rem 1rem 1rem',
  },
  nom: {
    fontWeight:   700,
    fontSize:     '0.9rem',
    color:        '#1A0A2E',
    marginBottom: '0.3rem',
  },
  details: {
    display:    'flex',
    alignItems: 'center',
    gap:        '0.4rem',
  },
  detail: {
    color:    '#C9A84C',
    fontSize: '0.82rem',
  },
  profession: {
    color:     '#888888',
    fontSize:  '0.78rem',
    marginTop: '0.4rem',
    fontStyle: 'italic',
    lineHeight: 1.3,
  },
  langues: {
    color:     '#C9A84C',
    fontSize:  '0.75rem',
    marginTop: '0.25rem',
    opacity:   0.8,
  },
};