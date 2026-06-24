import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// Retourne les statistiques de votes agrégées par candidate et par catégorie.
// Accessible sans authentification (résultats publics).
export async function GET() {
  try {
    const [rows] = await pool.execute(`
      SELECT
        c.id_candidate,
        c.prenom,
        c.nom,
        COUNT(v.miss_tahiti_candidate_id = c.id_candidate OR NULL)         AS miss_tahiti,
        COUNT(v.premiere_dauphine_candidate_id = c.id_candidate OR NULL)   AS premiere_dauphine,
        COUNT(v.deuxieme_dauphine_candidate_id = c.id_candidate OR NULL)   AS deuxieme_dauphine,
        COUNT(v.miss_heiva_candidate_id = c.id_candidate OR NULL)          AS miss_heiva
      FROM candidates c
      LEFT JOIN votes v ON (
        v.miss_tahiti_candidate_id       = c.id_candidate
        OR v.premiere_dauphine_candidate_id = c.id_candidate
        OR v.deuxieme_dauphine_candidate_id = c.id_candidate
        OR v.miss_heiva_candidate_id        = c.id_candidate
      )
      GROUP BY c.id_candidate, c.prenom, c.nom
      ORDER BY c.id_candidate
    `);

    return NextResponse.json(rows);
  } catch {
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
}
