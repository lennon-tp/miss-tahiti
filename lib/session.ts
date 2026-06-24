import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';

export interface SessionData {
  userId?: number;
  prenom?: string;
}

export const sessionOptions = {
  cookieName: 'miss_tahiti_session',
  password:   process.env.SESSION_SECRET as string,
  cookieOptions: {
    secure:   false,
    httpOnly: true,
    sameSite: 'lax' as const,
    maxAge:   60 * 60 * 24 * 7,
  },
};

export async function getSession() {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore, sessionOptions);
}