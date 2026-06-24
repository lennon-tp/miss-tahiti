import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';

// Retourne les infos de l'utilisateur connecté, ou 401 si non authentifié.
export async function GET() {
  const session = await getSession();

  if (!session.userId) {
    return NextResponse.json({ error: 'Non authentifié.' }, { status: 401 });
  }

  return NextResponse.json({ userId: session.userId, prenom: session.prenom });
}
