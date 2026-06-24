import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import pool from '@/lib/db';
import { getSession } from '@/lib/session';

export async function POST(req: NextRequest) {
  try {
    const { prenom, password } = await req.json();

    // ─── Validation des champs ────────────────────────────────────────────────
    if (!prenom?.trim() || !password?.trim()) {
      return NextResponse.json(
        { error: 'Le prénom et le mot de passe sont obligatoires.' },
        { status: 400 }
      );
    }

    const conn = await pool.getConnection();
    try {
      // ─── Vérification unicité du prénom ───────────────────────────────────
      const [rows] = await conn.execute(
        'SELECT id_user FROM users WHERE prenom = ?',
        [prenom.trim()]
      );
      if ((rows as unknown[]).length > 0) {
        return NextResponse.json(
          { error: 'Ce prénom est déjà utilisé.' },
          { status: 409 }
        );
      }

      // ─── Hash du mot de passe ─────────────────────────────────────────────
      const hash = await bcrypt.hash(password, 12);

      // ─── Création de l'utilisateur ────────────────────────────────────────
      const [result] = await conn.execute(
        'INSERT INTO users (prenom, password_hash) VALUES (?, ?)',
        [prenom.trim(), hash]
      );
      const insertId = (result as { insertId: number }).insertId;

      // ─── Ouverture de session automatique après inscription ───────────────
      const session = await getSession();
      session.userId = insertId;
      session.prenom = prenom.trim();
      await session.save();

      return NextResponse.json({ ok: true, prenom: prenom.trim() }, { status: 201 });
    } finally {
      conn.release();
    }
  } catch {
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
}
