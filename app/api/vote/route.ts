import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getSession } from '@/lib/session';
import { VoteCategory } from '@/lib/types';

const CATEGORY_COLUMNS: Record<VoteCategory, string> = {
  miss_tahiti:         'miss_tahiti_candidate_id',
  premiere_dauphine:   'premiere_dauphine_candidate_id',
  deuxieme_dauphine:   'deuxieme_dauphine_candidate_id',
  miss_heiva:          'miss_heiva_candidate_id',
};

// ─── GET /api/vote ─────────────────────────────────────────────────────────────
export async function GET() {
  const session = await getSession();
  if (!session.userId) {
    return NextResponse.json({ error: 'Non authentifié.' }, { status: 401 });
  }

  try {
    const [rows] = await pool.execute(
      `SELECT
         miss_tahiti_candidate_id,
         premiere_dauphine_candidate_id,
         deuxieme_dauphine_candidate_id,
         miss_heiva_candidate_id
       FROM votes WHERE id_user = ?`,
      [session.userId]
    );
    const votes = rows as unknown[];
    if (votes.length === 0) {
      return NextResponse.json({
        miss_tahiti_candidate_id:       null,
        premiere_dauphine_candidate_id: null,
        deuxieme_dauphine_candidate_id: null,
        miss_heiva_candidate_id:        null,
      });
    }
    return NextResponse.json(votes[0]);
  } catch {
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
}

// ─── POST /api/vote ────────────────────────────────────────────────────────────
// Body : { candidateId: number | null, category: VoteCategory }
// candidateId = null → retire le vote pour cette catégorie
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.userId) {
    return NextResponse.json({ error: 'Non authentifié.' }, { status: 401 });
  }

  try {
    const { candidateId, category } = await req.json();

    if (!Object.keys(CATEGORY_COLUMNS).includes(category)) {
      return NextResponse.json({ error: 'Catégorie invalide.' }, { status: 400 });
    }

    const col = CATEGORY_COLUMNS[category as VoteCategory];

    // ── Cas : retrait du vote (candidateId = null) ──────────────────────────
    if (candidateId === null || candidateId === undefined) {
      await pool.execute(
        `INSERT INTO votes (id_user, ${col})
         VALUES (?, NULL)
         ON DUPLICATE KEY UPDATE ${col} = NULL, updated_at = NOW()`,
        [session.userId]
      );
      return NextResponse.json({ ok: true });
    }

    const candidateIdNum = parseInt(candidateId);
    if (!Number.isInteger(candidateIdNum) || candidateIdNum < 1) {
      return NextResponse.json({ error: 'candidateId invalide.' }, { status: 400 });
    }

    const conn = await pool.getConnection();
    try {
      // Vérifier que la candidate existe
      const [candRows] = await conn.execute(
        'SELECT id_candidate FROM candidates WHERE id_candidate = ?',
        [candidateIdNum]
      );
      if ((candRows as unknown[]).length === 0) {
        return NextResponse.json({ error: 'Candidate introuvable.' }, { status: 404 });
      }

      // Récupérer le vote actuel
      const [existingRows] = await conn.execute(
        `SELECT
           miss_tahiti_candidate_id,
           premiere_dauphine_candidate_id,
           deuxieme_dauphine_candidate_id,
           miss_heiva_candidate_id
         FROM votes WHERE id_user = ?`,
        [session.userId]
      );
      const existing = (existingRows as Record<string, number | null>[])[0] ?? null;

      // Construire la mise à jour :
      // - on écrit la nouvelle valeur dans la colonne cible
      // - si la candidate était dans une autre catégorie, on l'efface de là
      const updates: Record<string, number | null> = {};
      updates[col] = candidateIdNum;

      if (existing) {
        for (const [cat, c] of Object.entries(CATEGORY_COLUMNS)) {
          if (cat !== category && existing[c] === candidateIdNum) {
            // La candidate était dans une autre catégorie → on l'efface
            updates[c] = null;
          }
        }
      }

      // Construire la requête dynamiquement
      const setClauses = Object.keys(updates)
        .map((c) => `${c} = ?`)
        .join(', ');
      const values = Object.values(updates);

      await conn.execute(
        `INSERT INTO votes (id_user, ${Object.keys(updates).join(', ')})
         VALUES (?, ${Object.keys(updates).map(() => '?').join(', ')})
         ON DUPLICATE KEY UPDATE ${setClauses}, updated_at = NOW()`,
        [session.userId, ...values, ...values]
      );

      return NextResponse.json({ ok: true });
    } finally {
      conn.release();
    }
  } catch {
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
}