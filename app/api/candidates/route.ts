import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// Retourne les 10 candidates Miss Tahiti 2026, triées par id.
export async function GET() {
  try {
    const [rows] = await pool.execute(
      'SELECT id_candidate, nom, prenom, age, taille, photo_url, profession, langues FROM candidates ORDER BY id_candidate'
    );
    return NextResponse.json(rows);
  } catch {
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
}
