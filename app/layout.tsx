import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Miss Tahiti 2026 - Votez pour votre candidate',
  description: 'Election Miss Tahiti 2026 - Votez pour Miss Tahiti, 1ère Dauphine, 2ème Dauphine et Miss Heiva.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
