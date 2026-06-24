import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const [rows] = await pool.execute(`
      SELECT
        u.prenom,
        mt.prenom  AS miss_tahiti_prenom,
        mt.nom     AS miss_tahiti_nom,
        pd.prenom  AS premiere_dauphine_prenom,
        pd.nom     AS premiere_dauphine_nom,
        dd.prenom  AS deuxieme_dauphine_prenom,
        dd.nom     AS deuxieme_dauphine_nom,
        mh.prenom  AS miss_heiva_prenom,
        mh.nom     AS miss_heiva_nom,
        v.miss_tahiti_candidate_id,
        v.premiere_dauphine_candidate_id,
        v.deuxieme_dauphine_candidate_id,
        v.miss_heiva_candidate_id,
        v.updated_at
      FROM votes v
      JOIN users u ON u.id_user = v.id_user
      LEFT JOIN candidates mt ON mt.id_candidate = v.miss_tahiti_candidate_id
      LEFT JOIN candidates pd ON pd.id_candidate = v.premiere_dauphine_candidate_id
      LEFT JOIN candidates dd ON dd.id_candidate = v.deuxieme_dauphine_candidate_id
      LEFT JOIN candidates mh ON mh.id_candidate = v.miss_heiva_candidate_id
      ORDER BY v.updated_at DESC
    `);
    return NextResponse.json(rows);
  } catch {
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
}