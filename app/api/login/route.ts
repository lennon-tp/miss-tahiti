import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import pool from '@/lib/db';
import { getSession } from '@/lib/session';

export async function POST(req: NextRequest) {
  try {
    const { prenom, password } = await req.json();

    if (!prenom?.trim() || !password?.trim()) {
      return NextResponse.json(
        { error: 'Le prénom et le mot de passe sont obligatoires.' },
        { status: 400 }
      );
    }

    const conn = await pool.getConnection();
    try {
      // ─── Recherche de l'utilisateur ───────────────────────────────────────
      const [rows] = await conn.execute(
        'SELECT id_user, prenom, password_hash FROM users WHERE prenom = ?',
        [prenom.trim()]
      );
      const users = rows as { id_user: number; prenom: string; password_hash: string }[];

      if (users.length === 0) {
        return NextResponse.json(
          { error: 'Prénom ou mot de passe incorrect.' },
          { status: 401 }
        );
      }

      const user = users[0];

      // ─── Vérification du mot de passe ─────────────────────────────────────
      const valid = await bcrypt.compare(password, user.password_hash);
      if (!valid) {
        return NextResponse.json(
          { error: 'Prénom ou mot de passe incorrect.' },
          { status: 401 }
        );
      }

      // ─── Création de la session ───────────────────────────────────────────
      const session = await getSession();
      session.userId = user.id_user;
      session.prenom = user.prenom;
      await session.save();

      return NextResponse.json({ ok: true, prenom: user.prenom });
    } finally {
      conn.release();
    }
  } catch {
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
}
